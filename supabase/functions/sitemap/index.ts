// supabase/functions/sitemap/index.ts
// Enterprise Sitemap Generator - Covers All Entities

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const BASE_URL = "https://www.jaipurcircle.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// ============================================
// STATIC URLS (Always included)
// ============================================
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

// ============================================
// DYNAMIC URL GENERATORS
// ============================================

async function getEventUrls(supabase: any) {
  const urls: Array<{ loc: string; priority: number; changefreq: string; lastmod?: string }> = [];
  
  // Main event URLs
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
  
  // Individual event pages
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
  
  // Category pages (from actual events)
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
  
  // Locality event pages
  const { data: localities } = await supabase
    .from("events")
    .select("locality")
    .eq("status", "published")
    .not("locality", "is", null);
  
  const uniqueLocalities = [...new Set(localities?.map(l => l.locality) || [])];
  uniqueLocalities.forEach((locality: string) => {
    urls.push({
      loc: `/events/in/${locality.toLowerCase().replace(/\s+/g, '-')}`,
      priority: 0.7,
      changefreq: "weekly"
    });
  });
  
  return urls;
}

async function getLocalityUrls(supabase: any) {
  const urls: Array<{ loc: string; priority: number; changefreq: string; lastmod?: string }> = [];
  
  // Main locality URLs
  urls.push({ loc: "/jaipur", priority: 0.9, changefreq: "weekly" });
  urls.push({ loc: "/jaipur/localities", priority: 0.8, changefreq: "weekly" });
  urls.push({ loc: "/jaipur/zones", priority: 0.7, changefreq: "weekly" });
  
  // Individual locality pages
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
  
  // Zone pages
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
  
  // Main deal URLs
  const dealMainUrls = [
    { path: "/deals", priority: 0.9, changefreq: "daily" },
    { path: "/deals/today", priority: 0.8, changefreq: "daily" },
    { path: "/deals/featured", priority: 0.7, changefreq: "daily" },
    { path: "/deals/near-me", priority: 0.7, changefreq: "daily" },
  ];
  
  dealMainUrls.forEach(u => {
    urls.push({ loc: u.path, priority: u.priority, changefreq: u.changefreq });
  });
  
  // Individual deal pages
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
  
  // Main merchant URLs
  urls.push({ loc: "/merchants", priority: 0.8, changefreq: "weekly" });
  urls.push({ loc: "/merchants/featured", priority: 0.7, changefreq: "weekly" });
  urls.push({ loc: "/merchants/verified", priority: 0.7, changefreq: "weekly" });
  
  // Individual merchant pages
  const { data: merchants } = await supabase
    .from("merchants")
    .select("slug, updated_at")
    .eq("status", "active");
  
  merchants?.forEach((merchant: any) => {
    urls.push({
      loc: `/merchants/${merchant.slug}`,
      priority: 0.7,
      changefreq: "weekly",
      lastmod: merchant.updated_at?.split('T')[0]
    });
  });
  
  // Merchant category pages
  const { data: categories } = await supabase
    .from("merchant_categories")
    .select("slug");
  
  categories?.forEach((cat: any) => {
    urls.push({
      loc: `/merchants/category/${cat.slug}`,
      priority: 0.6,
      changefreq: "weekly"
    });
  });
  
  return urls;
}

async function getNewsUrls(supabase: any) {
  const urls: Array<{ loc: string; priority: number; changefreq: string; lastmod?: string }> = [];
  
  // Main news URLs
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
  
  // Individual news articles
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

async function getCategoryUrls(supabase: any) {
  const urls: Array<{ loc: string; priority: number; changefreq: string }> = [];
  
  urls.push({ loc: "/categories", priority: 0.7, changefreq: "weekly" });
  
  const { data: categories } = await supabase
    .from("categories")
    .select("slug");
  
  categories?.forEach((cat: any) => {
    urls.push({
      loc: `/categories/${cat.slug}`,
      priority: 0.6,
      changefreq: "weekly"
    });
  });
  
  return urls;
}

// ============================================
// SITEMAP XML GENERATION
// ============================================
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

// ============================================
// MAIN SERVE FUNCTION
// ============================================
serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    // Handle sitemap index
    if (pathname === "/sitemap-index.xml" || pathname === "/sitemap") {
      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemaps/static.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/events.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/localities.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/deals.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/merchants.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/news.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/categories.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;
      
      return new Response(sitemapIndex, {
        headers: { "content-type": "application/xml", "cache-control": "public, max-age=3600" }
      });
    }
    
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
    
    let urls: Array<{ loc: string; priority: number; changefreq: string; lastmod?: string }> = [];
    
    // Route to specific sitemap
    if (pathname.includes("/sitemaps/static.xml")) {
      urls = STATIC_URLS;
    } 
    else if (pathname.includes("/sitemaps/events.xml")) {
      urls = await getEventUrls(supabase);
    }
    else if (pathname.includes("/sitemaps/localities.xml")) {
      urls = await getLocalityUrls(supabase);
    }
    else if (pathname.includes("/sitemaps/deals.xml")) {
      urls = await getDealUrls(supabase);
    }
    else if (pathname.includes("/sitemaps/merchants.xml")) {
      urls = await getMerchantUrls(supabase);
    }
    else if (pathname.includes("/sitemaps/news.xml")) {
      urls = await getNewsUrls(supabase);
    }
    else if (pathname.includes("/sitemaps/categories.xml")) {
      urls = await getCategoryUrls(supabase);
    }
    else {
      // Default to static sitemap
      urls = STATIC_URLS;
    }
    
    const xml = generateSitemapXml(urls);
    
    return new Response(xml, {
      headers: {
        "content-type": "application/xml",
        "cache-control": "public, max-age=3600, s-maxage=86400"
      }
    });
    
  } catch (error) {
    console.error("Sitemap error:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
});
