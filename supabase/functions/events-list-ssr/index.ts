// supabase/functions/events-list-ssr/index.ts
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
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
  return /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|WhatsApp|TelegramBot/i.test(
    ua
  );
}

// Simple, deterministic slugify to align incoming params with normalized DB values
function slugify(input: string | null): string | null {
  if (!input) return null;
  const s = String(input).trim().toLowerCase();
  if (!s) return null;

  // spaces/underscores -> hyphen
  const hyphen = s.replace(/[\s_]+/g, "-");

  // remove non url-safe
  const clean = hyphen.replace(/[^a-z0-9-]+/g, "");

  // collapse multiple hyphens
  const collapsed = clean.replace(/-{2,}/g, "-");

  // trim hyphens
  const trimmed = collapsed.replace(/^-+|-+$/g, "");

  return trimmed || null;
}

// Small singularization to smooth common mismatch: "workshops" -> "workshop"
function singularizeCategory(catSlug: string): string {
  if (catSlug.endsWith("s") && catSlug.length > 3) return catSlug.slice(0, -1);
  return catSlug;
}

type RobotsResult = { robots: string; reason: string };

// Determine whether this request should be indexable, based on params + inventory + query noise
function computeRobots(
  url: URL,
  hasCleanPath: boolean,
  upcomingCount: number,
  isScoped: boolean
): RobotsResult {
  // Allow only "clean" index pages:
  // - /events
  // - /events/:category/:locality
  // Everything else = noindex,follow
  const allowedNoise = new Set(["category", "locality"]);
  const noisyKeys = [...url.searchParams.keys()].filter((k) => !allowedNoise.has(k));

  if (!hasCleanPath) return { robots: "noindex, follow", reason: "non-canonical variant" };
  if (noisyKeys.length > 0) return { robots: "noindex, follow", reason: "query-noise" };

  // Category+locality pages only index if inventory meets threshold
  if (isScoped && upcomingCount < INDEX_MIN_UPCOMING) {
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
  if (html.includes("</head>")) {
    return html.replace("</head>", `${headInjection}\n</head>`);
  }
  return html;
}

function injectPreRender(html: string, pre: string): string {
  if (/<body[^>]*>/i.test(html)) {
    return html.replace(/<body([^>]*)>/i, `<body$1>\n${pre}\n`);
  }
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

type EventRow = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  locality: string | null;
  city: string | null;
  venue_name: string | null;
  venue_address: string | null;
  start_date: string | null;
  end_date: string | null;
  is_free: boolean | null;
  ticket_price: number | null;
  cover_image: string | null;
  short_description: string | null;
  description: string | null;
};

// Apply filters to a Supabase query with different strictness levels
function applyScopedFilters(
  q: any,
  categoryRaw: string | null,
  localityRaw: string | null,
  mode:
    | "EXACT_EXACT"
    | "EXACT_ILIKE"
    | "ILIKE_EXACT"
    | "ILIKE_ILIKE"
    | "DROP_LOCALITY"
): any {
  const catSlug = slugify(categoryRaw);
  const locSlug = slugify(localityRaw);

  // For category, also try singular form if useful
  const catSingular = catSlug ? singularizeCategory(catSlug) : null;

  if (mode === "DROP_LOCALITY") {
    // Keep category intent if present, but remove locality constraint
    if (catSlug) {
      // Prefer exact eq on normalized category
      q = q.eq("category", catSlug);
      // If plural/singular mismatch, broaden with ilike
      if (catSingular && catSingular !== catSlug) {
        // broaden slightly: category contains either
        q = q.or(`category.eq.${catSlug},category.eq.${catSingular}`);
      }
    }
    return q;
  }

  if (catSlug) {
    if (mode === "EXACT_EXACT" || mode === "EXACT_ILIKE") {
      q = q.eq("category", catSlug);
      // If plural/singular mismatch exists, widen exact using OR
      if (catSingular && catSingular !== catSlug) {
        q = q.or(`category.eq.${catSlug},category.eq.${catSingular}`);
      }
    } else {
      // ilike
      // use raw + slug to maximize matches in case DB has legacy strings
      const raw = String(categoryRaw ?? "").trim();
      const patterns = new Set<string>();
      if (raw) patterns.add(raw);
      if (catSlug) patterns.add(catSlug);
      if (catSingular) patterns.add(catSingular);

      // Supabase OR for ilike needs explicit statements
      const orParts = [...patterns].map((p) => `category.ilike.%${p}%`);
      q = q.or(orParts.join(","));
    }
  }

  if (locSlug) {
    if (mode === "EXACT_EXACT" || mode === "ILIKE_EXACT") {
      q = q.eq("locality", locSlug);
    } else {
      const raw = String(localityRaw ?? "").trim();
      const patterns = new Set<string>();
      if (raw) patterns.add(raw);
      if (locSlug) patterns.add(locSlug);

      const orParts = [...patterns].map((p) => `locality.ilike.%${p}%`);
      q = q.or(orParts.join(","));
    }
  }

  return q;
}

async function runScopedQuery(
  supabase: any,
  nowIso: string,
  categoryRaw: string | null,
  localityRaw: string | null,
  mode:
    | "EXACT_EXACT"
    | "EXACT_ILIKE"
    | "ILIKE_EXACT"
    | "ILIKE_ILIKE"
    | "DROP_LOCALITY"
): Promise<{ events: EventRow[]; count: number }> {
  // List query
  let q = supabase
    .from("events")
    .select(
      "id,slug,title,category,locality,city,venue_name,venue_address,start_date,end_date,is_free,ticket_price,cover_image,short_description,description"
    )
    .eq("status", "published")
    .gte("start_date", nowIso)
    .order("start_date", { ascending: true })
    .limit(20);

  // Count query
  let countQ = supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
    .gte("start_date", nowIso);

  q = applyScopedFilters(q, categoryRaw, localityRaw, mode);
  countQ = applyScopedFilters(countQ, categoryRaw, localityRaw, mode);

  const [listRes, countRes] = await Promise.all([q, countQ]);

  if (listRes.error) throw listRes.error;
  if (countRes.error) throw countRes.error;

  return { events: (listRes.data ?? []) as EventRow[], count: countRes.count ?? 0 };
}

Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url);

    // Incoming params (from Vercel rewrite query)
    const categoryRaw = url.searchParams.get("category");
    const localityRaw = url.searchParams.get("locality");

    const category = slugify(categoryRaw);
    const locality = slugify(localityRaw);

    const isHub = !category && !locality;
    const isScoped = Boolean(category && locality);

    // Canonical URLs (only two indexable shapes)
    const canonical = isHub
      ? `${BASE_URL}/events`
      : `${BASE_URL}/events/${encodeURIComponent(category || "")}/${encodeURIComponent(
          locality || ""
        )}`;

    // This Edge Function is only reached via Vercel clean-path rewrites.
    // If someone hits it directly with weird queries, we treat it as non-canonical.
    // NOTE: We can’t trust url.pathname here because it’s a Supabase function URL.
    const hasCleanPath = isHub || isScoped;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const nowIso = new Date().toISOString();

    let events: EventRow[] = [];
    let upcoming = 0;

    // ✅ Smart Fallback Model
    // - exact first
    // - then progressively broaden
    // - if still thin: drop locality to avoid empty pages (kept noindex via robots logic)
    let matchMode:
      | "HUB"
      | "EXACT_EXACT"
      | "EXACT_ILIKE"
      | "ILIKE_EXACT"
      | "ILIKE_ILIKE"
      | "DROP_LOCALITY" = "HUB";

    if (isHub) {
      const res = await runScopedQuery(supabase, nowIso, null, null, "DROP_LOCALITY");
      events = res.events;
      upcoming = res.count;
      matchMode = "HUB";
    } else {
      // Step 1: exact category + exact locality
      let res = await runScopedQuery(supabase, nowIso, category, locality, "EXACT_EXACT");
      events = res.events;
      upcoming = res.count;
      matchMode = "EXACT_EXACT";

      // If thin, loosen locality matching first (common mismatch / legacy locality)
      if (upcoming < INDEX_MIN_UPCOMING) {
        res = await runScopedQuery(supabase, nowIso, category, locality, "EXACT_ILIKE");
        if (res.count > upcoming) {
          events = res.events;
          upcoming = res.count;
          matchMode = "EXACT_ILIKE";
        }
      }

      // If still thin, loosen category matching (legacy categories / variants)
      if (upcoming < INDEX_MIN_UPCOMING) {
        res = await runScopedQuery(supabase, nowIso, category, locality, "ILIKE_EXACT");
        if (res.count > upcoming) {
          events = res.events;
          upcoming = res.count;
          matchMode = "ILIKE_EXACT";
        }
      }

      // If still thin, loosen both
      if (upcoming < INDEX_MIN_UPCOMING) {
        res = await runScopedQuery(supabase, nowIso, category, locality, "ILIKE_ILIKE");
        if (res.count > upcoming) {
          events = res.events;
          upcoming = res.count;
          matchMode = "ILIKE_ILIKE";
        }
      }

      // If still thin, drop locality (category-only) to avoid empty pages
      // (We will still keep the page NOINDEX because it’s not a clean scoped inventory page.)
      if (upcoming === 0 || (upcoming < Math.min(3, INDEX_MIN_UPCOMING))) {
        res = await runScopedQuery(supabase, nowIso, category, locality, "DROP_LOCALITY");
        if (res.count > upcoming) {
          events = res.events;
          upcoming = res.count;
          matchMode = "DROP_LOCALITY";
        }
      }
    }

    const { robots } = computeRobots(url, hasCleanPath, upcoming, isScoped);

    const city = "Jaipur";
    const catLabel = category ? titleCase(category) : "Events";
    const locLabel = locality ? titleCase(locality) : "Jaipur";

    const pageTitle = isHub
      ? `Jaipur Events Calendar — Upcoming Events, Concerts, Comedy, Workshops | ${SITE_NAME}`
      : `${catLabel} Events in ${locLabel}, ${city} — Dates, Venues, Tickets | ${SITE_NAME}`;

    const pageDesc = isHub
      ? `Discover upcoming events in Jaipur: concerts, comedy shows, workshops, festivals and more. Browse by category and locality, see dates, venues and ticket prices.`
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
        : [
            { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
            { "@type": "ListItem", position: 2, name: "Events", item: `${BASE_URL}/events` },
            { "@type": "ListItem", position: 3, name: `${catLabel} in ${locLabel}`, item: canonical },
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

    const fallbackNote =
      matchMode === "DROP_LOCALITY" && !isHub
        ? `<p style="margin:10px 0 14px;padding:10px;border:1px dashed #ddd;border-radius:10px;color:#444">
            Limited listings found for this exact locality. Showing Jaipur-wide <strong>${esc(
              catLabel
            )}</strong> events as a fallback.
          </p>`
        : "";

    const intro = isHub
      ? `<p style="margin:8px 0 14px">Browse Jaipur’s latest events by category and locality. We track concerts, comedy, workshops, festivals, nightlife, and more. Updated regularly.</p>`
      : `<p style="margin:8px 0 14px">Showing upcoming <strong>${esc(
          catLabel
        )}</strong> events in <strong>${esc(
          locLabel
        )}</strong>, Jaipur. Total upcoming: <strong>${upcoming}</strong>.</p>`;

    const listHtml =
      events.length === 0
        ? `<p>No upcoming events found for this selection. Try another category/locality.</p>`
        : `<div style="display:flex;flex-direction:column;gap:12px">
${events
  .slice(0, 20)
  .map((e: any) => {
    const href = `/events/${e.slug}`;
    const venue = e.venue_name || "TBA";
    const loc = e.locality || "Jaipur";
    const when = e.start_date ? `${fmtDate(e.start_date)} · ${fmtTime(e.start_date)}` : "";
    const price = e.is_free ? "Free" : e.ticket_price ? `₹${e.ticket_price}` : "Paid";
    const blurb = (e.short_description || e.description || "").toString().slice(0, 160);

    return `
  <article style="border:1px solid #eee;border-radius:10px;padding:12px">
    <a href="${href}" style="text-decoration:none;color:inherit">
      <h2 style="margin:0 0 6px;font-size:18px;line-height:1.2">${esc(e.title)}</h2>
    </a>
    <div style="color:#555;font-size:13px;margin-bottom:6px">${esc(when)} · ${esc(
      venue
    )} · ${esc(loc)} · <strong>${esc(price)}</strong></div>
    ${blurb ? `<p style="margin:0;color:#444;font-size:14px">${esc(blurb)}...</p>` : ""}
    <div style="margin-top:8px">
      <a href="${href}">View details</a>
    </div>
  </article>`;
  })
  .join("")}
</div>`;

    const faq = isHub
      ? `
<section style="margin-top:18px">
  <h2 style="font-size:18px;margin:14px 0 6px">FAQs</h2>
  <h3 style="font-size:15px;margin:10px 0 4px">Where can I find today’s events in Jaipur?</h3>
  <p style="margin:0 0 10px">Use this Events hub and filter by category/locality to see what’s happening today and this week.</p>
  <h3 style="font-size:15px;margin:10px 0 4px">Do you list free events?</h3>
  <p style="margin:0 0 10px">Yes — many entries are marked Free when available.</p>
</section>`
      : `
<section style="margin-top:18px">
  <h2 style="font-size:18px;margin:14px 0 6px">FAQs</h2>
  <h3 style="font-size:15px;margin:10px 0 4px">What are the best ${esc(
    catLabel.toLowerCase()
  )} venues near ${esc(locLabel)}?</h3>
  <p style="margin:0 0 10px">Browse the list above — we show venue names and timings. Open an event for full venue details.</p>
  <h3 style="font-size:15px;margin:10px 0 4px">How do I book tickets?</h3>
  <p style="margin:0 0 10px">Open any event and follow the booking/registration info on the event page.</p>
</section>`;

    const internalLinks = buildInternalLinks(category, locality);

    const prerender = `
<div class="ssr-prerender" style="max-width:900px;margin:0 auto;padding:18px 16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
  <nav aria-label="Breadcrumb" style="font-size:13px;color:#666;margin-bottom:10px">
    <a href="/">Home</a> › <a href="/events">Events</a>${isHub ? "" : ` › <a href="${esc(
      canonical
    )}">${esc(catLabel)} in ${esc(locLabel)}</a>`}
  </nav>
  <h1 style="margin:0 0 8px;font-size:24px">${esc(pageTitle)}</h1>
  ${intro}
  ${fallbackNote}
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
