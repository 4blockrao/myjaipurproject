// supabase/functions/category-ssr/index.ts
// Deployed 2026-09-17. Modeled directly on locality-ssr/index.ts (same
// constants, same utility functions, same overall serve() shape).
//
// Connects with SUPABASE_SERVICE_ROLE_KEY, same as locality-ssr — which
// bypasses RLS entirely, so status/is_indexable gating is applied explicitly
// in the query below, not left to the "Anyone can view published category
// pages" RLS policy (that policy only protects anon/authenticated requests,
// not this service-role connection).
//
// REQUIRES verify_jwt = false on this function (Supabase project-level
// setting, checked/set via the Management API, e.g.
// PATCH /v1/projects/{ref}/functions/category-ssr {"verify_jwt": false}).
// This is NOT stored in this repo or in supabase/config.toml — it's a live
// dashboard/API setting that does not travel with the code. New functions
// default to verify_jwt=true; without this set to false, every request
// through api/category-proxy.ts (which sends no Authorization header, same
// as the other SSR proxies) 401s with UNAUTHORIZED_NO_AUTH_HEADER before
// this file's code ever runs — confirmed live, 2026-09-17. If this function
// is ever deleted and redeployed from scratch, this setting will NOT be
// preserved automatically and must be set again. See
// jaipurcircle_infrastructure_findings.md for the full list of which
// deployed functions currently have this set.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = (Deno.env.get("SITE_ORIGIN") ?? "https://www.jaipurcircle.com").replace(/\/+$/, "");
const SITE_NAME = "JaipurCircle";
const DEFAULT_IMAGE = "https://www.jaipurcircle.com/og-default.jpg";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

let cachedIndexHtml: { html: string; fetchedAt: number } | null = null;

// ============================================
// UTILITY FUNCTIONS — copied verbatim from locality-ssr
// ============================================
function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function truncate(str: string, max: number): string {
  if (!str) return "";
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + "...";
}

