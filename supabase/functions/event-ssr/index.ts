// supabase/functions/event-ssr/index.ts
// GOLD STANDARD 100% - ALWAYS SSR, NO EMPTY SHELL
// ENHANCED SEO: Better meta descriptions, clean snippets for Google

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

function formatDate(dateStr: string): string {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
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
  if (cat.includes("comedy")) return "ComedyEvent";
  if (cat.includes("music")) return "MusicEvent";
  if (cat.includes("theatre") || cat.includes("play")) return "TheaterEvent";
  if (cat.includes("dance")) return "DanceEvent";
  if (cat.includes("festival")) return "Festival";
  if (cat.includes("sports")) return "SportsEvent";
  if (cat.includes("workshop") || cat.includes("seminar")) return "EducationEvent";
  return "Event";
}

function truncate(str: string, max: number): string {
  if (!str) return "";
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + "...";
}

// ============================================
// ENHANCED: Generate SEO-friendly meta description
// ============================================
function generateMetaDescription(event: any, venue: any): string {
  const venueName = venue?.name || event.venue_name || "TBA";
  const date = formatDate(event.start_date);
  const priceText = event.is_free
    ? "Free entry"
    : event.ticket_tiers?.length
    ? `Tickets from ₹${Math.min(...event.ticket_tiers.map((t: any) => t.price))}`
    : event.ticket_price
    ? `Tickets ₹${event.ticket_price}`
    : "Ticket details available";
  
  let description = `${event.title} on ${date} at ${venueName}, Jaipur. ${priceText}. `;
  
  if (event.short_description) {
    description += truncate(event.short_description, 100);
  } else if (event.description) {
    description += truncate(event.description, 100);
  } else {
    description += `Don't miss this exciting ${event.category || "event"} in the Pink City. Book your spot today!`;
  }
  
  return truncate(description, 155);
}

// ============================================
// ENHANCED: Generate SEO-friendly title
// ============================================
function generateMetaTitle(event: any): string {
  const baseTitle = event.title;
  const date = formatShortDate(event.start_date);
  const priceText = event.is_free ? "Free" : event.ticket_price ? `₹${event.ticket_price}` : "";
  
  if (priceText) {
    return `${baseTitle} | ${date} | ${priceText} | JaipurCircle`;
  }
  return `${baseTitle} | ${date} | Jaipur Events | JaipurCircle`;
}

