import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const config = {
  verify_jwt: false,
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://www.jaipurcircle.com";
const SITE_NAME = "JaipurCircle";

function esc(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escJson(v: any): string {
  // JSON-LD must stay valid JSON (literal quotes). Only neutralise characters
  // that could break out of the <script> tag; do NOT HTML-escape the quotes.
  return JSON.stringify(v)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function fmtDate(d?: string | null): string {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

function pickPrimaryLocalitySlug(localitySlugParam: string | null, localityRow: any | null) {
  // If caller provides locality, prefer that for canonical (it matches your URL structure).
  // If not, fall back to locality row slug if we have it.
  if (localitySlugParam) return localitySlugParam;
  return localityRow?.slug || "jaipur";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const u = new URL(req.url);
    const localitySlug = u.searchParams.get("locality");
    const merchantSlug = u.searchParams.get("slug");

    if (!merchantSlug) {
      return new Response(JSON.stringify({ error: "Missing slug" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load merchant by slug (your DB has merchants.slug)
    const { data: merchant, error: mErr } = await supabase
      .from("merchants")
      .select("id, slug, business_name, description, logo_url, logo_url, address, phone, website, updated_at, created_at, is_active")
      .eq("slug", merchantSlug)
      .maybeSingle();

    if (mErr) throw mErr;
    if (!merchant) {
      return new Response(JSON.stringify({ error: "Merchant not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
      });
    }

    // Load published reviews (server-rendered for SEO + AggregateRating rich results)
    const { data: reviewRows } = await supabase
      .from("merchant_reviews")
      .select("rating, reviewer_name, title, body, created_at, is_verified")
      .eq("merchant_id", merchant.id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);
    const reviews = reviewRows || [];
    const reviewCount = reviews.length;
    const avgRating = reviewCount
      ? Math.round((reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviewCount) * 10) / 10
      : 0;

    // Find primary locality (entity_locality_map)
    const { data: mapRow } = await supabase
      .from("entity_locality_map")
      .select("locality_id")
      .eq("entity_type", "merchant")
      .eq("entity_id", merchant.id)
      .eq("is_primary", true)
      .maybeSingle();

    let localityRow: any | null = null;
    if (mapRow?.locality_id) {
      const { data: loc } = await supabase
        .from("localities")
        .select("id, name, slug, zone, updated_at")
        .eq("id", mapRow.locality_id)
        .maybeSingle();
      localityRow = loc || null;
    }

    const canonicalLocality = pickPrimaryLocalitySlug(localitySlug, localityRow);
    const canonical = `${SITE_URL}/jaipur/${encodeURIComponent(canonicalLocality)}/merchants/${encodeURIComponent(merchant.slug)}`;

    // If request is already for canonical route, serve SSR HTML.
    // If someone hits the function directly with a different locality, we still serve canonical in <link>.
    const name = merchant.business_name || merchant.slug;
    const localityName = localityRow?.name || canonicalLocality.replace(/-/g, " ");
    const title = `${name} in ${localityName}, Jaipur — Address, Phone, Reviews & Offers`;
    const desc =
      merchant.description?.trim() ||
      `${name} in ${localityName}, Jaipur. View contact details, address, photos and latest updates on ${SITE_NAME}.`;

    const img =
      merchant.logo_url ||
      merchant.logo_url ||
      `${SITE_URL}/og-default.png`;

    const schemaLocalBusiness = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name,
      url: canonical,
      image: img,
      telephone: merchant.phone || undefined,
      sameAs: merchant.website || undefined,
      address: merchant.address
        ? { "@type": "PostalAddress", streetAddress: merchant.address, addressLocality: "Jaipur", addressRegion: "RJ", addressCountry: "IN" }
        : undefined,
      aggregateRating: reviewCount
        ? { "@type": "AggregateRating", ratingValue: avgRating, reviewCount, bestRating: 5, worstRating: 1 }
        : undefined,
      review: reviews.slice(0, 5).map((r: any) => ({
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
        author: { "@type": "Person", name: r.reviewer_name || "A JaipurCircle user" },
        name: r.title || undefined,
        reviewBody: r.body || r.title || undefined,
        datePublished: r.created_at,
      })),
    };

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Jaipur", item: `${SITE_URL}/jaipur` },
        { "@type": "ListItem", position: 3, name: localityName, item: `${SITE_URL}/jaipur/${canonicalLocality}` },
        { "@type": "ListItem", position: 4, name: name, item: canonical },
      ],
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `Where is ${name} located in Jaipur?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: merchant.address ? `${name} is located at ${merchant.address} in ${localityName}, Jaipur.` : `${name} is located in ${localityName}, Jaipur.`,
          },
        },
        {
          "@type": "Question",
          name: `How to contact ${name}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: merchant.phone ? `You can call ${name} at ${merchant.phone}.` : `Contact details for ${name} are available on this page.`,
          },
        },
        {
          "@type": "Question",
          name: `Is ${name} currently active on ${SITE_NAME}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: merchant.is_active ? `Yes, ${name} is active on ${SITE_NAME}.` : `This listing may be inactive currently on ${SITE_NAME}.`,
          },
        },
      ],
    };

    // Load SPA index.html from the deployed site
    const indexRes = await fetch(`${SITE_URL}/index.html`, { headers: { "User-Agent": "JaipurCircle-SSR/1.0" } });
    const indexHtml = await indexRes.text();

    const metaTags = `
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
<script type="application/ld+json">${escJson(schemaLocalBusiness)}</script>
<script type="application/ld+json">${escJson(breadcrumb)}</script>
<script type="application/ld+json">${escJson(faqSchema)}</script>
`;

    const reviewsHtml = reviewCount === 0
      ? `
  <section>
    <h2>Reviews</h2>
    <p style="color:#555">No reviews yet — be the first to review ${esc(name)} on ${SITE_NAME}.</p>
  </section>`
      : `
  <section>
    <h2>Reviews — ${avgRating} out of 5 (${reviewCount} review${reviewCount > 1 ? "s" : ""})</h2>
    ${reviews.map((r: any) => `
    <article style="margin:12px 0;padding:12px;border:1px solid #eee;border-radius:10px">
      <div style="font-weight:600">${esc(r.reviewer_name || "A JaipurCircle user")}${r.is_verified ? " · Verified visit" : ""}</div>
      <div style="color:#f59e0b" aria-label="${r.rating} out of 5 stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
      ${r.title ? `<div style="font-weight:600;margin-top:4px">${esc(r.title)}</div>` : ""}
      ${r.body ? `<p style="color:#555;margin:4px 0 0">${esc(r.body)}</p>` : ""}
    </article>`).join("")}
  </section>`;

    const preContent = `
<div class="ssr-prerender" style="max-width:900px;margin:0 auto;padding:20px;font-family:system-ui,sans-serif">
  <nav aria-label="Breadcrumb">
    <a href="/">Home</a> › <a href="/jaipur">Jaipur</a> › <a href="/jaipur/${esc(canonicalLocality)}">${esc(localityName)}</a> › ${esc(name)}
  </nav>

  <h1>${esc(name)} in ${esc(localityName)}, Jaipur</h1>

  <p style="color:#555;line-height:1.6">${esc(desc)}</p>

  <div style="margin:16px 0;padding:14px;border:1px solid #eee;border-radius:10px">
    <h2 style="margin:0 0 10px 0;font-size:18px">Quick Info</h2>
    <ul style="margin:0;padding-left:18px;line-height:1.7">
      <li><strong>Locality:</strong> ${esc(localityName)}</li>
      ${merchant.address ? `<li><strong>Address:</strong> ${esc(merchant.address)}</li>` : ""}
      ${merchant.phone ? `<li><strong>Phone:</strong> ${esc(merchant.phone)}</li>` : ""}
      ${merchant.website ? `<li><strong>Website:</strong> <a href="${esc(merchant.website)}" rel="nofollow">${esc(merchant.website)}</a></li>` : ""}
      <li><strong>Last updated:</strong> ${esc(fmtDate(merchant.updated_at || merchant.created_at))}</li>
    </ul>
  </div>
${reviewsHtml}

  <section>
    <h2>Frequently Asked Questions</h2>
    <h3>Where is ${esc(name)} located?</h3>
    <p>${merchant.address ? `${esc(name)} is located at ${esc(merchant.address)} in ${esc(localityName)}, Jaipur.` : `${esc(name)} is located in ${esc(localityName)}, Jaipur.`}</p>
    <h3>How to contact ${esc(name)}?</h3>
    <p>${merchant.phone ? `Call ${esc(merchant.phone)}.` : `Contact details are available on this page.`}</p>
    <h3>How to find this listing?</h3>
    <p>Use the canonical URL: <a href="${canonical}">${canonical}</a></p>
  </section>
</div>
`;

    let html = indexHtml;

    // Clear common generic tags (best-effort, same approach as event-ssr)
    html = html.replace(/<title>[^<]*<\/title>/, "");
    html = html.replace(/<meta name="description"[^>]*>/, "");
    html = html.replace(/<meta property="og:title"[^>]*>/, "");
    html = html.replace(/<meta property="og:description"[^>]*>/, "");
    html = html.replace(/<meta property="og:url"[^>]*>/, "");
    html = html.replace(/<meta property="og:type"[^>]*>/, "");
    html = html.replace(/<meta name="twitter:card"[^>]*>/, "");

    html = html.replace("</head>", `${metaTags}\n</head>`);
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
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
    });
  }
});
