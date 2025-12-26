import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookMyShowEvent {
  title: string;
  venue: string;
  category: string;
  price: string;
  imageUrl: string;
  eventUrl: string;
  eventId: string;
  date?: string;
}

interface ProcessedEvent {
  title: string;
  description: string;
  short_description: string;
  start_date: string;
  venue_name: string;
  venue_address: string;
  city: string;
  locality: string | null;
  category: string;
  ticket_price: number | null;
  is_free: boolean;
  cover_image: string;
  registration_url: string;
  organizer_name: string;
  status: string;
  tags: string[];
  slug: string;
  meta_title: string;
  meta_description: string;
}

// Category mapping from BookMyShow to our schema
const categoryMap: Record<string, string> = {
  'stand up comedy': 'comedy',
  'standup comedy': 'comedy',
  'comedy shows': 'comedy',
  'concerts': 'music',
  'club gigs': 'music',
  'music festivals': 'music',
  'music shows': 'music',
  'nye parties': 'party',
  'new year parties': 'party',
  'parties': 'party',
  'workshops': 'workshop',
  'art exhibitions': 'art',
  'exhibitions': 'art',
  'conferences': 'business',
  'meetups': 'community',
  'talks': 'talk',
  'performances': 'performance',
  'kids': 'family',
};

// Venue to locality mapping for Jaipur
const venueLocalityMap: Record<string, string> = {
  'deep smriti auditorium': 'c-scheme',
  'jecc': 'sitapura',
  'jaipur exhibition': 'sitapura',
  'rajasthan international center': 'jln-marg',
  'birla auditorium': 'statue-circle',
  'jawahar kala kendra': 'jln-marg',
  'albert hall': 'ram-niwas-garden',
  'ora': 'c-scheme',
  'strings': 'c-scheme',
  'strings-cocktail lounge': 'c-scheme',
  'gypsy monkey': 'c-scheme',
  'jaipur comedy club': 'raja-park',
  'hyatt place': 'civil-lines',
  'umaid palace': 'bani-park',
  'fomo': 'malviya-nagar',
  'fomo kitchen': 'malviya-nagar',
  'harishchandra totuka': 'raja-park',
  'the big tree cafe': 'c-scheme',
  'the kukas resort': 'kukas',
  'sarover marriage garden': 'mansarovar',
};

function detectLocality(venueName: string): string | null {
  const venueLower = venueName.toLowerCase();
  for (const [venueKey, locality] of Object.entries(venueLocalityMap)) {
    if (venueLower.includes(venueKey)) {
      return locality;
    }
  }
  return null;
}

function normalizeCategory(category: string): string {
  const normalized = categoryMap[category.toLowerCase()];
  return normalized || 'other';
}

function parsePrice(priceStr: string): { price: number | null; isFree: boolean } {
  if (!priceStr || priceStr.toLowerCase().includes('free')) {
    return { price: null, isFree: true };
  }
  
  const match = priceStr.match(/₹\s*([\d,]+)/);
  if (match) {
    const price = parseInt(match[1].replace(/,/g, ''), 10);
    return { price, isFree: false };
  }
  
  return { price: null, isFree: false };
}

function generateSlug(title: string): string {
  const timestamp = Date.now();
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
    .trim();
  
  return `${baseSlug}-jaipur-${timestamp}`;
}

