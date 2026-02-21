/// <reference lib="deno.ns" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function xmlEscape(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function isoDateOnly(d: Date) {
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

function sitemapIndexXml(siteOrigin: string, lastmod: string) {
  const items = [
    "/sitemap-pages.xml",
    "/sitemap-localities.xml",
    "/sitemap-zones.xml",
    "/sitemap-deals.xml",
    "/sitemap-merchants.xml",
    "/sitemap-events.xml",
    "/sitemap-news.xml",
    "/sitemap-news-google.xml",
  ];

  const body = items
    .map((p) => {
      const loc = `${siteOrigin}${p}`;
      return `  <sitemap>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${xmlEscape(lastmod)}</lastmod>
  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "index";

    // IMPORTANT:
    // When this runs on Supabase, req.url origin is *.supabase.co.
    // We MUST use a configured site URL for first-party sitemap <loc> entries.
    const siteOrigin =
      (Deno.env.get("PUBLIC_SITE_URL") || Deno.env.get("SITE_URL") || "https://www.jaipurcircle.com").replace(/\/+$/, "");

    // If you want lastmod to reflect DB freshness later, wire it to queries.
    // For now, use "today" (UTC) so Google sees updates.
    const lastmod = isoDateOnly(new Date());

    if (type === "index") {
      const xml = sitemapIndexXml(siteOrigin, lastmod);
      return new Response(xml, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }

    // For other types, keep your existing implementation.
    // If you already have logic here in your current deployed function,
    // paste/merge it below this line (do NOT change the index behavior above).
    return new Response("Not Implemented", {
      status: 501,
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e) {
    console.error("sitemap edge error:", e);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  }
});
