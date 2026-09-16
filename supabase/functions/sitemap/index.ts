// supabase/functions/sitemap/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const BASE_URL = "https://www.jaipurcircle.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const STATIC_URLS = [
  { loc: "/", priority: 1.0, changefreq: "daily" },
  { loc: "/about", priority: 0.6, changefreq: "monthly" },
  { loc: "/help", priority: 0.5, changefreq: "monthly" },
  { loc: "/contact", priority: 0.5, changefreq: "monthly" },
  { loc: "/install", priority: 0.5, changefreq: "monthly" },
  { loc: "/sitemap", priority: 0.4, changefreq: "weekly" },
  { loc: "/terms", priority: 0.3, changefreq: "yearly" },
  { loc: "/privacy", priority: 0.3, changefreq: "yearly" },
  { loc: "/referral-program", priority: 0.6, changefreq: "weekly" },
  { loc: "/merchant-onboarding", priority: 0.6, changefreq: "weekly" },
  { loc: "/leaderboard", priority: 0.5, changefreq: "daily" },
  { loc: "/pro", priority: 0.5, changefreq: "weekly" },
];

async function getEventUrls(supabase: any) {
  const urls: Array<{ loc: string; priority: number; changefreq: string; lastmod?: string }> = [];
  
  const eventMainUrls = [
    { path: "/events", priority: 1.0, changefreq: "hourly" },
    { path: "/events/today", priority: 0.9, changefreq: "hourly" },
    { path: "/events/tomorrow", priority: 0.8, changefreq: "daily" },
    { path: "/events/this-week", priority: 0.8, changefreq: "daily" },
    { path: "/events/this-weekend", priority: 0.9, changefreq: "daily" },
    { path: "/events/next-month", priority: 0.7, changefreq: "weekly" },
    { path: "/events/free", priority: 0.8, changefreq: "daily" },
    { path: "/events/paid", priority: 0.7, changefreq: "daily" },
  ];
  
  eventMainUrls.forEach(u => {
    urls.push({ loc: u.path, priority: u.priority, changefreq: u.changefreq });
  });
  
  const { data: events } = await supabase
    .from("events")
    .select("slug, updated_at")
    .eq("status", "published")
    .gte("start_date", new Date().toISOString());
  
  events?.forEach((event: any) => {
    urls.push({
      loc: `/events/${event.slug}`,
      priority: 0.8,
      changefreq: "weekly",
      lastmod: event.updated_at?.split('T')[0]
    });
  });
  
  const { data: categories } = await supabase
    .from("events")
    .select("category")
    .eq("status", "published")
    .not("category", "is", null);
  
  const uniqueCategories = [...new Set(categories?.map(c => c.category) || [])];
  uniqueCategories.forEach((category: string) => {
    urls.push({
      loc: `/events/category/${category.toLowerCase().replace(/\s+/g, '-')}`,
      priority: 0.8,
      changefreq: "daily"
    });
  });
  
  return urls;
}

async function getLocalityUrls(supabase: any) {
  const urls: Array<{ loc: string; priority: number; changefreq: string; lastmod?: string }> = [];
  
  urls.push({ loc: "/jaipur", priority: 0.9, changefreq: "weekly" });
  urls.push({ loc: "/jaipur/localities", priority: 0.8, changefreq: "weekly" });
  urls.push({ loc: "/jaipur/zones", priority: 0.7, changefreq: "weekly" });
  
  const { data: localities } = await supabase
    .from("localities")
    .select("slug, updated_at");
  
  localities?.forEach((locality: any) => {
    urls.push({
      loc: `/jaipur/${locality.slug}`,
      priority: 0.8,
      changefreq: "weekly",
      lastmod: locality.updated_at?.split('T')[0]
    });
  });
  
  const zones = ["north", "south", "east", "west", "central"];
  zones.forEach(zone => {
    urls.push({
      loc: `/jaipur/zones/${zone}`,
      priority: 0.7,
      changefreq: "weekly"
    });
  });
  
  return urls;
}

