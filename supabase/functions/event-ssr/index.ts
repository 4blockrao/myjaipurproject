// supabase/functions/event-ssr/index.ts
// GOLD STANDARD EVENT SSR - Exceeds BookMyShow
// This is the ONLY file you need for serving event pages

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
// BOT DETECTION
// ============================================
const BOT_PATTERNS = [
  /Googlebot/i, /bingbot/i, /Baiduspider/i, /YandexBot/i, /DuckDuckBot/i,
  /Slurp/i, /facebookexternalhit/i, /WhatsApp/i, /Twitterbot/i, /LinkedInBot/i,
  /Pinterest/i, /TelegramBot/i, /GPTBot/i, /CCBot/i, /Applebot/i, /Amazonbot/i,
  /SemrushBot/i, /AhrefsBot/i, /MJ12bot/i, /rogerbot/i, /DotBot/i, /Barkrowler/i,
  /DataForSeoBot/i, /MozBot/i, /BLEXBot/i, /Qwantify/i, /Discordbot/i
];

function isBot(userAgent: string): boolean {
  if (!userAgent) return false;
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

function formatShortDate(dateStr: string): string {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

function getEventType(category: string): string {
  const cat = (category || "").toLowerCase();
  if (cat.includes("comedy")) return "ComedyEvent";
  if (cat.includes("music")) return "MusicEvent";
  if (cat.includes("theatre")) return "TheaterEvent";
  if (cat.includes("dance")) return "DanceEvent";
  if (cat.includes("festival")) return "Festival";
  if (cat.includes("sports")) return "SportsEvent";
  if (cat.includes("workshop")) return "EducationEvent";
  return "Event";
}

function truncate(str: string, max: number): string {
  if (!str) return "";
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + "...";
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
      headers: { "user-agent": "jaipurcircle-event-ssr/2.0", accept: "text/html" },
    });

    if (!res.ok) throw new Error(`Failed to fetch index.html: ${res.status}`);

    let html = await res.text();
    html = html.replace(/<title>.*?<\/title>/, '');
    html = html.replace(/<div\s+id=["']root["'][^>]*>.*?<\/div>/i, '<div id="root"></div>');
    
    cachedIndexHtml = { html, fetchedAt: now };
    return html;
  } catch (err) {
    console.error("Failed to fetch SPA shell:", err);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${SITE_NAME}</title></head><body><div id="root"></div></body></html>`;
  }
}

// ============================================
// FETCH COMPLETE EVENT DATA
// ============================================
async function fetchCompleteEventData(slug: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Fetch event
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !event) return null;

  // Fetch venue
  let venue = null;
  if (event.venue_id) {
    const { data: venueData } = await supabase
      .from("venues")
      .select("name, address, city, latitude, longitude, rating")
      .eq("id", event.venue_id)
      .maybeSingle();
    venue = venueData;
  }

  // Fetch performer
  let performer = null;
  if (event.performer_id) {
    const { data: performerData } = await supabase
      .from("performers")
      .select("name, bio, image, social_links, follower_count")
      .eq("id", event.performer_id)
      .maybeSingle();
    performer = performerData;
  }

  // Fetch locality
  let locality = null;
  if (event.locality_slug) {
    const { data: localityData } = await supabase
      .from("localities")
      .select("name, slug, known_for")
      .eq("slug", event.locality_slug)
      .maybeSingle();
    locality = localityData;
  }

  // Fetch related events
  let relatedEvents: any[] = [];
  if (event.locality_slug) {
    const { data: related } = await supabase
      .from("events")
      .select("title, slug, start_date, cover_image, ticket_price, is_free, venue_name")
      .eq("locality_slug", event.locality_slug)
      .neq("slug", slug)
      .gte("start_date", new Date().toISOString())
      .order("start_date", { ascending: true })
      .limit(6);
    relatedEvents = related || [];
  }

  // Prepare ticket tiers
  const ticketTiers = event.ticket_tiers || (event.ticket_price ? [
    { name: "General Admission", price: event.ticket_price, available: true }
  ] : []);

  return { 
    event: { ...event, ticket_tiers: ticketTiers }, 
    venue, 
    performer, 
    locality,
    relatedEvents 
  };
}

// ============================================
// GENERATE ALL SCHEMAS
// ============================================
function generateAllSchemas(event: any, venue: any, performer: any, locality: any, canonical: string, isPast: boolean) {
  const schemas = [];

  // Main Event Schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": getEventType(event.category),
    "name": event.title,
    "description": truncate(event.description || event.short_description || "", 500),
    "startDate": new Date(event.start_date).toISOString(),
    "eventStatus": isPast ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": venue?.name || event.venue_name || "TBA",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": locality?.name || event.locality || "Jaipur",
        "addressRegion": "Rajasthan",
        "addressCountry": "IN"
      }
    },
    "image": event.cover_image || DEFAULT_IMAGE,
    "url": canonical,
    "offers": event.is_free ? {
      "@type": "Offer",
      "price": 0,
      "priceCurrency": "INR"
    } : event.ticket_tiers?.length ? event.ticket_tiers.map((tier: any) => ({
      "@type": "Offer",
      "name": tier.name,
      "price": tier.price,
      "priceCurrency": "INR"
    })) : event.ticket_price ? {
      "@type": "Offer",
      "price": event.ticket_price,
      "priceCurrency": "INR"
    } : undefined
  });

  // Breadcrumb Schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": "Events", "item": `${BASE_URL}/events` },
      { "@type": "ListItem", "position": 3, "name": event.title, "item": canonical }
    ]
  });

  // FAQ Schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Is ${event.title} confirmed in Jaipur?`,
        "acceptedAnswer": { "@type": "Answer", "text": `Yes! ${event.title} is confirmed for ${formatDate(event.start_date)} at ${venue?.name || event.venue_name || "the venue"}.` }
      },
      {
        "@type": "Question",
        "name": `What are the ticket prices for ${event.title}?`,
        "acceptedAnswer": { "@type": "Answer", "text": event.is_free ? "Free entry!" : event.ticket_tiers?.length ? `Tickets start from ₹${Math.min(...event.ticket_tiers.map((t: any) => t.price))}` : `Tickets are ₹${event.ticket_price}` }
      },
      {
        "@type": "Question",
        "name": `Where is ${event.title} taking place?`,
        "acceptedAnswer": { "@type": "Answer", "text": `At ${venue?.name || event.venue_name || "TBA"} in ${locality?.name || event.locality || "Jaipur"}.` }
      }
    ]
  });

  return schemas;
}