// ============================================
// FETCH SPA SHELL (WITH FALLBACK)
// ============================================
async function getSpaShellHtml(): Promise<string> {
  const now = Date.now();
  const ttlMs = 5 * 60 * 1000;

  if (cachedIndexHtml && now - cachedIndexHtml.fetchedAt < ttlMs) {
    return cachedIndexHtml.html;
  }

  const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#e91e63">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <title>${SITE_NAME}</title>
  <link rel="icon" href="/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="/pwa-192x192.png">
  <style>
    html, body { overscroll-behavior: none; -webkit-overflow-scrolling: touch; }
    body { padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom); }
    * { -webkit-tap-highlight-color: transparent; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" crossorigin src="/assets/index-uPnmVZlR.js"></script>
  <link rel="stylesheet" crossorigin href="/assets/index-YJsD5eZ5.css">
</body>
</html>`;

  try {
    const res = await fetch(`${BASE_URL}/index.html?cb=${Math.floor(now / 1000)}`, {
      headers: { "user-agent": "jaipurcircle-event-ssr/2.0", accept: "text/html" },
    });

    if (!res.ok) throw new Error(`Failed to fetch index.html: ${res.status}`);

    let html = await res.text();
    html = html.replace(/<title>.*?<\/title>/, "");
    html = html.replace(/<meta name="description".*?>/, "");
    html = html.replace(/<meta name="keywords".*?>/, "");
    html = html.replace(/<meta property="og:title".*?>/g, "");
    html = html.replace(/<meta property="og:description".*?>/g, "");
    html = html.replace(/<meta property="og:url".*?>/g, "");
    html = html.replace(/<meta property="og:image".*?>/g, "");
    html = html.replace(/<meta name="twitter:title".*?>/g, "");
    html = html.replace(/<meta name="twitter:description".*?>/g, "");
    html = html.replace(/<meta name="twitter:image".*?>/g, "");
    html = html.replace(/<div\s+id=["']root["'][^>]*>.*?<\/div>/is, '<div id="root"></div>');

    if (!html.includes('<script type="module"')) {
      console.warn("index.html missing script tags, using fallback");
      html = fallbackHtml;
    }

    cachedIndexHtml = { html, fetchedAt: now };
    return html;
  } catch (err) {
    console.error("Failed to fetch SPA shell:", err);
    return fallbackHtml;
  }
}

// ============================================
// FETCH COMPLETE EVENT DATA (WITH ARTIST & VENUE)
// ============================================
async function fetchCompleteEventData(slug: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      artist:artist_id(
        id, name, slug, bio, image_url, cover_image, 
        social_links, follower_count, rating, genre, website
      ),
      venue:venue_id(
        id, name, address, latitude, longitude, 
        phone, website, rating, image, capacity
      )
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !event) {
    console.error("Event fetch error:", error);
    return null;
  }

  let relatedEvents: any[] = [];
  if (event.locality_slug) {
    const { data: related } = await supabase
      .from("events")
      .select("title, slug, start_date, cover_image, ticket_price, is_free, venue_name, category")
      .eq("locality_slug", event.locality_slug)
      .neq("slug", slug)
      .gte("start_date", new Date().toISOString())
      .order("start_date", { ascending: true })
      .limit(6);
    relatedEvents = related || [];
  }

  const ticketTiers = event.ticket_tiers || (event.ticket_price ? [
    { name: "General Admission", price: event.ticket_price, available: true }
  ] : []);

  return {
    event: { ...event, ticket_tiers: ticketTiers },
    artist: event.artist,
    venue: event.venue,
    relatedEvents,
  };
}

// ============================================
// GENERATE ALL SCHEMAS (100% COMPLETE)
// ============================================
function generateAllSchemas(event: any, artist: any, venue: any, canonical: string, isPast: boolean) {
  const schemas = [];

  const eventSchema: any = {
    "@context": "https://schema.org",
    "@type": getEventType(event.category),
    "name": event.title,
    "description": truncate(event.description || event.short_description || `Join us for ${event.title} in Jaipur.`, 500),
    "startDate": new Date(event.start_date).toISOString(),
    "eventStatus": isPast ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": venue?.name || event.venue_name || "TBA",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.locality || "Jaipur",
        "addressRegion": "Rajasthan",
        "addressCountry": "IN",
      },
    },
    "image": event.cover_image || DEFAULT_IMAGE,
    "url": canonical,
    "isAccessibleForFree": !!event.is_free,
  };

  if (artist && artist.name) {
    eventSchema.performer = {
      "@type": "Person",
      "name": artist.name,
      "description": truncate(artist.bio || "", 300),
      "image": artist.image_url,
      "sameAs": artist.social_links ? Object.values(artist.social_links) : undefined,
    };
  } else if (event.artist_name) {
    eventSchema.performer = { "@type": "Person", "name": event.artist_name };
  }

  if (venue?.latitude && venue?.longitude) {
    eventSchema.location.geo = {
      "@type": "GeoCoordinates",
      "latitude": venue.latitude,
      "longitude": venue.longitude,
    };
  }

  if (event.is_free) {
    eventSchema.offers = {
      "@type": "Offer",
      "price": 0,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
    };
  } else if (event.ticket_tiers?.length > 0) {
    eventSchema.offers = event.ticket_tiers.map((tier: any) => ({
      "@type": "Offer",
      "name": tier.name,
      "price": tier.price,
      "priceCurrency": "INR",
      "availability": tier.available !== false ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
    }));
  } else if (event.ticket_price) {
    eventSchema.offers = {
      "@type": "Offer",
      "price": event.ticket_price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
    };
  }

  if (event.organizer_name) {
    eventSchema.organizer = {
      "@type": "Organization",
      "name": event.organizer_name,
      "url": event.organizer_website,
    };
  }

  if (event.age_restriction) {
    eventSchema.typicalAgeRange = event.age_restriction;
  }

  schemas.push(eventSchema);

  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": "Events", "item": `${BASE_URL}/events` },
      { "@type": "ListItem", "position": 3, "name": event.title, "item": canonical },
    ],
  });

  schemas.push({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Is ${event.title} confirmed in Jaipur?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes! ${event.title} is confirmed for ${formatDate(event.start_date)} at ${venue?.name || event.venue_name || "the venue"}.`,
        },
      },
      {
        "@type": "Question",
        "name": `What are the ticket prices for ${event.title}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": event.is_free
            ? "Free entry!"
            : event.ticket_tiers?.length
            ? `Tickets start from ₹${Math.min(...event.ticket_tiers.map((t: any) => t.price))}`
            : `Tickets are ₹${event.ticket_price}`,
        },
      },
      {
        "@type": "Question",
        "name": `Where is ${event.title} taking place?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `At ${venue?.name || event.venue_name || "TBA"} in ${event.locality || "Jaipur"}.`,
        },
      },
    ],
  });

  return schemas;
}