async function getDealUrls(supabase: any) {
  const urls: Array<{ loc: string; priority: number; changefreq: string; lastmod?: string }> = [];
  
  const dealMainUrls = [
    { path: "/deals", priority: 0.9, changefreq: "daily" },
    { path: "/deals/today", priority: 0.8, changefreq: "daily" },
    { path: "/deals/featured", priority: 0.7, changefreq: "daily" },
    { path: "/deals/near-me", priority: 0.7, changefreq: "daily" },
  ];
  
  dealMainUrls.forEach(u => {
    urls.push({ loc: u.path, priority: u.priority, changefreq: u.changefreq });
  });
  
  const { data: deals } = await supabase
    .from("deals")
    .select("slug, updated_at")
    .eq("status", "active");
  
  deals?.forEach((deal: any) => {
    urls.push({
      loc: `/deals/${deal.slug}`,
      priority: 0.7,
      changefreq: "weekly",
      lastmod: deal.updated_at?.split('T')[0]
    });
  });
  
  return urls;
}

async function getMerchantUrls(supabase: any) {
  const urls: Array<{ loc: string; priority: number; changefreq: string; lastmod?: string }> = [];

  // "/merchants" (plural) is the real directory/listing route (src/App.tsx).
  // "/merchants/featured" and "/merchants/verified" are NOT registered routes
  // anywhere in the app router — they were dead placeholder entries that
  // resolved as soft-404s (SPA shell). Removed rather than fixed forward,
  // since there is no such page to point them at today.
  urls.push({ loc: "/merchants", priority: 0.8, changefreq: "weekly" });

  const { data: merchants } = await supabase
    .from("merchants")
    .select("slug, updated_at")
    .eq("status", "active");

  merchants?.forEach((merchant: any) => {
    // Individual merchant pages live at the SINGULAR route "/merchant/:slug"
    // (vercel.json: ^/merchant/([^/]+)/?$ -> api/merchant-proxy). The plural
    // "/merchants/:slug" used here previously does not match any route and
    // was serving the SPA shell instead of the merchant page.
    urls.push({
      loc: `/merchant/${merchant.slug}`,
      priority: 0.7,
      changefreq: "weekly",
      lastmod: merchant.updated_at?.split('T')[0]
    });
  });

  return urls;
}

async function getNewsUrls(supabase: any) {
  const urls: Array<{ loc: string; priority: number; changefreq: string; lastmod?: string }> = [];
  
  const newsMainUrls = [
    { path: "/news", priority: 0.8, changefreq: "daily" },
    { path: "/news/city", priority: 0.7, changefreq: "daily" },
    { path: "/news/events", priority: 0.7, changefreq: "daily" },
    { path: "/news/food", priority: 0.6, changefreq: "daily" },
    { path: "/news/culture", priority: 0.6, changefreq: "daily" },
    { path: "/news/business", priority: 0.6, changefreq: "daily" },
    { path: "/news/sports", priority: 0.6, changefreq: "daily" },
  ];
  
  newsMainUrls.forEach(u => {
    urls.push({ loc: u.path, priority: u.priority, changefreq: u.changefreq });
  });
  
  const { data: articles } = await supabase
    .from("news_articles")
    .select("slug, published_at")
    .eq("status", "published");
  
  articles?.forEach((article: any) => {
    urls.push({
      loc: `/news/${article.slug}`,
      priority: 0.6,
      changefreq: "never",
      lastmod: article.published_at?.split('T')[0]
    });
  });
  
  return urls;
}

function getCategoryUrls() {
  const urls: Array<{ loc: string; priority: number; changefreq: string }> = [];

  // Only "/categories" (the bare index) is a registered route today
  // (src/App.tsx has `Route path="/categories"` with no `:slug` child route).
  // The per-category loop that used to run here emitted "/categories/{slug}"
  // for all 26 rows in the `categories` table — every one of those 404s as
  // the SPA shell (confirmed live: HTTP 200, but title/body identical to the
  // homepage, not a real category page or an honest 404).
  //
  // Removed rather than pointed at a real page, since /categories/:slug does
  // not exist yet. RE-ADD this loop once that route ships:
  //
  //   const { data: categories } = await supabase.from("categories").select("slug");
  //   categories?.forEach((cat: any) => {
  //     urls.push({ loc: `/categories/${cat.slug}`, priority: 0.6, changefreq: "weekly" });
  //   });
  urls.push({ loc: "/categories", priority: 0.7, changefreq: "weekly" });

  return urls;
}

