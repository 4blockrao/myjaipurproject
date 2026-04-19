import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InputEvent {
  id?: string;
  title: string;
  category?: string;
  imageUrl?: string;
  link?: string; // BookMyShow event URL
}

interface ImportResult {
  title: string;
  status: 'created' | 'skipped' | 'failed';
  eventId?: string;
  slug?: string;
  reason?: string;
}

const FIRECRAWL_V2 = 'https://api.firecrawl.dev/v2';

const categoryMap: Record<string, string> = {
  'comedy shows': 'comedy', 'stand up comedy': 'comedy', 'comedy': 'comedy',
  'concerts': 'music', 'music shows': 'music', 'music': 'music',
  'parties': 'party', 'nightlife': 'party',
  'workshops': 'workshop', 'exhibitions': 'art', 'art': 'art',
  'theatre': 'performance', 'performances': 'performance',
  'sports': 'sports', 'kids': 'family',
};

function slugify(text: string): string {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

function detectLocality(venue: string, address: string): string | null {
  const text = `${venue} ${address}`.toLowerCase();
  const localities = [
    'c-scheme', 'raja park', 'malviya nagar', 'vaishali nagar', 'mansarovar',
    'jhotwara', 'sitapura', 'tonk road', 'ajmer road', 'jagatpura',
    'sanganer', 'pratap nagar', 'sodala', 'civil lines', 'bani park',
    'mi road', 'adarsh nagar', 'jln marg', 'lal kothi',
  ];
  for (const loc of localities) {
    if (text.includes(loc)) return loc.replace(/\s+/g, '-');
  }
  return null;
}

async function scrapeWithFirecrawl(url: string, apiKey: string): Promise<any> {
  const resp = await fetch(`${FIRECRAWL_V2}/scrape`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent: true,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Firecrawl ${resp.status}: ${JSON.stringify(data).slice(0, 200)}`);
  return data;
}

function parseScrapedContent(markdown: string, fallbackTitle: string) {
  // Extract event details from BookMyShow markdown
  const out: any = {
    description: '',
    venue_name: '',
    venue_address: '',
    start_date: null as string | null,
    ticket_price: null as number | null,
    is_free: false,
    organizer_name: null as string | null,
  };

  if (!markdown) return out;

  // Date - look for patterns like "27 Apr, 2026" or "Sat, 27 Apr"
  const dateMatch = markdown.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[,\s]+(\d{4})/i);
  if (dateMatch) {
    const [, day, mon, year] = dateMatch;
    const months: Record<string, number> = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
    const d = new Date(parseInt(year), months[mon.toLowerCase()], parseInt(day), 19, 0, 0);
    out.start_date = d.toISOString();
  }

  // Price
  const priceMatch = markdown.match(/(?:₹|Rs\.?\s*|INR\s*)(\d{2,5})/i);
  if (priceMatch) out.ticket_price = parseInt(priceMatch[1]);
  if (/free/i.test(markdown.slice(0, 800))) out.is_free = true;

  // Venue - heuristic: line containing "Jaipur" near top
  const lines = markdown.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 60)) {
    if (/jaipur/i.test(line) && line.length < 200 && !/book|tickets?|share|about/i.test(line)) {
      out.venue_address = line.replace(/[*_#>]/g, '').trim();
      const parts = out.venue_address.split(',');
      if (parts.length >= 2) out.venue_name = parts[0].trim();
      break;
    }
  }

  // Description: first substantial paragraph after title
  const descParts: string[] = [];
  for (const line of lines) {
    if (line.length > 80 && !line.startsWith('#') && !line.startsWith('!') && !line.startsWith('[')) {
      descParts.push(line);
      if (descParts.join(' ').length > 400) break;
    }
  }
  out.description = descParts.join('\n\n').slice(0, 1500) || `Don't miss ${fallbackTitle} happening in Jaipur. Book your tickets now.`;

  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ error: 'FIRECRAWL_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    const events: InputEvent[] = Array.isArray(body) ? body : (body.events || []);
    const dryRun: boolean = body.dryRun === true;
    const maxEvents: number = Math.min(body.maxEvents || events.length, 100);

    if (!events.length) {
      return new Response(JSON.stringify({ error: 'No events provided. Send { events: [...] } or a JSON array.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const toProcess = events.slice(0, maxEvents);
    const results: ImportResult[] = [];

    for (const ev of toProcess) {
      try {
        if (!ev.title) {
          results.push({ title: 'unknown', status: 'failed', reason: 'missing title' });
          continue;
        }

        // Dedup by source link or title
        const sourceUrl = ev.link || null;
        if (sourceUrl) {
          const { data: existing } = await supabase
            .from('events')
            .select('id, slug')
            .eq('source_url', sourceUrl)
            .maybeSingle();
          if (existing) {
            results.push({ title: ev.title, status: 'skipped', eventId: existing.id, slug: existing.slug, reason: 'already exists (source_url)' });
            continue;
          }
        }

        // Scrape for details
        let scraped: any = {};
        if (sourceUrl) {
          try {
            const fc = await scrapeWithFirecrawl(sourceUrl, FIRECRAWL_API_KEY);
            const markdown = fc.markdown || fc.data?.markdown || '';
            scraped = parseScrapedContent(markdown, ev.title);
          } catch (e) {
            console.warn(`Firecrawl failed for ${sourceUrl}:`, e instanceof Error ? e.message : e);
          }
        }

        const category = categoryMap[(ev.category || '').toLowerCase()] || 'other';
        const slug = `${slugify(ev.title)}-${(ev.id || '').toLowerCase()}`.replace(/-+$/, '') || slugify(ev.title);
        const locality = detectLocality(scraped.venue_name || '', scraped.venue_address || '');

        const eventData = {
          title: ev.title,
          slug,
          description: scraped.description || `Experience ${ev.title} in Jaipur. Book your tickets and details below.`,
          short_description: ev.title,
          start_date: scraped.start_date, // may be null
          venue_name: scraped.venue_name || null,
          venue_address: scraped.venue_address || 'Jaipur, Rajasthan',
          locality,
          category,
          ticket_price: scraped.ticket_price,
          is_free: scraped.is_free,
          cover_image: ev.imageUrl || null,
          cover_image_url: ev.imageUrl || null,
          image_url: ev.imageUrl || null,
          registration_url: sourceUrl,
          source_url: sourceUrl,
          source_label: 'BookMyShow',
          organizer_name: scraped.organizer_name,
          status: 'draft',
          editorial_status: 'draft',
          tags: [category, 'bookmyshow', 'imported'].filter(Boolean),
          meta_title: `${ev.title} | Jaipur Event Details`,
          meta_description: (scraped.description || ev.title).slice(0, 155),
        };

        if (dryRun) {
          results.push({ title: ev.title, status: 'created', reason: 'dry run', slug });
          continue;
        }

        const { data: inserted, error } = await supabase
          .from('events')
          .insert(eventData as any)
          .select('id, slug')
          .single();

        if (error) {
          results.push({ title: ev.title, status: 'failed', reason: error.message });
        } else {
          results.push({ title: ev.title, status: 'created', eventId: inserted.id, slug: inserted.slug });
        }
      } catch (e) {
        results.push({
          title: ev.title || 'unknown',
          status: 'failed',
          reason: e instanceof Error ? e.message : String(e),
        });
      }
    }

    const summary = {
      total: results.length,
      created: results.filter(r => r.status === 'created').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      failed: results.filter(r => r.status === 'failed').length,
    };

    return new Response(JSON.stringify({ summary, results }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
