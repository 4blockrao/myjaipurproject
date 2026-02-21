import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://www.jaipurcircle.com";
const SITE_NAME = "JaipurCircle";

function esc(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escJson(obj: any): string {
  // JSON inside <script> should not break out
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return iso.includes("T") ? iso.split("T")[0] : iso;
}

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function fetchIndexHtml(): Promise<string> {
  // Use the deployed index.html as the template
  const res = await fetch(`${SITE_URL}/index.html`, { headers: { "Cache-Control": "no-cache" } });
  if (!res.ok) throw new Error(`Failed to fetch index.html: ${res.status}`);
  return await res.text();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const localitySlug = (url.searchParams.get("locality") || "").trim();
    const merchantSlug = (url.searchParams.get("slug") || "").trim();

    if (!localitySlug || !merchantSlug) {
      return new Response("Missing locality or slug", {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const [indexHtml, merchantRes, localityRes] = await Promise.all([
      fetchIndexHtml(),
      supabase
        .from("merchants")
        .select("id, slug, business_name, business_type, logo_url, updated_at, locality_slug")
        .eq("slug", merchantSlug)
        .eq("locality_slug", localitySlug)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("localities")
        .select("slug, name, updated_at, zone, seo_blurb, known_for")
        .eq("slug", localitySlug)
        .limit(1)
        .maybeSingle(),
    ]);

    if (merchantRes.error) throw merchantRes.error;
    if (localityRes.error) throw localityRes.error;

    const merchant = merchantRes.data;
    const locality = localityRes.data;

    if (!merchant) {
      // Let SPA show its own 404 page (but keep status 200 so Vercel doesn't hard-404)
      return new Response(indexHtml, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      });
    }

    const localityName = locality?.name || slugToTitle(localitySlug);
    const city = "Jaipur";
    const canonical = `${SITE_URL}/jaipur/${encodeURIComponent(localitySlug)}/merchants/${encodeURIComponent(merchantSlug)}`;

    const businessName = merchant.business_name || slugToTitle(merchantSlug);
    const businessType = merchant.business_type || "Business";
    const img = merchant.logo_url || `${SITE_URL}/logo-lanscape.png`;

    const title = `${businessName} in ${localityName}, ${city} | ${SITE_NAME}`;
    const metaDesc =
      locality?.seo_blurb
        ? `${businessName} (${businessType}) in ${localityName}, ${city}. ${locality.seo_blurb}`
        : `${businessName} (${businessType}) in ${localityName}, ${city}. Hours, location, reviews and contact info on ${SITE_NAME}.`;

    // JSON-LD (LocalBusiness)
    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": businessName,
      "url": canonical,
      "image": img,
      "logo": img,
      "areaServed": {
        "@type": "City",
        "name": city,
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": localityName,
        "addressRegion": "Rajasthan",
        "addressCountry": "IN",
      },
    };

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
        { "@type": "ListItem", position: 2, name: "Jaipur", item: SITE_URL + "/jaipur" },
        { "@type": "ListItem", position: 3, name: localityName, item: SITE_URL + "/jaipur/" + localitySlug },
        { "@type": "ListItem", position: 4, name: "Merchants", item: SITE_URL + "/merchants" },
        { "@type": "ListItem", position: 5, name: businessName, item: canonical },
      ],
    };

    // Simple FAQ (safe generic)
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `Where is ${businessName} located?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${businessName} is located in ${localityName}, ${city}. Visit the merchant page on ${SITE_NAME} for details.`,
          },
        },
        {
          "@type": "Question",
          name: `What does ${businessName} offer?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${businessName} is listed as a ${businessType} in ${localityName}, ${city}.`,
          },
        },
      ],
    };

    // Meta tags injected into <head>
    const metaTags = `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(metaDesc)}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(metaDesc)}">
    <meta property="og:image" content="${esc(img)}">
    <meta property="og:locale" content="en_IN">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(metaDesc)}">
    <meta name="twitter:image" content="${esc(img)}">
    <meta name="geo.region" content="IN-RJ">
    <meta name="geo.placename" content="${esc(localityName)}">
    <script type="application/ld+json">${escJson(schema)}</script>
    <script type="application/ld+json">${escJson(breadcrumb)}</script>
    <script type="application/ld+json">${escJson(faqSchema)}</script>`;

    const updatedAt = fmtDate(merchant.updated_at || locality?.updated_at);

    // Pre-render content for crawlers (React hydrates over)
    const preContent = `<div class="ssr-prerender" style="max-width:900px;margin:0 auto;padding:20px;font-family:system-ui,sans-serif">
<nav aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/jaipur">Jaipur</a> › <a href="/jaipur/${esc(localitySlug)}">${esc(localityName)}</a> › <a href="/merchants">Merchants</a> › ${esc(businessName)}</nav>
<h1>${esc(businessName)} in ${esc(localityName)}, Jaipur</h1>
<p style="color:#555;margin-top:8px">${esc(metaDesc)}</p>

<div style="margin:16px 0">
<table style="width:100%;border-collapse:collapse"><tbody>
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:160px;color:#666">Business</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(businessName)}</td></tr>
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:160px;color:#666">Type</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(businessType)}</td></tr>
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:160px;color:#666">Locality</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(localityName)}</td></tr>
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:160px;color:#666">City</th><td style="padding:8px;border-bottom:1px solid #eee">Jaipur</td></tr>
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:160px;color:#666">Last Updated</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(updatedAt)}</td></tr>
</tbody></table>
</div>

<section>
<h2>About</h2>
<p>${esc(businessName)} is listed on ${SITE_NAME} as a ${esc(businessType)} serving ${esc(localityName)}, Jaipur.</p>
</section>

<section>
<h2>Frequently Asked Questions</h2>
<h3>Where is ${esc(businessName)} located?</h3>
<p>${esc(businessName)} is located in ${esc(localityName)}, Jaipur.</p>
<h3>What does ${esc(businessName)} offer?</h3>
<p>${esc(businessName)} is listed as a ${esc(businessType)} in ${esc(localityName)}, Jaipur.</p>
</section>

</div>`;

    // Inject into index.html
    let html = indexHtml;

    // Remove generic meta (best-effort, safe if missing)
    html = html.replace(/<title>[^<]*<\/title>/, "");
    html = html.replace(/<meta name="description"[^>]*>/, "");
    html = html.replace(/<meta name="keywords"[^>]*>/, "");
    html = html.replace(/<meta property="og:title"[^>]*>/, "");
    html = html.replace(/<meta property="og:description"[^>]*>/, "");
    html = html.replace(/<meta property="og:url"[^>]*>/, "");
    html = html.replace(/<meta property="og:type"[^>]*>/, "");
    html = html.replace(/<meta name="twitter:card"[^>]*>/, "");

    // Inject merchant meta tags
    html = html.replace("</head>", `${metaTags}\n</head>`);

    // Inject SSR content into root
    html = html.replace('<div id="root"></div>', `<div id="root">${preContent}</div>`);

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("Merchant SSR error:", err);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  }
});
