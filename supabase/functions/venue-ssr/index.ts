// supabase/functions/venue-ssr/index.ts
// Always SSR – serves full venue page (no conditional bot logic)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const BASE_URL = "https://www.jaipurcircle.com";
const SITE_NAME = "JaipurCircle";
const DEFAULT_IMAGE = "https://www.jaipurcircle.com/og-default.jpg";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

let cachedIndexHtml: { html: string; fetchedAt: number } | null = null;

// ============================================
// UTILITIES
// ============================================
function escapeHtml(str: string): string {
  if (!str) return "";
  return str
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

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9\s-]/g, "")
    .replaceAll(/\s+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

function formatDate(isoString: string): string {
  if (!isoString) return "TBA";
  return new Date(isoString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ============================================
// FETCH SPA SHELL (with fallback)
// ============================================
async function getSpaShellHtml(): Promise<string> {
  const now = Date.now();
  const ttlMs = 5 * 60 * 1000;
  if (cachedIndexHtml && now - cachedIndexHtml.fetchedAt < ttlMs) {
    return cachedIndexHtml.html;
  }

  const fallbackHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${SITE_NAME}</title></head><body><div id="root"></div><script src="/assets/index.js"></script></body></html>`;

  try {
    const res = await fetch(`${BASE_URL}/index.html?cb=${Math.floor(now / 1000)}`, {
      headers: { "user-agent": "jaipurcircle-venue-ssr/1.0", accept: "text/html" },
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
// DATABASE QUERIES
// ============================================
type VenueRow = {
  id: string;
  name: string | null;
  slug: string | null;
  description?: string | null;
  address?: string | null;
  locality_slug?: string | null;
  rating?: number | null;
  image?: string | null;
  phone?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type EventRow = {
  id: string;
  title: string | null;
  slug: string | null;
  start_date: string | null;
  cover_image?: string | null;
  is_free?: boolean | null;
  ticket_price?: number | null;
  category?: string | null;
};

async function fetchVenueData(slug: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  const { data: venue, error } = await supabase
    .from("venues")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !venue) return null;

  // Fetch upcoming events at this venue
  const today = new Date().toISOString().slice(0, 10);
  const { data: events } = await supabase
    .from("events")
    .select("id, title, slug, start_date, cover_image, is_free, ticket_price, category")
    .eq("venue_id", venue.id)
    .gte("start_date", today)
    .order("start_date", { ascending: true })
    .limit(12);

  return { venue, events: events || [] };
}

// ============================================
// SSR HTML BUILDER
// ============================================
function buildSSRHTML(venue: VenueRow, events: EventRow[]) {
  const name = venue.name || "Venue";
  const description = venue.description || `Discover events at ${name} in Jaipur.`;
  const address = venue.address || "";
  const locality = venue.locality_slug ? slugify(venue.locality_slug).replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "";
  const image = venue.image || DEFAULT_IMAGE;
  const rating = venue.rating;
  const phone = venue.phone;
  const website = venue.website;
  const hasMap = venue.latitude && venue.longitude;

  const infoHtml = `
    <div class="card">
      <h3>Venue Information</h3>
      <div class="info-grid">
        ${address ? `<div><strong>Address</strong><br>${escapeHtml(address)}${locality ? `, ${escapeHtml(locality)}` : ""}</div>` : ""}
        ${phone ? `<div><strong>Phone</strong><br><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></div>` : ""}
        ${website ? `<div><strong>Website</strong><br><a href="${escapeHtml(website)}" target="_blank" rel="nofollow">${escapeHtml(website)}</a></div>` : ""}
        ${rating ? `<div><strong>Rating</strong><br>⭐ ${rating} / 5</div>` : ""}
      </div>
    </div>
  `;

  const mapHtml = hasMap
    ? `<div class="card"><h3>Location</h3><iframe class="map" src="https://www.openstreetmap.org/export/embed.html?bbox=${venue.longitude!-0.01},${venue.latitude!-0.01},${venue.longitude!+0.01},${venue.latitude!+0.01}&layer=mapnik&marker=${venue.latitude},${venue.longitude}" width="100%" height="300" frameborder="0" style="border:0; border-radius:12px" allowfullscreen></iframe></div>`
    : "";

  const eventsHtml = events.length
    ? `<div class="card"><h3>Upcoming Events (${events.length})</h3><div class="event-grid">${events.map(e => `
      <a href="${BASE_URL}/events/${e.slug}" class="event-card">
        ${e.cover_image ? `<img src="${escapeHtml(e.cover_image)}" alt="${escapeHtml(e.title || 'Event')}">` : '<div class="event-placeholder">🎪</div>'}
        <div><strong>${escapeHtml(e.title || "Event")}</strong><br>📅 ${formatDate(e.start_date!)}<br>💰 ${e.is_free ? "FREE" : e.ticket_price ? `₹${e.ticket_price}` : "TBA"}</div>
      </a>
    `).join("")}</div></div>`
    : `<div class="card"><p>No upcoming events scheduled at this venue. Check back soon!</p></div>`;

  const css = `
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:system-ui;background:#f8fafc;line-height:1.5}
      .page{max-width:1000px;margin:0 auto}
      .hero{background:linear-gradient(135deg,#1e293b,#0f172a);color:white;padding:2rem;border-radius:0 0 24px 24px}
      .hero h1{font-size:2rem;margin:0.5rem 0}
      .container{padding:1.5rem}
      .card{background:white;border-radius:16px;padding:1.5rem;margin-bottom:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
      .info-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;margin-top:1rem}
      .event-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;margin-top:1rem}
      .event-card{display:flex;gap:1rem;background:#f9fafb;border-radius:12px;padding:1rem;text-decoration:none;color:inherit}
      .event-card img{width:80px;height:80px;object-fit:cover;border-radius:8px}
      .event-placeholder{width:80px;height:80px;background:#e5e7eb;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:2rem}
      .map{width:100%;height:300px;border:0;border-radius:12px}
      @media (max-width:640px){.container{padding:1rem}}
    </style>
  `;

  return `
    ${css}
    <div class="page">
      <div class="hero">
        <h1>${escapeHtml(name)}</h1>
        ${description ? `<p>${escapeHtml(truncate(description, 200))}</p>` : ""}
      </div>
      <div class="container">
        ${infoHtml}
        ${mapHtml}
        ${eventsHtml}
        <div class="card" style="text-align:center; font-size:0.75rem; color:#6b7280">
          <p>© ${SITE_NAME} – Events and venues in Jaipur</p>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// SCHEMA GENERATION
// ============================================
function generateSchemas(venue: VenueRow, events: EventRow[], canonical: string) {
  const schemas = [];

  // Breadcrumb
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Venues", item: `${BASE_URL}/venues` },
      { "@type": "ListItem", position: 3, name: venue.name, item: canonical },
    ],
  });

  // Place Schema
  const place: any = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: venue.name,
    url: canonical,
    description: truncate(venue.description || `Venue in Jaipur hosting various events.`, 200),
  };
  if (venue.address) place.address = { "@type": "PostalAddress", streetAddress: venue.address };
  if (venue.latitude && venue.longitude) place.geo = { "@type": "GeoCoordinates", latitude: venue.latitude, longitude: venue.longitude };
  if (venue.rating) place.aggregateRating = { "@type": "AggregateRating", ratingValue: venue.rating, bestRating: 5 };
  if (venue.image) place.image = venue.image;
  schemas.push(place);

  // ItemList for events
  if (events.length) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Upcoming events at ${venue.name}`,
      numberOfItems: events.length,
      itemListElement: events.map((e, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: e.title,
        url: `${BASE_URL}/events/${e.slug}`,
      })),
    });
  }

  return schemas;
}

// ============================================
// MAIN SERVE – ALWAYS SSR
// ============================================
serve(async (req: Request) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim();

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const data = await fetchVenueData(slug);
  if (!data || !data.venue) {
    const notFoundHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Venue not found | ${SITE_NAME}</title><meta name="robots" content="noindex,follow"></head><body><h1>Venue not found</h1><p>No venue with slug "${escapeHtml(slug)}".</p></body></html>`;
    return new Response(notFoundHtml, { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
  }

  const { venue, events } = data;
  const canonical = `${BASE_URL}/venues/${venue.slug}`;
  const title = `${venue.name} – Venue Guide & Upcoming Events | ${SITE_NAME}`;
  const description = truncate(venue.description || `Discover events at ${venue.name} in Jaipur. Address, contact, upcoming shows, and more.`, 160);
  const image = venue.image || DEFAULT_IMAGE;

  let indexHtml = await getSpaShellHtml();
  const schemas = generateSchemas(venue, events, canonical);

  const headHtml = `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta property="og:type" content="place" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
${schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("")}
`;

  if (indexHtml.includes("</head>")) {
    indexHtml = indexHtml.replace(/<\/head>/i, `${headHtml}\n</head>`);
  }

  const ssrContent = buildSSRHTML(venue, events);
  const finalHtml = indexHtml.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

  return new Response(finalHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, max-age=0, must-revalidate",
      "x-ssr-rendered": "true",
    },
  });
});
