// supabase/functions/locality-ssr/index.ts
// Enhanced version with full SEO, caching, bot detection, and events listing

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
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
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
      headers: {
        "user-agent": "jaipurcircle-locality-ssr/1.0",
        accept: "text/html",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch index.html: ${res.status}`);
    }

    const html = await res.text();
    // Remove default title to avoid duplicates
    const cleanedHtml = html.replace(/<title>.*?<\/title>/, '');
    cachedIndexHtml = { html: cleanedHtml, fetchedAt: now };
    return cleanedHtml;
  } catch (err) {
    console.error("Failed to fetch SPA shell:", err);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${SITE_NAME}</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
  }
}

async function fetchLocalityData(slug: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-ssr": "locality-ssr" } },
  });

  // Fetch locality without any joins (fixes the column error)
  const { data: locality, error } = await supabase
    .from("localities")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !locality) {
    console.error("Locality fetch error:", error);
    return null;
  }

  // Fetch upcoming events in this locality (next 60 days)
  let events = [];
  try {
    const { data: eventsData } = await supabase
      .from("events")
      .select("title, slug, start_date, venue_name, cover_image, ticket_price, is_free, category")
      .eq("locality_slug", slug)
      .gte("start_date", new Date().toISOString())
      .lte("start_date", new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString())
      .order("start_date", { ascending: true })
      .limit(12);
    events = eventsData || [];
  } catch (eventsError) {
    console.error("Events fetch error (non-critical):", eventsError);
  }

  // Fetch nearby localities (simple version - you can enhance with geo queries)
  let nearbyLocalities = [];
  try {
    const { data: nearby } = await supabase
      .from("localities")
      .select("name, slug")
      .neq("slug", slug)
      .limit(6);
    nearbyLocalities = nearby || [];
  } catch (nearbyError) {
    console.error("Nearby localities fetch error (non-critical):", nearbyError);
  }

  // Fetch event count
  let eventCount = 0;
  try {
    const { count } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("locality_slug", slug)
      .gte("start_date", new Date().toISOString());
    eventCount = count || 0;
  } catch (countError) {
    console.error("Event count error (non-critical):", countError);
  }

  return { locality, events, nearbyLocalities, eventCount };
}

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

function generatePlaceSchema(locality: any, canonical: string, eventCount: number) {
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

  if (eventCount > 0) {
    schema.numberOfUpcomingEvents = eventCount;
  }

  return schema;
}

function generateFAQSchema(locality: any) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What are the best places to visit in ${locality.name}, Jaipur?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: locality.known_for || `${locality.name} offers a mix of local markets, cultural venues, and dining experiences. Check JaipurCircle for upcoming events in this area.`,
        },
      },
      {
        "@type": "Question",
        name: `Upcoming events in ${locality.name}`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Find all upcoming events, workshops, and gatherings in ${locality.name} on JaipurCircle. Browse concerts, cultural programs, and more.`,
        },
      },
      {
        "@type": "Question",
        name: `How to reach ${locality.name} in Jaipur?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${locality.name} is well-connected within Jaipur. Use local transport, auto-rickshaws, or app-based cabs to reach this locality.`,
        },
      },
    ],
  };
}

