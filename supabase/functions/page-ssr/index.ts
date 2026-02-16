import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const BASE_URL = "https://www.jaipurcircle.com";
const SITE_NAME = "JaipurCircle";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&h=630&fit=crop";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escJson(o: unknown): string {
  return JSON.stringify(o).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}
function fmtPrice(p: number | null | undefined): string {
  if (!p) return "TBA";
  return `₹${p.toLocaleString("en-IN")}`;
}
function truncate(s: string, n: number): string {
  return s.length > n ? s.substring(0, n - 3) + "..." : s;
}

// ─── Fetch production index.html ───
async function getShell(): Promise<string> {
  try {
    const r = await fetch(`${BASE_URL}/index.html`, { headers: { "User-Agent": "JaipurCircle-SSR/2.0" } });
    return await r.text();
  } catch {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body><div id="root"></div></body></html>`;
  }
}

// ─── Inject meta + content into shell ───
function injectIntoShell(shell: string, metaTags: string, preContent: string): string {
  let html = shell;
  // Strip generic defaults
  html = html.replace(/<title>[^<]*<\/title>/, "");
  html = html.replace(/<meta name="description"[^>]*>/, "");
  html = html.replace(/<meta name="keywords"[^>]*>/, "");
  html = html.replace(/<meta property="og:title"[^>]*>/, "");
  html = html.replace(/<meta property="og:description"[^>]*>/, "");
  html = html.replace(/<meta property="og:url"[^>]*>/, "");
  html = html.replace(/<meta property="og:type"[^>]*>/, "");
  html = html.replace(/<meta name="twitter:card"[^>]*>/, "");
  // Inject
  html = html.replace("</head>", `${metaTags}\n</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${preContent}</div>`);
  return html;
}

function respond(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

// ═══════════════════════════════════════════════
// DEAL SSR
// ═══════════════════════════════════════════════
function buildDealSSR(deal: any): { meta: string; content: string } {
  const canonical = `${BASE_URL}/deals/${deal.slug}`;
  const img = deal.image_url || DEFAULT_IMAGE;
  const desc = deal.description || `${deal.title} — exclusive deal in Jaipur on ${SITE_NAME}.`;
  const merchantName = deal.merchants?.business_name || "";
  const locality = deal.location || "";
  const discount = deal.discount_percentage ? `${deal.discount_percentage}% OFF` : "";
  const price = fmtPrice(deal.discounted_price);
  const originalPrice = fmtPrice(deal.original_price);
  const category = deal.category || "Deals";
  const yr = new Date().getFullYear();

  const title = `${deal.title} — ${discount || price} | ${SITE_NAME}`;
  const metaDesc = truncate(`${deal.title}${discount ? ` — ${discount}` : ""}${merchantName ? ` at ${merchantName}` : ""}${locality ? ` in ${locality}` : ""}, Jaipur. ${desc}`, 160);

  // Product + Offer schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: deal.title,
    description: truncate(desc, 500),
    url: canonical,
    image: img,
    ...(merchantName && { brand: { "@type": "Brand", name: merchantName } }),
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "INR",
      price: String(deal.discounted_price || deal.original_price || 0),
      ...(deal.original_price && deal.discounted_price && { 
        priceValidUntil: deal.end_date || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
      }),
      availability: deal.is_active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      ...(merchantName && { seller: { "@type": "Organization", name: merchantName } }),
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Deals", item: `${BASE_URL}/deals` },
      ...(category !== "Deals" ? [{ "@type": "ListItem", position: 3, name: category, item: `${BASE_URL}/deals?category=${encodeURIComponent(category)}` }] : []),
      { "@type": "ListItem", position: category !== "Deals" ? 4 : 3, name: deal.title, item: canonical },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What is the price for ${deal.title}?`, acceptedAnswer: { "@type": "Answer", text: `The discounted price is ${price}${deal.original_price ? ` (original: ${originalPrice})` : ""}.` } },
      { "@type": "Question", name: `Where can I get ${deal.title}?`, acceptedAnswer: { "@type": "Answer", text: `${deal.title} is available${merchantName ? ` at ${merchantName}` : ""}${locality ? ` in ${locality}` : ""}, Jaipur. Book on ${SITE_NAME}.` } },
    ],
  };

  const meta = `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(metaDesc)}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="product">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:title" content="${esc(deal.title)}">
    <meta property="og:description" content="${esc(metaDesc)}">
    <meta property="og:image" content="${esc(img)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="en_IN">
    <meta property="product:price:amount" content="${deal.discounted_price || deal.original_price || 0}">
    <meta property="product:price:currency" content="INR">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(deal.title)}">
    <meta name="twitter:description" content="${esc(metaDesc)}">
    <meta name="twitter:image" content="${esc(img)}">
    <meta name="geo.region" content="IN-RJ">
    <meta name="geo.placename" content="${esc(locality || "Jaipur")}">
    <meta name="citation_title" content="${esc(deal.title)}">
    <script type="application/ld+json">${escJson(productSchema)}</script>
    <script type="application/ld+json">${escJson(breadcrumb)}</script>
    <script type="application/ld+json">${escJson(faqSchema)}</script>`;

  const content = `<div class="ssr-prerender" style="max-width:800px;margin:0 auto;padding:20px;font-family:system-ui,sans-serif">
<nav aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/deals">Deals</a> › ${esc(deal.title)}</nav>
<h1>${esc(deal.title)} — ${discount || ""} Deal in Jaipur ${yr}</h1>
<div class="deal-quick-info" style="margin:16px 0">
<table style="width:100%;border-collapse:collapse"><tbody>
${discount ? `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Discount</th><td style="padding:8px;border-bottom:1px solid #eee"><strong>${esc(discount)}</strong></td></tr>` : ""}
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Price</th><td style="padding:8px;border-bottom:1px solid #eee"><strong>${esc(price)}</strong>${deal.original_price ? ` <s>${esc(originalPrice)}</s>` : ""}</td></tr>
${merchantName ? `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Merchant</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(merchantName)}</td></tr>` : ""}
${locality ? `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Location</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(locality)}, Jaipur</td></tr>` : ""}
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Category</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(category)}</td></tr>
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Status</th><td style="padding:8px;border-bottom:1px solid #eee">${deal.is_active ? "Active" : "Expired"}</td></tr>
</tbody></table></div>
<section><h2>About This Deal</h2><p>${esc(truncate(desc, 1500))}</p></section>
${deal.terms_conditions ? `<section><h2>Terms & Conditions</h2><p>${esc(deal.terms_conditions)}</p></section>` : ""}
</div>`;

  return { meta, content };
}