// KNOWN-LIVE stopgap list for /guide, /story, /explore ("publications").
//
// NOT DB-driven, unlike every other sitemap in this file — deliberately so.
// The `articles` table (which is where this content conceptually lives) does
// NOT reflect what the live site actually serves: every one of the 32 rows
// visible to the anon/publishable key returns HTTP 404 when fetched live
// under /guide, /story, and /explore (verified directly, all 3 prefixes,
// multiple slugs, 2026-09-15). Meanwhile these 8 URLs — sourced from the
// legacy-redirect `Location` targets already hardcoded in vercel.json for
// this exact purpose — all verified HTTP 200 live on the same date.
//
// The function that actually serves these routes (`publication-ssr`) is not
// in this repository's git history at all (confirmed via `git log --all`) —
// it was deployed to Supabase out-of-band, so its real query/slug-resolution
// logic can't be inspected from here to build a correct dynamic query.
//
// DO NOT replace this with a naive `.from("articles").select(...)` query —
// that would reintroduce the exact bug this file is being fixed for
// elsewhere (shipping confirmed-dead URLs into a sitemap search engines
// read). Building a correct dynamic version requires either: (a) the actual
// publication-ssr source, or (b) a service-role/authenticated check of which
// rows it actually resolves, cross-referenced against live HTTP checks the
// way this list was built.
// This list was self-reviewed after first being written: the first version
// only used the 8 URLs sourced from vercel.json's legacy redirects, and
// missed 5 more that were sitting in index.html's own #ssr-crawler-links
// list the whole time. All 5 below were verified HTTP 200 live on 2026-09-15
// before being added, same bar as the original 8.
//
// NOT added here: /news/ipl-2026-jaipur-sms-stadium-matchday-advisory — also
// verified live, but it's a /news/ URL, not /guide|/story|/explore. It
// belongs in sitemaps/news.xml, not here. getNewsUrls() below queries
// `news_articles` directly (this whole file runs on SUPABASE_SERVICE_ROLE_KEY,
// so that query sees rows the anon key can't) — it's very likely already
// covered dynamically without needing to be added to any curated list. Not
// verified directly (would need to inspect getNewsUrls()'s actual output),
// flagging rather than guessing.
const KNOWN_LIVE_PUBLICATION_URLS: Array<{ loc: string; priority: number; changefreq: string }> = [
  { loc: "/guide/weekend-getaways-from-jaipur", priority: 0.7, changefreq: "monthly" },
  { loc: "/explore/best-nightlife-places-jaipur", priority: 0.7, changefreq: "monthly" },
  { loc: "/explore/best-cafes-in-jaipur", priority: 0.7, changefreq: "monthly" },
  { loc: "/explore/best-street-food-in-jaipur", priority: 0.7, changefreq: "monthly" },
  { loc: "/story/jaipur-literature-festival-city-culture-guide", priority: 0.6, changefreq: "monthly" },
  { loc: "/story/jaipur-heritage-conservation-old-city-guide", priority: 0.6, changefreq: "monthly" },
  { loc: "/story/jaipur-business-parks-startup-growth", priority: 0.6, changefreq: "monthly" },
  { loc: "/story/rajasthan-royals-ipl-2026-jaipur-season", priority: 0.6, changefreq: "monthly" },
  { loc: "/explore/best-sports-bars-jaipur-watch-ipl", priority: 0.6, changefreq: "monthly" },
  { loc: "/explore/best-places-watch-ipl-jaipur", priority: 0.6, changefreq: "monthly" },
  { loc: "/explore/family-friendly-places-watch-ipl-jaipur", priority: 0.6, changefreq: "monthly" },
  { loc: "/guide/sms-stadium-pitch-report-ipl-jaipur", priority: 0.6, changefreq: "monthly" },
  { loc: "/story/jaipur-ipl-matchday-culture-sms-stadium", priority: 0.6, changefreq: "monthly" },
];

function getPublicationUrls() {
  return KNOWN_LIVE_PUBLICATION_URLS;
}

