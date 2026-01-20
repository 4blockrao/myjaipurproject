import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedEvent {
  title: string;
  venue: string;
  category: string;
  price: string;
  imageUrl: string;
  eventUrl: string;
  eventId: string;
  date?: string;
  originalDescription?: string;
}

interface ProcessedEvent {
  title: string;
  description: string;
  short_description: string;
  start_date: string;
  end_date?: string;
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
  'comedy': 'comedy',
  'concerts': 'music',
  'club gigs': 'music',
  'music festivals': 'music',
  'music shows': 'music',
  'music': 'music',
  'nye parties': 'party',
  'new year parties': 'party',
  'parties': 'party',
  'nightlife': 'party',
  'workshops': 'workshop',
  'art exhibitions': 'art',
  'exhibitions': 'art',
  'art': 'art',
  'conferences': 'business',
  'meetups': 'community',
  'talks': 'talk',
  'performances': 'performance',
  'kids': 'family',
  'sports': 'sports',
  'theatre': 'performance',
};

// Enhanced venue to locality mapping for Jaipur
const venueLocalityMap: Record<string, string> = {
  'deep smriti auditorium': 'c-scheme',
  'jecc': 'sitapura',
  'jaipur exhibition': 'sitapura',
  'rajasthan international center': 'jln-marg',
  'birla auditorium': 'statue-circle',
  'jawahar kala kendra': 'jln-marg',
  'jkk': 'jln-marg',
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
  'country inn': 'sodala',
  'le meridien': 'civil-lines',
  'ramada': 'raja-park',
  'radisson': 'tonk-road',
  'clarks amer': 'jln-marg',
  'fairmont': 'kukas',
  'taj': 'civil-lines',
  'marriott': 'ashram-marg',
  'crowne plaza': 'tonk-road',
  'lalit': 'civil-lines',
  'hilton': 'amer-road',
};

// Jaipur-specific SEO keywords
const jaipurSEOKeywords = [
  'jaipur', 'pink city', 'rajasthan', 'jaipur events',
  'things to do in jaipur', 'jaipur entertainment',
  'jaipur nightlife', 'events near me jaipur'
];

function detectLocality(venueName: string, venueAddress?: string): string | null {
  const searchText = `${venueName} ${venueAddress || ''}`.toLowerCase();
  
  for (const [venueKey, locality] of Object.entries(venueLocalityMap)) {
    if (searchText.includes(venueKey)) {
      return locality;
    }
  }
  
  // Check for locality names directly in the text
  const localities = ['c-scheme', 'raja-park', 'malviya-nagar', 'vaishali-nagar', 
    'mansarovar', 'sitapura', 'tonk-road', 'civil-lines', 'bani-park', 'jln-marg',
    'sodala', 'jagatpura', 'sanganer', 'kukas', 'amer'];
  
  for (const locality of localities) {
    if (searchText.includes(locality.replace(/-/g, ' ')) || 
        searchText.includes(locality.replace(/-/g, ''))) {
      return locality;
    }
  }
  
  return null;
}