// ═══════════════════════════════════════════════
// NEWS ARTICLE SSR
// ═══════════════════════════════════════════════
function buildNewsSSR(article: any, categorySlug: string): { meta: string; content: string } {
  const canonical = `${BASE_URL}/news/${categorySlug}/${article.slug}`;
  const img = article.cover_image || article.og_image || DEFAULT_IMAGE;
  const desc = article.excerpt || article.meta_description || truncate(article.content, 300);
  const publishedAt = article.published_at || article.created_at;
  const updatedAt = article.updated_at || publishedAt;
  const readTime = article.reading_time_minutes || Math.ceil((article.word_count || 500) / 200);

  const title = article.meta_title || `${article.title} — ${SITE_NAME}`;
  const metaDesc = article.meta_description || truncate(desc, 160);

  const newsSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: truncate(desc, 500),
    url: canonical,
    image: [img],
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: BASE_URL, logo: { "@type": "ImageObject", url: `${BASE_URL}/favicon.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    inLanguage: "en-IN",
    wordCount: article.word_count || undefined,
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".article-excerpt"] },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "News", item: `${BASE_URL}/news` },
      { "@type": "ListItem", position: 3, name: article.category, item: `${BASE_URL}/news/${categorySlug}` },
      { "@type": "ListItem", position: 4, name: article.title, item: canonical },
    ],
  };

  const meta = `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(metaDesc)}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:title" content="${esc(article.title)}">
    <meta property="og:description" content="${esc(metaDesc)}">
    <meta property="og:image" content="${esc(img)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="en_IN">
    <meta property="article:published_time" content="${publishedAt}">
    <meta property="article:modified_time" content="${updatedAt}">
    <meta property="article:section" content="${esc(article.category)}">
    ${(article.tags || []).map((t: string) => `<meta property="article:tag" content="${esc(t)}">`).join("\n    ")}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(article.title)}">
    <meta name="twitter:description" content="${esc(metaDesc)}">
    <meta name="twitter:image" content="${esc(img)}">
    <meta name="citation_title" content="${esc(article.title)}">
    <meta name="citation_date" content="${publishedAt}">
    <meta name="citation_geo_region" content="IN-RJ">
    <script type="application/ld+json">${escJson(newsSchema)}</script>
    <script type="application/ld+json">${escJson(breadcrumb)}</script>`;

  // Pre-rendered content - use body_html if available for full rich content
  const bodyPreview = article.body_html
    ? article.body_html.substring(0, 3000)
    : `<p>${esc(truncate(article.content, 2000))}</p>`;

  const content = `<article class="ssr-prerender" style="max-width:800px;margin:0 auto;padding:20px;font-family:system-ui,sans-serif">