function generateSitemapXml(urls: Array<{ loc: string; priority: number; changefreq: string; lastmod?: string }>): string {
  const urlElements = urls.map(url => {
    const lastmodTag = url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : '';
    return `
  <url>
    <loc>${BASE_URL}${url.loc}</loc>
    <priority>${url.priority}</priority>
    <changefreq>${url.changefreq}</changefreq>
    ${lastmodTag}
  </url>`;
  }).join('');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${urlElements}
</urlset>`;
}

function generateSitemapIndex(): string {
  const today = new Date().toISOString().split('T')[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemaps/static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/events.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/localities.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/deals.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/merchants.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/news.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/categories.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/publications.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;
}

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    console.log(`[sitemap] Full URL: ${req.url}`);
    console.log(`[sitemap] Pathname: ${pathname}`);
    
    // Normalize the path - remove trailing slashes
    let normalizedPath = pathname.replace(/\/$/, '');
    
    // Check for sitemap index FIRST
    if (normalizedPath === "/sitemap-index.xml" || 
        normalizedPath === "/sitemap.xml" || 
        normalizedPath === "/sitemap" || 
        normalizedPath === "/" || 
        normalizedPath === "" ||
        normalizedPath === "/sitemaps") {
      const sitemapIndex = generateSitemapIndex();
      console.log(`[sitemap] Returning sitemap index`);
      return new Response(sitemapIndex, {
        status: 200,
        headers: { 
          "content-type": "application/xml", 
          "cache-control": "public, max-age=3600"
        }
      });
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
    
    let urls: Array<{ loc: string; priority: number; changefreq: string; lastmod?: string }> = [];
    
    // Check for static.xml - using endsWith for more reliable matching
    if (normalizedPath.endsWith("/sitemaps/static.xml") || normalizedPath === "/static.xml") {
      console.log(`[sitemap] Generating static sitemap`);
      urls = STATIC_URLS;
    } 
    else if (normalizedPath.endsWith("/sitemaps/events.xml") || normalizedPath === "/events.xml") {
      console.log(`[sitemap] Generating events sitemap`);
      urls = await getEventUrls(supabase);
    }
    else if (normalizedPath.endsWith("/sitemaps/localities.xml") || normalizedPath === "/localities.xml") {
      console.log(`[sitemap] Generating localities sitemap`);
      urls = await getLocalityUrls(supabase);
    }
    else if (normalizedPath.endsWith("/sitemaps/deals.xml") || normalizedPath === "/deals.xml") {
      console.log(`[sitemap] Generating deals sitemap`);
      urls = await getDealUrls(supabase);
    }
    else if (normalizedPath.endsWith("/sitemaps/merchants.xml") || normalizedPath === "/merchants.xml") {
      console.log(`[sitemap] Generating merchants sitemap`);
      urls = await getMerchantUrls(supabase);
    }
    else if (normalizedPath.endsWith("/sitemaps/news.xml") || normalizedPath === "/news.xml") {
      console.log(`[sitemap] Generating news sitemap`);
      urls = await getNewsUrls(supabase);
    }
    else if (normalizedPath.endsWith("/sitemaps/categories.xml") || normalizedPath === "/categories.xml") {
      console.log(`[sitemap] Generating categories sitemap`);
      urls = getCategoryUrls();
    }
    else if (normalizedPath.endsWith("/sitemaps/publications.xml") || normalizedPath === "/publications.xml") {
      console.log(`[sitemap] Generating publications sitemap (curated, see KNOWN_LIVE_PUBLICATION_URLS)`);
      urls = getPublicationUrls();
    }
    else {
      // Default to sitemap index for unknown paths
      console.log(`[sitemap] Unknown path: ${normalizedPath}, returning index`);
      const sitemapIndex = generateSitemapIndex();
      return new Response(sitemapIndex, {
        status: 200,
        headers: { 
          "content-type": "application/xml", 
          "cache-control": "public, max-age=3600"
        }
      });
    }
    
    const xml = generateSitemapXml(urls);
    console.log(`[sitemap] Returning ${urls.length} URLs for ${normalizedPath}`);
    
    return new Response(xml, {
      status: 200,
      headers: {
        "content-type": "application/xml",
        "cache-control": "public, max-age=3600, s-maxage=86400"
      }
    });
    
  } catch (error) {
    console.error("Sitemap error:", error);
    
    // Return a proper XML error response, not HTML
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>Failed to generate sitemap</message>
  <detail>${error.message}</detail>
</error>`;
    
    return new Response(errorXml, {
      status: 500,
      headers: { 
        "content-type": "application/xml",
        "cache-control": "no-cache"
      }
    });
  }
});
