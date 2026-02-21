import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BASE_URL = "https://www.jaipurcircle.com";
const SITE_NAME = "JaipurCircle";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=630&fit=crop";

// Listing pages indexability threshold (avoid thin indexed pages)
const INDEX_MIN_UPCOMING = 6;

// A small curated set for strong internal linking (crawl pyramid)
const TOP_CATEGORIES = [
  "music",
  "comedy",
  "workshops",
  "food",
  "nightlife",
  "sports",
  "theatre",
  "festival",
];
const TOP_LOCALITIES = [
  "vaishali-nagar",
  "mansarovar",
  "malviya-nagar",
  "c-scheme",
  "jagatpura",
  "tonk-road",
  "ajmer-road",
  "bani-park",
];

function esc(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escJson(obj: unknown): string {
  // Prevent accidental HTML breaking out
  return JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

function titleCase(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
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

function isLikelyBot(req: Request): boolean {
  const ua = req.headers.get("user-agent") || "";
  return /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|WhatsApp|TelegramBot/i
    .test(ua);
}

function startOfDayISO(d: Date): string {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function endOfDayISO(d: Date): string {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

// Determine whether this request should be indexable, based on params + inventory + query noise
function computeRobots(
  hasCleanPath: boolean,
  isHub: boolean,
  hasScoped: boolean,
  upcomingCount: number,
): { robots: string; reason: string } {
  if (!hasCleanPath) return { robots: "noindex, follow", reason: "non-canonical variant" };

  // Hub is always indexable
  if (isHub) {
    return {
      robots: "index, follow, max-image-preview:large, max-snippet:-1",
      reason: "hub-ok",
    };
  }

  // Scoped pages only index if inventory meets threshold
  if (hasScoped && upcomingCount < INDEX_MIN_UPCOMING) {
    return { robots: "noindex, follow", reason: "thin-inventory" };
  }

  return {
    robots: "index, follow, max-image-preview:large, max-snippet:-1",
    reason: "ok",
  };
}

async function fetchIndexHtml(): Promise<string> {
  try {
    const resp = await fetch(`${BASE_URL}/index.html`, {
      headers: { "User-Agent": "JaipurCircle-SSR/1.0" },
    });
    return await resp.text();
  } catch {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body><div id="root"></div></body></html>`;
  }
}

function injectHead(html: string, headInjection: string): string {
  if (html.includes("</head>")) return html.replace("</head>", `${headInjection}\n</head>`);
  return html;
}

function injectPreRender(html: string, pre: string): string {
  if (/<body[^>]*>/i.test(html)) return html.replace(/<body([^>]*)>/i, `<body$1>\n${pre}\n`);
  return `${pre}\n${html}`;
}

function buildInternalLinks(category?: string | null, locality?: string | null): string {
  const catLinks = TOP_CATEGORIES.map((c) => {
    const href = locality ? `/events/${c}/${locality}` : `/events/${c}/${TOP_LOCALITIES[0]}`;
    return `<a href="${href}" style="margin-right:10px">${esc(titleCase(c))}</a>`;
  }).join("");

  const locLinks = TOP_LOCALITIES.map((l) => {
    const href = category ? `/events/${category}/${l}` : `/events/${TOP_CATEGORIES[0]}/${l}`;
    return `<a href="${href}" style="margin-right:10px">${esc(titleCase(l))}</a>`;
  }).join("");

  return `
<section style="margin-top:18px">
  <h2 style="font-size:18px;margin:14px 0 6px">Explore by Category</h2>
  <div>${catLinks}</div>
  <h2 style="font-size:18px;margin:14px 0 6px">Explore by Locality</h2>
  <div>${locLinks}</div>
</section>`;
}

type FilterKey = "today" | "this-week" | "this-weekend" | "free" | "workshops" | null;

function filterLabel(f: FilterKey): string {
  switch (f) {
    case "today":
      return "Today";
    case "this-week":
      return "This Week";
    case "this-weekend":
      return "This Weekend";
    case "free":
      return "Free Events";
    case "workshops":
      return "Workshops";
    default:
      return "";
  }
}

// Canonicals (only clean shapes; never canonicalize to query variants)
function computeCanonical(
  category: string | null,
  locality: string | null,
  filter: FilterKey,
): string {
  if (filter) return `${BASE_URL}/events/${filter === "this-week" ? "this-week" : filter}`;
  if (!category && !locality) return `${BASE_URL}/events`;
  if (category && locality) {
    return `${BASE_URL}/events/${encodeURIComponent(category)}/${encodeURIComponent(locality)}`;
  }
  // If somehow partial scope appears, canonicalize to hub
  return `${BASE_URL}/events`;
}

Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url);

    const category = url.searchParams.get("category");
    const locality = url.searchParams.get("locality");
    const filter = (url.searchParams.get("filter") as FilterKey) || null;

    const isHub = !category && !locality && !filter;
    const hasScoped = Boolean(category && locality);

    // This Edge Function is only reached via Vercel clean-path rewrites.
    const hasCleanPath = true;

    const canonical = computeCanonical(category, locality, filter);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Time window logic
    const now = new Date();
    const nowIso = now.toISOString();

    // Default listing: upcoming events
    let startGte = nowIso;
    let endLt: string | null = null;

    if (filter === "today") {
      startGte = startOfDayISO(now);
      endLt = endOfDayISO(now);
    } else if (filter === "this-week") {
      // next 7 days
      startGte = startOfDayISO(now);
      endLt = endOfDayISO(addDays(now, 7));
    } else if (filter === "this-weekend") {
      // Fri–Sun of the current week (simple version: next 3 days)
      startGte = startOfDayISO(now);
      endLt = endOfDayISO(addDays(now, 3));
    }

    // Build query
    let q = supabase
      .from("events")
      .select(
        "id,slug,title,category,locality,city,venue_name,venue_address,start_date,end_date,is_free,ticket_price,cover_image,short_description,description",
      )
      .gte("start_date", startGte)
      .order("start_date", { ascending: true })
      .limit(20);

    let countQ = supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .gte("start_date", startGte);

    if (endLt) {
      q = q.lte("start_date", endLt);
      countQ = countQ.lte("start_date", endLt);
    }

    if (filter === "free") {
      q = q.eq("is_free", true);
      countQ = countQ.eq("is_free", true);
    }

    if (filter === "workshops") {
      // your categories vary; use ilike match
      q = q.ilike("category", "%workshop%");
      countQ = countQ.ilike("category", "%workshop%");
    }

    if (category) {
      q = q.ilike("category", `%${category}%`);
      countQ = countQ.ilike("category", `%${category}%`);
    }
    if (locality) {
      q = q.ilike("locality", `%${locality}%`);
      countQ = countQ.ilike("locality", `%${locality}%`);
    }

    const [listRes, countRes] = await Promise.all([q, countQ]);
    if (listRes.error) throw listRes.error;
    if (countRes.error) throw countRes.error;

    const events = listRes.data ?? [];
    const upcoming = countRes.count ?? events.length;

    const { robots } = computeRobots(hasCleanPath, isHub, hasScoped || Boolean(filter), upcoming);

    // Titles/descriptions
    const city = "Jaipur";
    const catLabel = category ? titleCase(category) : "Events";
    const locLabel = locality ? titleCase(locality) : "Jaipur";
    const filterText = filter ? filterLabel(filter) : "";

    const pageTitle = isHub
      ? `Jaipur Events Calendar — Upcoming Events, Concerts, Comedy, Workshops | ${SITE_NAME}`
      : filter
        ? `Jaipur Events ${filterText} — Dates, Venues, Tickets | ${SITE_NAME}`
        : `${catLabel} Events in ${locLabel}, ${city} — Dates, Venues, Tickets | ${SITE_NAME}`;

    const pageDesc = isHub
      ? `Discover upcoming events in Jaipur: concerts, comedy shows, workshops, festivals and more. Browse by category and locality, see dates, venues and ticket prices.`
      : filter
        ? `Find Jaipur events ${filterText.toLowerCase()}: timings, venues, tickets and booking info. Updated regularly.`
        : `Explore upcoming ${catLabel.toLowerCase()} events in ${locLabel}, Jaipur — dates, timings, venues and tickets. Updated regularly with new listings.`;

    // Schema: Breadcrumb + CollectionPage + ItemList
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: isHub
        ? [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Events", item: `${BASE_URL}/events` },
        ]
        : filter
          ? [
            { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
            { "@type": "ListItem", position: 2, name: "Events", item: `${BASE_URL}/events` },
            { "@type": "ListItem", position: 3, name: filterText, item: canonical },
          ]
          : [
            { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
            { "@type": "ListItem", position: 2, name: "Events", item: `${BASE_URL}/events` },
            {
              "@type": "ListItem",
              position: 3,
              name: `${catLabel} in ${locLabel}`,
              item: canonical,
            },
          ],
    };

    const collection = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pageTitle,
      description: pageDesc,
      url: canonical,
      inLanguage: "en-IN",
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: BASE_URL },
    };

    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: Math.min(events.length, 10),
      itemListElement: events.slice(0, 10).map((e: any, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${BASE_URL}/events/${e.slug}`,
        name: e.title,
      })),
    };

    const ogImage = DEFAULT_IMAGE;

    const metaTags = `
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(pageDesc)}">
<meta name="robots" content="${esc(robots)}">
<link rel="canonical" href="${esc(canonical)}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:title" content="${esc(pageTitle)}">
<meta property="og:description" content="${esc(pageDesc)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(pageTitle)}">
<meta name="twitter:description" content="${esc(pageDesc)}">
<meta name="twitter:image" content="${esc(ogImage)}">

<script type="application/ld+json">${escJson(breadcrumb)}</script>
<script type="application/ld+json">${escJson(collection)}</script>
<script type="application/ld+json">${escJson(itemList)}</script>
`;

    // Pre-render content (real HTML links for crawl)
    const intro = isHub
      ? `<p style="margin:8px 0 14px">Browse Jaipur’s latest events by category and locality. We track concerts, comedy, workshops, festivals, nightlife, and more. Updated regularly.</p>`
      : filter
        ? `<p style="margin:8px 0 14px">Showing Jaipur events for <strong>${esc(filterText)}</strong>. Total upcoming in this view: <strong>${upcoming}</strong>.</p>`
        : `<p style="margin:8px 0 14px">Showing upcoming <strong>${esc(catLabel)}</strong> events in <strong>${esc(locLabel)}</strong>, Jaipur. Total upcoming: <strong>${upcoming}</strong>.</p>`;

    const listHtml =
      events.length === 0
        ? `<p>No upcoming events found for this selection. Try another category/locality.</p>`
        : `<div style="display:flex;flex-direction:column;gap:12px">
${events.slice(0, 20).map((e: any) => {
  const href = `/events/${e.slug}`;
  const venue = e.venue_name || "TBA";
  const loc = e.locality || "Jaipur";
  const when = e.start_date ? `${fmtDate(e.start_date)} · ${fmtTime(e.start_date)}` : "";
  const price = e.is_free ? "Free" : (e.ticket_price ? `₹${e.ticket_price}` : "Paid");
  const blurb = (e.short_description || e.description || "").toString().slice(0, 160);

  return `
  <article style="border:1px solid #eee;border-radius:10px;padding:12px">
    <a href="${href}" style="text-decoration:none;color:inherit">
      <h2 style="margin:0 0 6px;font-size:18px;line-height:1.2">${esc(e.title)}</h2>
    </a>
    <div style="color:#555;font-size:13px;margin-bottom:6px">${esc(when)} · ${esc(venue)} · ${esc(loc)} · <strong>${esc(price)}</strong></div>
    ${blurb ? `<p style="margin:0;color:#444;font-size:14px">${esc(blurb)}...</p>` : ""}
    <div style="margin-top:8px">
      <a href="${href}">View details</a>
    </div>
  </article>`;
}).join("")}
</div>`;

    const faq = isHub
      ? `
<section style="margin-top:18px">
  <h2 style="font-size:18px;margin:14px 0 6px">FAQs</h2>
  <h3 style="font-size:15px;margin:10px 0 4px">Where can I find today’s events in Jaipur?</h3>
  <p style="margin:0 0 10px">Use the Events hub and the Today/This Week/Weekend filters to see what’s happening soon.</p>
  <h3 style="font-size:15px;margin:10px 0 4px">Do you list free events?</h3>
  <p style="margin:0 0 10px">Yes — many entries are marked Free when available.</p>
</section>`
      : `
<section style="margin-top:18px">
  <h2 style="font-size:18px;margin:14px 0 6px">FAQs</h2>
  <h3 style="font-size:15px;margin:10px 0 4px">How do I book tickets?</h3>
  <p style="margin:0 0 10px">Open any event and follow the booking/registration info on the event page.</p>
  <h3 style="font-size:15px;margin:10px 0 4px">How often is this list updated?</h3>
  <p style="margin:0 0 10px">Listings are updated regularly as new events are added.</p>
</section>`;

    const internalLinks = buildInternalLinks(category, locality);

    const prerender = `
<div class="ssr-prerender" style="max-width:900px;margin:0 auto;padding:18px 16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
  <nav aria-label="Breadcrumb" style="font-size:13px;color:#666;margin-bottom:10px">
    <a href="/">Home</a> › <a href="/events">Events</a>${isHub ? "" : ` › <a href="${esc(canonical)}">${esc(isHub ? "Events" : (filter ? filterText : `${catLabel} in ${locLabel}`))}</a>`}
  </nav>
  <h1 style="margin:0 0 8px;font-size:24px">${esc(pageTitle)}</h1>
  ${intro}
  ${listHtml}
  ${internalLinks}
  ${faq}
</div>`;

    let html = await fetchIndexHtml();

    // Remove generic tags if present (safe no-op if not found)
    html = html.replace(/<title>[^<]*<\/title>/i, "");
    html = html.replace(/<meta name="description"[^>]*>/i, "");
    html = html.replace(/<link rel="canonical"[^>]*>/i, "");
    html = html.replace(/<meta name="robots"[^>]*>/i, "");

    html = injectHead(html, metaTags);
    html = injectPreRender(html, prerender);

    const headers = new Headers({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": isLikelyBot(req)
        ? "public, max-age=0, must-revalidate"
        : "public, max-age=30",
    });

    return new Response(html, { status: 200, headers });
  } catch (_e) {
    return new Response("Error loading events", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=UTF-8" },
    });
  }
});