<nav aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/news">News</a> › <a href="/news/${encodeURIComponent(categorySlug)}">${esc(article.category)}</a> › ${esc(article.title)}</nav>
<h1>${esc(article.title)}</h1>
<div class="article-meta" style="color:#666;margin:8px 0 16px;font-size:0.9em">
<time datetime="${publishedAt}">${new Date(publishedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</time>
 · ${readTime} min read · ${esc(article.category)}
</div>
${article.excerpt ? `<p class="article-excerpt" style="font-size:1.1em;color:#444;margin-bottom:16px"><strong>${esc(article.excerpt)}</strong></p>` : ""}
<div class="article-body">${bodyPreview}</div>
${(article.tags || []).length > 0 ? `<div style="margin-top:16px">${(article.tags || []).map((t: string) => `<span style="display:inline-block;background:#f0f0f0;padding:2px 8px;margin:2px;border-radius:4px;font-size:0.85em">${esc(t)}</span>`).join("")}</div>` : ""}
</article>`;

  return { meta, content };
}

// ═══════════════════════════════════════════════
// LOCALITY SSR
// ═══════════════════════════════════════════════
function buildLocalitySSR(loc: any): { meta: string; content: string } {
  const canonical = `${BASE_URL}/jaipur/${loc.slug}`;
  const yr = new Date().getFullYear();
  const zoneRaw = loc.zone || "";
  const zone = zoneRaw.replace(/\s+Zone$/i, ""); // Remove trailing "Zone" to avoid "X Zone Zone"
  const pinCodes = (loc.pin_codes || []).join(", ");
  const microLocalities = (loc.micro_localities || []).slice(0, 10);
  const nearbyLocalities = (loc.nearby_localities || []).slice(0, 8);
  const blurb = loc.seo_blurb || `${loc.name} is a locality in Jaipur, Rajasthan. Explore markets, restaurants, schools, property and more in ${loc.name}.`;

  const title = `${loc.name} Jaipur — Locality Guide, Markets, Schools, Restaurants, Property & Map ${yr}`;
  const metaDesc = truncate(`${loc.name}, Jaipur${zone ? ` (${zone} Zone)` : ""}${pinCodes ? ` — PIN ${pinCodes}` : ""}. ${blurb}`, 160);

  const placeSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${loc.name}, Jaipur`,
    description: truncate(blurb, 500),
    url: canonical,
    address: {
      "@type": "PostalAddress",
      addressLocality: loc.name,
      addressRegion: "Rajasthan",
      addressCountry: "IN",
      ...(pinCodes && { postalCode: loc.pin_codes?.[0] }),
    },
    ...(loc.geo_lat && loc.geo_lng && {
      geo: { "@type": "GeoCoordinates", latitude: loc.geo_lat, longitude: loc.geo_lng },
    }),
    containedInPlace: { "@type": "City", name: "Jaipur", addressRegion: "Rajasthan" },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Jaipur", item: `${BASE_URL}/jaipur` },
      ...(zone ? [{ "@type": "ListItem", position: 3, name: `${zone} Zone`, item: `${BASE_URL}/jaipur/zones/${zone.toLowerCase().replace(/\s+/g, "-")}` }] : []),
      { "@type": "ListItem", position: zone ? 4 : 3, name: loc.name, item: canonical },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What is the PIN code of ${loc.name}, Jaipur?`, acceptedAnswer: { "@type": "Answer", text: pinCodes ? `The PIN code(s) of ${loc.name} are ${pinCodes}.` : `PIN code information for ${loc.name} is being updated.` } },
      { "@type": "Question", name: `Which zone is ${loc.name} in?`, acceptedAnswer: { "@type": "Answer", text: zone ? `${loc.name} falls under the ${zone} zone of Jaipur.` : `Zone information for ${loc.name} is being updated.` } },
      { "@type": "Question", name: `What is ${loc.name} known for?`, acceptedAnswer: { "@type": "Answer", text: loc.known_for || `${loc.name} is a well-known locality in Jaipur with markets, schools, and residential areas.` } },
      ...(loc.municipality ? [{ "@type": "Question", name: `Which municipality does ${loc.name} belong to?`, acceptedAnswer: { "@type": "Answer", text: `${loc.name} belongs to ${loc.municipality}.` } }] : []),
    ],
  };

  const meta = `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(metaDesc)}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="place">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:title" content="${esc(loc.name)} — Locality Guide, Jaipur">
    <meta property="og:description" content="${esc(metaDesc)}">
    <meta property="og:locale" content="en_IN">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${esc(loc.name)} — Locality Guide, Jaipur">
    <meta name="twitter:description" content="${esc(metaDesc)}">
    <meta name="geo.region" content="IN-RJ">
    <meta name="geo.placename" content="${esc(loc.name)}, Jaipur">
    ${loc.geo_lat && loc.geo_lng ? `<meta name="geo.position" content="${loc.geo_lat};${loc.geo_lng}">` : ""}
    <meta name="citation_title" content="${esc(loc.name)} Jaipur Locality Guide">
    <meta name="citation_geo_region" content="IN-RJ">
    <script type="application/ld+json">${escJson(placeSchema)}</script>
    <script type="application/ld+json">${escJson(breadcrumb)}</script>
    <script type="application/ld+json">${escJson(faqSchema)}</script>`;

  const nearbyLinks = nearbyLocalities.map((n: string) => {
    const nSlug = n.toLowerCase().replace(/\s+/g, "-");
    return `<a href="/jaipur/${nSlug}">${esc(n)}</a>`;
  }).join(" · ");

  const microList = microLocalities.map((m: string) => `<li>${esc(m)}</li>`).join("");

  const categories = ["Restaurants", "Shopping", "Schools", "Hospitals", "Property", "Events"];
  const categoryLinks = categories.map(c => {
    const cSlug = c.toLowerCase();
    return `<a href="/jaipur/${loc.slug}/${cSlug}" style="display:inline-block;background:#f0f0f0;padding:4px 12px;margin:4px;border-radius:4px">${c} in ${esc(loc.name)}</a>`;
  }).join("");

  const content = `<div class="ssr-prerender" style="max-width:800px;margin:0 auto;padding:20px;font-family:system-ui,sans-serif">
<nav aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/jaipur">Jaipur</a>${zone ? ` › <a href="/jaipur/zones/${zone.toLowerCase().replace(/\s+/g, "-")}">${esc(zone)} Zone</a>` : ""} › ${esc(loc.name)}</nav>
<h1>${esc(loc.name)} Jaipur — Locality Guide ${yr}</h1>
<div class="locality-quick-info" style="margin:16px 0">
<table style="width:100%;border-collapse:collapse"><tbody>
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Locality</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(loc.name)}</td></tr>
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">City</th><td style="padding:8px;border-bottom:1px solid #eee">Jaipur, Rajasthan</td></tr>
${zone ? `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Zone</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(zone)}</td></tr>` : ""}
${pinCodes ? `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">PIN Code</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(pinCodes)}</td></tr>` : ""}
${loc.municipality ? `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Municipality</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(loc.municipality)}</td></tr>` : ""}
${loc.police_station ? `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Police Station</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(loc.police_station)}</td></tr>` : ""}
${loc.assembly_constituency ? `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Constituency</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(loc.assembly_constituency)}</td></tr>` : ""}
</tbody></table></div>
<section><h2>About ${esc(loc.name)}</h2><p>${esc(blurb)}</p></section>
${categoryLinks ? `<section><h2>Explore ${esc(loc.name)}</h2><div>${categoryLinks}</div></section>` : ""}
${microList ? `<section><h2>Micro-Localities in ${esc(loc.name)}</h2><ul>${microList}</ul></section>` : ""}
${nearbyLinks ? `<section><h2>Nearby Localities</h2><p>${nearbyLinks}</p></section>` : ""}
<section>
<h2>Frequently Asked Questions</h2>
<h3>What is the PIN code of ${esc(loc.name)}?</h3>
<p>${pinCodes ? `The PIN code(s) are ${esc(pinCodes)}.` : "PIN code information is being updated."}</p>
<h3>Which zone is ${esc(loc.name)} in?</h3>
<p>${zone ? `${esc(loc.name)} falls under the ${esc(zone)} zone.` : "Zone information is being updated."}</p>
</section>
</div>`;

  return { meta, content };
}

// ═══════════════════════════════════════════════
// MERCHANT SSR
// ═══════════════════════════════════════════════
function buildMerchantSSR(m: any): { meta: string; content: string } {
  const canonical = `${BASE_URL}/merchant/${m.id}`;
  const img = m.logo_url || DEFAULT_IMAGE;
  const desc = m.description || `${m.business_name} — a trusted business in ${m.locality || "Jaipur"} on ${SITE_NAME}.`;
  const locality = m.locality || "Jaipur";

  const title = `${m.business_name} — ${m.business_type || "Business"} in ${locality}, Jaipur | ${SITE_NAME}`;
  const metaDesc = truncate(`${m.business_name}${m.business_type ? ` (${m.business_type})` : ""} in ${locality}, Jaipur. ${desc}`, 160);

  const bizSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: m.business_name,
    description: truncate(desc, 500),
    url: canonical,
    image: img,
    ...(m.phone && { telephone: m.phone }),
    ...(m.email && { email: m.email }),
    address: {
      "@type": "PostalAddress",
      streetAddress: m.address || locality,
      addressLocality: locality,
      addressRegion: "Rajasthan",
      addressCountry: "IN",
    },
    ...(m.average_rating && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: String(m.average_rating), reviewCount: String(m.total_reviews || 1), bestRating: "5" },
    }),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Merchants", item: `${BASE_URL}/merchants` },
      { "@type": "ListItem", position: 3, name: m.business_name, item: canonical },
    ],
  };

  const meta = `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(metaDesc)}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="business.business">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:title" content="${esc(m.business_name)}">
    <meta property="og:description" content="${esc(metaDesc)}">
    <meta property="og:image" content="${esc(img)}">
    <meta property="og:locale" content="en_IN">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${esc(m.business_name)}">
    <meta name="twitter:description" content="${esc(metaDesc)}">
    <meta name="geo.region" content="IN-RJ">
    <meta name="geo.placename" content="${esc(locality)}, Jaipur">
    <script type="application/ld+json">${escJson(bizSchema)}</script>
    <script type="application/ld+json">${escJson(breadcrumb)}</script>`;

  const content = `<div class="ssr-prerender" style="max-width:800px;margin:0 auto;padding:20px;font-family:system-ui,sans-serif">
