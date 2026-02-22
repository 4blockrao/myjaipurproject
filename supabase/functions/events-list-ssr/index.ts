// supabase/functions/events-list-ssr/index.ts
// JaipurCircle — Events Hub + Scoped Listings SSR (Authority layer + Semantic locality block + Smart fallback matching)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type EventRow = {
  id: string;
  title: string | null;
  slug: string | null;
  start_date: string | null;
  start_time?: string | null;
  end_time?: string | null;
  cover_image?: string | null;
  is_free?: boolean | null;
  ticket_price?: number | null;
  category?: string | null;
  locality?: string | null;
  venue_name?: string | null;
  venue_slug?: string | null;
};

type LocalityRow = {
  name: string | null;
  slug: string | null;
  seo_blurb?: string | null;
  zone?: string | null;
};

const BASE_URL = "https://www.jaipurcircle.com";
const SITE_NAME = "JaipurCircle";

const ALLOWED_QUERY_KEYS = new Set([
  "category",
  "locality",
  "cb",
  "gclid",
  "fbclid",
  "msclkid",
]);

const LOCALITY_ALIASES: Record<string, string> = {
  // normalize common variants → canonical slugs
  "c scheme": "c-scheme",
  "c-scheme": "c-scheme",
  "raja park": "raja-park",
  "raja-park": "raja-park",
  sitapura: "sitapura",
  "jln marg": "jln-marg",
  "jln-marg": "jln-marg",
  "vaishali nagar": "vaishali-nagar",
  "vaishali-nagar": "vaishali-nagar",
  "bani park": "bani-park",
  "bani-park": "bani-park",
  mansarovar: "mansarovar",
  "malviya nagar": "malviya-nagar",
  "malviya-nagar": "malviya-nagar",
};

function nowIsoDateOnlyIST(): string {
  // Date-only, but we want “today” in IST; do a simple offset calc (UTC+5:30)
  const now = new Date();
  const istMs = now.getTime() + 5.5 * 60 * 60 * 1000;
  const ist = new Date(istMs);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ist.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatHumanDateIST(isoDate: string): string {
  // isoDate: YYYY-MM-DD
  const [y, m, d] = isoDate.split("-").map((x) => Number(x));
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  return dt.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function titleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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

function safeUrl(path: string): string {
  if (!path.startsWith("/")) return `${BASE_URL}/${path}`;
  return `${BASE_URL}${path}`;
}

function buildBreadcrumbJsonLd(items: Array<{ name: string; item: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((x, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: x.name,
      item: x.item,
    })),
  };
}

function buildCollectionPageJsonLd(args: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: args.name,
    description: args.description,
    url: args.url,
    inLanguage: "en-IN",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: BASE_URL,
    },
  };
}