// ============================================
// FETCH SPA SHELL — identical to locality-ssr, this is generic infra
// ============================================
async function getSpaShellHtml(): Promise<string> {
  const now = Date.now();
  const ttlMs = 5 * 60 * 1000;

  if (cachedIndexHtml && now - cachedIndexHtml.fetchedAt < ttlMs) {
    return cachedIndexHtml.html;
  }

  const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${SITE_NAME}</title>
  <link rel="icon" href="/favicon.png" type="image/png">
</head>
<body>
  <div id="root"></div>
  <script type="module" crossorigin src="/assets/index-uPnmVZlR.js"></script>
  <link rel="stylesheet" crossorigin href="/assets/index-YJsD5eZ5.css">
</body>
</html>`;

  try {
    const res = await fetch(`${BASE_URL}/index.html?cb=${Math.floor(now / 1000)}`, {
      headers: { "user-agent": "jaipurcircle-category-ssr/1.0", accept: "text/html" },
    });

    if (!res.ok) throw new Error(`Failed to fetch index.html: ${res.status}`);

    let html = await res.text();
    html = html.replace(/<title>.*?<\/title>/, "");
    html = html.replace(/<meta name="description".*?>/, "");
    html = html.replace(/<meta property="og:title".*?>/g, "");
    html = html.replace(/<meta property="og:description".*?>/g, "");
    html = html.replace(/<meta property="og:url".*?>/g, "");
    html = html.replace(/<meta property="og:image".*?>/g, "");
    html = html.replace(/<meta name="twitter:title".*?>/g, "");
    html = html.replace(/<meta name="twitter:description".*?>/g, "");
    html = html.replace(/<meta name="twitter:image".*?>/g, "");
    html = html.replace(/<div\s+id=["']root["'][^>]*>.*?<\/div>/is, '<div id="root"></div>');

    if (!html.includes('<script type="module"')) {
      html = fallbackHtml;
    }

    cachedIndexHtml = { html, fetchedAt: now };
    return html;
  } catch (err) {
    console.error("Failed to fetch SPA shell:", err);
    return fallbackHtml;
  }
}

// ============================================
// FETCH CATEGORY PAGE DATA
// ============================================
async function fetchCategoryPageData(slug: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Explicit status/is_indexable filter — required because this connection
  // uses the service-role key and bypasses RLS entirely. Without this, a
  // draft or non-indexable page would render publicly via SSR even though
  // the RLS policy and the sitemap both correctly exclude it.
  const { data: page, error } = await supabase
    .from("category_pages")
    .select("*, categories(name, slug), authors(name, slug, bio, avatar_url)")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("is_indexable", true)
    .maybeSingle();

  if (error || !page) {
    console.error("Category page fetch error:", error);
    return null;
  }

  return { page };
}

// ============================================
// SSR RENDER FUNCTIONS
// ============================================
function renderComparisonTable(comparisonData: any): string {
  // Shape contract: { headers: string[], rows: string[][] } - also recorded
  // as a durable COMMENT ON COLUMN category_pages.comparison_data (see
  // migration 20260917020000), since this isn't enforced by a CHECK
  // constraint. Anything not matching this shape renders as nothing below,
  // silently - not an error - so a malformed value won't surface here.
  if (!comparisonData || !Array.isArray(comparisonData.headers) || !Array.isArray(comparisonData.rows)) return "";
  return `
    <div class="section comparison-table">
      <table>
        <thead>
          <tr>${comparisonData.headers.map((h: string) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${comparisonData.rows.map((row: string[]) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderFAQ(page: any): string {
  const faqs = page.faq_json || [];
  if (!faqs.length) return "";
  return `
    <div class="section faq-section">
      <h3>❓ Frequently Asked Questions</h3>
      <div class="faq-list">
        ${faqs.map((faq: any, idx: number) => `
          <div class="faq-item" data-faq-idx="${idx}">
            <div class="faq-question">${escapeHtml(faq.question)}<span class="faq-toggle">▼</span></div>
            <div class="faq-answer">${escapeHtml(faq.answer)}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderAuthorByline(page: any): string {
  if (!page.authors) return "";
  return `
    <div class="section author-byline">
      <p>By <strong>${escapeHtml(page.authors.name)}</strong></p>
      ${page.authors.bio ? `<p class="author-bio">${escapeHtml(page.authors.bio)}</p>` : ""}
    </div>
  `;
}

// ============================================
// MAIN SSR HTML BUILDER
// ============================================
function buildSSRHTML(page: any) {
  const comparisonHtml = renderComparisonTable(page.comparison_data);
  const faqHtml = renderFAQ(page);
  const authorHtml = renderAuthorByline(page);

  return `
    <div class="category-page" data-category="${page.slug}">
      <div class="hero">
        <h1>${escapeHtml(page.title)}</h1>
      </div>
      <div class="container">
        <div class="section intro">
          <p>${escapeHtml(page.intro)}</p>
        </div>
        ${comparisonHtml}
        ${faqHtml}
        ${authorHtml}
        <div class="section" style="font-size: 0.75rem; color: #6b7280; text-align: center; padding: 1rem;">
          <p>📅 Last Updated: ${new Date(page.updated_at).toLocaleDateString("en-IN", { month: "long", year: "numeric", day: "numeric" })}</p>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// GENERATE SCHEMAS — BreadcrumbList, WebPage, FAQPage (confirmed 3 types)
// ============================================
function generateAllSchemas(page: any, canonical: string) {
  const schemas = [];

  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Categories", item: `${BASE_URL}/categories` },
      { "@type": "ListItem", position: 3, name: page.title, item: canonical },
    ],
  });

  const webPageSchema: any = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    url: canonical,
    description: truncate(page.meta_description || page.intro, 500),
    dateModified: page.updated_at,
  };
  if (page.authors) {
    webPageSchema.author = { "@type": "Person", name: page.authors.name };
  }
  schemas.push(webPageSchema);

  const faqs = page.faq_json || [];
  if (faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.slice(0, 10).map((faq: any) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  return schemas;
}

// ============================================
// MAIN SERVE FUNCTION
// ============================================
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const url = new URL(req.url);

  try {
    const slug = url.searchParams.get("slug")?.trim().toLowerCase();
    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error("Missing Supabase configuration");
      return new Response("Server configuration error", { status: 500 });
    }

    const data = await fetchCategoryPageData(slug);
    if (!data || !data.page) {
      const notFoundHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Category Page Not Found | ${SITE_NAME}</title><meta name="robots" content="noindex, nofollow"></head><body style="font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 20px"><h1>Category Page Not Found</h1><p>We couldn't find a published category page with slug: ${escapeHtml(slug)}</p><a href="/categories">Browse categories →</a></body></html>`;
      return new Response(notFoundHtml, { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
    }

    const { page } = data;
    const canonical = page.canonical_url || `${BASE_URL}/categories/${page.slug}`;
    const title = page.meta_title || `${page.title} | ${SITE_NAME}`;
    const description = page.meta_description || truncate(page.intro, 160);

    let indexHtml = await getSpaShellHtml();
    const schemas = generateAllSchemas(page, canonical);

    const headHtml = `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${DEFAULT_IMAGE}" />
<meta property="og:locale" content="en_IN" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
${schemas.map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`).join("")}
`;

    if (indexHtml.includes("</head>")) {
      indexHtml = indexHtml.replace(/<\/head>/i, `${headHtml}\n</head>`);
    }

    const ssrContent = buildSSRHTML(page);
    const finalHtml = indexHtml.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

    console.log(`[category-ssr] Served: ${slug} in ${Date.now() - startTime}ms`);

    return new Response(finalHtml, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "content-disposition": "inline",
        "x-content-type-options": "nosniff",
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "content-security-policy": "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src * data:; font-src 'self' https: data:; connect-src 'self' https:;",
        "x-ssr-rendered": "true",
        "x-render-time-ms": String(Date.now() - startTime),
      },
    });
  } catch (err) {
    console.error("Category SSR fatal error:", err);
    const errorHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${SITE_NAME} | Error</title></head><body><div id="root"></div><script src="/assets/index.js"></script></body></html>`;
    return new Response(errorHtml, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
  }
});