<nav aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/merchants">Merchants</a> › ${esc(m.business_name)}</nav>
<h1>${esc(m.business_name)} — ${esc(m.business_type || "Business")} in ${esc(locality)}, Jaipur</h1>
<div style="margin:16px 0">
<table style="width:100%;border-collapse:collapse"><tbody>
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Business</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(m.business_name)}</td></tr>
${m.business_type ? `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Type</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(m.business_type)}</td></tr>` : ""}
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Location</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(m.address || locality)}, Jaipur</td></tr>
${m.phone ? `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Phone</th><td style="padding:8px;border-bottom:1px solid #eee">${esc(m.phone)}</td></tr>` : ""}
${m.average_rating ? `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Rating</th><td style="padding:8px;border-bottom:1px solid #eee">${m.average_rating}/5 (${m.total_reviews || 0} reviews)</td></tr>` : ""}
<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:130px;color:#666">Total Deals</th><td style="padding:8px;border-bottom:1px solid #eee">${m.total_deals || 0} deals</td></tr>
</tbody></table></div>
<section><h2>About ${esc(m.business_name)}</h2><p>${esc(truncate(desc, 1500))}</p></section>
</div>`;

  return { meta, content };
}

// ═══════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const slug = url.searchParams.get("slug");
    const category = url.searchParams.get("category");

    if (!type || !slug) {
      return new Response("Missing type or slug", { status: 400, headers: corsHeaders });
    }

    // Skip SSR for known non-detail routes
    const skipSlugs = ["all", "zones", "create", "organizer", "free", "workshops", "today", "this-week", "this-weekend"];
    if (skipSlugs.includes(slug)) {
      const shell = await getShell();
      return respond(shell);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const shell = await getShell();

    if (type === "deal") {
      const { data: deal } = await supabase
        .from("deals")
        .select("*, merchants(business_name)")
        .eq("slug", slug)
        .maybeSingle();

      if (!deal) return respond(shell); // Fallback to SPA

      const { meta, content } = buildDealSSR(deal);
      return respond(injectIntoShell(shell, meta, content));
    }

    if (type === "news") {
      const { data: article } = await supabase
        .from("news_articles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!article) return respond(shell);

      const { meta, content } = buildNewsSSR(article, category || article.category?.toLowerCase().replace(/\s+/g, "-") || "general");
      return respond(injectIntoShell(shell, meta, content));
    }

    if (type === "locality") {
      const { data: loc } = await supabase
        .from("localities")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!loc) return respond(shell);

      const { meta, content } = buildLocalitySSR(loc);
      return respond(injectIntoShell(shell, meta, content));
    }

    if (type === "merchant") {
      // Support both UUID and slug lookup
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      const query = supabase.from("merchants").select("*");
      const { data: merchant } = isUUID
        ? await query.eq("id", slug).maybeSingle()
        : await query.eq("slug", slug).maybeSingle();

      if (!merchant) return respond(shell);

      const { meta, content } = buildMerchantSSR(merchant);
      return respond(injectIntoShell(shell, meta, content));
    }

    // Unknown type — fallback to SPA
    return respond(shell);
  } catch (err) {
    console.error("Page SSR error:", err);
    return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
  }
});
