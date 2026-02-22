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

// ---------- Semantic Authority Dictionaries (safe + curated) ----------
type LocalityProfile = {
  vibe: string;
  access: string;
  venueTypes: string[];
  tips?: string[];
};

const LOCALITY_PROFILE: Record<string, LocalityProfile> = {
  "vaishali-nagar": {
    vibe: "a lively residential and shopping hub",
    access: "Ajmer Road-side connectivity and nearby arterial roads",
    venueTypes: ["cafés", "lounges", "community spaces"],
    tips: ["Weekend evenings can be busy around popular market stretches."],
  },
  mansarovar: {
    vibe: "a large, well-known residential area with active community spots",
    access: "major connectors like Ajmer Road/Tonk Road corridors nearby",
    venueTypes: ["community halls", "studios", "local event venues"],
  },
  "malviya-nagar": {
    vibe: "a busy neighbourhood with malls, cafés, and activity hubs",
    access: "key city corridors with frequent transport availability",
    venueTypes: ["cafés", "auditoriums", "event spaces"],
  },
  "c-scheme": {
    vibe: "a central area with cafés and cultural venues",
    access: "central city corridors and well-connected roads",
    venueTypes: ["auditoriums", "cafés", "event spaces"],
  },
  jagatpura: {
    vibe: "a fast-growing area with student and family footfall",
    access: "ring-road and outer corridors connecting multiple parts of Jaipur",
    venueTypes: ["studios", "cafés", "community spaces"],
  },
  "tonk-road": {
    vibe: "a major corridor with high movement and venue clusters",
    access: "a primary arterial route connecting multiple zones",
    venueTypes: ["event venues", "auditoriums", "restaurants"],
  },
  "ajmer-road": {
    vibe: "a prominent stretch with mixed commercial and residential pockets",
    access: "direct arterial connectivity across key parts of Jaipur",
    venueTypes: ["restaurants", "lounges", "event venues"],
  },
  "bani-park": {
    vibe: "a central locality with hotels and gathering venues",
    access: "central connectivity to multiple Jaipur neighbourhoods",
    venueTypes: ["auditoriums", "hotels", "event venues"],
  },
};

type CategoryProfile = {
  label: string;
  typicalTimes: string;
  venues: string[];
  expectations: string;
  tips: string[];
};

const CATEGORY_PROFILE: Record<string, CategoryProfile> = {
  music: {
    label: "Music",
    typicalTimes: "evenings and weekends",
    venues: ["clubs", "cafés", "auditoriums"],
    expectations:
      "You’ll commonly see live gigs, DJ nights, acoustic sets, and ticketed performances depending on the venue.",
    tips: [
      "Arriving 15–20 minutes early helps for popular ticketed shows.",
      "Verify age/entry rules and ticket availability in the event details.",
    ],
  },
  comedy: {
    label: "Comedy",
    typicalTimes: "weekend evenings",
    venues: ["auditoriums", "community halls", "theatre-style venues"],
    expectations:
      "Expect stand-up sets, touring line-ups, and venue-based shows with reserved seating on many listings.",
    tips: [
      "For seated shows, arrive early to avoid last-minute entry queues.",
      "Double-check venue address and entry gate before you go.",
    ],
  },
  workshops: {
    label: "Workshops",
    typicalTimes: "weekends and afternoons",
    venues: ["studios", "community spaces", "learning venues"],
    expectations:
      "Workshops often include limited seats and may require registration or pre-booking.",
    tips: [
      "Look for materials/requirements mentioned in the listing before booking.",
      "Some workshops have punctual start times—plan to be on time.",
    ],
  },
  food: {
    label: "Food",
    typicalTimes: "evenings and weekends",
    venues: ["restaurants", "festivals", "pop-ups"],
    expectations:
      "Food events often include tastings, themed menus, pop-ups, and festival-style experiences.",
    tips: [
      "Confirm pricing format (entry vs. pay-per-item) in the event details.",
      "Crowds can peak on weekend evenings—plan accordingly.",
    ],
  },
  nightlife: {
    label: "Nightlife",
    typicalTimes: "late evenings and weekends",
    venues: ["clubs", "lounges", "bars"],
    expectations:
      "Nightlife listings typically include DJ nights, themed parties, and venue-hosted events.",
    tips: [
      "Check entry rules and timing carefully—some listings have cut-off times.",
      "Confirm dress code or ID requirements when mentioned.",
    ],
  },
  sports: {
    label: "Sports",
    typicalTimes: "mornings, evenings, and weekends",
    venues: ["arenas", "sports complexes", "community grounds"],
    expectations:
      "Sports events may include matches, group activities, and venue-based sessions.",
    tips: [
      "Check whether the listing is spectator-friendly or participant-only.",
      "Review the exact start time and meeting point in the details.",
    ],
  },
  theatre: {
    label: "Theatre",
    typicalTimes: "evenings and weekends",
    venues: ["auditoriums", "theatres", "community halls"],
    expectations:
      "Theatre listings often include plays, stage performances, and ticketed shows with seating.",
    tips: [
      "Arrive early for seating and smoother entry.",
      "Verify language and duration if mentioned in the listing.",
    ],
  },
  festival: {
    label: "Festival",
    typicalTimes: "weekends and seasonal dates",
    venues: ["grounds", "open venues", "event spaces"],
    expectations:
      "Festival-style events may include multiple activities, stalls, performances, and timed entry windows.",
    tips: [
      "Check entry format and timings—some festivals have multiple slots.",
      "Expect higher footfall—plan parking and arrival time.",
    ],
  },
  other: {
    label: "Events",
    typicalTimes: "weekends and evenings",
    venues: ["event venues", "community spaces"],
    expectations:
      "You’ll find a mix of community and venue-based listings across Jaipur.",
    tips: [
      "Verify timing and location details before you go.",
      "Ticket prices and availability can change—confirm before booking.",
    ],
  },
};