function generateEnrichedDescription(event: BookMyShowEvent): string {
  const localityName = detectLocality(event.venue)?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Jaipur';
  const category = normalizeCategory(event.category);
  
  const audienceMap: Record<string, string> = {
    comedy: 'comedy lovers and entertainment enthusiasts',
    music: 'music fans and concert-goers',
    party: 'party enthusiasts and celebration seekers',
    workshop: 'learners and skill-seekers',
    art: 'art lovers and culture enthusiasts',
    other: 'event enthusiasts',
  };

  const whatToExpectMap: Record<string, string[]> = {
    comedy: ['Sharp, relatable humor', 'Interactive audience moments', 'Comfortable seating', 'Refreshments available'],
    music: ['High-energy performances', 'Professional sound & lighting', 'Crowd-favorite songs', 'Merchandise stalls'],
    party: ['Curated music & entertainment', 'Premium food & beverages', 'Great ambiance', 'Networking opportunities'],
    workshop: ['Step-by-step guidance', 'All materials provided', 'Small batch sizes', 'Hands-on experience'],
    art: ['Curated displays', 'Artist interactions', 'Photography opportunities', 'Guided tours'],
    other: ['Quality entertainment', 'Professional organization', 'Comfortable venue', 'Great experience'],
  };

  const audience = audienceMap[category] || audienceMap.other;
  const expectations = whatToExpectMap[category] || whatToExpectMap.other;

  return `**${event.title}** is coming to ${localityName}! ${audience.charAt(0).toUpperCase() + audience.slice(1)} across Jaipur are excited for this upcoming ${category} event at ${event.venue}.

**Event Highlights:**
${expectations.map(item => `• ${item}`).join('\n')}

**Why You Should Attend:**
• Experience world-class entertainment in Jaipur
• Create unforgettable memories with amazing performances
• Join fellow enthusiasts in the Pink City

📍 Located at **${event.venue}** in ${localityName}, one of Jaipur's popular event destinations.

*Tickets available via BookMyShow. JaipurCircle provides local context and discovery to help you make informed decisions.*`;
}

function generateMetaTitle(title: string, venue: string): string {
  return `${title} in Jaipur | ${venue} | Book Tickets`.slice(0, 60);
}

function generateMetaDescription(title: string, venue: string, price: string): string {
  const priceInfo = price.includes('Free') ? 'Free event!' : price;
  return `Book tickets for ${title} at ${venue}, Jaipur. ${priceInfo} Get event details, directions & local tips on JaipurCircle.`.slice(0, 160);
}

// Parse events from scraped markdown content
function parseEventsFromMarkdown(markdown: string): BookMyShowEvent[] {
  const events: BookMyShowEvent[] = [];
  
  // Split by event blocks - look for patterns with image, title, venue, category, price
  const eventPattern = /\[!\[(.*?)\]\((https:\/\/assets-in\.bmscdn\.com\/[^)]+)\)[^\]]*\]\((https:\/\/in\.bookmyshow\.com\/events\/[^)]+)\)[\s\S]*?\\{2}\s*(.*?)\\{2}\s*(.*?)\\{2}\s*(.*?)\\{2}\s*₹?\s*([\d,]+ onwards|Free)?/gi;
  
  // Alternative simpler pattern for list items
  const simplePattern = /\[(.*?)\]\((https:\/\/in\.bookmyshow\.com\/events\/[^/]+\/([^)]+))\)/g;
  
  let match;
  const processedIds = new Set<string>();

  // First try to extract from image-based cards
  const lines = markdown.split('\n');
  let currentEvent: Partial<BookMyShowEvent> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for image link with event URL
    const imgMatch = line.match(/\[!\[([^\]]*)\]\(([^)]+)\)[^\]]*\]\((https:\/\/in\.bookmyshow\.com\/events\/[^)]+)\)/);
    if (imgMatch) {
      currentEvent = {
        title: imgMatch[1],
        imageUrl: imgMatch[2],
        eventUrl: imgMatch[3],
        eventId: imgMatch[3].split('/').pop() || '',
      };
      continue;
    }
    
    // Check for venue line (contains ": Jaipur")
    if (line.includes(': Jaipur') && currentEvent.title) {
      currentEvent.venue = line.replace(/\\+/g, '').trim();
      continue;
    }
    
    // Check for category line (common categories)
    const categories = ['Stand up Comedy', 'Concerts', 'Club Gigs', 'Music Festivals', 'NYE Parties', 'Comedy Shows', 'Workshops', 'Art Exhibitions'];
    for (const cat of categories) {
      if (line.includes(cat)) {
        currentEvent.category = cat;
        break;
      }
    }
    
    // Check for price line
    if (line.includes('₹') || line.toLowerCase() === 'free') {
      currentEvent.price = line.replace(/\\+/g, '').trim();
      
      // Save completed event
      if (currentEvent.title && currentEvent.eventId && !processedIds.has(currentEvent.eventId)) {
        events.push({
          title: currentEvent.title,
          venue: currentEvent.venue || 'Venue TBA',
          category: currentEvent.category || 'Events',
          price: currentEvent.price || '',
          imageUrl: currentEvent.imageUrl || '',
          eventUrl: currentEvent.eventUrl || '',
          eventId: currentEvent.eventId,
        });
        processedIds.add(currentEvent.eventId);
      }
      currentEvent = {};
    }
  }

  // Also extract from simple links
  while ((match = simplePattern.exec(markdown)) !== null) {
    const [, title, url, eventId] = match;
    if (!processedIds.has(eventId) && !title.includes('!')) {
      events.push({
        title: title.trim(),
        venue: 'Venue TBA',
        category: 'Events',
        price: '',
        imageUrl: '',
        eventUrl: url,
        eventId: eventId,
      });
      processedIds.add(eventId);
    }
  }

  return events;
}