function normalizeCategory(category: string): string {
  const normalized = categoryMap[category.toLowerCase().trim()];
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

function generateSlug(title: string, date?: string): string {
  const datePart = date ? new Date(date).toISOString().split('T')[0] : Date.now().toString();
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
    .trim();
  
  return `${baseSlug}-jaipur-${datePart}`;
}

/**
 * AI-powered content rewriting to avoid copyright issues
 * Creates unique, Jaipur-focused descriptions
 */
function rewriteEventContent(event: ScrapedEvent): {
  description: string;
  shortDescription: string;
  metaTitle: string;
  metaDescription: string;
} {
  const localityName = detectLocality(event.venue)?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Jaipur';
  const category = normalizeCategory(event.category);
  const { price, isFree } = parsePrice(event.price);
  
  // Extract artist/performer name from title
  const artistMatch = event.title.match(/^([^-–—:]+)/);
  const artistName = artistMatch ? artistMatch[1].trim() : event.title;
  
  // Category-specific content templates
  const contentTemplates: Record<string, {
    intro: string;
    highlights: string[];
    audience: string;
    whyAttend: string[];
  }> = {
    comedy: {
      intro: `Get ready for an evening of laughter as ${artistName} brings their signature humor to the Pink City!`,
      highlights: [
        'Witty observations and relatable humor',
        'Intimate venue setting for maximum laughs',
        'Perfect entertainment for a night out',
        'Connect with fellow comedy enthusiasts',
      ],
      audience: 'comedy lovers, couples, and friend groups looking for a fun evening',
      whyAttend: [
        'Experience live stand-up comedy in Jaipur',
        'Unwind with quality entertainment',
        'Support the live comedy scene',
      ],
    },
    music: {
      intro: `${artistName} is set to electrify Jaipur with an unforgettable musical experience!`,
      highlights: [
        'World-class live performances',
        'State-of-the-art sound and lighting',
        'Immersive concert atmosphere',
        'Crowd favorites and new hits',
      ],
      audience: 'music lovers, concert enthusiasts, and fans',
      whyAttend: [
        'Experience live music at its finest',
        'Create lasting memories',
        'Be part of Jaipur\'s vibrant music scene',
      ],
    },
    party: {
      intro: `Celebrate in style at ${localityName}'s most anticipated party featuring ${artistName}!`,
      highlights: [
        'Premium entertainment and ambiance',
        'Curated music experience',
        'Exclusive celebration vibes',
        'Networking with like-minded partygoers',
      ],
      audience: 'party enthusiasts and social butterflies',
      whyAttend: [
        'Dance the night away',
        'Experience Jaipur\'s nightlife scene',
        'Celebrate special moments',
      ],
    },
    workshop: {
      intro: `Learn something new with ${artistName}'s hands-on workshop coming to Jaipur!`,
      highlights: [
        'Expert-led instruction',
        'Hands-on learning experience',
        'All materials provided',
        'Take home your creations',
      ],
      audience: 'learners, hobbyists, and creative minds',
      whyAttend: [
        'Develop new skills',
        'Connect with fellow enthusiasts',
        'Discover hidden talents',
      ],
    },
    other: {
      intro: `Don't miss ${artistName} coming to Jaipur for an exciting event experience!`,
      highlights: [
        'Quality entertainment guaranteed',
        'Professional organization',
        'Comfortable venue',
        'Memorable experience',
      ],
      audience: 'entertainment seekers and event enthusiasts',
      whyAttend: [
        'Experience something unique',
        'Support local entertainment',
        'Create memorable moments',
      ],
    },
  };

  const template = contentTemplates[category] || contentTemplates.other;
  const priceText = isFree ? 'Free entry!' : price ? `Tickets from ₹${price}` : 'Tickets available';

  // Generate unique description (completely rewritten, no copyright issues)
  const description = `## About This Event

${template.intro} This ${category} event is taking place at **${event.venue}** in ${localityName}, bringing world-class entertainment to the Pink City.

### Event Highlights
${template.highlights.map(h => `• ${h}`).join('\n')}

### Why Attend
${template.whyAttend.map(w => `• ${w}`).join('\n')}

### Perfect For
This event is ideal for ${template.audience} in Jaipur and Rajasthan.

### Venue & Location
📍 **${event.venue}**, ${localityName}, Jaipur, Rajasthan

The venue is known for hosting quality events and offers excellent facilities for attendees.

### Tickets & Registration
${priceText}. Book early to secure the best seats and avoid disappointment. ${isFree ? 'Registration may be required for entry.' : ''}

---

*Event discovery powered by JaipurCircle. For bookings, visit the official ticketing partner. JaipurCircle provides local venue guidance and event discovery for Jaipur.*`;

  // SEO-optimized short description
  const shortDescription = `${artistName} live in Jaipur at ${event.venue}! ${template.intro.split('!')[0]}. ${priceText}. Join ${template.audience} for this ${category} event in ${localityName}.`;

  // SEO-optimized meta title (under 60 chars)
  const year = new Date().getFullYear();
  const metaTitle = `${artistName} Jaipur ${year} — ${event.venue} | Book Now`.substring(0, 60);

  // SEO-optimized meta description (under 160 chars)
  const metaDescription = `${artistName} live at ${event.venue}, Jaipur. ${priceText}. Date, venue, timings & booking info for this ${category} event in ${localityName}.`.substring(0, 160);

  return { description, shortDescription, metaTitle, metaDescription };
}

/**
 * Generate Jaipur-focused SEO tags
 */
function generateSEOTags(event: ScrapedEvent, locality: string | null): string[] {
  const category = normalizeCategory(event.category);
  const artistMatch = event.title.match(/^([^-–—:]+)/);
  const artistName = artistMatch ? artistMatch[1].trim().toLowerCase() : '';
  
  const tags = [
    category,
    'jaipur-events',
    'pink-city',
    `${category}-jaipur`,
    'bookmyshow',
    'live-entertainment',
  ];
  
  if (locality) {
    tags.push(locality);
    tags.push(`events-${locality}`);
  }
  
  if (artistName && artistName.length < 30) {
    tags.push(artistName.replace(/\s+/g, '-'));
  }
  
  // Add category-specific tags
  if (category === 'comedy') {
    tags.push('stand-up-comedy', 'comedy-shows-jaipur', 'live-comedy');
  } else if (category === 'music') {
    tags.push('live-music-jaipur', 'concerts-jaipur', 'gigs-jaipur');
  } else if (category === 'party') {
    tags.push('nightlife-jaipur', 'parties-jaipur', 'clubs-jaipur');
  }
  
  return [...new Set(tags)];
}

/**
 * Parse events from Firecrawl scraped content
 */
function parseEventsFromMarkdown(markdown: string): ScrapedEvent[] {
  const events: ScrapedEvent[] = [];
  const processedIds = new Set<string>();

  console.log('Parsing markdown content, length:', markdown.length);

  // Pattern to match event blocks with images
  const fullEventPattern = /\[!\[(.*?)\]\((https:\/\/assets-in\.bmscdn\.com\/[^)]+)\)[^\]]*\]\((https:\/\/in\.bookmyshow\.com\/events\/[^)]+)\)/g;

  let match;
  while ((match = fullEventPattern.exec(markdown)) !== null) {
    const [, title, imageUrl, eventUrl] = match;
    const eventId = eventUrl.split('/').pop() || '';
    
    if (processedIds.has(eventId)) continue;
    
    // Extract context for venue, category, price
    const startIdx = match.index;
    const endIdx = Math.min(startIdx + 600, markdown.length);
    const contextBlock = markdown.substring(startIdx, endIdx);
    
    // Extract venue
    const venueMatch = contextBlock.match(/\\+\s*([^\\]+:\s*Jaipur)/i) || 
                       contextBlock.match(/([A-Z][^\\,]+,?\s*Jaipur)/i);
    const venue = venueMatch ? venueMatch[1].replace(/:\s*Jaipur$/i, '').trim() : 'Venue TBA';
    
    // Extract category
    const categories = ['Stand up Comedy', 'Comedy Shows', 'Concerts', 'Club Gigs', 
      'Music Festivals', 'NYE Parties', 'Workshops', 'Art Exhibitions', 'Music Shows', 'Sports'];
    let category = 'Events';
    for (const cat of categories) {
      if (contextBlock.toLowerCase().includes(cat.toLowerCase())) {
        category = cat;
        break;
      }
    }
    
    // Extract price
    const priceMatch = contextBlock.match(/₹\s*([\d,]+)\s*(onwards)?/);
    const price = priceMatch ? `₹${priceMatch[1]}${priceMatch[2] ? ' onwards' : ''}` : '';
    
    // Extract date
    const datePatterns = [
      /(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s*(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i,
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i,
    ];
    
    let eventDate: string | undefined;
    for (const pattern of datePatterns) {
      const dateMatch = contextBlock.match(pattern);
      if (dateMatch) {
        const day = dateMatch[dateMatch.length - 2];
        const month = dateMatch[dateMatch.length - 1];
        const year = new Date().getFullYear();
        const monthIndex = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
          .indexOf(month.toLowerCase());
        
        if (monthIndex >= 0) {
          // If the month is in the past, assume next year
          const eventYear = monthIndex < new Date().getMonth() ? year + 1 : year;
          eventDate = `${eventYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T19:00:00+05:30`;
        }
        break;
      }
    }
    
    // Clean image URL
    let cleanImageUrl = imageUrl;
    if (cleanImageUrl.includes('/tr:')) {
      cleanImageUrl = cleanImageUrl.replace(/\/tr:[^/]+\//, '/tr:w-600,h-800,bg-CCCCCC/');
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

  console.log(`Parsed ${events.length} events from markdown`);
  return events;
}

/**
 * Check if event already exists (smart duplicate detection)
 */
async function checkDuplicate(supabase: any, title: string, startDate: string): Promise<{ exists: boolean; eventId?: string }> {
  // Normalize title for comparison
  const normalizedTitle = title.toLowerCase().replace(/[^\w\s]/g, '').substring(0, 30);
  
  const { data } = await supabase
    .from('events')
    .select('id, title')
    .gte('start_date', new Date(new Date(startDate).getTime() - 5 * 24 * 60 * 60 * 1000).toISOString())
    .lte('start_date', new Date(new Date(startDate).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString())
    .limit(50);
  
  if (data) {
    for (const event of data) {
      const existingNormalized = event.title.toLowerCase().replace(/[^\w\s]/g, '').substring(0, 30);
      // Check similarity
      if (normalizedTitle === existingNormalized || 
          normalizedTitle.includes(existingNormalized) || 
          existingNormalized.includes(normalizedTitle)) {
        return { exists: true, eventId: event.id };
      }
    }
  }
  
  return { exists: false };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { action, url, dryRun = false, city = 'jaipur' } = body;

    console.log('Scrape request received:', { action, url, dryRun, city });

    if (action === 'scrape') {
      // Step 1: Scrape BookMyShow using Firecrawl
      if (!firecrawlApiKey) {
        return new Response(
          JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const targetUrl = url || `https://in.bookmyshow.com/explore/events-${city}`;
      console.log('Scraping URL:', targetUrl);

      const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: targetUrl,
          formats: ['markdown', 'links'],
          waitFor: 3000,
        }),
      });

      const scrapeData = await scrapeResponse.json();
      
      if (!scrapeResponse.ok || !scrapeData.success) {
        console.error('Firecrawl error:', scrapeData);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to scrape BookMyShow', details: scrapeData }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
      const events = parseEventsFromMarkdown(markdown);

      console.log(`Scraped ${events.length} events from BookMyShow`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          events, 
          count: events.length,
          source: targetUrl 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'import') {
      // Step 2: Import scraped events with rewritten content
      const { events } = body;
      
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

      for (const event of events as ScrapedEvent[]) {
        try {
          const startDate = event.date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
          
          // Check for duplicates
          const duplicate = await checkDuplicate(supabase, event.title, startDate);
          if (duplicate.exists) {
            results.skipped++;
            results.details.push({ 
              title: event.title, 
              status: 'skipped', 
              reason: 'duplicate',
              existingId: duplicate.eventId 
            });
            continue;
          }

          // Rewrite content for uniqueness and SEO
          const { description, shortDescription, metaTitle, metaDescription } = rewriteEventContent(event);
          
          const { price, isFree } = parsePrice(event.price);
          const locality = detectLocality(event.venue);
          const category = normalizeCategory(event.category);
          const tags = generateSEOTags(event, locality);
          const slug = generateSlug(event.title, startDate);

          const processedEvent: ProcessedEvent = {
            title: event.title,
            description,
            short_description: shortDescription,
            start_date: startDate,
            venue_name: event.venue.replace(/:\s*Jaipur$/i, '').trim(),
            venue_address: `${event.venue}, Jaipur, Rajasthan 302001`,
            city: 'Jaipur',
            locality,
            category,
            ticket_price: price,
            is_free: isFree,
            cover_image: event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
            registration_url: event.eventUrl,
            organizer_name: 'BookMyShow',
            status: 'published',
            tags,
            slug,
            meta_title: metaTitle,
            meta_description: metaDescription,
          };

          if (!dryRun) {
            const { error } = await supabase.from('events').insert(processedEvent);
            
            if (error) {
              console.error('Insert error:', error);
              results.failed++;
              results.details.push({ title: event.title, status: 'failed', error: error.message });
            } else {
              results.imported++;
              results.details.push({ 
                title: event.title, 
                status: 'imported', 
                slug,
                locality,
                category 
              });
            }
          } else {
            results.imported++;
            results.details.push({ 
              title: event.title, 
              status: 'would-import', 
              slug,
              preview: { metaTitle, category, locality } 
            });
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

    if (action === 'scrape-and-import') {
      // Combined action: Scrape + Import in one call
      if (!firecrawlApiKey) {
        return new Response(
          JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const targetUrl = url || `https://in.bookmyshow.com/explore/events-${city}`;
      console.log('Scrape and import from:', targetUrl);

      // Scrape
      const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: targetUrl,
          formats: ['markdown', 'links'],
          waitFor: 3000,
        }),
      });

      const scrapeData = await scrapeResponse.json();
      
      if (!scrapeResponse.ok || !scrapeData.success) {
        return new Response(
          JSON.stringify({ success: false, error: 'Scrape failed', details: scrapeData }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
      const events = parseEventsFromMarkdown(markdown);

      // Import
      const results = {
        total: events.length,
        imported: 0,
        skipped: 0,
        failed: 0,
        source: targetUrl,
        details: [] as any[],
      };

      for (const event of events) {
        try {
          const startDate = event.date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
          
          const duplicate = await checkDuplicate(supabase, event.title, startDate);
          if (duplicate.exists) {
            results.skipped++;
            results.details.push({ title: event.title, status: 'skipped' });
            continue;
          }

          const { description, shortDescription, metaTitle, metaDescription } = rewriteEventContent(event);
          const { price, isFree } = parsePrice(event.price);
          const locality = detectLocality(event.venue);
          const category = normalizeCategory(event.category);
          const tags = generateSEOTags(event, locality);
          const slug = generateSlug(event.title, startDate);

          if (!dryRun) {
            const { error } = await supabase.from('events').insert({
              title: event.title,
              description,
              short_description: shortDescription,
              start_date: startDate,
              venue_name: event.venue.replace(/:\s*Jaipur$/i, '').trim(),
              venue_address: `${event.venue}, Jaipur, Rajasthan 302001`,
              city: 'Jaipur',
              locality,
              category,
              ticket_price: price,
              is_free: isFree,
              cover_image: event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
              registration_url: event.eventUrl,
              organizer_name: 'BookMyShow',
              status: 'published',
              tags,
              slug,
              meta_title: metaTitle,
              meta_description: metaDescription,
            });

            if (error) {
              results.failed++;
              results.details.push({ title: event.title, status: 'failed' });
            } else {
              results.imported++;
              results.details.push({ title: event.title, status: 'imported', slug });
            }
          } else {
            results.imported++;
            results.details.push({ title: event.title, status: 'would-import' });
          }
        } catch (err) {
          results.failed++;
          results.details.push({ title: event.title, status: 'failed' });
        }
      }

      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid action. Use "scrape", "import", or "scrape-and-import"' 
      }),
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
