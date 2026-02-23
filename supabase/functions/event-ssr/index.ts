// supabase/functions/event-ssr/index.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = (Deno.env.get("SITE_ORIGIN") ?? "https://www.jaipurcircle.com").replace(/\/+$/, "");
const SITE_NAME = "JaipurCircle";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=630&fit=crop";

const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL") ||
  Deno.env.get("SUPABASE_ANON_URL") ||
  Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ||
  "";

const SUPABASE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_ANON_KEY") ||
  Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
  "";

function esc(str: string): string {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escJson(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function fmtTime(d: string): string {
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function eventType(cat: string): string {
  const c = (cat || "").toLowerCase();
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

// ---- index.html cache (preserve hashed asset refs) ----
let cachedIndexHtml: { html: string; fetchedAt: number } | null = null;

async function getSpaShellHtml(): Promise<string> {
  const now = Date.now();
  const ttlMs = 5 * 60 * 1000; // 5 minutes
  if (cachedIndexHtml && now - cachedIndexHtml.fetchedAt < ttlMs) return cachedIndexHtml.html;

  const cb = Math.floor(now / 1000);
  const url = `${BASE_URL}/index.html?cb=${cb}`;

  const res = await fetch(url, {
    headers: {
      "user-agent": "jaipurcircle-event-ssr/1.0",
      accept: "text/html,*/*",
    },
  });

  if (!res.ok) {
    // fallback minimal shell (still HTML)
    const minimal =
      `<!doctype html><html lang="en"><head>` +
      `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<title>${SITE_NAME}</title></head><body><div id="root"></div></body></html>`;
    cachedIndexHtml = { html: minimal, fetchedAt: now };
    return minimal;
  }

  const html = await res.text();
  cachedIndexHtml = { html, fetchedAt: now };
  return html;
}

function injectHeadAndRoot(indexHtml: string, headHtml: string, rootHtml: string): string {
  let out = indexHtml;

  // Inject head tags
  if (out.toLowerCase().includes("</head>")) {
    out = out.replace(/<\/head>/i, `${headHtml}\n</head>`);
  } else {
    out = `${headHtml}\n${out}`;
  }

  // Replace root container
  const rootRegex = /<div\s+id=["']root["'][^>]*>([\s\S]*?)<\/div>/i;
  if (rootRegex.test(out)) {
    out = out.replace(rootRegex, `<div id="root">${rootHtml}</div>`);
  } else {
    out = out.replace(/<div\s+id=["']root["'][^>]*>\s*<\/div>/i, `<div id="root">${rootHtml}</div>`);
  }

  return out;
}

function ssrHeaders(args: { cacheControl: string }) {
  // We explicitly set Content-Type for ALL paths, including 404,
  // to avoid “text/plain + nosniff” on HTML.
  return {
    ...corsHeaders,
    "content-type": "text/html; charset=utf-8",
    "cache-control": args.cacheControl,

    // Avoid platform default “default-src 'none'; sandbox” for 404s
    // while still being reasonably safe.
    "content-security-policy":
      "default-src 'self' https: data: blob:; " +
      "script-src 'self' https: 'unsafe-inline'; " +
      "style-src 'self' https: 'unsafe-inline'; " +
      "img-src * data: blob:; " +
      "connect-src * https:; " +
      "frame-src *; " +
      "base-uri 'self';",
    "x-ssr-module": "event-ssr",
    "x-site-origin": BASE_URL,
  };
}

function renderNotFound(slug: string) {
  const canonical = `${BASE_URL}/events`;
  const html = `<!doctype html><html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Event not found — ${SITE_NAME}</title>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="canonical" href="${esc(canonical)}" />
</head>
<body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;max-width:860px;margin:40px auto;padding:0 16px">
  <h1>Event not found</h1>
  <p>We couldn’t find an event for slug: <code>${esc(slug)}</code>.</p>
  <p><a href="${esc(canonical)}">Browse events</a></p>
</body>
</html>`;
  return html;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const slug = (url.searchParams.get("slug") || "").trim();

    if (!slug) {
      const html = renderNotFound("(missing slug)");
      return new Response(html, {
        status: 400,
        headers: ssrHeaders({ cacheControl: "no-store" }),
      });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${SITE_NAME}</title></head><body>
      <h1>Server misconfigured</h1><p>Missing SUPABASE_URL / SUPABASE_*_KEY.</p></body></html>`;
      return new Response(html, {
        status: 500,
        headers: ssrHeaders({ cacheControl: "no-store" }),
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "x-ssr": "event-ssr" } },
    });

    const { data: event, error } = await supabase.from("events").select("*").eq("slug", slug).maybeSingle();

    if (error || !event) {
      const html = renderNotFound(slug);
      return new Response(html, {
        status: 404,
        headers: ssrHeaders({ cacheControl: "no-store" }),
      });
    }

    const indexHtml = await getSpaShellHtml();

    const city = (event.city || "Jaipur").trim();
    const yr = new Date(event.start_date).getFullYear();
    const venue = (event.venue_name || "TBA").trim();
    const isPast = new Date(event.start_date) < new Date();
    const canonical = `${BASE_URL}/events/${encodeURIComponent(event.slug)}`;
    const img = event.cover_image || DEFAULT_IMAGE;
    const priceText = event.is_free ? "Free Entry" : `₹${event.ticket_price || "TBA"}`;
    const desc =
      event.description ||
      event.short_description ||
      `${event.title} in ${city}. Get details on ${SITE_NAME}.`;

    const title =
      event.meta_title ||
      `${event.title} ${city} ${yr} — Date, ${venue !== "TBA" ? venue + ", " : ""}Ticket Price & Booking`;

    const metaDesc =
      event.meta_description ||
      `Book ${event.title} tickets in ${city} — ${fmtDate(event.start_date)}${
        venue !== "TBA" ? ` at ${venue}` : ""
      }. ${priceText}. Timings, entry rules & booking.`;

    // JSON-LD schemas
    const schema = {
      "@context": "https://schema.org",
      "@type": eventType(event.category || ""),
      "@id": canonical,
      name: event.title,
      description: String(desc).substring(0, 500),
      url: canonical,
      startDate: new Date(event.start_date).toISOString(),
      endDate: event.end_date
        ? new Date(event.end_date).toISOString()
        : new Date(new Date(event.start_date).getTime() + 3 * 3600000).toISOString(),
      eventStatus: isPast ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
      eventAttendanceMode: event.is_online
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
      location: event.is_online
        ? { "@type": "VirtualLocation", url: event.online_url || canonical }
        : {
            "@type": "Place",
            name: venue,
            address: {
              "@type": "PostalAddress",
              streetAddress: event.venue_address || venue,
              addressLocality: event.locality || "Jaipur",
              addressRegion: "Rajasthan",
              addressCountry: "IN",
            },
          },
      image: [img],
      offers: {
        "@type": "Offer",
        url: canonical,
        priceCurrency: "INR",
        ...(event.is_free ? { price: "0" } : event.ticket_price ? { price: String(event.ticket_price) } : {}),
        availability: isPast ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      },
      organizer: { "@type": "Organization", name: event.organizer_name || SITE_NAME, url: BASE_URL },
      ...(event.organizer_name ? { performer: { "@type": "Person", name: event.organizer_name } } : {}),
      isAccessibleForFree: !!event.is_free,
      inLanguage: "en-IN",
    };

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Events", item: `${BASE_URL}/events` },
        { "@type": "ListItem", position: 3, name: String(event.category || "Events"), item: `${BASE_URL}/events` },
        { "@type": "ListItem", position: 4, name: String(event.title || "Event"), item: canonical },
      ],
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `When is ${event.title} in ${city}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${event.title} is on ${fmtDate(event.start_date)} at ${fmtTime(event.start_date)} in ${city}.`,
          },
        },
        {
          "@type": "Question",
          name: `Where is ${event.title} happening?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${event.title} is at ${venue}${event.locality ? `, ${event.locality}` : ""}, ${city}.`,
          },
        },
        {
          "@type": "Question",
          name: `What is the ticket price for ${event.title}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: event.is_free ? "This is a free event. Registration may be required." : `Tickets start from ₹${event.ticket_price || "TBA"}.`,
          },
        },
        {
          "@type": "Question",
          name: `How to book tickets for ${event.title}?`,
          acceptedAnswer: { "@type": "Answer", text: `You can view booking details on ${SITE_NAME} at ${canonical}.` },
        },
      ],
    };

    // Head tags (we do not try to remove old ones; we append near end of head)
    const headHtml = `
<title>${esc(title)}</title>
<meta name="description" content="${esc(metaDesc)}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<link rel="canonical" href="${esc(canonical)}" />
<meta property="og:type" content="event" />
<meta property="og:url" content="${esc(canonical)}" />
<meta property="og:site_name" content="${esc(SITE_NAME)}" />
<meta property="og:title" content="${esc(String(event.title || title))}" />
<meta property="og:description" content="${esc(metaDesc)}" />
<meta property="og:image" content="${esc(img)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(String(event.title || title))}" />
<meta name="twitter:description" content="${esc(metaDesc)}" />
<meta name="twitter:image" content="${esc(img)}" />
<script type="application/ld+json">${escJson(schema)}</script>
<script type="application/ld+json">${escJson(breadcrumb)}</script>
<script type="application/ld+json">${escJson(faqSchema)}</script>
`.trim();

    // SSR block (simple + crawlable)
    const preContent = `
<div class="ssr-prerender" data-ssr="event" style="max-width:820px;margin:0 auto;padding:20px;font-family:system-ui,sans-serif">
  <nav aria-label="Breadcrumb" style="font-size:13px;color:#374151">
    <a href="/">Home</a> › <a href="/events">Events</a> › ${esc(String(event.category || "Events"))} › ${esc(String(event.title || "Event"))}
  </nav>
  <h1 style="margin-top:12px">${esc(String(event.title || "Event"))} ${esc(city)} ${yr} — Date, Venue, Ticket Price, Timing &amp; Booking Info</h1>

  <div style="margin:16px 0">
    <table style="width:100%;border-collapse:collapse"><tbody>
      <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:140px;color:#666">Venue</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(venue)}</td></tr>
      ${event.locality ? `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:140px;color:#666">Locality</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(String(event.locality))}</td></tr>` : ""}
      <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:140px;color:#666">Date</th><td style="padding:8px;border-bottom:1px solid #eee"><time datetime="${new Date(event.start_date).toISOString()}">${esc(fmtDate(event.start_date))}</time></td></tr>
      <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:140px;color:#666">Time</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(fmtTime(event.start_date))}${event.end_date ? ` – ${esc(fmtTime(event.end_date))}` : ""}</td></tr>
      <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:140px;color:#666">Price</th><td style="padding:8px;border-bottom:1px solid #eee"><strong>${esc(priceText)}</strong></td></tr>
    </tbody></table>
  </div>

  <section>
    <h2>About ${esc(String(event.title || "this event"))}</h2>
    <p>${esc(String(desc).substring(0, 1500))}</p>
  </section>
</div>
`.trim();

    const finalHtml = injectHeadAndRoot(indexHtml, headHtml, preContent);

    return new Response(finalHtml, {
      status: 200,
      headers: ssrHeaders({
        cacheControl: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      }),
    });
  } catch (err) {
    console.error("event-ssr fatal:", err);
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${SITE_NAME} — Events</title><meta name="robots" content="noindex, follow" />
    </head><body><h1>Events</h1><p>Temporarily unavailable.</p></body></html>`;
    return new Response(html, {
      status: 200,
      headers: ssrHeaders({ cacheControl: "public, max-age=0, s-maxage=60" }),
    });
  }
});