// ---------- Helpers ----------
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

function slugifyLoose(input: string): string {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function localityVariants(localitySlug: string): string[] {
  const base = slugifyLoose(localitySlug);
  const spaced = base.replace(/-/g, " ");
  const titled = titleCase(base);
  const titledSpaced = titleCase(spaced.replace(/\s+/g, "-")).replace(/-/g, " ");
  // Dedup
  return Array.from(new Set([base, spaced, titled, titledSpaced].filter(Boolean)));
}

function categoryVariants(categorySlug: string): string[] {
  const base = slugifyLoose(categorySlug);
  const spaced = base.replace(/-/g, " ");
  const titled = titleCase(base);
  return Array.from(new Set([base, spaced, titled].filter(Boolean)));
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

// Determine whether this request should be indexable, based on params + inventory + query noise
function computeRobots(
  url: URL,
  hasCleanPath: boolean,
  upcomingCount: number
): { robots: string; reason: string } {
  // Allow only "clean" index pages:
  // - /events
  // - /events/:category/:locality
  // Everything else = noindex,follow
  const allowedNoise = new Set(["category", "locality"]);
  const noisyKeys = [...url.searchParams.keys()].filter((k) => !allowedNoise.has(k));

  if (!hasCleanPath) return { robots: "noindex, follow", reason: "non-canonical variant" };
  if (noisyKeys.length > 0) return { robots: "noindex, follow", reason: "query-noise" };

  // Category+locality pages only index if inventory meets threshold
  const hasScoped = Boolean(url.searchParams.get("category") && url.searchParams.get("locality"));
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

function renderAuthorityBlock(params: {
  categorySlug: string;
  localitySlug: string;
  upcomingCount: number;
}): { html: string; localityPlaceJsonLd: any } {
  const { categorySlug, localitySlug, upcomingCount } = params;

  const catKey = slugifyLoose(categorySlug) || "other";
  const locKey = slugifyLoose(localitySlug);

  const catProfile = CATEGORY_PROFILE[catKey] || CATEGORY_PROFILE.other;
  const locProfile = LOCALITY_PROFILE[locKey];

  const locLabel = titleCase(locKey);
  const catLabel = catProfile.label;

  const venueTypes = locProfile?.venueTypes?.length
    ? locProfile.venueTypes
    : catProfile.venues;

  const localityOverview = locProfile
    ? `${locLabel} is ${locProfile.vibe} in Jaipur. It’s well-connected via ${locProfile.access}, and often hosts ${catLabel.toLowerCase()} events across ${venueTypes.join(
        ", "
      )}.`
    : `${locLabel} is an active neighbourhood in Jaipur where community and venue-based listings regularly appear. ${catLabel} events here are commonly hosted across ${venueTypes.join(
        ", "
      )} depending on schedules and availability.`;

  const expectations = `For ${catLabel.toLowerCase()} events in ${locLabel}, you’ll typically find listings during ${catProfile.typicalTimes}. ${catProfile.expectations}`;

  const tips = [
    ...(locProfile?.tips || []),
    ...catProfile.tips,
    "Ticket prices and availability can change — verify before booking.",
  ].slice(0, 5);

  const tipsHtml = tips.map((t) => `<li style="margin:6px 0">${esc(t)}</li>`).join("");

  const html = `
<section aria-label="Locality guide" style="margin-top:18px;padding:14px 14px;border:1px solid #eee;border-radius:12px">
  <h2 style="font-size:18px;margin:0 0 8px">About ${esc(locLabel)} for ${esc(
    catLabel
  )} events</h2>
  <p style="margin:0 0 10px;color:#333;line-height:1.55">${esc(localityOverview)}</p>
  <p style="margin:0 0 10px;color:#333;line-height:1.55">${esc(expectations)}</p>
  <div style="margin-top:8px">
    <div style="font-weight:600;margin:0 0 6px">Practical tips</div>
    <ul style="margin:0 0 0 18px;padding:0;color:#333">
      ${tipsHtml}
    </ul>
    <div style="margin-top:10px;color:#666;font-size:13px">
      Total upcoming listings for this selection: <strong>${upcomingCount}</strong>
    </div>
  </div>
</section>`;

  // Safe locality Place schema (no fragile claims)
  const localityPlaceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${locLabel}, Jaipur`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jaipur",
      addressRegion: "Rajasthan",
      addressCountry: "IN",
    },
  };

  return { html, localityPlaceJsonLd };
}

Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url);

    // Expected query params (Vercel rewrite should supply these for scoped pages)
    const rawCategory = url.searchParams.get("category");
    const rawLocality = url.searchParams.get("locality");

    const category = rawCategory ? slugifyLoose(rawCategory) : null;
    const locality = rawLocality ? slugifyLoose(rawLocality) : null;

    const isHub = !category && !locality;

    // Canonical URLs (only two indexable shapes)
    const canonical = isHub
      ? `${BASE_URL}/events`
      : `${BASE_URL}/events/${encodeURIComponent(category || "")}/${encodeURIComponent(
          locality || ""
        )}`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    const nowIso = new Date().toISOString();

    // ---------- Query strategy ----------
    // Strict match first (best for relevance + indexing).
    // If inventory is too low, apply smart fallback matching rules,
    // BUT mark the page as non-indexable (robots=noindex) when fallback is used.
    const catVars = category ? categoryVariants(category) : [];
    const locVars = locality ? localityVariants(locality) : [];

    const buildCategoryOr = (vars: string[]) =>
      vars.map((v) => `category.ilike.%${v}%`).join(",");

    const buildLocalityOr = (vars: string[]) =>
      vars.map((v) => `locality.ilike.%${v}%`).join(",");

    async function runQuery(opts: {
      categoryVars?: string[];
      localityVars?: string[];
      ignoreLocality?: boolean;
      ignoreCategory?: boolean;
    }): Promise<{ events: any[]; upcoming: number }> {
      const ignoreLocality = Boolean(opts.ignoreLocality);
      const ignoreCategory = Boolean(opts.ignoreCategory);

      let q = supabase
        .from("events")
        .select(
          "id,slug,title,category,locality,city,venue_name,venue_address,start_date,end_date,is_free,ticket_price,cover_image,short_description,description"
        )
        .gte("start_date", nowIso)
        .order("start_date", { ascending: true })
        .limit(20);

      let countQ = supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .gte("start_date", nowIso);

      if (!ignoreCategory && category && (opts.categoryVars?.length || 0) > 0) {
        q = q.or(buildCategoryOr(opts.categoryVars!));
        countQ = countQ.or(buildCategoryOr(opts.categoryVars!));
      }

      if (!ignoreLocality && locality && (opts.localityVars?.length || 0) > 0) {
        q = q.or(buildLocalityOr(opts.localityVars!));
        countQ = countQ.or(buildLocalityOr(opts.localityVars!));
      }

      const [listRes, countRes] = await Promise.all([q, countQ]);
      if (listRes.error) throw listRes.error;
      if (countRes.error) throw countRes.error;

      const events = listRes.data ?? [];
      const upcoming = countRes.count ?? events.length;

      return { events, upcoming };
    }

    let usedFallback = false;

    // STRICT: category+locality (only if both exist)
    let events: any[] = [];
    let upcoming = 0;

    if (isHub) {
      // HUB: show upcoming Jaipur events (no scoped filters)
      const res = await runQuery({ ignoreCategory: true, ignoreLocality: true });
      events = res.events;
      upcoming = res.upcoming;
    } else {
      // STRICT scoped query
      const strictRes = await runQuery({ categoryVars: catVars, localityVars: locVars });
      events = strictRes.events;
      upcoming = strictRes.upcoming;

      // Smart fallback rules:
      // If strict inventory too low, broaden locality/category match safely.
      // 1) Keep category strict, broaden locality variants (already done via variants)
      // 2) If still low, show category-only (ignore locality) but noindex.
      if (upcoming < INDEX_MIN_UPCOMING) {
        const categoryOnlyRes = await runQuery({
          categoryVars: catVars.length ? catVars : ["other"],
          ignoreLocality: true,
        });
        events = categoryOnlyRes.events;
        upcoming = categoryOnlyRes.upcoming;
        usedFallback = true;
      }
    }

    // "Clean path" means: the page is a canonical shape AND we did not use fallback broadening.
    // (Fallback broadening should not be indexed to avoid mismatched intent indexing.)
    const hasCleanPath = !usedFallback;

    const { robots } = computeRobots(url, hasCleanPath, upcoming);

    const city = "Jaipur";
    const catKey = category || "events";
    const catLabel = category ? titleCase(category) : "Events";
    const locLabel = locality ? titleCase(locality) : "Jaipur";

    const pageTitle = isHub
      ? `Jaipur Events Calendar — Upcoming Events, Concerts, Comedy, Workshops | ${SITE_NAME}`
      : `${catLabel} Events in ${locLabel}, ${city} — Dates, Venues, Tickets | ${SITE_NAME}`;

    const pageDesc = isHub
      ? `Discover upcoming events in Jaipur: concerts, comedy shows, workshops, festivals and more. Browse by category and locality, see dates, venues and ticket prices.`
      : `Explore upcoming ${catLabel.toLowerCase()} events in ${locLabel}, Jaipur — dates, timings, venues and tickets. Updated regularly with new listings.`;

    // Schema: Breadcrumb + CollectionPage + ItemList (+ locality Place on scoped)
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

    // Semantic locality authority block (only scoped pages)
    let authorityHtml = "";
    let localityPlaceJsonLd: any | null = null;
    if (!isHub && category && locality) {
      const authority = renderAuthorityBlock({
        categorySlug: category,
        localitySlug: locality,
        upcomingCount: upcoming,
      });
      authorityHtml = authority.html;
      localityPlaceJsonLd = authority.localityPlaceJsonLd;
    }

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
${localityPlaceJsonLd ? `<script type="application/ld+json">${escJson(localityPlaceJsonLd)}</script>` : ""}
`;

    const intro = isHub
      ? `<p style="margin:8px 0 14px">Browse Jaipur’s latest events by category and locality. We track concerts, comedy, workshops, festivals, nightlife, and more. Updated regularly.</p>`
      : usedFallback
      ? `<p style="margin:8px 0 14px">Showing ${esc(
          catLabel
        )} events across Jaipur because listings in <strong>${esc(
          locLabel
        )}</strong> are currently limited. Explore other localities below.</p>`
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
  <p style="margin:0 0 10px">Use this Events hub and browse by category/locality to find what’s happening today and this week.</p>
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

  ${authorityHtml}

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