// ============================================
// BUILD SSR HTML
// ============================================
function buildSSRHTML(event: any, venue: any, performer: any, locality: any, relatedEvents: any[], canonical: string, isPast: boolean) {
  const venueName = venue?.name || event.venue_name || "TBA";
  const priceText = event.is_free ? "Free Entry" : event.ticket_tiers?.length ? `From ₹${Math.min(...event.ticket_tiers.map((t: any) => t.price))}` : event.ticket_price ? `₹${event.ticket_price}` : "Contact Organizer";
  
  // Ticket tiers HTML
  const ticketTiersHtml = event.ticket_tiers?.length > 1 ? `
    <div class="ticket-tiers" style="margin-top: 1rem">
      <h3>Ticket Categories</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.5rem">
        ${event.ticket_tiers.map((tier: any) => `
          <div style="background: #f3f4f6; padding: 0.75rem 1rem; border-radius: 8px; text-align: center; flex: 1; min-width: 100px">
            <div style="font-weight: 600">${escapeHtml(tier.name)}</div>
            <div style="font-size: 1.25rem; font-weight: 700; color: #3b82f6">₹${tier.price}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  // Related events HTML
  const relatedHtml = relatedEvents.length > 0 ? `
    <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb">
      <h3 style="margin-bottom: 1rem">You might also like</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem">
        ${relatedEvents.slice(0, 4).map((rel: any) => `
          <a href="${BASE_URL}/events/${rel.slug}" style="text-decoration: none; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: block">
            ${rel.cover_image ? `<img src="${rel.cover_image}" style="width: 100%; height: 120px; object-fit: cover" loading="lazy">` : '<div style="height: 120px; background: #e5e7eb; display: flex; align-items: center; justify-content: center">🎉</div>'}
            <div style="padding: 0.75rem">
              <h4 style="margin: 0 0 0.25rem; font-size: 0.875rem">${escapeHtml(rel.title)}</h4>
              <div style="font-size: 0.75rem; color: #6b7280">${formatShortDate(rel.start_date)}</div>
              <div style="font-size: 0.75rem; font-weight: 600; color: #3b82f6; margin-top: 0.25rem">${rel.is_free ? 'FREE' : rel.ticket_price ? `₹${rel.ticket_price}` : 'TBA'}</div>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  ` : '';

  const criticalCSS = `
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:system-ui,sans-serif;background:#f8fafc;line-height:1.5}
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
          ${!isPast ? '<span>🔥 Upcoming</span>' : ''}
        </div>
        <h1>${escapeHtml(event.title)}</h1>
        <div class="hero-stats">
          <span>📅 ${formatDate(event.start_date)} • ${formatTime(event.start_date)}</span>
          <span>📍 ${escapeHtml(venueName)}</span>
          <span>💰 ${escapeHtml(priceText)}</span>
        </div>
      </div>
      
      <div class="container">
        ${event.cover_image ? `<img src="${escapeHtml(event.cover_image)}" style="width:100%; border-radius:16px; margin-bottom:1.5rem" loading="lazy">` : ''}
        
        <div class="card">
          <h2>Event Details</h2>
          <div class="info-grid">
            <strong>Date:</strong> <span>${formatDate(event.start_date)}</span>
            <strong>Time:</strong> <span>${formatTime(event.start_date)}</span>
            <strong>Venue:</strong> <span>${escapeHtml(venueName)}</span>
            <strong>Price:</strong> <span style="font-weight:700;color:#3b82f6">${escapeHtml(priceText)}</span>
            ${event.duration ? `<strong>Duration:</strong> <span>${escapeHtml(event.duration)}</span>` : ''}
            ${event.age_restriction ? `<strong>Age Limit:</strong> <span>${escapeHtml(event.age_restriction)}</span>` : ''}
          </div>
          ${ticketTiersHtml}
        </div>
        
        ${!isPast && event.booking_url ? `
          <a href="${escapeHtml(event.booking_url)}" target="_blank" class="booking-btn">🎟️ Book Tickets Now</a>
        ` : ''}
        
        <div class="card">
          <h2>About This Event</h2>
          <p style="margin-top:0.5rem; line-height:1.6">${escapeHtml(event.description || event.short_description || `Join us for ${event.title} in Jaipur!`)}</p>
        </div>
        
        ${relatedHtml}
        
        <div style="margin-top:2rem; padding-top:1rem; border-top:1px solid #e5e7eb; font-size:0.75rem; color:#9ca3af; text-align:center">
          <p>© ${SITE_NAME} — Discover the best events in Jaipur</p>
        </div>
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
  const isSearchBot = isBot(userAgent);
  
  console.log(`[event-ssr] User-Agent: ${userAgent.substring(0, 100)}`);
  console.log(`[event-ssr] IsBot: ${isSearchBot}`);

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
      const notFoundHtml = `<!DOCTYPE html><html><head><title>Event Not Found</title></head><body><h1>Event Not Found</h1><a href="/events">Browse events →</a></body></html>`;
      return new Response(notFoundHtml, { status: 404, headers: { "content-type": "text/html" } });
    }

    const { event, venue, performer, locality, relatedEvents } = data;
    const isPast = new Date(event.start_date) < new Date();
    const canonical = `${BASE_URL}/events/${event.slug}`;
    
    const title = `${event.title} | ${formatDate(event.start_date)} | ${SITE_NAME}`;
    const description = event.short_description || `Book tickets for ${event.title} in Jaipur. ${formatDate(event.start_date)} at ${venue?.name || event.venue_name || "TBA"}.`;
    const image = event.cover_image || DEFAULT_IMAGE;

    let indexHtml = await getSpaShellHtml();
    const schemas = generateAllSchemas(event, venue, performer, locality, canonical, isPast);

    const headHtml = `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="robots" content="${isPast ? 'noindex' : 'index, follow'}" />
<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta property="og:title" content="${escapeHtml(event.title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta name="twitter:card" content="summary_large_image" />
${schemas.map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`).join('')}
`;

    if (indexHtml.includes("</head>")) {
      indexHtml = indexHtml.replace(/<\/head>/i, `${headHtml}\n</head>`);
    }

    // CRITICAL: Bot vs User response
    if (isSearchBot) {
      const ssrContent = buildSSRHTML(event, venue, performer, locality, relatedEvents, canonical, isPast);
      const finalHtml = indexHtml.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);
      
      console.log(`[event-ssr] Bot served: ${slug} in ${Date.now() - startTime}ms`);
      
      return new Response(finalHtml, {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-cache",
          "vary": "User-Agent",
          "x-ssr-bot": "true",
        },
      });
    }
    
    // Normal users get SPA shell
    console.log(`[event-ssr] User served: ${slug} in ${Date.now() - startTime}ms`);
    
    return new Response(indexHtml, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=3600",
        "vary": "User-Agent",
        "x-ssr-bot": "false",
      },
    });

  } catch (err) {
    console.error("Event SSR fatal error:", err);
    return new Response(`<!DOCTYPE html><html><body><div id="root"></div></body></html>`, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});