function buildSSRMarkup(locality: any, events: any[], nearby: any[], canonical: string) {
  const eventsHtml = events.length > 0 ? `
    <section style="margin: 32px 0">
      <h2 style="font-size: 22px; margin-bottom: 16px">Upcoming Events in ${escapeHtml(locality.name)}</h2>
      <div style="display: grid; gap: 16px">
        ${events.map(event => `
          <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px">
            <h3 style="margin: 0 0 8px 0; font-size: 18px">
              <a href="${BASE_URL}/events/${escapeHtml(event.slug)}" style="color: #1f2937; text-decoration: none">
                ${escapeHtml(event.title)}
              </a>
            </h3>
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px">
              📍 ${escapeHtml(event.venue_name || "Venue TBA")}
            </p>
            <p style="margin: 0; color: #6b7280; font-size: 14px">
              📅 ${formatDate(event.start_date)}
              ${event.is_free ? ' • 🎟️ Free' : event.ticket_price ? ` • ₹${event.ticket_price}` : ''}
            </p>
          </div>
        `).join('')}
      </div>
      <div style="margin-top: 16px">
        <a href="${BASE_URL}/jaipur/${escapeHtml(locality.slug)}/events" style="color: #3b82f6">
          View all ${events.length}+ events in ${escapeHtml(locality.name)} →
        </a>
      </div>
    </section>
  ` : `
    <section style="margin: 32px 0; padding: 32px; background: #f3f4f6; border-radius: 12px; text-align: center">
      <h2 style="font-size: 22px; margin-bottom: 8px">No upcoming events yet</h2>
      <p style="color: #6b7280">Be the first to know when events are announced in ${escapeHtml(locality.name)}</p>
    </section>
  `;

  const nearbyHtml = nearby.length > 0 ? `
    <section style="margin: 32px 0">
      <h3 style="font-size: 18px; margin-bottom: 12px">Nearby Localities</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        ${nearby.map(loc => `
          <a href="${BASE_URL}/jaipur/${escapeHtml(loc.slug)}" 
             style="padding: 8px 16px; background: #f3f4f6; border-radius: 24px; color: #1f2937; text-decoration: none; font-size: 14px">
            ${escapeHtml(loc.name)}
          </a>
        `).join('')}
      </div>
    </section>
  ` : '';

  return `
<div class="ssr-prerender" data-ssr="locality" style="max-width: 900px; margin: 0 auto; padding: 24px 16px; font-family: system-ui, -apple-system, sans-serif">
  
  <nav aria-label="Breadcrumb" style="font-size: 13px; color: #6b7280; margin-bottom: 24px">
    <a href="/" style="color: #6b7280; text-decoration: none">Home</a> › 
    <a href="/jaipur" style="color: #6b7280; text-decoration: none">Jaipur</a> › 
    <a href="/jaipur/localities" style="color: #6b7280; text-decoration: none">Localities</a> › 
    <span style="color: #1f2937">${escapeHtml(locality.name)}</span>
  </nav>

  <h1 style="font-size: 32px; margin: 0 0 8px 0">${escapeHtml(locality.name)}, Jaipur</h1>
  
  ${locality.known_for ? `
    <div style="margin: 16px 0; padding: 12px 16px; background: #fef3c7; border-radius: 8px; color: #92400e; font-size: 14px">
      ✨ Known for: ${escapeHtml(locality.known_for)}
    </div>
  ` : ''}

  <div style="margin: 24px 0">
    <p style="line-height: 1.6; color: #374151">
      ${escapeHtml(truncate(locality.seo_blurb || locality.description || `Explore ${locality.name}, a vibrant locality in Jaipur. Find upcoming events, local attractions, and things to do.`, 500))}
    </p>
  </div>

  ${eventsHtml}
  ${nearbyHtml}

  <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center">
    <p>© ${SITE_NAME} — Events, venues, and local experiences in Jaipur</p>
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
<head>
  <meta charset="utf-8">
  <title>Locality Not Found | ${SITE_NAME}</title>
  <meta name="robots" content="noindex, nofollow">
</head>
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

    const { locality, events, nearbyLocalities, eventCount } = data;
    const canonical = `${BASE_URL}/jaipur/${locality.slug}`;
    const title = `${locality.name}, Jaipur — Events, Places, and Local Guide | ${SITE_NAME}`;
    const description = truncate(
      locality.seo_blurb || 
      `Explore ${locality.name} in Jaipur. Find upcoming events, local attractions, ${locality.known_for ? locality.known_for + ", " : ""}and things to do in this vibrant locality.`,
      160
    );
    const image = locality.featured_image || DEFAULT_IMAGE;

    let indexHtml = await getSpaShellHtml();

    const headHtml = `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${escapeHtml(canonical)}" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />

<!-- Structured Data -->
<script type="application/ld+json">${JSON.stringify(generateBreadcrumbSchema(locality, canonical))}</script>
<script type="application/ld+json">${JSON.stringify(generatePlaceSchema(locality, canonical, eventCount))}</script>
<script type="application/ld+json">${JSON.stringify(generateFAQSchema(locality))}</script>
`;

    if (indexHtml.includes("</head>")) {
      indexHtml = indexHtml.replace(/<\/head>/i, `${headHtml}\n</head>`);
    }

    if (isSearchBot) {
      const ssrContent = buildSSRMarkup(locality, events, nearbyLocalities, canonical);
      const finalHtml = injectIntoRoot(indexHtml, ssrContent);
      
      console.log(`[locality-ssr] Bot served: ${slug} in ${Date.now() - startTime}ms`);
      
      return new Response(finalHtml, {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
          "x-ssr-module": "locality-ssr",
          "x-ssr-bot": "true",
          "x-render-time-ms": String(Date.now() - startTime),
        },
      });
    }

    const finalHtml = injectIntoRoot(indexHtml, `<div data-ssr-placeholder="locality-${locality.slug}"></div>`);
    
    console.log(`[locality-ssr] User served (SPA mode): ${slug} in ${Date.now() - startTime}ms`);
    
    return new Response(finalHtml, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
        "x-ssr-module": "locality-ssr",
        "x-ssr-bot": "false",
        "x-render-time-ms": String(Date.now() - startTime),
      },
    });

  } catch (err) {
    console.error("Locality SSR fatal error:", err);
    
    const errorHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${SITE_NAME} | Localities in Jaipur</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
    
    return new Response(errorHtml, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});