// Check if event already exists
async function eventExists(supabase: any, title: string, startDate: string): Promise<boolean> {
  const { data } = await supabase
    .from('events')
    .select('id')
    .ilike('title', `%${title.substring(0, 20)}%`)
    .gte('start_date', new Date(new Date(startDate).getTime() - 3 * 24 * 60 * 60 * 1000).toISOString())
    .lte('start_date', new Date(new Date(startDate).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString())
    .limit(1);
  
  return data && data.length > 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, markdownContent, dryRun } = await req.json();

    console.log('Import request received:', { action, dryRun, hasContent: !!markdownContent });

    if (action === 'parse') {
      // Parse events from provided markdown content
      if (!markdownContent) {
        return new Response(
          JSON.stringify({ success: false, error: 'No markdown content provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const events = parseEventsFromMarkdown(markdownContent);
      console.log(`Parsed ${events.length} events from markdown`);

      return new Response(
        JSON.stringify({ success: true, events, count: events.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'import') {
      // Import parsed events into database
      const { events } = await req.json();
      
      if (!events || !Array.isArray(events)) {
        return new Response(
          JSON.stringify({ success: false, error: 'No events array provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const results = {
        total: events.length,
        imported: 0,
        skipped: 0,
        failed: 0,
        details: [] as any[],
      };

      for (const event of events as BookMyShowEvent[]) {
        try {
          // Generate start date (default to upcoming dates if not specified)
          const startDate = event.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          
          // Check for duplicates
          const exists = await eventExists(supabase, event.title, startDate);
          if (exists) {
            results.skipped++;
            results.details.push({ title: event.title, status: 'skipped', reason: 'duplicate' });
            continue;
          }

          const { price, isFree } = parsePrice(event.price);
          const locality = detectLocality(event.venue);
          const category = normalizeCategory(event.category);

          const processedEvent: ProcessedEvent = {
            title: event.title,
            description: generateEnrichedDescription(event),
            short_description: `${event.title} at ${event.venue} in Jaipur. ${isFree ? 'Free entry!' : event.price}`,
            start_date: startDate,
            venue_name: event.venue.replace(': Jaipur', '').trim(),
            venue_address: `${event.venue}, Jaipur, Rajasthan`,
            city: 'Jaipur',
            locality: locality,
            category: category,
            ticket_price: price,
            is_free: isFree,
            cover_image: event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
            registration_url: event.eventUrl,
            organizer_name: 'BookMyShow',
            status: 'published',
            tags: [category, 'bookmyshow', 'jaipur-events', locality].filter(Boolean) as string[],
            slug: generateSlug(event.title),
            meta_title: generateMetaTitle(event.title, event.venue),
            meta_description: generateMetaDescription(event.title, event.venue, event.price),
          };

          if (!dryRun) {
            const { error } = await supabase.from('events').insert(processedEvent);
            
            if (error) {
              console.error('Insert error:', error);
              results.failed++;
              results.details.push({ title: event.title, status: 'failed', error: error.message });
            } else {
              results.imported++;
              results.details.push({ title: event.title, status: 'imported', slug: processedEvent.slug });
            }
          } else {
            results.imported++;
            results.details.push({ title: event.title, status: 'would-import', slug: processedEvent.slug });
          }
        } catch (err) {
          console.error('Processing error:', err);
          results.failed++;
          results.details.push({ title: event.title, status: 'failed', error: String(err) });
        }
      }

      console.log('Import results:', results);

      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action. Use "parse" or "import"' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