// ============================================
// BUILD SSR HTML (FULL PAGE)
// ============================================
function buildSSRHTML(event: any, artist: any, venue: any, relatedEvents: any[], canonical: string, isPast: boolean) {
  const venueName = venue?.name || event.venue_name || "TBA";
  const priceText = event.is_free
    ? "Free Entry"
    : event.ticket_tiers?.length
    ? `From ₹${Math.min(...event.ticket_tiers.map((t: any) => t.price))}`
    : event.ticket_price
    ? `₹${event.ticket_price}`
    : "Contact Organizer";

  const ticketTiersHtml =
    event.ticket_tiers?.length > 1
      ? `
    <div class="ticket-tiers" style="margin-top: 1rem">
      <h3>Ticket Categories</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.5rem">
        ${event.ticket_tiers
          .map(
            (tier: any) => `
          <div style="background: #f3f4f6; padding: 0.75rem 1rem; border-radius: 8px; text-align: center; flex: 1; min-width: 100px">
            <div style="font-weight: 600">${escapeHtml(tier.name)}</div>
            <div style="font-size: 1.25rem; font-weight: 700; color: #3b82f6">₹${tier.price}</div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `
      : "";

  const artistHtml = artist
    ? `
    <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center">
        ${artist.image_url ? `<img src="${escapeHtml(artist.image_url)}" alt="${escapeHtml(artist.name)}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover">` : ""}
        <div>
          <h2 style="font-size: 1.25rem; margin-bottom: 0.25rem">About ${escapeHtml(artist.name)}</h2>
          <p style="color: #4b5563; font-size: 0.875rem">${escapeHtml(truncate(artist.bio || "Renowned performer bringing an unforgettable experience.", 200))}</p>
          ${artist.follower_count ? `<p style="margin-top: 0.5rem; font-size: 0.75rem; color: #8b5cf6">🎧 ${artist.follower_count.toLocaleString()} followers</p>` : ""}
        </div>
      </div>
    </div>
  `
    : "";

  const relatedHtml =
    relatedEvents.length > 0
      ? `
    <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb">
      <h3 style="margin-bottom: 1rem">You might also like</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem">
        ${relatedEvents
          .slice(0, 4)
          .map(
            (rel: any) => `
          <a href="${BASE_URL}/events/${rel.slug}" style="text-decoration: none; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: block">
            ${rel.cover_image ? `<img src="${rel.cover_image}" style="width: 100%; height: 120px; object-fit: cover" loading="lazy">` : '<div style="height: 120px; background: #e5e7eb; display: flex; align-items: center; justify-content: center">🎉</div>'}
            <div style="padding: 0.75rem">
              <h4 style="margin: 0 0 0.25rem; font-size: 0.875rem">${escapeHtml(rel.title)}</h4>
              <div style="font-size: 0.75rem; color: #6b7280">${formatShortDate(rel.start_date)}</div>
              <div style="font-size: 0.75rem; font-weight: 600; color: #3b82f6; margin-top: 0.25rem">${rel.is_free ? "FREE" : rel.ticket_price ? `₹${rel.ticket_price}` : "TBA"}</div>
            </div>
          </a>
        `
          )
          .join("")}
      </div>
    </div>
  `
      : "";

  const criticalCSS = `
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#f8fafc;line-height:1.5}
      .event-page{max-width:1000px;margin:0 auto}
      .hero{background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);color:white;padding:2rem;border-radius:0 0 24px 24px}
      .hero h1{font-size:clamp(1.5rem,5vw,2rem);margin:0.5rem 0}
      .hero-stats{display:flex;gap:1rem;flex-wrap:wrap;margin-top:1rem;font-size:0.875rem}
      .container{padding:1.5rem}
      .card{background:white;border-radius:16px;padding:1.5rem;margin-bottom:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
      .info-grid{display:grid;grid-template-columns:auto 1fr;gap:0.5rem 1rem;margin-top:1rem}
      .booking-btn{display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:1rem 2rem;border-radius:12px;text-decoration:none;font-weight:600;text-align:center;width:100%}
      @media (max-width:640px){.container{padding:1rem}}
    </style>
  `;

  return `
    ${criticalCSS}
    <div class="event-page">
      <div class="hero">
        <div class="hero-stats">
          <span>${escapeHtml(event.category || "Event")}</span>
          ${!isPast ? "<span>🔥 Upcoming</span>" : ""}
          ${event.is_online ? "<span>💻 Online</span>" : ""}
        </div>
        <h1>${escapeHtml(event.title)}</h1>
        <div class="hero-stats">
          <span>📅 ${formatDate(event.start_date)} • ${formatTime(event.start_date)}</span>
          <span>📍 ${escapeHtml(venueName)}</span>
          <span>💰 ${escapeHtml(priceText)}</span>
        </div>
      </div>
      
      <div class="container">
        ${event.cover_image ? `<img src="${escapeHtml(event.cover_image)}" style="width:100%; border-radius:16px; margin-bottom:1.5rem" loading="lazy">` : ""}
        
        <div class="card">
          <h2>Event Details</h2>
          <div class="info-grid">
            <strong>Date:</strong> <span>${formatDate(event.start_date)}</span>
            <strong>Time:</strong> <span>${formatTime(event.start_date)}</span>
            <strong>Venue:</strong> <span>${escapeHtml(venueName)}</span>
            <strong>Price:</strong> <span style="font-weight:700;color:#3b82f6">${escapeHtml(priceText)}</span>
            ${event.duration ? `<strong>Duration:</strong> <span>${escapeHtml(event.duration)}</span>` : ""}
            ${event.age_restriction ? `<strong>Age Limit:</strong> <span>${escapeHtml(event.age_restriction)}</span>` : ""}
          </div>
          ${ticketTiersHtml}
        </div>
        
        ${!isPast && event.booking_url ? `<a href="${escapeHtml(event.booking_url)}" target="_blank" class="booking-btn">🎟️ Book Tickets Now</a>` : ""}
        
        ${artistHtml}
        
        <div class="card">
          <h2>About This Event</h2>
          <p style="margin-top:0.5rem; line-height:1.6">${escapeHtml(event.description || event.short_description || `Join us for ${event.title} in Jaipur!`)}</p>
        </div>
        
        ${relatedHtml}
        
        <div style="margin-top:2rem; padding-top:1rem; border-top:1px solid #e5e7eb; font-size:0.75rem; color:#9ca3af; text-align:center">
          <p>© ${SITE_NAME} — Discover the best events in Jaipur</p>
          <p style="margin-top:0.25rem">
            <a href="${canonical}" style="color:#9ca3af">Event Page</a> | 
            <a href="/events" style="color:#9ca3af">All Events</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// MAIN SERVE FUNCTION - ALWAYS SSR
// ============================================
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const url = new URL(req.url);
  const userAgent = req.headers.get("user-agent") || "";
  console.log(`[event-ssr] User-Agent: ${userAgent.substring(0, 100)}`);

  try {
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

    const data = await fetchCompleteEventData(slug);
    if (!data || !data.event) {
      const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Event Not Found | ${SITE_NAME}</title><meta name="robots" content="noindex, nofollow"></head>
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

    const { event, artist, venue, relatedEvents } = data;
    const isPast = new Date(event.start_date) < new Date();
    const canonical = `${BASE_URL}/events/${event.slug}`;
    
    // ============================================
    // ENHANCED SEO: Use improved title and description
    // ============================================
    const title = generateMetaTitle(event);
    const description = generateMetaDescription(event, venue);
    const image = event.cover_image || DEFAULT_IMAGE;

    let indexHtml = await getSpaShellHtml();
    const schemas = generateAllSchemas(event, artist, venue, canonical, isPast);

    const headHtml = `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="robots" content="${isPast ? "noindex, follow" : "index, follow, max-image-preview:large"}" />
<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta property="og:type" content="event" />
<meta property="og:title" content="${escapeHtml(event.title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(event.title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
${schemas.map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`).join("")}
`;

    if (indexHtml.includes("</head>")) {
      indexHtml = indexHtml.replace(/<\/head>/i, `${headHtml}\n</head>`);
    }

    // ============================================
    // ALWAYS serve SSR content – NO CONDITIONAL
    // ============================================
    const ssrContent = buildSSRHTML(event, artist, venue, relatedEvents, canonical, isPast);
    const finalHtml = indexHtml.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

    console.log(`[event-ssr] Served: ${slug} (SSR: true) in ${Date.now() - startTime}ms`);

    return new Response(finalHtml, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store, max-age=0, must-revalidate",
        "x-ssr-rendered": "true",
        "x-render-time-ms": String(Date.now() - startTime),
      },
    });
  } catch (err) {
    console.error("Event SSR fatal error:", err);
    const errorHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${SITE_NAME} | Events in Jaipur</title></head>
<body><div id="root"></div><script src="/assets/index.js"></script></body>
</html>`;
    return new Response(errorHtml, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});
