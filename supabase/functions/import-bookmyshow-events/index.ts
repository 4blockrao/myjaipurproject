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

// Parse events from scraped markdown content - improved image parsing
function parseEventsFromMarkdown(markdown: string): BookMyShowEvent[] {
  const events: BookMyShowEvent[] = [];
  const processedIds = new Set<string>();

  // Pattern to match the full event blocks with images
  // Example: [![Dhol Beats Fiesta](https://assets-in.bmscdn.com/...portrait.jpg)\\...](https://in.bookmyshow.com/events/dhol-beats-fiesta/ET00473176)
  const fullEventPattern = /\[!\[(.*?)\]\((https:\/\/assets-in\.bmscdn\.com\/[^)]+)\)[^\]]*\]\((https:\/\/in\.bookmyshow\.com\/events\/[^)]+)\)/g;

  let match;
  while ((match = fullEventPattern.exec(markdown)) !== null) {
    const [, title, imageUrl, eventUrl] = match;
    const eventId = eventUrl.split('/').pop() || '';
    
    if (processedIds.has(eventId)) continue;
    
    // Find the surrounding content for venue, category, price
    const startIdx = match.index;
    const endIdx = Math.min(startIdx + 500, markdown.length);
    const contextBlock = markdown.substring(startIdx, endIdx);
    
    // Extract venue - look for ": Jaipur" pattern
    const venueMatch = contextBlock.match(/\\+\s*([^\\]+:\s*Jaipur)/i);
    const venue = venueMatch ? venueMatch[1].trim() : 'Venue TBA';
    
    // Extract category
    const categories = ['Stand up Comedy', 'Concerts', 'Club Gigs', 'Music Festivals', 'NYE Parties', 'Comedy Shows', 'Workshops', 'Art Exhibitions', 'Music Shows', 'Performances'];
    let category = 'Events';
    for (const cat of categories) {
      if (contextBlock.includes(cat)) {
        category = cat;
        break;
      }
    }
    
    // Extract price
    const priceMatch = contextBlock.match(/₹\s*([\d,]+)\s*(onwards)?/);
    const price = priceMatch ? `₹ ${priceMatch[1]}${priceMatch[2] ? ' onwards' : ''}` : '';
    
    // Extract date if present (encoded in image URL or text)
    const dateMatch = contextBlock.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s*(\d+)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
    let eventDate: string | undefined;
    if (dateMatch) {
      const day = dateMatch[2];
      const month = dateMatch[3];
      const year = new Date().getFullYear();
      const monthNum = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(month) + 1;
      if (monthNum > 0) {
        eventDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}T18:00:00+05:30`;
      }
    }
    
    // Clean up image URL - get high quality version
    let cleanImageUrl = imageUrl;
    // Remove transformation params and get portrait version
    if (cleanImageUrl.includes('/tr:')) {
      cleanImageUrl = cleanImageUrl.replace(/\/tr:[^/]+\//, '/');
    }
    // Make sure we get a good size
    if (!cleanImageUrl.includes('tr:')) {
      cleanImageUrl = cleanImageUrl.replace('discovery-catalog/events/', 'discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC/');
    }
    
    events.push({
      title: title.trim(),
      venue,
      category,
      price,
      imageUrl: cleanImageUrl,
      eventUrl,
      eventId,
      date: eventDate,
    });
    
    processedIds.add(eventId);
  }

  // Also look for simpler event links without images (will use fallback image)
  const simplePattern = /\[([^\]]+)\]\((https:\/\/in\.bookmyshow\.com\/events\/[^/]+\/([^)]+))\)/g;
  while ((match = simplePattern.exec(markdown)) !== null) {
    const [, title, url, eventId] = match;
    // Skip if already found or if it's an image link
    if (processedIds.has(eventId) || title.startsWith('!')) continue;
    
    // Find context for venue/category/price
    const startIdx = Math.max(0, match.index - 200);
    const endIdx = Math.min(match.index + 300, markdown.length);
    const contextBlock = markdown.substring(startIdx, endIdx);
    
    const venueMatch = contextBlock.match(/([^\\]+:\s*Jaipur)/i);
    const venue = venueMatch ? venueMatch[1].trim() : 'Venue TBA';
    
    const priceMatch = contextBlock.match(/₹\s*([\d,]+)/);
    const price = priceMatch ? `₹ ${priceMatch[1]}` : '';
    
    events.push({
      title: title.trim(),
      venue,
      category: 'Events',
      price,
      imageUrl: '', // Will use fallback
      eventUrl: url,
      eventId,
    });
    
    processedIds.add(eventId);
  }

  console.log(`Parsed ${events.length} events, ${events.filter(e => e.imageUrl).length} with images`);
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

    const body = await req.json();
    const { action, markdownContent, dryRun, events: inputEvents } = body;

    console.log('Import request received:', { action, dryRun, hasContent: !!markdownContent, hasEvents: !!inputEvents });

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
      const events = inputEvents;
      
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
