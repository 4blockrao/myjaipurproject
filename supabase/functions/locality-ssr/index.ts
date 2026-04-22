// supabase/functions/locality-ssr/index.ts
// GOLD STANDARD 100% - Complete Locality Page with Events, Venues, and Rich Schema

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = (Deno.env.get("SITE_ORIGIN") ?? "https://www.jaipurcircle.com").replace(/\/+$/, "");
const SITE_NAME = "JaipurCircle";
const DEFAULT_IMAGE = "https://www.jaipurcircle.com/og-default.jpg";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

let cachedIndexHtml: { html: string; fetchedAt: number } | null = null;

// ============================================
// ENHANCED BOT DETECTION
// ============================================
const BOT_PATTERNS = [
  /Googlebot/i, /bingbot/i, /Baiduspider/i, /YandexBot/i, /DuckDuckBot/i,
  /Slurp/i, /GPTBot/i, /CCBot/i, /Applebot/i, /Amazonbot/i,
  /SemrushBot/i, /AhrefsBot/i, /MJ12bot/i, /rogerbot/i, /DotBot/i,
  /facebookexternalhit/i, /Facebot/i, /WhatsApp/i, /Twitterbot/i, 
  /LinkedInBot/i, /Pinterest/i, /TelegramBot/i, /Discordbot/i, 
  /Slackbot/i, /SkypeUriPreview/i, /RedditBot/i, /Tumblr/i,
  /spider/i, /crawler/i
];