function buildItemListJsonLd(events: EventRow[], canonicalBase: string) {
  const list = events.slice(0, 10).map((e, idx) => {
    const slug = (e.slug || "").trim();
    const url = slug ? `${canonicalBase}/events/${slug}` : canonicalBase;
    return {
      "@type": "ListItem",
      position: idx + 1,
      url,
      name: e.title || "Event",
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: list.length,
    itemListElement: list,
  };
}

function buildPlaceJsonLd(localityName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${localityName}, Jaipur`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jaipur",
      addressRegion: "Rajasthan",
      addressCountry: "IN",
    },
    containedInPlace: {
      "@type": "Place",
      name: "Jaipur, Rajasthan, India",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jaipur",
        addressRegion: "Rajasthan",
        addressCountry: "IN",
      },
    },
  };
}

function htmlScriptJsonLd(obj: unknown): string {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

function metaTag(name: string, content: string) {
  return `<meta name="${escapeHtml(name)}" content="${escapeHtml(content)}">`;
}

function linkCanonical(href: string) {
  return `<link rel="canonical" href="${escapeHtml(href)}">`;
}

function setOrInsertHead(html: string, injection: string): string {
  const marker = "<!--ssr-prerender-head-->";
  if (html.includes(marker)) return html.replace(marker, injection);
  const idx = html.toLowerCase().indexOf("</head>");
  if (idx >= 0) return html.slice(0, idx) + injection + "\n" + html.slice(idx);
  return injection + "\n" + html;
}

function setOrInsertBody(html: string, injection: string): string {
  const marker = "<!--ssr-prerender-body-->";
  if (html.includes(marker)) return html.replace(marker, injection);
  const idx = html.toLowerCase().indexOf("</body>");
  if (idx >= 0) return html.slice(0, idx) + injection + "\n" + html.slice(idx);
  return html + "\n" + injection;
}

async function fetchSpaShell(): Promise<string> {
  // Pull the live SPA index.html so SSR is always in sync with the deployed UI bundle.
  const res = await fetch(`${BASE_URL}/index.html`, {
    headers: {
      "user-agent": "jaipurcircle-events-ssr/1.0",
      accept: "text/html",
    },
  });

  if (!res.ok) {
    // Last resort: minimal HTML
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${SITE_NAME}</title></head><body><div id="root"></div></body></html>`;
  }

  return await res.text();
}

function hasNoisyParams(url: URL): boolean {
  for (const k of url.searchParams.keys()) {
    const key = String(k || "").toLowerCase();
    if (ALLOWED_QUERY_KEYS.has(key)) continue;
    if (key.startsWith("utm_")) continue;
    return true;
  }
  return false;
}

function normalizedCategory(raw: string | null): string | null {
  if (!raw) return null;
  const s = slugify(raw);
  return s.length ? s : null;
}

function normalizedLocality(raw: string | null): string | null {
  if (!raw) return null;
  const s = slugify(raw);
  if (!s) return null;
  return LOCALITY_ALIASES[s] || s;
}

async function queryUpcomingEvents(args: {
  supabase: ReturnType<typeof createClient>;
  category?: string | null;
  locality?: string | null;
  limit?: number;
}): Promise<{ rows: EventRow[]; count: number }> {
  const today = nowIsoDateOnlyIST();

  // Query with count (head: true gives count without rows, but we need rows anyway)
  let q = args.supabase
    .from("events")
    .select(
      "id,title,slug,start_date,start_time,end_time,cover_image,is_free,ticket_price,category,locality,venue_name,venue_slug",
      { count: "exact" },
    )
    .eq("status", "published")
    .gte("start_date", today)
    .order("start_date", { ascending: true })
    .limit(args.limit ?? 20);

  if (args.category) q = q.eq("category", args.category);
  if (args.locality) q = q.eq("locality", args.locality);

  const { data, error, count } = await q;

  if (error) {
    // Fail-safe: return empty set
    return { rows: [], count: 0 };
  }

  return { rows: (data as EventRow[]) || [], count: count || 0 };
}

async function queryUpcomingEventsSmartFallback(args: {
  supabase: ReturnType<typeof createClient>;
  category?: string | null;
  locality?: string | null;
  limit?: number;
}): Promise<{
  rows: EventRow[];
  count: number;
  usedFallback: boolean;
  matchMode: "exact" | "ilike" | "alias" | "hub";
}> {
  const { supabase, category, locality } = args;

  // 1) Exact normalized match
  if (category && locality) {
    const exact = await queryUpcomingEvents({ supabase, category, locality, limit: args.limit ?? 20 });
    if (exact.rows.length > 0) return { ...exact, usedFallback: false, matchMode: "exact" };

    // 2) ILIKE match (case-insensitive exact; no wildcards)
    // Use a new query to avoid chaining issues
    const today = nowIsoDateOnlyIST();
    const q2 = supabase
      .from("events")
      .select(
        "id,title,slug,start_date,start_time,end_time,cover_image,is_free,ticket_price,category,locality,venue_name,venue_slug",
        { count: "exact" },
      )
      .eq("status", "published")
      .gte("start_date", today)
      .ilike("category", category)
      .ilike("locality", locality)
      .order("start_date", { ascending: true })
      .limit(args.limit ?? 20);

    const { data: d2, count: c2 } = await q2;
    const rows2 = (d2 as EventRow[]) || [];
    if (rows2.length > 0) return { rows: rows2, count: c2 || rows2.length, usedFallback: true, matchMode: "ilike" };

    // 3) Alias map fallback (if alias differs)
    const aliasLoc = normalizedLocality(locality);
    if (aliasLoc && aliasLoc !== locality) {
      const alias = await queryUpcomingEvents({ supabase, category, locality: aliasLoc, limit: args.limit ?? 20 });
      if (alias.rows.length > 0) return { ...alias, usedFallback: true, matchMode: "alias" };
    }

    // 4) Hub fallback (Jaipur-wide) if empty — returns hub rows but caller keeps scoped canonical
    const hub = await queryUpcomingEvents({ supabase, category: null, locality: null, limit: args.limit ?? 20 });
    return { ...hub, usedFallback: true, matchMode: "hub" };
  }

  // Hub page
  const hub = await queryUpcomingEvents({ supabase, category: null, locality: null, limit: args.limit ?? 20 });
  return { ...hub, usedFallback: false, matchMode: "exact" };
}

async function queryLocalityEntity(args: {
  supabase: ReturnType<typeof createClient>;
  localitySlug: string;
}): Promise<LocalityRow | null> {
  const { data } = await args.supabase
    .from("localities")
    .select("name,slug,seo_blurb,zone")
    .eq("slug", args.localitySlug)
    .maybeSingle();

  return (data as LocalityRow) || null;
}

async function queryTopCombos(args: {
  supabase: ReturnType<typeof createClient>;
}): Promise<Array<{ category: string; locality: string; count: number }>> {
  // Pull a bounded set of upcoming events; compute counts in JS (fast enough for SEO list)
  const today = nowIsoDateOnlyIST();
  const { data } = await args.supabase
    .from("events")
    .select("category,locality")
    .eq("status", "published")
    .gte("start_date", today)
    .limit(2000);

  const rows = (data as Array<{ category: string | null; locality: string | null }>) || [];
  const counts = new Map<string, number>();

  for (const r of rows) {
    const c = normalizedCategory(r.category || "") || "";
    const l = normalizedLocality(r.locality || "") || "";
    if (!c || !l) continue;
    const key = `${c}||${l}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const list = [...counts.entries()]
    .map(([key, count]) => {
      const [category, locality] = key.split("||");
      return { category, locality, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return list;
}

function renderAuthorityBlock(args: {
  updatedDateHuman: string;
  upcomingCount: number;
  isScoped: boolean;
  scopeLabel: string;
}) {
  const headline = args.isScoped ? `Trust & freshness for ${escapeHtml(args.scopeLabel)}` : "Trust & freshness";
  return `
<section aria-label="Authority and freshness" style="margin-top:14px; padding:14px; border:1px solid #e5e7eb; border-radius:14px; background:#fff;">
  <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
    <strong style="font-size:14px;">${headline}</strong>
    <span style="font-size:12px; color:#6b7280;">Last updated: ${escapeHtml(args.updatedDateHuman)}</span>
    <span style="font-size:12px; color:#6b7280;">Upcoming events tracked: ${args.upcomingCount}</span>
  </div>
  <ul style="margin:10px 0 0 18px; padding:0; font-size:13px; color:#374151; line-height:1.45;">
    <li>Listings include timings, venue and ticket info when available.</li>
    <li>We compile from public sources and community submissions; updates roll in daily.</li>
    <li>See something inaccurate? <a href="/help" style="text-decoration:underline;">Report it</a>.</li>
  </ul>
</section>
`.trim();
}

function renderSemanticLocalityBlock(args: {
  localityName: string;
  localitySlug: string;
  seoBlurb?: string | null;
  zone?: string | null;
  nearbyLinks: Array<{ name: string; slug: string }>;
}) {
  const blurb = (args.seoBlurb || "").trim();
  const fallbackBlurb = `${args.localityName} is a neighborhood in Jaipur. Explore events, venues, and local happenings around ${args.localityName} — updated regularly.`;
  const text = blurb.length >= 60 ? blurb : fallbackBlurb;

  const nearby = args.nearbyLinks
    .slice(0, 6)
    .map((n) => `<a href="/events/in/${escapeHtml(n.slug)}" style="display:inline-block; margin:6px 8px 0 0; padding:6px 10px; border:1px solid #e5e7eb; border-radius:999px; font-size:12px; color:#111827; background:#fff; text-decoration:none;">${escapeHtml(n.name)}</a>`)
    .join("");

  const zoneLine = args.zone ? `<div style="margin-top:6px; font-size:12px; color:#6b7280;">Zone: ${escapeHtml(args.zone)}</div>` : "";

  return `
<section aria-label="About this locality" style="margin-top:14px; padding:14px; border:1px solid #e5e7eb; border-radius:14px; background:#fff;">
  <h2 style="margin:0; font-size:16px;">About ${escapeHtml(args.localityName)} (Jaipur)</h2>
  ${zoneLine}
  <p style="margin:10px 0 0 0; font-size:13px; color:#374151; line-height:1.55;">
    ${escapeHtml(text)}
  </p>

  <div style="margin-top:12px;">
    <div style="font-size:12px; color:#6b7280;">Explore nearby areas:</div>
    <div style="margin-top:6px;">${nearby || `<span style="font-size:12px; color:#6b7280;">More localities coming soon.</span>`}</div>
  </div>
</section>
`.trim();
}

function renderTopCombosBlock(combos: Array<{ category: string; locality: string; count: number }>) {
  if (!combos.length) return "";
  const links = combos
    .map((x) => {
      const catName = titleCaseFromSlug(x.category);
      const locName = titleCaseFromSlug(x.locality);
      const href = `/events/${x.category}/${x.locality}`;
      return `<a href="${escapeHtml(href)}" style="display:inline-block; margin:6px 8px 0 0; padding:6px 10px; border:1px solid #e5e7eb; border-radius:999px; font-size:12px; color:#111827; background:#fff; text-decoration:none;">${escapeHtml(catName)} · ${escapeHtml(locName)} <span style="color:#6b7280">(${x.count})</span></a>`;
    })
    .join("");

  return `
<section aria-label="Popular event combinations" style="margin-top:14px; padding:14px; border:1px solid #e5e7eb; border-radius:14px; background:#fff;">
  <h2 style="margin:0; font-size:16px;">Popular searches in Jaipur</h2>
  <p style="margin:8px 0 0 0; font-size:13px; color:#374151; line-height:1.55;">
    Browse high-demand categories by locality — helps you discover what people are planning this week.
  </p>
  <div style="margin-top:8px;">${links}</div>
</section>
`.trim();
}

function renderEventListSnippet(events: EventRow[], canonicalBase: string) {
  const items = events.slice(0, 10).map((e) => {
    const title = escapeHtml((e.title || "Event").trim());
    const slug = (e.slug || "").trim();
    const href = slug ? `/events/${escapeHtml(slug)}` : "/events";
    const date = e.start_date ? escapeHtml(e.start_date) : "";
    const isFree = !!e.is_free;
    const price = typeof e.ticket_price === "number" && e.ticket_price > 0 ? `₹${Math.round(e.ticket_price)}` : "";
    const badge = isFree ? "Free" : price ? price : "";
    const badgeHtml = badge ? `<span style="margin-left:8px; font-size:12px; color:#047857;">${escapeHtml(badge)}</span>` : "";
    return `<li style="margin:8px 0; font-size:13px; color:#111827;">
      <a href="${href}" style="text-decoration:underline; color:#111827;">${title}</a>
      ${date ? `<span style="margin-left:8px; font-size:12px; color:#6b7280;">${date}</span>` : ""}
      ${badgeHtml}
    </li>`;
  });

  return `
<section aria-label="Upcoming events preview" style="margin-top:14px; padding:14px; border:1px solid #e5e7eb; border-radius:14px; background:#fff;">
  <h2 style="margin:0; font-size:16px;">Upcoming events (preview)</h2>
  <p style="margin:8px 0 0 0; font-size:13px; color:#374151; line-height:1.55;">
    Explore the newest listings. For full filters and booking info, open the events page.
  </p>
  <ul style="margin:10px 0 0 18px; padding:0;">${items.join("")}</ul>
</section>
`.trim();
}

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);

    // 1) Redirect away noisy params (but allow cb, utm_*, gclid, fbclid)
    if (hasNoisyParams(url)) {
      // Preserve only allowed keys (+ utm_ stripped)
      const clean = new URL(url.toString());
      for (const k of [...clean.searchParams.keys()]) {
        const key = String(k || "").toLowerCase();
        if (ALLOWED_QUERY_KEYS.has(key)) continue;
        if (key.startsWith("utm_")) {
          clean.searchParams.delete(k);
          continue;
        }
        clean.searchParams.delete(k);
      }
      // If still different, redirect
      if (clean.toString() !== url.toString()) {
        return new Response(null, {
          status: 308,
          headers: {
            location: clean.toString(),
            "cache-control": "public, max-age=300",
          },
        });
      }
    }

    const rawCategory = url.searchParams.get("category");
    const rawLocality = url.searchParams.get("locality");

    const category = normalizedCategory(rawCategory);
    const locality = normalizedLocality(rawLocality);

    const isScoped = !!(category && locality);

    // Canonical URL must be clean (no cb / tracking params)
    const canonicalUrl = isScoped
      ? safeUrl(`/events/${category}/${locality}`)
      : safeUrl(`/events`);

    // Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("SUPABASE_ANON_URL") || Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") || "";
    const supabaseKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
      Deno.env.get("SUPABASE_ANON_KEY") ||
      Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
      "";

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: { headers: { "x-client-info": "jaipurcircle-events-list-ssr" } },
    });

    // Data
    const topCombos = await queryTopCombos({ supabase });

    // Smart fallback matching rules (Option B)
    const { rows: eventsRows, count: eventsCount, usedFallback, matchMode } = await queryUpcomingEventsSmartFallback({
      supabase,
      category,
      locality,
      limit: 20,
    });

    // Locality entity
    let localityEntity: LocalityRow | null = null;
    if (isScoped && locality) {
      localityEntity = await queryLocalityEntity({ supabase, localitySlug: locality });
    }

    const todayIso = nowIsoDateOnlyIST();
    const updatedHuman = formatHumanDateIST(todayIso);

    // ✅ UPDATED Robots rules:
    // - Hub: always index
    // - Scoped: index if params are normalized (category+locality exist)
    //   Even when 0 results or fallback/hub mode, we keep it indexable because we render:
    //   authority + locality + popular combos + preview (not thin).
    const robots = !isScoped
      ? "index, follow, max-image-preview:large, max-snippet:-1"
      : "index, follow, max-image-preview:large, max-snippet:-1";

    // Page meta
    let title = "Jaipur Events Calendar — Upcoming Events, Concerts, Comedy, Workshops | JaipurCircle";
    let description =
      "Discover upcoming events in Jaipur: concerts, comedy shows, workshops, festivals and more. Browse by category and locality, see dates, venues and ticket prices.";

    let h1 = "Events in Jaipur — Concerts, Shows, Festivals & Things to Do";
    let scopeLabel = "Jaipur";

    if (isScoped && category && locality) {
      const catName = titleCaseFromSlug(category);
      const locName = (localityEntity?.name || titleCaseFromSlug(locality)).trim();
      scopeLabel = `${catName} in ${locName}`;
      title = `${catName} Events in ${locName}, Jaipur — Dates, Venues, Tickets | JaipurCircle`;
      description = `Explore upcoming ${catName.toLowerCase()} events in ${locName}, Jaipur — dates, timings, venues and tickets. Updated regularly with new listings.`;
      h1 = `${catName} Events in ${locName}, Jaipur`;
    }

    const breadcrumb = buildBreadcrumbJsonLd(
      isScoped
        ? [
            { name: "Home", item: BASE_URL },
            { name: "Events", item: safeUrl("/events") },
            { name: scopeLabel, item: canonicalUrl },
          ]
        : [
            { name: "Home", item: BASE_URL },
            { name: "Events", item: canonicalUrl },
          ],
    );

    const collection = buildCollectionPageJsonLd({
      name: title,
      description,
      url: canonicalUrl,
    });

    const itemList = buildItemListJsonLd(eventsRows, BASE_URL);

    // SSR body blocks (authority + locality + top combos + preview list)
    const authorityBlock = renderAuthorityBlock({
      updatedDateHuman: updatedHuman,
      upcomingCount: Math.max(eventsCount || 0, eventsRows.length),
      isScoped,
      scopeLabel,
    });

    // Semantic locality block first (scoped pages)
    let localityBlock = "";
    if (isScoped && locality) {
      const locName = (localityEntity?.name || titleCaseFromSlug(locality)).trim();
      // Nearby localities (simple heuristic: use aliases list order; can replace later with zones)
      const nearby = Object.values(LOCALITY_ALIASES)
        .filter((x) => x !== locality)
        .slice(0, 6)
        .map((slug) => ({ slug, name: titleCaseFromSlug(slug) }));

      localityBlock = renderSemanticLocalityBlock({
        localityName: locName,
        localitySlug: locality,
        seoBlurb: localityEntity?.seo_blurb || null,
        zone: localityEntity?.zone || null,
        nearbyLinks: nearby,
      });
    }

    const combosBlock = renderTopCombosBlock(topCombos);

    const previewList = renderEventListSnippet(eventsRows, BASE_URL);

    const fallbackBanner =
      isScoped && usedFallback
        ? `<div style="margin-top:14px; padding:12px 14px; border:1px dashed #d1d5db; border-radius:14px; background:#fafafa; font-size:13px; color:#374151;">
            <strong>Heads up:</strong> inventory for this exact filter is limited right now.
            ${matchMode === "hub" ? " Showing Jaipur-wide upcoming events to help you plan." : " Showing closest matches."}
           </div>`
        : "";

    const ssrBody = `
<div id="ssr-prerender" style="max-width:980px; margin:0 auto; padding:18px 16px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;">
  <header>
    <h1 style="margin:0; font-size:26px; line-height:1.15; color:#111827;">${escapeHtml(h1)}</h1>
    <p style="margin:10px 0 0 0; font-size:14px; color:#374151; line-height:1.55;">
      ${escapeHtml(description)}
    </p>
  </header>

  ${authorityBlock}
  ${localityBlock}
  ${fallbackBanner}
  ${combosBlock}
  ${previewList}

  <footer style="margin-top:16px; font-size:12px; color:#6b7280;">
    Prefer the full interactive experience? <a href="${isScoped ? `/events/${category}/${locality}` : "/events"}" style="text-decoration:underline;">Open Events</a>.
  </footer>
</div>
`.trim();

    // Head injection (robots + canonical + basic SEO + JSON-LD)
    const headInjection = `
${metaTag("robots", robots)}
${linkCanonical(canonicalUrl)}
<title>${escapeHtml(title)}</title>
${metaTag("description", description)}
${metaTag("og:site_name", SITE_NAME)}
${metaTag("og:title", title)}
${metaTag("og:description", description)}
${metaTag("og:url", canonicalUrl)}
${htmlScriptJsonLd(breadcrumb)}
${htmlScriptJsonLd(collection)}
${htmlScriptJsonLd(itemList)}
${isScoped && locality
  ? htmlScriptJsonLd(buildPlaceJsonLd((localityEntity?.name || titleCaseFromSlug(locality)).trim()))
  : ""}
`.trim();

    // Load SPA shell and inject
    let html = await fetchSpaShell();
    html = setOrInsertHead(html, `\n${headInjection}\n`);
    html = setOrInsertBody(html, `\n${ssrBody}\n`);

    // Cache policy
    // Keep low TTL so “events freshness” stays current, but allow CDN caching.
    const headers = new Headers();
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "public, max-age=0, s-maxage=900, stale-while-revalidate=86400");
    headers.set("access-control-allow-origin", "*");

    return new Response(html, { status: 200, headers });
  } catch (_err) {
    // Fail-safe: never return JSON 404 for the hub.
    const fallback = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${SITE_NAME} — Events</title><meta name="robots" content="noindex, follow"></head><body><h1>Events</h1><p>Temporarily unavailable.</p></body></html>`;
    return new Response(fallback, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, s-maxage=60",
      },
    });
  }
});
