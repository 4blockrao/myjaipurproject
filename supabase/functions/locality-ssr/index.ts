// supabase/functions/locality-ssr/index.ts
// GOLD STANDARD version - BookMyShow quality for locality pages

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

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") || "";

// Cache for SPA shell with TTL
let cachedIndexHtml: { html: string; fetchedAt: number } | null = null;

// Enhanced bot detection (includes more crawlers)
const BOT_PATTERNS = [
  /Googlebot/i, /bingbot/i, /Baiduspider/i, /YandexBot/i, /DuckDuckBot/i,
  /Slurp/i, /facebookexternalhit/i, /WhatsApp/i, /Twitterbot/i, /LinkedInBot/i,
  /Pinterest/i, /TelegramBot/i, /GPTBot/i, /CCBot/i, /Applebot/i, /Amazonbot/i,
  /SemrushBot/i, /AhrefsBot/i, /MJ12bot/i, /rogerbot/i, /DotBot/i,
];

function isBot(userAgent: string): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

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
  return str.slice(0, max - 1) + "…";
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "TBA";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function getSpaShellHtml(): Promise<string> {
  const now = Date.now();
  const ttlMs = 5 * 60 * 1000;
  
  if (cachedIndexHtml && now - cachedIndexHtml.fetchedAt < ttlMs) {
    return cachedIndexHtml.html;
  }

  try {
    const res = await fetch(`${BASE_URL}/index.html?cb=${Math.floor(now / 1000)}`, {
      headers: { "user-agent": "jaipurcircle-locality-ssr/1.0", accept: "text/html" },
    });

    if (!res.ok) throw new Error(`Failed to fetch index.html: ${res.status}`);

    const html = await res.text();
    const cleanedHtml = html.replace(/<title>.*?<\/title>/, '');
    cachedIndexHtml = { html: cleanedHtml, fetchedAt: now };
    return cleanedHtml;
  } catch (err) {
    console.error("Failed to fetch SPA shell:", err);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${SITE_NAME}</title></head><body><div id="root"></div></body></html>`;
  }
}

// ENHANCED: Fetches more comprehensive locality data
async function fetchLocalityData(slug: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-ssr": "locality-ssr" } },
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

  // ENHANCED: Fetch events with more details and pricing tiers
  let events: any[] = [];
  try {
    const { data: eventsData } = await supabase
      .from("events")
      .select(`
        title, 
        slug, 
        start_date, 
        end_date,
        venue_name, 
        venue_address,
        cover_image, 
        ticket_price, 
        is_free, 
        category,
        description,
        performer_name,
        ticket_tiers
      `)
      .eq("locality_slug", slug)
      .gte("start_date", new Date().toISOString())
      .lte("start_date", new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString())
      .order("start_date", { ascending: true })
      .limit(20);
    
    events = eventsData?.map(event => ({
      ...event,
      ticket_tiers: event.ticket_tiers || (event.ticket_price ? [{ name: "General", price: event.ticket_price }] : [])
    })) || [];
  } catch (eventsError) {
    console.error("Events fetch error (non-critical):", eventsError);
  }

  // ENHANCED: Fetch popular venues in this locality
  let venues: any[] = [];
  try {
    const { data: venuesData } = await supabase
      .from("venues")
      .select("name, slug, category, rating, image")
      .eq("locality_slug", slug)
      .order("rating", { ascending: false })
      .limit(8);
    venues = venuesData || [];
  } catch (venuesError) {
    console.error("Venues fetch error (non-critical):", venuesError);
  }

  // Fetch nearby localities with distance
  let nearbyLocalities: any[] = [];
  try {
    let query = supabase.from("localities").select("name, slug, known_for");
    
    if (locality.geo_lat && locality.geo_lng) {
      // Use PostGIS if available, otherwise simple nearby
      query = supabase.rpc('nearby_localities', {
        lat: locality.geo_lat,
        lng: locality.geo_lng,
        exclude_slug: slug
      });
    } else {
      query = query.neq("slug", slug).limit(6);
    }
    
    const { data: nearby } = await query;
    nearbyLocalities = nearby || [];
  } catch (nearbyError) {
    console.error("Nearby localities fetch error:", nearbyError);
    // Fallback: just get any localities
    const { data: fallback } = await supabase.from("localities").select("name, slug").neq("slug", slug).limit(6);
    nearbyLocalities = fallback || [];
  }

  // Fetch event statistics
  let eventStats = { total: 0, thisWeek: 0, thisMonth: 0, free: 0 };
  try {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const { count: total } = await supabase.from("events").select("*", { count: "exact", head: true }).eq("locality_slug", slug).gte("start_date", now.toISOString());
    const { count: thisWeek } = await supabase.from("events").select("*", { count: "exact", head: true }).eq("locality_slug", slug).gte("start_date", now.toISOString()).lte("start_date", nextWeek.toISOString());
    const { count: free } = await supabase.from("events").select("*", { count: "exact", head: true }).eq("locality_slug", slug).eq("is_free", true).gte("start_date", now.toISOString());
    
    eventStats = {
      total: total || 0,
      thisWeek: thisWeek || 0,
      thisMonth: 0, // Could calculate if needed
      free: free || 0,
    };
  } catch (statsError) {
    console.error("Event stats error:", statsError);
  }

  return { locality, events, venues, nearbyLocalities, eventStats };
}

// ENHANCED: Comprehensive Event Schema (BookMyShow style)
function generateEventSchemas(events: any[], localityName: string, localityUrl: string): string {
  if (!events.length) return '';
  
  const eventSchemas = events.slice(0, 10).map(event => {
    const eventSchema: any = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      description: truncate(event.description || `Join us for ${event.title} in ${localityName}.`, 500),
      startDate: event.start_date,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: event.venue_name || localityName,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Jaipur",
          addressRegion: "Rajasthan",
          addressCountry: "IN",
          streetAddress: event.venue_address || undefined,
        },
      },
      image: event.cover_image || DEFAULT_IMAGE,
      url: `${BASE_URL}/events/${event.slug}`,
    };

    // Add performer if available
    if (event.performer_name) {
      eventSchema.performer = {
        "@type": "Person",
        name: event.performer_name,
      };
    }

    // Add ticket offers (critical for events)
    if (event.is_free) {
      eventSchema.offers = {
        "@type": "Offer",
        price: 0,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        validFrom: new Date().toISOString(),
      };
    } else if (event.ticket_tiers?.length) {
      eventSchema.offers = event.ticket_tiers.map((tier: any) => ({
        "@type": "Offer",
        name: tier.name,
        price: tier.price,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        validFrom: new Date().toISOString(),
      }));
    } else if (event.ticket_price) {
      eventSchema.offers = {
        "@type": "Offer",
        price: event.ticket_price,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      };
    }

    return eventSchema;
  });

  return eventSchemas.map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`).join('');
}