function isBot(userAgent: string): boolean {
  if (!userAgent) return false;
  if (userAgent.trim() === "") return true;
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function truncate(str: string, max: number): string {
  if (!str) return "";
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + "...";
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

// ============================================
// FETCH SPA SHELL
// ============================================
async function getSpaShellHtml(): Promise<string> {
  const now = Date.now();
  const ttlMs = 5 * 60 * 1000;
  
  if (cachedIndexHtml && now - cachedIndexHtml.fetchedAt < ttlMs) {
    return cachedIndexHtml.html;
  }

  try {
    const res = await fetch(`${BASE_URL}/index.html?cb=${Math.floor(now / 1000)}`, {
      headers: { "user-agent": "jaipurcircle-locality-ssr/2.0", accept: "text/html" },
    });

    if (!res.ok) throw new Error(`Failed to fetch index.html: ${res.status}`);

    let html = await res.text();
    html = html.replace(/<title>.*?<\/title>/, '');
    html = html.replace(/<div\s+id=["']root["'][^>]*>.*?<\/div>/si, '<div id="root"></div>');
    
    cachedIndexHtml = { html, fetchedAt: now };
    return html;
  } catch (err) {
    console.error("Failed to fetch SPA shell:", err);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${SITE_NAME}</title></head><body><div id="root"></div><script src="/assets/index.js"></script></body></html>`;
  }
}

// ============================================
// FETCH COMPLETE LOCALITY DATA
// ============================================
async function fetchCompleteLocalityData(slug: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Fetch locality with all fields
  const { data: locality, error } = await supabase
    .from("localities")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !locality) {
    console.error("Locality fetch error:", error);
    return null;
  }

  // Fetch upcoming events (next 90 days)
  const { data: events } = await supabase
    .from("events")
    .select("title, slug, start_date, venue_name, cover_image, ticket_price, is_free, category")
    .eq("locality_slug", slug)
    .gte("start_date", new Date().toISOString())
    .lte("start_date", new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString())
    .order("start_date", { ascending: true })
    .limit(12);

  // Fetch popular venues in this locality
  const { data: venues } = await supabase
    .from("venues")
    .select("name, slug, category, rating, image")
    .eq("locality_slug", slug)
    .order("rating", { ascending: false, nullsLast: true })
    .limit(8);

  // Fetch nearby localities
  let nearby: any[] = [];
  if (locality.geo_lat && locality.geo_lng) {
    const { data: nearbyData } = await supabase
      .rpc('nearby_localities_simple', {
        lat: locality.geo_lat,
        lng: locality.geo_lng,
        exclude_slug: slug,
        max_distance_km: 5,
        limit_count: 8
      });
    nearby = nearbyData || [];
  } else {
    const { data: fallback } = await supabase
      .from("localities")
      .select("name, slug")
      .neq("slug", slug)
      .limit(8);
    nearby = fallback || [];
  }

  const eventCount = events?.length || 0;

  return { 
    locality, 
    events: events || [], 
    venues: venues || [], 
    nearby, 
    eventCount 
  };
}

// ============================================
// GENERATE ALL SCHEMAS (GOLD STANDARD)
// ============================================
function generateAllSchemas(locality: any, events: any[], venues: any[], canonical: string) {
  const schemas = [];

  // 1. Breadcrumb Schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": "Jaipur", "item": `${BASE_URL}/jaipur` },
      { "@type": "ListItem", "position": 3, "name": "Localities", "item": `${BASE_URL}/jaipur/localities` },
      { "@type": "ListItem", "position": 4, "name": locality.name, "item": canonical }
    ]
  });

  // 2. Enhanced Place Schema
  const placeSchema: any = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": `${locality.name}, Jaipur`,
    "url": canonical,
    "description": truncate(locality.seo_blurb || locality.description || `Complete guide to ${locality.name} in Jaipur with events, venues, and local experiences.`, 500),
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Jaipur",
      "addressRegion": "Rajasthan",
      "addressCountry": "IN"
    }
  };

  // Add geo coordinates if available
  if (locality.geo_lat && locality.geo_lng) {
    placeSchema.geo = {
      "@type": "GeoCoordinates",
      "latitude": locality.geo_lat,
      "longitude": locality.geo_lng
    };
  }

  // Add known_for as additional property
  if (locality.known_for && Array.isArray(locality.known_for) && locality.known_for.length > 0) {
    placeSchema.knownFor = locality.known_for;
  }

  // Add aggregate rating if available
  if (locality.avg_rating && locality.review_count) {
    placeSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": locality.avg_rating,
      "reviewCount": locality.review_count,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  // Add number of upcoming events
  if (events.length > 0) {
    placeSchema.numberOfUpcomingEvents = events.length;
  }

  schemas.push(placeSchema);

  // 3. Event Schemas for each upcoming event (max 5)
  events.slice(0, 5).forEach(event => {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Event",
      "name": event.title,
      "startDate": event.start_date,
      "location": {
        "@type": "Place",
        "name": event.venue_name || locality.name,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Jaipur",
          "addressRegion": "Rajasthan",
          "addressCountry": "IN"
        }
      },
      "image": event.cover_image,
      "url": `${BASE_URL}/events/${event.slug}`,
      "offers": event.is_free ? {
        "@type": "Offer",
        "price": 0,
        "priceCurrency": "INR"
      } : event.ticket_price ? {
        "@type": "Offer",
        "price": event.ticket_price,
        "priceCurrency": "INR"
      } : undefined
    });
  });

  // 4. ItemList Schema for venues
  if (venues.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `Popular Venues in ${locality.name}`,
      "description": `Recommended venues and attractions in ${locality.name}, Jaipur`,
      "numberOfItems": venues.length,
      "itemListElement": venues.map((venue, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": venue.name,
        "url": `${BASE_URL}/venues/${venue.slug}`,
        "description": `${venue.name} is a popular ${venue.category || "venue"} in ${locality.name}.`
      }))
    });
  }

  // 5. Enhanced FAQ Schema (FIXED: text as string, not array)
  const faqQuestions = [
    {
      name: `What are the best places to visit in ${locality.name}, Jaipur?`,
      text: locality.known_for?.length 
        ? `${locality.name} is known for ${locality.known_for.slice(0, 3).join(", ")}. ${locality.popular_venues?.length ? `Popular venues include ${locality.popular_venues.slice(0, 3).join(", ")}.` : ""} Check JaipurCircle for upcoming events and local experiences.`
        : `${locality.name} offers a mix of local attractions, shopping areas, and dining options. Explore the locality guide for more details.`
    },
    {
      name: `Upcoming events in ${locality.name}`,
      text: events.length > 0 
        ? `There are currently ${events.length} upcoming events in ${locality.name}. Browse concerts, workshops, cultural programs, and more on JaipurCircle. Book tickets directly through our platform.`
        : `Stay tuned for upcoming events in ${locality.name}. Follow this locality on JaipurCircle to get notified when new events are announced.`
    },
    {
      name: `How to reach ${locality.name} in Jaipur?`,
      text: `${locality.name} is well-connected within Jaipur. You can reach by metro (${locality.nearest_metro || "check local metro station"}), local bus, auto-rickshaw, or app-based cabs like Uber and Ola. ${locality.geo_lat && locality.geo_lng ? `Coordinates: ${locality.geo_lat}°N, ${locality.geo_lng}°E.` : ""}`
    },
    {
      name: `What are the best restaurants and cafes in ${locality.name}?`,
      text: locality.popular_eateries?.length 
        ? `Popular dining spots in ${locality.name} include ${locality.popular_eateries.slice(0, 5).join(", ")}. Cuisines range from local Rajasthani to international.`
        : `${locality.name} has several dining options ranging from street food to fine dining. Use JaipurCircle to discover rated restaurants in this area.`
    },
    {
      name: `Is ${locality.name} a good place for shopping?`,
      text: locality.shopping_options || `${locality.name} offers various shopping experiences from local markets to branded outlets. ${locality.known_for?.includes("Shopping") ? "The area is particularly known for its shopping scene." : ""}`
    },
    {
      name: `What is the best time to visit ${locality.name}?`,
      text: locality.best_time_to_visit || "October to March is generally the best time to visit Jaipur, with pleasant weather ideal for exploring the city and its localities."
    }
  ];

  schemas.push({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqQuestions.map(q => ({
      "@type": "Question",
      "name": q.name,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.text  // ← FIXED: string, not array
      }
    }))
  });

  return schemas;
}

// ============================================
// BUILD SSR HTML FOR BOTS
// ============================================
function buildSSRHTML(locality: any, events: any[], venues: any[], nearby: any[], eventCount: number) {
  // Known For badges
  const knownForHtml = locality.known_for?.length ? `
    <div class="section known-for">
      <h3>✨ Known For</h3>
      <div class="badge-group">
        ${locality.known_for.map((item: string) => `<span class="badge badge-yellow">${escapeHtml(item)}</span>`).join('')}
      </div>
    </div>
  ` : '';

  // Popular Venues grid
  const venuesHtml = venues?.length ? `
    <div class="section venues">
      <h3>🏛️ Popular Venues in ${escapeHtml(locality.name)}</h3>
      <div class="venue-grid">
        ${venues.map((venue: any) => `
          <a href="${BASE_URL}/venues/${venue.slug}" class="venue-card">
            ${venue.image ? `<img src="${escapeHtml(venue.image)}" alt="${escapeHtml(venue.name)}" loading="lazy">` : '<div class="venue-placeholder">🏢</div>'}
            <h4>${escapeHtml(venue.name)}</h4>
            ${venue.rating ? `<span class="rating">⭐ ${venue.rating}</span>` : ''}
            ${venue.category ? `<span class="category">${escapeHtml(venue.category)}</span>` : ''}
          </a>
        `).join('')}
      </div>
    </div>
  ` : '';

  // Events section
  const eventsHtml = events.length > 0 ? `
    <div class="section events">
      <div class="section-header">
        <h3>🎪 Upcoming Events in ${escapeHtml(locality.name)}</h3>
        <a href="${BASE_URL}/jaipur/${locality.slug}/events" class="view-all">View all ${eventCount} →</a>
      </div>
      <div class="event-list">
        ${events.slice(0, 6).map((event: any) => `
          <a href="${BASE_URL}/events/${event.slug}" class="event-card">
            ${event.cover_image ? `<img src="${escapeHtml(event.cover_image)}" alt="${escapeHtml(event.title)}" loading="lazy">` : '<div class="event-placeholder">🎉</div>'}
            <div class="event-info">
              <h4>${escapeHtml(event.title)}</h4>
              <div class="event-meta">
                <span>📅 ${formatDate(event.start_date)}</span>
                <span>📍 ${escapeHtml(event.venue_name || 'TBA')}</span>
              </div>
              <div class="event-price">${event.is_free ? 'FREE' : event.ticket_price ? `₹${event.ticket_price}` : 'TBA'}</div>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  ` : `
    <div class="section events-empty">
      <h3>🎪 No Upcoming Events Yet</h3>
      <p>Be the first to know when events are announced in ${escapeHtml(locality.name)}</p>
      <button class="follow-btn" data-locality="${locality.slug}">🔔 Follow this locality</button>
    </div>
  `;

  // Popular Eateries
  const eateriesHtml = locality.popular_eateries?.length ? `
    <div class="section eateries">
      <h3>🍽️ Popular Eateries</h3>
      <div class="badge-group">
        ${locality.popular_eateries.map((item: string) => `<span class="badge badge-green">${escapeHtml(item)}</span>`).join('')}
      </div>
    </div>
  ` : '';

  // Info cards (Metro, Best Time, Shopping)
  const infoCardsHtml = `
    <div class="info-cards">
      ${locality.nearest_metro ? `
        <div class="info-card">
          <span class="info-icon">🚇</span>
          <div>
            <strong>Nearest Metro</strong>
            <span>${escapeHtml(locality.nearest_metro)}</span>
          </div>
        </div>
      ` : ''}
      ${locality.best_time_to_visit ? `
        <div class="info-card">
          <span class="info-icon">📅</span>
          <div>
            <strong>Best Time to Visit</strong>
            <span>${escapeHtml(locality.best_time_to_visit)}</span>
          </div>
        </div>
      ` : ''}
      ${locality.shopping_options ? `
        <div class="info-card">
          <span class="info-icon">🛍️</span>
          <div>
            <strong>Shopping</strong>
            <span>${escapeHtml(truncate(locality.shopping_options, 100))}</span>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Nearby localities
  const nearbyHtml = nearby.length > 0 ? `
    <div class="section nearby">
      <h3>📍 Nearby Localities</h3>
      <div class="nearby-list">
        ${nearby.map((loc: any) => `
          <a href="${BASE_URL}/jaipur/${loc.slug}" class="nearby-item">
            ${escapeHtml(loc.name)}
            ${loc.distance_km ? `<span class="distance">${loc.distance_km.toFixed(1)} km</span>` : ''}
          </a>
        `).join('')}
      </div>
    </div>
  ` : '';

  const criticalCSS = `
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#f8fafc;line-height:1.5}
      .locality-page{max-width:1200px;margin:0 auto}
      .hero{background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);color:white;padding:clamp(2rem,5vw,3rem);border-radius:0 0 32px 32px}
      .hero h1{font-size:clamp(1.8rem,6vw,2.5rem);margin:0.5rem 0}
      .hero-stats{display:flex;gap:1rem;flex-wrap:wrap;margin:1rem 0;font-size:0.875rem}
      .hero-stat{background:rgba(255,255,255,0.2);padding:0.25rem 0.75rem;border-radius:20px}
      .container{padding:2rem 1rem}
      .section{background:white;border-radius:16px;padding:1.5rem;margin-bottom:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
      .section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap}
      .badge-group{display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.5rem}
      .badge{padding:0.5rem 1rem;border-radius:24px;font-size:0.875rem}
      .badge-yellow{background:#fef3c7;color:#92400e}
      .badge-green{background:#dcfce7;color:#166534}
      .venue-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem}
      .venue-card{text-decoration:none;color:inherit;background:#f9fafb;border-radius:12px;padding:1rem;transition:transform 0.2s;display:block}
      .venue-card:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.1)}
      .venue-card img{width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:0.5rem}
      .venue-placeholder{width:100%;height:120px;background:#e5e7eb;border-radius:8px;margin-bottom:0.5rem;display:flex;align-items:center;justify-content:center;font-size:2rem}
      .event-list{display:flex;flex-direction:column;gap:0.75rem}
      .event-card{display:flex;gap:1rem;text-decoration:none;color:inherit;background:#f9fafb;border-radius:12px;overflow:hidden;transition:transform 0.2s}
      .event-card:hover{transform:translateX(4px);background:#f3f4f6}
      .event-card img{width:100px;height:100px;object-fit:cover}
      .event-placeholder{width:100px;height:100px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:2rem}
      .event-info{flex:1;padding:0.75rem 0.75rem 0.75rem 0}
      .event-meta{display:flex;gap:1rem;font-size:0.75rem;color:#6b7280;margin:0.25rem 0}
      .event-price{font-weight:700;color:#3b82f6;margin-top:0.25rem}
      .info-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;margin-bottom:1.5rem}
      .info-card{background:#f0fdf4;padding:1rem;border-radius:12px;display:flex;gap:0.75rem;border-left:4px solid #10b981}
      .info-icon{font-size:1.5rem}
      .nearby-list{display:flex;flex-wrap:wrap;gap:0.75rem}
      .nearby-item{background:#f3f4f6;padding:0.5rem 1rem;border-radius:24px;text-decoration:none;color:#1f2937;font-size:0.875rem;transition:background 0.2s}
      .nearby-item:hover{background:#e5e7eb}
      .distance{font-size:0.7rem;color:#6b7280;margin-left:0.5rem}
      .follow-btn{background:#667eea;color:white;border:none;padding:0.75rem 1.5rem;border-radius:8px;cursor:pointer;font-size:1rem;margin-top:1rem}
      @media (max-width:640px){.event-card{flex-direction:column}.event-card img,.event-placeholder{width:100%;height:120px}.event-info{padding:0.75rem}}
    </style>
  `;

  return `
    ${criticalCSS}
    <div class="locality-page" data-locality="${locality.slug}" data-events="${eventCount}">
      <div class="hero">
        <div class="hero-stats">
          <span class="hero-stat">📍 ${escapeHtml(locality.name)}</span>
          ${eventCount > 0 ? `<span class="hero-stat">🎉 ${eventCount} Upcoming Events</span>` : ''}
          ${venues?.length ? `<span class="hero-stat">🏛️ ${venues.length} Venues</span>` : ''}
          ${locality.avg_rating ? `<span class="hero-stat">⭐ ${locality.avg_rating} (${locality.review_count || 0} reviews)</span>` : ''}
        </div>
        <h1>${escapeHtml(locality.name)}, Jaipur</h1>
        <p>${escapeHtml(truncate(locality.seo_blurb || locality.description || `Complete guide to ${locality.name} with events, venues, and local experiences.`, 200))}</p>
      </div>
      
      <div class="container">
        ${knownForHtml}
        ${infoCardsHtml}
        ${eventsHtml}
        ${venuesHtml}
        ${eateriesHtml}
        
        <div class="section">
          <h3>ℹ️ About ${escapeHtml(locality.name)}</h3>
          <p>${escapeHtml(locality.description || locality.seo_blurb || `Explore ${locality.name}, a vibrant locality in Jaipur.`)}</p>
        </div>
        
        ${nearbyHtml}
      </div>
    </div>
  `;
}

// ============================================
// MAIN SERVE FUNCTION
// ============================================
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const url = new URL(req.url);
  const userAgent = req.headers.get("user-agent") || "";
  const isCrawler = isBot(userAgent);
  
  console.log(`[locality-ssr] User-Agent: ${userAgent.substring(0, 100)}`);
  console.log(`[locality-ssr] IsCrawler: ${isCrawler}`);

  try {
    const slug = url.searchParams.get("slug")?.trim().toLowerCase();
    
    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error("Missing Supabase configuration");
      return new Response("Server configuration error", { status: 500 });
    }

    const data = await fetchCompleteLocalityData(slug);
    
    if (!data || !data.locality) {
      const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Locality Not Found | ${SITE_NAME}</title><meta name="robots" content="noindex, nofollow"></head>
<body style="font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 20px">
  <h1>Locality Not Found</h1>
  <p>We couldn't find a locality with slug: ${escapeHtml(slug)}</p>
  <a href="/jaipur">Browse localities →</a>
</body>
</html>`;
      return new Response(notFoundHtml, {
        status: 404,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    const { locality, events, venues, nearby, eventCount } = data;
    const canonical = `${BASE_URL}/jaipur/${locality.slug}`;
    
    const title = locality.meta_title || `${locality.name}, Jaipur — ${eventCount > 0 ? `${eventCount} Upcoming Events, ` : ''}Places & Local Guide | ${SITE_NAME}`;
    const description = locality.meta_description || `Complete guide to ${locality.name} in Jaipur. ${eventCount > 0 ? `Find ${eventCount} upcoming events, ` : ''}discover popular venues, dining spots, and local experiences.`;
    const image = locality.featured_image || DEFAULT_IMAGE;

    let indexHtml = await getSpaShellHtml();
    const schemas = generateAllSchemas(locality, events, venues, canonical);

    const headHtml = `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="keywords" content="${escapeHtml(locality.name)}, ${locality.name} jaipur, events in ${locality.slug}, ${locality.name} venues, ${locality.name} guide, jaipur localities" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${escapeHtml(canonical)}" />

<!-- Preloads & Preconnects -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:alt" content="${escapeHtml(locality.name)} - Locality guide with ${eventCount} upcoming events" />
<meta property="og:locale" content="en_IN" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />

<!-- Structured Data -->
${schemas.map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`).join('')}
`;

    if (indexHtml.includes("</head>")) {
      indexHtml = indexHtml.replace(/<\/head>/i, `${headHtml}\n</head>`);
    }

    // For crawlers: return FULL SSR content
    if (isCrawler) {
      const ssrContent = buildSSRHTML(locality, events, venues, nearby, eventCount);
      const finalHtml = indexHtml.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);
      
      console.log(`[locality-ssr] Crawler served: ${slug} (${events.length} events, ${venues.length} venues) in ${Date.now() - startTime}ms`);
      
      return new Response(finalHtml, {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
          "vary": "User-Agent",
          "x-ssr-bot": "true",
          "x-events-count": String(events.length),
          "x-venues-count": String(venues.length),
          "x-render-time-ms": String(Date.now() - startTime),
        },
      });
    }
    
    // For normal users: Return SPA shell with EMPTY root div
    console.log(`[locality-ssr] User served: ${slug} in ${Date.now() - startTime}ms`);
    
    return new Response(indexHtml, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=3600",
        "vary": "User-Agent",
        "x-ssr-bot": "false",
        "x-render-time-ms": String(Date.now() - startTime),
      },
    });

  } catch (err) {
    console.error("Locality SSR fatal error:", err);
    
    const errorHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${SITE_NAME} | Localities in Jaipur</title></head>
<body><div id="root"></div><script src="/assets/index.js"></script></body>
</html>`;
    
    return new Response(errorHtml, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});
