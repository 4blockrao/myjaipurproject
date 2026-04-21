// supabase/functions/event-ssr/index.ts
// Enhanced version with full SEO, caching, and bot detection

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = (Deno.env.get("SITE_ORIGIN") ?? "https://www.jaipurcircle.com").replace(/\/+$/, "");
const SITE_NAME = "JaipurCircle";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=630&fit=crop";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") || "";

// Cache for SPA shell
let cachedIndexHtml: { html: string; fetchedAt: number } | null = null;

// Bot detection - user agents that need full SSR
const BOT_PATTERNS = [
  /Googlebot/i,
  /bingbot/i,
  /Baiduspider/i,
  /YandexBot/i,
  /DuckDuckBot/i,
  /Slurp/i,
  /facebookexternalhit/i,
  /WhatsApp/i,
  /Twitterbot/i,
  /LinkedInBot/i,
  /Pinterest/i,
  /TelegramBot/i,
  /GPTBot/i,
  /CCBot/i,
];

function isBot(userAgent: string): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

// Helper functions
function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateStr: string): string {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getEventType(category: string): string {
  const cat = (category || "").toLowerCase();
  if (cat.includes("music") || cat.includes("concert")) return "MusicEvent";
  if (cat.includes("comedy")) return "ComedyEvent";
  if (cat.includes("dance")) return "DanceEvent";
  if (cat.includes("theatre")) return "TheaterEvent";
  if (cat.includes("festival")) return "Festival";
  if (cat.includes("sports")) return "SportsEvent";
  if (cat.includes("workshop")) return "EducationEvent";
  return "Event";
}

async function getSpaShellHtml(): Promise<string> {
  const now = Date.now();
  const ttlMs = 5 * 60 * 1000; // 5 minutes
  
  if (cachedIndexHtml && now - cachedIndexHtml.fetchedAt < ttlMs) {
    return cachedIndexHtml.html;
  }

  try {
    const res = await fetch(`${BASE_URL}/index.html?cb=${Math.floor(now / 1000)}`, {
      headers: {
        "user-agent": "jaipurcircle-event-ssr/1.0",
        accept: "text/html",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch index.html: ${res.status}`);
    }

    const html = await res.text();
    cachedIndexHtml = { html, fetchedAt: now };
    return html;
  } catch (err) {
    console.error("Failed to fetch SPA shell:", err);
    // Fallback minimal HTML
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${SITE_NAME}</title>
</head>
<body>
  <div id="root"></div>
  <script>console.error("Failed to load application shell");</script>
</body>
</html>`;
  }
}

async function fetchEventData(slug: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-ssr": "event-ssr" } },
  });

  // Fetch event without venue join first (fixes the column error)
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !event) {
    console.error("Event fetch error:", error);
    return null;
  }

  // Try to fetch venue separately if venue_id exists, but don't fail if it doesn't
  let venue = null;
  if (event.venue_id) {
    try {
      const { data: venueData } = await supabase
        .from("venues")
        .select("name, address")
        .eq("id", event.venue_id)
        .maybeSingle();
      venue = venueData;
    } catch (venueError) {
      console.error("Venue fetch error (non-critical):", venueError);
      // Continue without venue data
    }
  }

  // Fetch related events in same locality (for internal linking)
  let relatedEvents = [];
  if (event.locality_slug) {
    try {
      const { data: related } = await supabase
        .from("events")
        .select("title, slug, start_date")
        .eq("locality_slug", event.locality_slug)
        .neq("slug", slug)
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(5);
      relatedEvents = related || [];
    } catch (relatedError) {
      console.error("Related events fetch error (non-critical):", relatedError);
    }
  }

  return { event, relatedEvents, venue };
}

function generateEventSchema(event: any, venue: any, canonical: string, isPast: boolean) {
  const venueName = venue?.name || event.venue_name || "TBA";
  const localityName = event.locality || "Jaipur";
  
  const schema: any = {
    "@context": "https://schema.org",
    "@type": getEventType(event.category),
    name: event.title,
    description: (event.description || event.short_description || "").substring(0, 500),
    url: canonical,
    startDate: new Date(event.start_date).toISOString(),
    endDate: event.end_date ? new Date(event.end_date).toISOString() : new Date(new Date(event.start_date).getTime() + 3 * 60 * 60 * 1000).toISOString(),
    eventStatus: isPast ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
    eventAttendanceMode: event.is_online 
      ? "https://schema.org/OnlineEventAttendanceMode" 
      : "https://schema.org/OfflineEventAttendanceMode",
    location: event.is_online 
      ? { "@type": "VirtualLocation", url: event.online_url || canonical }
      : {
          "@type": "Place",
          name: venueName,
          address: {
            "@type": "PostalAddress",
            streetAddress: event.venue_address || venueName,
            addressLocality: localityName,
            addressRegion: "Rajasthan",
            addressCountry: "IN",
          },
        },
    image: event.cover_image || DEFAULT_IMAGE,
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "INR",
      ...(event.is_free 
        ? { price: "0", priceCurrency: "INR" } 
        : event.ticket_price ? { price: String(event.ticket_price) } : {}),
      availability: isPast ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer_name || SITE_NAME,
      url: BASE_URL,
    },
    isAccessibleForFree: !!event.is_free,
  };

  return schema;
}