// ENHANCED: Breadcrumb Schema
function generateBreadcrumbSchema(locality: any, canonical: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Jaipur", item: `${BASE_URL}/jaipur` },
      { "@type": "ListItem", position: 3, name: "Localities", item: `${BASE_URL}/jaipur/localities` },
      { "@type": "ListItem", position: 4, name: locality.name, item: canonical },
    ],
  };
}

// ENHANCED: Place Schema with more details
function generatePlaceSchema(locality: any, canonical: string, eventStats: any) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${locality.name}, Jaipur`,
    url: canonical,
    description: truncate(locality.seo_blurb || locality.description || `Explore ${locality.name} in Jaipur.`, 500),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jaipur",
      addressRegion: "Rajasthan",
      addressCountry: "IN",
    },
  };

  if (locality.geo_lat && locality.geo_lng) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: locality.geo_lat,
      longitude: locality.geo_lng,
    };
  }

  // Add aggregate rating if available
  if (locality.avg_rating && locality.review_count) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: locality.avg_rating,
      reviewCount: locality.review_count,
    };
  }

  return schema;
}

// ENHANCED: FAQ Schema with locality-specific answers
function generateFAQSchema(locality: any, eventCount: number) {
  const questions = [
    {
      name: `What are the best places to visit in ${locality.name}, Jaipur?`,
      text: locality.known_for || `${locality.name} offers a mix of ${locality.venue_categories?.join(', ') || 'local markets, cultural venues, and dining experiences'}. Popular spots include ${locality.popular_venues?.slice(0,3).join(', ') || 'various local attractions'}. Check JaipurCircle for the latest events and happenings.`,
    },
    {
      name: `Upcoming events in ${locality.name}`,
      text: eventCount > 0 
        ? `There are currently ${eventCount} upcoming events in ${locality.name}. Browse concerts, workshops, cultural programs, and more on JaipurCircle. Book tickets directly through our platform.`
        : `Stay tuned for upcoming events in ${locality.name}. Follow this locality on JaipurCircle to get notified when new events are announced.`,
    },
    {
      name: `How to reach ${locality.name} in Jaipur?`,
      text: `${locality.name} is well-connected within Jaipur. You can reach by metro (${locality.nearest_metro || 'check local metro station'}), local bus, auto-rickshaw, or app-based cabs like Uber and Ola. The locality is accessible from major city landmarks.`,
    },
    {
      name: `What are the best restaurants and cafes in ${locality.name}?`,
      text: locality.popular_eateries?.length 
        ? `Popular dining spots in ${locality.name} include ${locality.popular_eateries.slice(0,5).join(', ')}. Cuisines range from local Rajasthani to international.`
        : `${locality.name} has several dining options ranging from street food to fine dining. Use JaipurCircle to discover rated restaurants in this area.`,
    },
    {
      name: `Is ${locality.name} a good place for shopping?`,
      text: locality.shopping_options || `${locality.name} offers various shopping experiences from local markets to branded outlets. The area is known for ${locality.known_for?.toLowerCase().includes('shopping') ? 'its shopping scene' : 'local products and daily essentials'}.`,
    },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(q => ({
      "@type": "Question",
      name: q.name,
      acceptedAnswer: { "@type": "Answer", text: q.text },
    })),
  };
}

// ENHANCED: Rich SSR HTML with better styling and structure
function buildSSRMarkup(locality: any, events: any[], venues: any[], nearby: any[], eventStats: any, canonical: string) {
  const hasEvents = events.length > 0;
  
  // Hero section with stats
  const heroHtml = `
    <div class="locality-hero" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: clamp(2rem, 5vw, 3rem); border-radius: 0 0 24px 24px; margin-bottom: 2rem">
      <div style="max-width: 1200px; margin: 0 auto">
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; font-size: 0.875rem">
          ${eventStats.total > 0 ? `<span>🎉 ${eventStats.total} upcoming events</span>` : ''}
          ${eventStats.thisWeek > 0 ? `<span>📅 ${eventStats.thisWeek} this week</span>` : ''}
          ${eventStats.free > 0 ? `<span>🎟️ ${eventStats.free} free events</span>` : ''}
          ${venues.length > 0 ? `<span>🏢 ${venues.length}+ venues</span>` : ''}
        </div>
        <h1 style="font-size: clamp(1.8rem, 6vw, 2.5rem); margin: 0.5rem 0">${escapeHtml(locality.name)}, Jaipur</h1>
        <p style="font-size: 1.125rem; opacity: 0.95; max-width: 800px; margin: 1rem 0 0 0">
          ${escapeHtml(truncate(locality.seo_blurb || locality.description || `Complete guide to ${locality.name} with events, venues, and local experiences.`, 200))}
        </p>
      </div>
    </div>
  `;

  // Enhanced events section with ticket info
  const eventsHtml = hasEvents ? `
    <section style="margin-bottom: 3rem">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; margin-bottom: 1.5rem">
        <h2 style="font-size: 1.5rem; margin: 0">🎪 Upcoming Events in ${escapeHtml(locality.name)}</h2>
        <a href="${BASE_URL}/jaipur/${escapeHtml(locality.slug)}/events" style="color: #667eea; text-decoration: none">View all ${eventStats.total}+ →</a>
      </div>
      <div style="display: grid; gap: 1rem">
        ${events.slice(0, 8).map(event => `
          <article style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-wrap: wrap; cursor: pointer">
            ${event.cover_image ? `<img src="${escapeHtml(event.cover_image)}" alt="${escapeHtml(event.title)}" style="width: 120px; height: 120px; object-fit: cover" loading="lazy">` : ''}
            <div style="flex: 1; padding: 1rem">
              <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: start; gap: 0.5rem; margin-bottom: 0.5rem">
                <h3 style="margin: 0; font-size: 1.125rem">
                  <a href="${BASE_URL}/events/${escapeHtml(event.slug)}" style="color: #1f2937; text-decoration: none">${escapeHtml(event.title)}</a>
                </h3>
                ${event.is_free 
                  ? '<span style="background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600">FREE</span>'
                  : `<span style="background: #f59e0b; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600">₹${event.ticket_price || 'TBA'}</span>`
                }
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.5rem; font-size: 0.875rem; color: #6b7280">
                <span>📍 ${escapeHtml(event.venue_name || 'Venue TBA')}</span>
                <span>📅 ${formatDate(event.start_date)}${event.end_date ? ` – ${formatDate(event.end_date)}` : ''}</span>
                ${event.start_date ? `<span>⏰ ${formatTime(event.start_date)}</span>` : ''}
              </div>
              ${event.performer_name ? `<div style="font-size: 0.875rem; color: #8b5cf6">🎤 ${escapeHtml(event.performer_name)}</div>` : ''}
              ${event.ticket_tiers?.length > 1 ? `<div style="margin-top: 0.5rem; font-size: 0.75rem; color: #6b7280">${event.ticket_tiers.map((t: any) => `${t.name}: ₹${t.price}`).join(' • ')}</div>` : ''}
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  ` : `
    <section style="margin-bottom: 3rem; background: linear-gradient(135deg, #f5f7fa 0%, #f3f4f6 100%); border-radius: 16px; padding: 3rem 2rem; text-align: center">
      <div style="font-size: 3rem; margin-bottom: 1rem">🎉</div>
      <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem">No Upcoming Events Yet</h2>
      <p style="color: #6b7280; margin-bottom: 1.5rem">Be the first to know when events are announced in ${escapeHtml(locality.name)}</p>
      <button onclick="alert('Follow this locality feature coming soon!')" style="background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 1rem; cursor: pointer">🔔 Follow this locality</button>
    </section>
  `;

  // Venues section
  const venuesHtml = venues.length > 0 ? `
    <section style="margin-bottom: 3rem">
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem">🏛️ Popular Venues in ${escapeHtml(locality.name)}</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem">
        ${venues.map(venue => `
          <a href="${BASE_URL}/venues/${escapeHtml(venue.slug)}" style="text-decoration: none; background: white; border-radius: 12px; padding: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.2s; display: block">
            ${venue.image ? `<img src="${escapeHtml(venue.image)}" alt="${escapeHtml(venue.name)}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 0.75rem" loading="lazy">` : ''}
            <h3 style="margin: 0 0 0.25rem 0; font-size: 1rem; color: #1f2937">${escapeHtml(venue.name)}</h3>
            ${venue.category ? `<span style="font-size: 0.75rem; color: #6b7280">${escapeHtml(venue.category)}</span>` : ''}
            ${venue.rating ? `<span style="font-size: 0.75rem; color: #f59e0b">⭐ ${venue.rating}</span>` : ''}
          </a>
        `).join('')}
      </div>
    </section>
  ` : '';

  // About section with rich content
  const aboutHtml = `
    <section style="margin-bottom: 3rem; background: #f9fafb; border-radius: 16px; padding: 1.5rem">
      <h2 style="font-size: 1.25rem; margin-bottom: 1rem">📍 About ${escapeHtml(locality.name)}</h2>
      <div style="color: #374151; line-height: 1.6">
        <p>${escapeHtml(locality.seo_blurb || locality.description || `Explore ${locality.name}, a vibrant locality in Jaipur.`)}</p>
        ${locality.known_for ? `<p style="margin-top: 1rem"><strong>✨ Known for:</strong> ${escapeHtml(locality.known_for)}</p>` : ''}
        ${locality.best_time_to_visit ? `<p><strong>📅 Best time to visit:</strong> ${escapeHtml(locality.best_time_to_visit)}</p>` : ''}
      </div>
    </section>
  `;

  // Nearby localities
  const nearbyHtml = nearby.length > 0 ? `
    <section style="margin-bottom: 3rem">
      <h2 style="font-size: 1.25rem; margin-bottom: 1rem">📍 Nearby Localities</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem">
        ${nearby.map(loc => `
          <a href="${BASE_URL}/jaipur/${escapeHtml(loc.slug)}" style="background: #f3f4f6; padding: 0.5rem 1rem; border-radius: 24px; color: #1f2937; text-decoration: none; font-size: 0.875rem; transition: background 0.2s">
            ${escapeHtml(loc.name)}${loc.known_for ? ` ✨` : ''}
          </a>
        `).join('')}
      </div>
    </section>
  ` : '';

  // Critical CSS inline for performance
  const criticalCSS = `
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.5;background:#f8fafc}
      .ssr-prerender{max-width:1200px;margin:0 auto}
      @media (max-width:768px){.ssr-prerender{padding:0 1rem 2rem}}
      article:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.12)}
      a{transition:all 0.2s}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      .ssr-prerender{animation:fadeIn 0.3s ease-out}
    </style>
  `;

  return `
    ${criticalCSS}
    <div class="ssr-prerender" data-ssr="locality" data-locality-slug="${escapeHtml(locality.slug)}" data-event-count="${eventStats.total}">
      ${heroHtml}
      <div style="padding: 0 1rem 2rem">
        ${eventsHtml}
        ${venuesHtml}
        ${aboutHtml}
        ${nearbyHtml}
      </div>
    </div>
  `;
}

// Enhanced injection with proper root handling
function injectIntoRoot(html: string, content: string): string {
  const rootRegex = /<div\s+id=["']root["'][^>]*>([\s\S]*?)<\/div>/i;
  if (rootRegex.test(html)) {
    return html.replace(rootRegex, `<div id="root">${content}</div>`);
  }
  return html.replace('</body>', `<div id="root">${content}</div></body>`);
}

// Generate critical preload links
function generatePreloadLinks(locality: any): string {
  const links = [];
  
  // Preconnect to important origins
  links.push('<link rel="preconnect" href="https://fonts.googleapis.com">');
  links.push('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
  links.push('<link rel="preconnect" href="https://cdn.jaipurcircle.com">');
  links.push('<link rel="dns-prefetch" href="https://www.google-analytics.com">');
  
  // Preload hero image if available
  if (locality.hero_image) {
    links.push(`<link rel="preload" as="image" href="${escapeHtml(locality.hero_image)}">`);
  }
  
  return links.join('\n');
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const url = new URL(req.url);
  const userAgent = req.headers.get("user-agent") || "";
  const isSearchBot = isBot(userAgent);

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

    const data = await fetchLocalityData(slug);
    
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

    const { locality, events, venues, nearbyLocalities, eventStats } = data;
    const canonical = `${BASE_URL}/jaipur/${locality.slug}`;
    const title = `${locality.name}, Jaipur — ${eventStats.total > 0 ? `${eventStats.total} Upcoming Events, ` : ''}Places & Local Guide | ${SITE_NAME}`;
    const description = truncate(
      locality.seo_blurb || 
      `Complete guide to ${locality.name} in Jaipur. ${eventStats.total > 0 ? `Find ${eventStats.total} upcoming events, ` : ''}discover popular venues, dining spots, and local experiences in this vibrant locality. Updated ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}.`,
      160
    );
    const image = locality.featured_image || DEFAULT_IMAGE;

    let indexHtml = await getSpaShellHtml();

    // Generate all schemas
    const breadcrumbSchema = generateBreadcrumbSchema(locality, canonical);
    const placeSchema = generatePlaceSchema(locality, canonical, eventStats);
    const faqSchema = generateFAQSchema(locality, eventStats.total);
    const eventSchemas = generateEventSchemas(events, locality.name, canonical);
    const preloadLinks = generatePreloadLinks(locality);

    const headHtml = `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="keywords" content="${escapeHtml(locality.name)}, ${locality.name} jaipur, events in ${locality.slug}, ${locality.name} venues, ${locality.name} guide, jaipur localities" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${escapeHtml(canonical)}" />

<!-- Preloads & Preconnects -->
${preloadLinks}

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:alt" content="${escapeHtml(locality.name)} - Locality guide with ${eventStats.total} upcoming events" />
<meta property="og:locale" content="en_IN" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />

<!-- Structured Data -->
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
<script type="application/ld+json">${JSON.stringify(placeSchema)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
${eventSchemas}
`;

    if (indexHtml.includes("</head>")) {
      indexHtml = indexHtml.replace(/<\/head>/i, `${headHtml}\n</head>`);
    }

    // For bots: serve fully populated SSR content
    if (isSearchBot) {
      const ssrContent = buildSSRMarkup(locality, events, venues, nearbyLocalities, eventStats, canonical);
      const finalHtml = injectIntoRoot(indexHtml, ssrContent);
      
      console.log(`[locality-ssr] Bot served: ${slug} (${events.length} events, ${venues.length} venues) in ${Date.now() - startTime}ms`);
      
      return new Response(finalHtml, {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
          "x-ssr-module": "locality-ssr-v2",
          "x-ssr-bot": "true",
          "x-events-count": String(events.length),
          "x-render-time-ms": String(Date.now() - startTime),
        },
      });
    }

    // For regular users: lightweight shell with placeholder
    const finalHtml = injectIntoRoot(indexHtml, `<div data-ssr-placeholder="locality-${locality.slug}" data-event-count="${eventStats.total}"></div>`);
    
    console.log(`[locality-ssr] User served (SPA mode): ${slug} in ${Date.now() - startTime}ms`);
    
    return new Response(finalHtml, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
        "x-ssr-module": "locality-ssr-v2",
        "x-ssr-bot": "false",
        "x-render-time-ms": String(Date.now() - startTime),
      },
    });

  } catch (err) {
    console.error("Locality SSR fatal error:", err);
    
    const errorHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${SITE_NAME} | Localities in Jaipur</title></head>
<body><div id="root"></div><script>console.error("SSR Error, falling back to SPA");</script></body>
</html>`;
    
    return new Response(errorHtml, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});
