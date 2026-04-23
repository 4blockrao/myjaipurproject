// supabase/functions/artist-ssr/index.ts
// Always SSR – serves full artist page (no conditional bot logic)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const BASE_URL = "https://www.jaipurcircle.com";
const SITE_NAME = "JaipurCircle";
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

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replaceAll("&", "and")
    .replaceAll(/[^a-z0-9\s-]/g, "")
    .replaceAll(/\s+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

function titleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function nowIsoDateOnlyIST(): string {
  const now = new Date();
  const istMs = now.getTime() + 5.5 * 60 * 60 * 1000;
  const ist = new Date(istMs);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ist.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatHumanDateIST(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  return dt.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function truncate(str: string, max: number): string {
  if (!str) return "";
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + "...";
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
      headers: { "user-agent": "jaipurcircle-artist-ssr/2.0", accept: "text/html" },
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
type ArtistRow = {
  id: string;
  name: string | null;
  slug: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  cover_image?: string | null;
  website_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
};

type EventRow = {
  id: string;
  title: string | null;
  slug: string | null;
  start_date: string | null;
  cover_image?: string | null;
  is_free?: boolean | null;
  ticket_price?: number | null;
  venue_name?: string | null;
  locality?: string | null;
};

async function queryArtistBySlug(supabase: any, slug: string): Promise<ArtistRow | null> {
  const { data } = await supabase
    .from("artists")
    .select("id,name,slug,bio,avatar_url,cover_image,website_url,instagram_url,youtube_url")
    .eq("slug", slug)
    .maybeSingle();
  return data as ArtistRow | null;
}

async function queryArtistByNameFuzzy(supabase: any, nameLike: string): Promise<ArtistRow | null> {
  const { data } = await supabase
    .from("artists")
    .select("id,name,slug,bio,avatar_url,cover_image,website_url,instagram_url,youtube_url")
    .ilike("name", nameLike)
    .limit(1);
  return (data as ArtistRow[])?.[0] || null;
}

async function queryEventsForArtist(supabase: any, artistId: string, upcoming: boolean, limit: number): Promise<EventRow[]> {
  const today = nowIsoDateOnlyIST();

  // Get artist-event links via event_artists join table
  const { data: joins, error: joinErr } = await supabase
    .from("event_artists")
    .select("event_id")
    .eq("artist_id", artistId)
    .order("sort_order", { ascending: true })
    .limit(400);

  if (joinErr || !joins?.length) return [];
  const eventIds = (joins as Array<{ event_id: string }>).map((j) => j.event_id).filter(Boolean);
  if (!eventIds.length) return [];

  let q = supabase
    .from("events")
    .select("id,title,slug,start_date,cover_image,is_free,ticket_price,venue_name,locality")
    .eq("status", "published")
    .in("id", eventIds)
    .order("start_date", { ascending: upcoming })
    .limit(limit);

  if (upcoming) q = q.gte("start_date", today);
  else q = q.lt("start_date", today);

  const { data, error } = await q;
  return (data as EventRow[]) || [];
}

// ============================================
// SSR HTML BUILDER
// ============================================
function buildSSRHTML(artist: ArtistRow, upcoming: EventRow[], past: EventRow[]) {
  const name = artist.name || titleCaseFromSlug(artist.slug || "");
  const bio = artist.bio || "";
  const avatar = artist.avatar_url;
  const website = artist.website_url;
  const instagram = artist.instagram_url;
  const youtube = artist.youtube_url;

  const sameAs: string[] = [];
  if (website) sameAs.push(website);
  if (instagram) sameAs.push(instagram);
  if (youtube) sameAs.push(youtube);

  const linksHtml = sameAs.length
    ? `<div style="margin-top:8px;">${sameAs.map(link => `<a href="${escapeHtml(link)}" rel="nofollow" style="display:inline-block; margin-right:12px; text-decoration:underline;">${escapeHtml(new URL(link).hostname)}</a>`).join("")}</div>`
    : "";

  const upcomingHtml = upcoming.length
    ? `<div class="card"><h3>Upcoming Events (${upcoming.length})</h3><div class="event-grid">${upcoming.map(e => `
      <a href="${BASE_URL}/events/${e.slug}" class="event-card">
        ${e.cover_image ? `<img src="${escapeHtml(e.cover_image)}" alt="${escapeHtml(e.title || 'Event')}">` : '<div class="event-placeholder">🎤</div>'}
        <div><strong>${escapeHtml(e.title || "Event")}</strong><br>${new Date(e.start_date!).toLocaleDateString("en-IN")}<br>${e.venue_name ? escapeHtml(e.venue_name) : ""}${e.locality ? `, ${escapeHtml(e.locality)}` : ""}<br>${e.is_free ? "FREE" : e.ticket_price ? `₹${e.ticket_price}` : "TBA"}</div>
      </a>
    `).join("")}</div></div>`
    : `<div class="card"><p>No upcoming events scheduled for this artist.</p></div>`;

  const pastHtml = past.length
    ? `<div class="card"><h3>Past Events (${past.length})</h3><div class="event-grid">${past.map(e => `
      <a href="${BASE_URL}/events/${e.slug}" class="event-card past">
        <div><strong>${escapeHtml(e.title || "Event")}</strong><br>${new Date(e.start_date!).toLocaleDateString("en-IN")}<br>${e.venue_name ? escapeHtml(e.venue_name) : ""}${e.locality ? `, ${escapeHtml(e.locality)}` : ""}</div>
      </a>
    `).join("")}</div></div>`
    : `<div class="card"><p>No past events recorded.</p></div>`;

  const css = `
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:system-ui;background:#f8fafc;line-height:1.5}
      .page{max-width:1000px;margin:0 auto}
      .hero{background:linear-gradient(135deg,#1e293b,#0f172a);color:white;padding:2rem;border-radius:0 0 24px 24px}
      .hero h1{font-size:2rem;margin:0.5rem 0}
      .hero img{width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid white;margin-bottom:1rem}
      .container{padding:1.5rem}
      .card{background:white;border-radius:16px;padding:1.5rem;margin-bottom:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
      .event-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;margin-top:1rem}
      .event-card{display:flex;gap:1rem;background:#f9fafb;border-radius:12px;padding:1rem;text-decoration:none;color:inherit}
      .event-card img{width:80px;height:80px;object-fit:cover;border-radius:8px}
      .event-placeholder{width:80px;height:80px;background:#e5e7eb;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:2rem}
      .past{opacity:0.8}
      @media (max-width:640px){.container{padding:1rem}}
    </style>
  `;

  return `
    ${css}
    <div class="page">
      <div class="hero">
        ${avatar ? `<img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}">` : `<div style="font-size:4rem">🎤</div>`}
        <h1>${escapeHtml(name)}</h1>
        ${bio ? `<p style="margin-top:0.5rem">${escapeHtml(truncate(bio, 300))}</p>` : ""}
        ${linksHtml}
      </div>
      <div class="container">
        ${upcomingHtml}
        ${pastHtml}
        <div class="card" style="text-align:center; font-size:0.75rem; color:#6b7280">
          <p>© ${SITE_NAME} – Discover artists and events in Jaipur</p>
          <p><a href="/events">Browse all events</a> | <a href="/jaipur">Localities</a></p>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// SCHEMA GENERATION
// ============================================
function generateSchemas(artist: ArtistRow, upcoming: EventRow[], canonical: string) {
  const schemas = [];

  // Breadcrumb
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Events", item: `${BASE_URL}/events` },
      { "@type": "ListItem", position: 3, name: artist.name, item: canonical },
    ],
  });

  // Person
  const person: any = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: artist.name,
    url: canonical,
  };
  if (artist.bio) person.description = truncate(artist.bio, 300);
  if (artist.avatar_url) person.image = artist.avatar_url;
  const sameAs: string[] = [];
  if (artist.website_url) sameAs.push(artist.website_url);
  if (artist.instagram_url) sameAs.push(artist.instagram_url);
  if (artist.youtube_url) sameAs.push(artist.youtube_url);
  if (sameAs.length) person.sameAs = sameAs;
  schemas.push(person);

  // ItemList for upcoming events
  if (upcoming.length) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Upcoming events by ${artist.name} in Jaipur`,
      numberOfItems: upcoming.length,
      itemListElement: upcoming.map((e, idx) => ({
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
  const rawSlug = url.searchParams.get("slug") || "";
  const slug = slugify(rawSlug);

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  let artist = await queryArtistBySlug(supabase, slug);
  if (!artist) {
    const guessName = titleCaseFromSlug(slug);
    artist = await queryArtistByNameFuzzy(supabase, `%${guessName}%`);
  }

  if (!artist || !artist.name) {
    const notFoundHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Artist not found | ${SITE_NAME}</title><meta name="robots" content="noindex,follow"></head><body><h1>Artist not found</h1><p>No artist with slug "${escapeHtml(slug)}".</p></body></html>`;
    return new Response(notFoundHtml, { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
  }

  const upcoming = await queryEventsForArtist(supabase, artist.id, true, 24);
  const past = await queryEventsForArtist(supabase, artist.id, false, 12);

  const canonical = `${BASE_URL}/artists/${artist.slug || slug}`;
  const title = `${artist.name} – Upcoming Shows & Profile | ${SITE_NAME}`;
  const description = truncate(artist.bio || `Discover ${artist.name} and their upcoming events in Jaipur.`, 160);
  const image = artist.avatar_url || artist.cover_image || "https://www.jaipurcircle.com/og-default.jpg";

  let indexHtml = await getSpaShellHtml();
  const schemas = generateSchemas(artist, upcoming, canonical);

  const headHtml = `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta property="og:type" content="profile" />
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

  const ssrContent = buildSSRHTML(artist, upcoming, past);
  const finalHtml = indexHtml.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

  return new Response(finalHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, max-age=0, must-revalidate",
      "x-ssr-rendered": "true",
    },
  });
});