function generateBreadcrumbSchema(event: any, canonical: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Events", item: `${BASE_URL}/events` },
      { "@type": "ListItem", position: 3, name: event.category || "Events", item: `${BASE_URL}/events?category=${encodeURIComponent(event.category || "")}` },
      { "@type": "ListItem", position: 4, name: event.title, item: canonical },
    ],
  };
}

function generateFAQSchema(event: any, venue: any) {
  const city = event.city || "Jaipur";
  const venueName = venue?.name || event.venue_name || "TBA";
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `When is ${event.title} in ${city}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${event.title} takes place on ${formatDate(event.start_date)} at ${formatTime(event.start_date)} in ${city}.`,
        },
      },
      {
        "@type": "Question",
        name: `Where is ${event.title} happening?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The event is at ${venueName}${event.locality ? `, ${event.locality}` : ""}, ${city}.`,
        },
      },
      {
        "@type": "Question",
        name: `How to book tickets for ${event.title}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: event.booking_url 
            ? `Book tickets at: ${event.booking_url}` 
            : `Visit ${SITE_NAME} for booking information and updates about ${event.title}.`,
        },
      },
    ],
  };
}

function buildSSRMarkup(event: any, venue: any, relatedEvents: any[], canonical: string, isPast: boolean) {
  const venueName = venue?.name || event.venue_name || "TBA";
  const priceText = event.is_free ? "Free Entry" : event.ticket_price ? `₹${event.ticket_price}` : "Contact Organizer";
  const description = event.description || event.short_description || `Join us for ${event.title} in ${event.city || "Jaipur"}.`;
  const category = event.category || "Event";
  
  const relatedEventsHtml = relatedEvents.length > 0 ? `
    <section style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #e5e7eb">
      <h3 style="font-size: 20px; margin-bottom: 16px">More events nearby</h3>
      <div style="display: grid; gap: 12px">
        ${relatedEvents.map((rel: any) => `
          <div>
            <a href="${BASE_URL}/events/${rel.slug}" style="color: #1f2937; text-decoration: none; font-weight: 500">
              ${escapeHtml(rel.title)}
            </a>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280">
              ${formatDate(rel.start_date)}
            </p>
          </div>
        `).join('')}
      </div>
    </section>
  ` : '';

  return `
<div class="ssr-prerender" data-ssr="event" style="max-width: 900px; margin: 0 auto; padding: 24px 16px; font-family: system-ui, -apple-system, sans-serif">
  
  <nav aria-label="Breadcrumb" style="font-size: 13px; color: #6b7280; margin-bottom: 24px">
    <a href="/" style="color: #6b7280; text-decoration: none">Home</a> › 
    <a href="/events" style="color: #6b7280; text-decoration: none">Events</a> › 
    <a href="/events?category=${encodeURIComponent(category)}" style="color: #6b7280; text-decoration: none">${escapeHtml(category)}</a> › 
    <span style="color: #1f2937">${escapeHtml(event.title)}</span>
  </nav>

  <h1 style="font-size: 32px; margin: 0 0 16px 0">${escapeHtml(event.title)}</h1>
  
  ${event.cover_image ? `
    <img src="${escapeHtml(event.cover_image)}" alt="${escapeHtml(event.title)}" 
         style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 12px; margin-bottom: 24px" />
  ` : ''}

  <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 32px">
    <div style="display: grid; gap: 12px">
      <div>
        <strong style="color: #4b5563">📅 Date:</strong> 
        <span>${formatDate(event.start_date)}</span>
        ${event.end_date && new Date(event.end_date).toDateString() !== new Date(event.start_date).toDateString() ? 
          ` – ${formatDate(event.end_date)}` : ''}
      </div>
      <div>
        <strong style="color: #4b5563">⏰ Time:</strong> 
        <span>${formatTime(event.start_date)}${event.end_date ? ` – ${formatTime(event.end_date)}` : ''}</span>
      </div>
      <div>
        <strong style="color: #4b5563">📍 Venue:</strong> 
        <span>${escapeHtml(venueName)}${event.venue_address ? `, ${escapeHtml(event.venue_address)}` : ''}</span>
      </div>
      <div>
        <strong style="color: #4b5563">💰 Price:</strong> 
        <span style="font-weight: 600">${escapeHtml(priceText)}</span>
      </div>
      ${event.category ? `
        <div>
          <strong style="color: #4b5563">🏷️ Category:</strong> 
          <span>${escapeHtml(event.category)}</span>
        </div>
      ` : ''}
    </div>
  </div>

  <div style="margin-bottom: 32px">
    <h2 style="font-size: 24px; margin-bottom: 16px">About this event</h2>
    <div style="line-height: 1.7; color: #374151">
      <p>${escapeHtml(description.substring(0, 1500))}</p>
    </div>
  </div>

  ${!isPast && event.booking_url ? `
    <div style="margin: 32px 0; text-align: center">
      <a href="${escapeHtml(event.booking_url)}" target="_blank" rel="noopener noreferrer"
         style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600">
        Book Tickets →
      </a>
    </div>
  ` : ''}

  ${relatedEventsHtml}

  <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center">
    <p>© ${SITE_NAME} — Discover events, venues, and local experiences in Jaipur</p>
    <p style="margin-top: 8px">
      <a href="${canonical}" style="color: #9ca3af">Event page</a>
    </p>
  </div>
</div>
  `;
}

function injectIntoRoot(html: string, content: string): string {
  const rootRegex = /<div\s+id=["']root["'][^>]*>([\s\S]*?)<\/div>/i;
  if (rootRegex.test(html)) {
    return html.replace(rootRegex, `<div id="root">${content}</div>`);
  }
  return html;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const url = new URL(req.url);
  const userAgent = req.headers.get("user-agent") || "";
  const isSearchBot = isBot(userAgent);

  try {
    // Get slug from query parameter
    const slug = url.searchParams.get("slug")?.trim();
    
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

    // Fetch event data
    const data = await fetchEventData(slug);
    
    if (!data || !data.event) {
      // Event not found - return 404
      const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Event Not Found | ${SITE_NAME}</title>
  <meta name="robots" content="noindex, nofollow">
</head>
<body style="font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 20px">
  <h1>Event Not Found</h1>
  <p>We couldn't find an event with slug: ${escapeHtml(slug)}</p>
  <a href="/events">Browse all events →</a>
</body>
</html>`;
      return new Response(notFoundHtml, {
        status: 404,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    const { event, relatedEvents, venue } = data;
    const isPast = new Date(event.start_date) < new Date();
    const canonical = `${BASE_URL}/events/${event.slug}`;
    
    // Generate meta data
    const title = event.meta_title || `${event.title} | ${event.city || "Jaipur"} | ${formatDate(event.start_date)} | ${SITE_NAME}`;
    const description = event.meta_description || event.short_description || 
      `Book tickets for ${event.title} in ${event.city || "Jaipur"}. ${formatDate(event.start_date)} at ${event.venue_name || "TBA"}. ${event.is_free ? "Free entry" : `Tickets from ₹${event.ticket_price || "contact organizer"}`}.`;
    const image = event.cover_image || DEFAULT_IMAGE;

    // Get SPA shell
    let indexHtml = await getSpaShellHtml();

    // Generate head HTML with all meta tags
    const headHtml = `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="robots" content="${isPast ? 'noindex, follow' : 'index, follow, max-image-preview:large'}" />
<link rel="canonical" href="${escapeHtml(canonical)}" />

<!-- Open Graph -->
<meta property="og:type" content="event" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${escapeHtml(event.title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(event.title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />

<!-- Structured Data -->
<script type="application/ld+json">${JSON.stringify(generateEventSchema(event, venue, canonical, isPast))}</script>
<script type="application/ld+json">${JSON.stringify(generateBreadcrumbSchema(event, canonical))}</script>
<script type="application/ld+json">${JSON.stringify(generateFAQSchema(event, venue))}</script>
`;

    // Inject head tags
    if (indexHtml.includes("</head>")) {
      indexHtml = indexHtml.replace(/<\/head>/i, `${headHtml}\n</head>`);
    }

    // For search bots: inject full SSR content
    if (isSearchBot) {
      const ssrContent = buildSSRMarkup(event, venue, relatedEvents, canonical, isPast);
      const finalHtml = injectIntoRoot(indexHtml, ssrContent);
      
      console.log(`[event-ssr] Bot served: ${slug} in ${Date.now() - startTime}ms`);
      
      return new Response(finalHtml, {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": isPast 
            ? "public, max-age=0, s-maxage=86400"
            : "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          "x-ssr-module": "event-ssr",
          "x-ssr-bot": "true",
          "x-render-time-ms": String(Date.now() - startTime),
        },
      });
    }

    // For regular users: return minimal HTML with meta tags only
    const finalHtml = injectIntoRoot(indexHtml, `<div data-ssr-placeholder="event-${event.slug}"></div>`);
    
    console.log(`[event-ssr] User served (SPA mode): ${slug} in ${Date.now() - startTime}ms`);
    
    return new Response(finalHtml, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        "x-ssr-module": "event-ssr",
        "x-ssr-bot": "false",
        "x-render-time-ms": String(Date.now() - startTime),
      },
    });

  } catch (err) {
    console.error("Event SSR fatal error:", err);
    
    const errorHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${SITE_NAME} | Events in Jaipur</title>
</head>
<body>
  <div id="root"></div>
  <p style="display:none">Temporarily unavailable. Please try again.</p>
</body>
</html>`;
    
    return new Response(errorHtml, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});
