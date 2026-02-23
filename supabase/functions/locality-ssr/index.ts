// JaipurCircle — Locality SSR (Locality-first, zone deprecated)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SITE_ORIGIN =
  (Deno.env.get("SITE_ORIGIN") ?? "https://www.jaipurcircle.com")
    .replace(/\/+$/, "");

const SUPABASE_URL =
  (Deno.env.get("SUPABASE_URL") ?? "").replace(/\/+$/, "");

const SUPABASE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  Deno.env.get("SUPABASE_ANON_KEY") ??
  "";

let cachedIndexHtml: { html: string; fetchedAt: number } | null = null;

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const slug = (url.searchParams.get("slug") ?? "")
      .trim()
      .toLowerCase();

    if (!slug) {
      return text("Missing slug", 400);
    }

    const locality = await fetchLocality(slug);

    if (!locality) {
      return text("Locality not found", 404);
    }

    const canonical = `${SITE_ORIGIN}/jaipur/${slug}`;
    const title = `Things to Do, Events & Local Guide for ${locality.name}, Jaipur`;
    const description = buildDescription(locality);

    let htmlDoc = await getIndexHtml();

    htmlDoc = replaceTitle(htmlDoc, title);
    htmlDoc = replaceMetaDescription(htmlDoc, description);
    htmlDoc = upsertCanonical(htmlDoc, canonical);
    htmlDoc = upsertJsonLd(htmlDoc, locality, canonical);
    htmlDoc = injectIntoRoot(htmlDoc, buildMarkup(locality, canonical));

    return new Response(htmlDoc, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control":
          "public, max-age=0, s-maxage=900, stale-while-revalidate=86400",
        "x-ssr-module": "locality-ssr",
      },
    });
  } catch (err) {
    return text("SSR Error: " + String(err), 500);
  }
});

/* -------------------- DATA -------------------- */

async function fetchLocality(slug: string) {
  const select =
    "name,slug,seo_blurb,known_for,pin_codes,geo_lat,geo_lng";

  const endpoint =
    `${SUPABASE_URL}/rest/v1/localities?` +
    `select=${encodeURIComponent(select)}&slug=eq.${encodeURIComponent(
      slug,
    )}&limit=1`;

  const res = await fetch(endpoint, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!res.ok) return null;

  const rows = await res.json();
  return rows?.[0] ?? null;
}

/* -------------------- INDEX FETCH -------------------- */

async function getIndexHtml(): Promise<string> {
  const now = Date.now();
  const ttl = 5 * 60 * 1000;

  if (cachedIndexHtml && now - cachedIndexHtml.fetchedAt < ttl) {
    return cachedIndexHtml.html;
  }

  const res = await fetch(`${SITE_ORIGIN}/index.html`);
  const html = await res.text();

  cachedIndexHtml = { html, fetchedAt: now };
  return html;
}

/* -------------------- DESCRIPTION -------------------- */

function buildDescription(loc: any): string {
  if (loc.seo_blurb?.trim()) {
    return truncate(loc.seo_blurb.trim(), 165);
  }

  const base =
    loc.known_for
      ? `${loc.name} is known for ${loc.known_for}.`
      : `Explore ${loc.name} in Jaipur.`;

  return truncate(
    base + " Discover local landmarks, events and neighbourhood highlights.",
    165,
  );
}

/* -------------------- JSON-LD -------------------- */

function upsertJsonLd(html: string, loc: any, canonical: string) {
  const place = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${loc.name}, Jaipur`,
    url: canonical,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jaipur",
      addressRegion: "Rajasthan",
      addressCountry: "IN",
    },
  };

  if (loc.geo_lat && loc.geo_lng) {
    place["geo"] = {
      "@type": "GeoCoordinates",
      latitude: loc.geo_lat,
      longitude: loc.geo_lng,
    };
  }

  html = html.replace(
    /<!-- LOCALITY_JSONLD_START -->[\s\S]*?<!-- LOCALITY_JSONLD_END -->/i,
    "",
  );

  const block = `
<!-- LOCALITY_JSONLD_START -->
<script type="application/ld+json">
${JSON.stringify(place)}
</script>
<!-- LOCALITY_JSONLD_END -->
`;

  return html.replace(/<\/head>/i, `${block}</head>`);
}

/* -------------------- MARKUP -------------------- */

function buildMarkup(loc: any, canonical: string) {
  return `
<style>
  .ssr-prerender{max-width:900px;margin:0 auto;padding:30px 16px;font-family:system-ui}
  .ssr-prerender h1{font-size:28px;margin:0 0 10px}
  .ssr-prerender p{color:#444}
</style>

<div class="ssr-prerender" data-ssr="locality">
  <h1>${escapeHtml(loc.name)}, Jaipur</h1>
  <p>${escapeHtml(buildDescription(loc))}</p>
  <p style="margin-top:10px;font-size:14px;color:#666">
    Canonical: <a href="${canonical}">${canonical}</a>
  </p>
</div>
`;
}

/* -------------------- HTML HELPERS -------------------- */

function replaceTitle(html: string, title: string) {
  const safe = escapeHtml(title);
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(
      /<title>[\s\S]*?<\/title>/i,
      `<title>${safe}</title>`,
    );
  }
  return html.replace(/<\/head>/i, `<title>${safe}</title></head>`);
}

function replaceMetaDescription(html: string, description: string) {
  const safe = escapeHtml(description);
  const tag = `<meta name="description" content="${safe}" />`;
  const re =
    /<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i;

  if (re.test(html)) {
    return html.replace(re, tag);
  }
  return html.replace(/<\/head>/i, `${tag}</head>`);
}

function upsertCanonical(html: string, canonical: string) {
  const safe = escapeHtml(canonical);
  const tag = `<link rel="canonical" href="${safe}" />`;
  const re = /<link\s+rel=["']canonical["'][^>]*\/?>/i;

  if (re.test(html)) {
    return html.replace(re, tag);
  }
  return html.replace(/<\/head>/i, `${tag}</head>`);
}

function injectIntoRoot(html: string, inner: string) {
  return html.replace(
    /<div\s+id=["']root["'][^>]*>[\s\S]*?<\/div>/i,
    `<div id="root">${inner}</div>`,
  );
}

/* -------------------- UTIL -------------------- */

function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}

function escapeHtml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function text(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/plain" },
  });
}
