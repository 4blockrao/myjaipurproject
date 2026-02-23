// supabase/functions/event-ssr/index.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

// JaipurCircle — Event Page SSR (SEO + Schema + Clean head injection + SSR body + internal links)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type EventRow = {
  id: string;
  slug: string;
  title: string | null;

  // Dates
  start_date: string | null; // can be datetime in your table; we treat as ISO parseable
  end_date: string | null;

  // Location / taxonomy
  city: string | null;
  locality: string | null;
  locality_slug?: string | null;
  category: string | null;
  category_slug?: string | null;

  // Venue
  venue_name: string | null;
  venue_slug?: string | null;
  venue_address?: string | null;

  // Media
  cover_image: string | null;

  // Pricing
  is_free: boolean | null;
  ticket_price: number | null;

  // Content
  description: string | null;
  short_description: string | null;
  meta_title: string | null;
  meta_description: string | null;

  // Organizer / online
  organizer_name: string | null;
  is_online: boolean | null;
  online_url: string | null;

  // Tags
  tags: string[] | null;

  // Misc
  updated_at?: string | null;
};

const BASE_URL = "https://www.jaipurcircle.com";
const SITE_NAME = "JaipurCircle";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=630&fit=crop";

const corsHeaders: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeJsonLd(obj: unknown): string {
  // Prevent closing tags via <script> parsing
  return JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

function safeTrim(s: string | null | undefined): string {
  return (s ?? "").trim();
}

function truncate(input: string, max = 170): string {
  const s = safeTrim(input).replace(/\s+/g, " ");
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function slugify(input: string): string {
  return safeTrim(input)
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function toIsoOrNull(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function fmtDateIN(dateStr: string | null): string {
  const iso = toIsoOrNull(dateStr);
  if (!iso) return "TBA";
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function fmtTimeIN(dateStr: string | null): string {
  const iso = toIsoOrNull(dateStr);
  if (!iso) return "TBA";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function pickEventSchemaType(category: string | null): string {
  const c = safeTrim(category).toLowerCase();
  if (c.includes("music") || c.includes("concert")) return "MusicEvent";
  if (c.includes("comedy") || c.includes("standup")) return "ComedyEvent";
  if (c.includes("dance")) return "DanceEvent";
  if (c.includes("theatre") || c.includes("theater")) return "TheaterEvent";
  if (c.includes("festival")) return "Festival";
  if (c.includes("sports")) return "SportsEvent";
  if (c.includes("workshop")) return "EducationEvent";
  if (c.includes("food")) return "FoodEvent";
  return "Event";
}

// ---- index.html cache (keeps hashed assets aligned with live SPA build) ----
let cachedIndexHtml: { html: string; fetchedAt: number } | null = null;

async function fetchIndexHtml(): Promise<string> {
  const now = Date.now();
  const ttlMs = 5 * 60 * 1000;

  if (cachedIndexHtml && now - cachedIndexHtml.fetchedAt < ttlMs) {
    return cachedIndexHtml.html;
  }

  const cb = Math.floor(now / 1000);
  const resp = await fetch(`${BASE_URL}/index.html?cb=${cb}`, {
    headers: { "user-agent": "jaipurcircle-event-ssr/1.0", accept: "text/html,*/*" },
  });

  if (!resp.ok) {
    // fallback minimal shell
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${SITE_NAME}</title></head><body><div id="root"></div></body></html>`;
  }

  const html = await resp.text();
  cachedIndexHtml = { html, fetchedAt: now };
  return html;
}

// ---- head/body injection ----
function removeHeadTag(html: string, regex: RegExp): string {
  return html.replace(regex, "");
}

function cleanExistingSeoHead(html: string): string {
  let out = html;

  // Remove ALL titles (avoid duplicates)
  out = removeHeadTag(out, /<title[\s\S]*?<\/title>\s*/gi);

  // Remove common SEO tags we will regenerate (global, case-insensitive)
  out = removeHeadTag(out, /<meta[^>]+name=["']description["'][^>]*>\s*/gi);
  out = removeHeadTag(out, /<meta[^>]+name=["']robots["'][^>]*>\s*/gi);

  out = removeHeadTag(out, /<link[^>]+rel=["']canonical["'][^>]*>\s*/gi);

  // OpenGraph
  out = removeHeadTag(out, /<meta[^>]+property=["']og:[^"']+["'][^>]*>\s*/gi);

  // Twitter
  out = removeHeadTag(out, /<meta[^>]+name=["']twitter:[^"']+["'][^>]*>\s*/gi);

  // Any existing JSON-LD scripts
  out = removeHeadTag(out, /<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi);

  return out;
}

function injectBeforeHeadClose(html: string, injection: string): string {
  const idx = html.toLowerCase().lastIndexOf("</head>");
  if (idx >= 0) return html.slice(0, idx) + injection + "\n" + html.slice(idx);
  return injection + "\n" + html;
}

function injectRootHtml(html: string, rootHtml: string): string {
  // Handle <div id="root"></div> or <div id="root">...</div>
  const rootRegex = /<div\s+id=["']root["'][^>]*>([\s\S]*?)<\/div>/i;
  if (rootRegex.test(html)) {
    return html.replace(rootRegex, `<div id="root">${rootHtml}</div>`);
  }
  // last resort: append
  return html + `\n<div id="root">${rootHtml}</div>`;
}

// ---- main ----
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slugRaw = url.searchParams.get("slug") ?? "";
    const slug = safeTrim(slugRaw);

    if (!slug) {
      return new Response("Missing slug parameter", {
        status: 400,
        headers: { ...corsHeaders, "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
      });
    }

    // Supabase client (prefer service role if present; else anon)
    const supabaseUrl =
      Deno.env.get("SUPABASE_URL") ||
      Deno.env.get("SUPABASE_ANON_URL") ||
      Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ||
      "";
    const supabaseKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
      Deno.env.get("SUPABASE_ANON_KEY") ||
      Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
      "";

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "x-client-info": "jaipurcircle-event-ssr" } },
    });

    // Fetch event (only fields we need)
    const { data: event, error } = await supabase
      .from("events")
      .select(
        [
          "id",
          "slug",
          "title",
          "start_date",
          "end_date",
          "city",
          "locality",
          "locality_slug",
          "category",
          "category_slug",
          "venue_name",
          "venue_slug",
          "venue_address",
          "cover_image",
          "is_free",
          "ticket_price",
          "description",
          "short_description",
          "meta_title",
          "meta_description",
          "organizer_name",
          "is_online",
          "online_url",
          "tags",
          "updated_at",
        ].join(","),
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error || !event) {
      // Return HTML 404 (not JSON) so crawlers/users don’t see raw JSON
      const notFound = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Event not found — ${SITE_NAME}</title><meta name="robots" content="noindex, nofollow"></head><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;max-width:860px;margin:40px auto;padding:0 16px"><h1>Event not found</h1><p>We couldn’t find an event for slug: <code>${escapeHtml(slug)}</code>.</p><p><a href="${BASE_URL}/events">Browse events</a></p></body></html>`;
      return new Response(notFound, {
        status: 404,
        headers: {
          ...corsHeaders,
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "x-ssr-module": "event-ssr",
        },
      });
    }

    const e = event as EventRow;

    const canonical = `${BASE_URL}/events/${encodeURIComponent(e.slug)}`;

    const city = safeTrim(e.city) || "Jaipur";
    const localityName = safeTrim(e.locality);
    const categoryName = safeTrim(e.category);

    const categorySlug = safeTrim(e.category_slug) || (categoryName ? slugify(categoryName) : "");
    const localitySlug = safeTrim(e.locality_slug) || (localityName ? slugify(localityName) : "");

    const year = e.start_date ? new Date(e.start_date).getFullYear() : new Date().getFullYear();
    const venue = safeTrim(e.venue_name) || "TBA";
    const img = safeTrim(e.cover_image) || DEFAULT_IMAGE;

    const startIso = toIsoOrNull(e.start_date);
    const endIso =
      toIsoOrNull(e.end_date) ||
      (startIso ? new Date(new Date(startIso).getTime() + 3 * 60 * 60 * 1000).toISOString() : null);

    const isPast = startIso ? new Date(startIso) < new Date() : false;
    const priceText = e.is_free ? "Free Entry" : e.ticket_price ? `₹${Math.round(e.ticket_price)}` : "Ticket price: TBA";

    const rawDesc =
      safeTrim(e.description) ||
      safeTrim(e.short_description) ||
      `${safeTrim(e.title) || "This event"} in ${city}. Get details on JaipurCircle.`;

    const title =
      safeTrim(e.meta_title) ||
      `${safeTrim(e.title) || "Event"} in ${city} ${year} — Date, ${venue !== "TBA" ? `${venue}, ` : ""}Tickets & Booking`;

    const metaDesc =
      safeTrim(e.meta_description) ||
      truncate(
        `Book ${safeTrim(e.title) || "this event"} in ${city} — ${fmtDateIN(e.start_date)}${
          venue !== "TBA" ? ` at ${venue}` : ""
        }. ${priceText}. Timings, entry rules & booking.`,
        170,
      );

    // Breadcrumb URLs (prefer clean paths)
    const categoryUrl = categorySlug ? `${BASE_URL}/events/${encodeURIComponent(categorySlug)}` : `${BASE_URL}/events`;
    const categoryLocalityUrl =
      categorySlug && localitySlug
        ? `${BASE_URL}/events/${encodeURIComponent(categorySlug)}/${encodeURIComponent(localitySlug)}`
        : categoryUrl;

    // JSON-LD: Event
    const eventSchema: any = {
      "@context": "https://schema.org",
      "@type": pickEventSchemaType(categoryName),
      "@id": canonical,
      name: safeTrim(e.title) || "Event",
      description: truncate(rawDesc, 500),
      url: canonical,
      inLanguage: "en-IN",
      image: [img],
      eventStatus: isPast ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
      eventAttendanceMode: e.is_online
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
      isAccessibleForFree: !!e.is_free,
    };

    if (startIso) eventSchema.startDate = startIso;
    if (endIso) eventSchema.endDate = endIso;

    if (e.is_online) {
      eventSchema.location = {
        "@type": "VirtualLocation",
        url: safeTrim(e.online_url) || canonical,
      };
    } else {
      eventSchema.location = {
        "@type": "Place",
        name: venue,
        address: {
          "@type": "PostalAddress",
          streetAddress: safeTrim(e.venue_address) || (venue !== "TBA" ? venue : ""),
          addressLocality: localityName || "Jaipur",
          addressRegion: "Rajasthan",
          addressCountry: "IN",
        },
      };
    }

    eventSchema.offers = {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "INR",
      ...(e.is_free ? { price: "0" } : e.ticket_price ? { price: String(Math.round(e.ticket_price)) } : {}),
      availability: isPast ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    };

    eventSchema.organizer = {
      "@type": "Organization",
      name: safeTrim(e.organizer_name) || SITE_NAME,
      url: BASE_URL,
    };

    // JSON-LD: BreadcrumbList
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Events", item: `${BASE_URL}/events` },
        ...(categoryName
          ? [{ "@type": "ListItem", position: 3, name: categoryName, item: categoryUrl }]
          : []),
        ...(categoryName && localityName && categorySlug && localitySlug
          ? [{ "@type": "ListItem", position: 4, name: localityName, item: categoryLocalityUrl }]
          : []),
        {
          "@type": "ListItem",
          position: categoryName && localityName && categorySlug && localitySlug ? 5 : categoryName ? 4 : 3,
          name: safeTrim(e.title) || "Event",
          item: canonical,
        },
      ],
    };

    // JSON-LD: FAQPage (tight + factual)
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `When is ${safeTrim(e.title) || "this event"} in ${city}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${safeTrim(e.title) || "This event"} is on ${fmtDateIN(e.start_date)} at ${fmtTimeIN(e.start_date)} in ${city}.`,
          },
        },
        {
          "@type": "Question",
          name: `Where is it happening?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: e.is_online
              ? `This is an online event. See details on JaipurCircle.`
              : `At ${venue}${localityName ? `, ${localityName}` : ""}, ${city}.`,
          },
        },
        {
          "@type": "Question",
          name: `What is the ticket price?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: e.is_free ? "This is a free event. Registration may be required." : priceText,
          },
        },
        {
          "@type": "Question",
          name: `How to book tickets?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Open the event page on JaipurCircle: ${canonical}`,
          },
        },
      ],
    };

    // Build head injection
    const head = `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(metaDesc)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${escapeHtml(canonical)}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:title" content="${escapeHtml(safeTrim(e.title) || title)}">
<meta property="og:description" content="${escapeHtml(metaDesc)}">
<meta property="og:image" content="${escapeHtml(img)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_IN">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(safeTrim(e.title) || title)}">
<meta name="twitter:description" content="${escapeHtml(metaDesc)}">
<meta name="twitter:image" content="${escapeHtml(img)}">

<script type="application/ld+json">${escapeJsonLd(eventSchema)}</script>
<script type="application/ld+json">${escapeJsonLd(breadcrumbSchema)}</script>
<script type="application/ld+json">${escapeJsonLd(faqSchema)}</script>
`.trim();

    // SSR body (crawlers + fallback UX)
    const tags = (e.tags || [])
      .filter(Boolean)
      .slice(0, 10)
      .map(
        (t) =>
          `<span style="display:inline-block;background:rgba(0,0,0,.05);padding:2px 8px;margin:2px;border-radius:999px;font-size:12px">${escapeHtml(
            String(t),
          )}</span>`,
      )
      .join("");

    const whenText = `${fmtDateIN(e.start_date)}${e.start_date ? ` • ${fmtTimeIN(e.start_date)}` : ""}${
      e.end_date ? ` – ${fmtTimeIN(e.end_date)}` : ""
    }`;

    const whereText = e.is_online
      ? "Online"
      : `${venue}${localityName ? ` • ${localityName}` : ""} • ${city}`;

    const exploreLinks = [
      { label: "All Jaipur Events", href: "/events" },
      { label: "Events Today", href: "/events/today" },
      { label: "This Week", href: "/events/this-week" },
      { label: "This Weekend", href: "/events/this-weekend" },
      { label: "Free Events", href: "/events/free" },
      ...(categorySlug ? [{ label: `${titleCaseFromSlug(categorySlug)} Events`, href: `/events/${categorySlug}` }] : []),
      ...(categorySlug && localitySlug
        ? [{ label: `${titleCaseFromSlug(categorySlug)} in ${titleCaseFromSlug(localitySlug)}`, href: `/events/${categorySlug}/${localitySlug}` }]
        : []),
      ...(localitySlug ? [{ label: `Locality Guide: ${titleCaseFromSlug(localitySlug)}`, href: `/jaipur/${localitySlug}` }] : []),
      ...(e.venue_slug ? [{ label: `Venue: ${venue}`, href: `/venues/${e.venue_slug}` }] : []),
    ];

    const exploreHtml = exploreLinks
      .slice(0, 10)
      .map(
        (x) =>
          `<a href="${escapeHtml(x.href)}" style="display:inline-block;margin:6px 8px 0 0;padding:8px 10px;border:1px solid rgba(0,0,0,.12);border-radius:12px;text-decoration:none;color:inherit;font-size:13px">${escapeHtml(
            x.label,
          )}</a>`,
      )
      .join("");

    const body = `
<style>
  .ssr-prerender{max-width:900px;margin:0 auto;padding:22px 16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
  .ssr-prerender h1{font-size:28px;line-height:1.2;margin:0 0 10px}
  .ssr-prerender .sub{color:#555;margin:0 0 18px}
  .ssr-prerender .grid{display:grid;grid-template-columns:1.1fr .9fr;gap:16px}
  @media (max-width: 900px){.ssr-prerender .grid{grid-template-columns:1fr}}
  .ssr-prerender .card{border:1px solid rgba(0,0,0,.08);border-radius:14px;padding:14px;background:#fff}
  .ssr-prerender h2{font-size:16px;margin:0 0 10px}
  .ssr-prerender .muted{color:#666;font-size:14px;line-height:1.55}
  .ssr-prerender table{width:100%;border-collapse:collapse}
  .ssr-prerender th,.ssr-prerender td{padding:8px;border-bottom:1px solid rgba(0,0,0,.06);vertical-align:top}
  .ssr-prerender th{width:140px;text-align:left;color:#666;font-size:12px;font-weight:600}
</style>

<div class="ssr-prerender" data-ssr="event">
  <nav aria-label="Breadcrumb" style="font-size:13px;color:#666;margin-bottom:10px">
    <a href="/" style="color:inherit;text-decoration:underline">Home</a>
    <span> › </span>
    <a href="/events" style="color:inherit;text-decoration:underline">Events</a>
    ${categoryName ? `<span> › </span><a href="${escapeHtml(categorySlug ? `/events/${categorySlug}` : "/events")}" style="color:inherit;text-decoration:underline">${escapeHtml(categoryName)}</a>` : ""}
    <span> › </span>
    <span>${escapeHtml(safeTrim(e.title) || "Event")}</span>
  </nav>

  <h1>${escapeHtml(safeTrim(e.title) || "Event")} — Jaipur Event Details</h1>
  <p class="sub">${escapeHtml(truncate(rawDesc, 220))}</p>

  <div class="grid">
    <div class="card">
      <h2>Quick Info</h2>
      <table class="event-quick-info" aria-label="Event Overview">
        <tbody>
          <tr><th>When</th><td>${escapeHtml(whenText)}</td></tr>
          <tr><th>Where</th><td>${escapeHtml(whereText)}</td></tr>
          <tr><th>Price</th><td><strong>${escapeHtml(priceText)}</strong></td></tr>
          ${safeTrim(e.organizer_name) ? `<tr><th>Organizer</th><td>${escapeHtml(safeTrim(e.organizer_name))}</td></tr>` : ""}
          ${e.is_online && safeTrim(e.online_url) ? `<tr><th>Online link</th><td><a href="${escapeHtml(safeTrim(e.online_url))}" style="text-decoration:underline">Open</a></td></tr>` : ""}
        </tbody>
      </table>

      ${tags ? `<div style="margin-top:10px"><div style="font-size:12px;color:#666;margin-bottom:6px">Tags</div><div>${tags}</div></div>` : ""}
    </div>

    <div class="card">
      <h2>About</h2>
      <div class="muted">${escapeHtml(truncate(rawDesc, 1200))}</div>
      <div style="height:10px"></div>
      <div class="muted">Canonical URL: <a href="${escapeHtml(canonical)}" style="text-decoration:underline">${escapeHtml(canonical)}</a></div>
    </div>

    <div class="card">
      <h2>Explore more</h2>
      <div class="muted">Continue browsing related pages:</div>
      <div style="margin-top:8px">${exploreHtml}</div>
    </div>

    <div class="card">
      <h2>FAQs</h2>
      <div class="muted"><strong>When is it?</strong> ${escapeHtml(fmtDateIN(e.start_date))} at ${escapeHtml(fmtTimeIN(e.start_date))}.</div>
      <div style="height:8px"></div>
      <div class="muted"><strong>Where?</strong> ${escapeHtml(whereText)}.</div>
      <div style="height:8px"></div>
      <div class="muted"><strong>Price?</strong> ${escapeHtml(priceText)}.</div>
    </div>
  </div>
</div>
`.trim();

    // Compose final HTML
    let html = await fetchIndexHtml();
    html = cleanExistingSeoHead(html);
    html = injectBeforeHeadClose(html, "\n" + head + "\n");
    html = injectRootHtml(html, body);

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        "x-ssr-module": "event-ssr",
      },
    });
  } catch (err) {
    console.error("event-ssr fatal:", err);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { ...corsHeaders, "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }
});
