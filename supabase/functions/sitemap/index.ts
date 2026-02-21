import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://www.jaipurcircle.com";
const SITE_NAME = "JaipurCircle";

// Listing pages indexability threshold must match events-list-ssr
const EVENTS_LISTING_INDEX_MIN_UPCOMING = 6;

// Hard cap to avoid insane sitemaps if category/locality is noisy
const EVENTS_LISTING_URL_CAP = 800;

function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDate(date: string | null): string {
  if (!date) return getToday();
  return date.split("T")[0];
}

function getXmlHeader(includeNews = false, includeImage = false): string {
  let namespaces = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
  if (includeNews) namespaces += ' xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"';
  if (includeImage) namespaces += ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset ${namespaces}>\n`;
}

// ---------- FIRST-PARTY SITEMAP URLS ONLY ----------
function firstPartySitemapUrl(type: string): string {
  switch (type) {
    case "pages":
      return `${SITE_URL}/sitemap-pages.xml`;
    case "localities":
      return `${SITE_URL}/sitemap-localities.xml`;
    case "zones":
      return `${SITE_URL}/sitemap-zones.xml`;
    case "deals":
      return `${SITE_URL}/sitemap-deals.xml`;
    case "merchants":
      return `${SITE_URL}/sitemap-merchants.xml`;
    case "events":
      return `${SITE_URL}/sitemap-events.xml`;
    case "news":
      return `${SITE_URL}/sitemap-news.xml`;
    case "news-sitemap":
      return `${SITE_URL}/sitemap-news-google.xml`;
    default:
      return `${SITE_URL}/sitemap.xml`;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "all";

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = getToday();
    let xml = "";

    switch (type) {
      case "deals":
        xml = await generateDealsSitemap(supabase, today);
        break;
      case "merchants":
        xml = await generateMerchantsSitemap(supabase, today);
        break;
      case "localities":
        xml = await generateLocalitiesSitemap(supabase, today);
        break;
      case "zones":
        xml = generateZonesSitemap(today);
        break;
      case "events":
        xml = await generateEventsSitemap(supabase, today);
        break;
      case "news":
        xml = await generateNewsSitemap(supabase, today);
        break;
      case "news-sitemap":
        xml = await generateGoogleNewsSitemap(supabase);
        break;
      case "index":
        xml = generateSitemapIndex(today);
        break;
      case "all":
      default:
        xml = await generateFullSitemap(supabase, today);
        break;
    }

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (error: any) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap: ${escapeXml(
        error?.message || String(error),
      )}</error>`,
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/xml" } },
    );
  }
});

async function generateDealsSitemap(supabase: any, today: string): Promise<string> {
  const { data: deals, error } = await supabase
    .from("deals")
    .select("id, title, updated_at, image_url, category, discount_percentage")
    .eq("approval_status", "approved")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(5000);

  if (error) throw error;

  let xml = getXmlHeader(false, true);

  for (const deal of deals || []) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/deal/${deal.id}</loc>\n`;
    xml += `    <lastmod>${formatDate(deal.updated_at)}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    if (deal.image_url) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(deal.image_url)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(deal.title)} - ${deal.discount_percentage || 0}% Off</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += "</urlset>";
  return xml;
}

async function generateMerchantsSitemap(supabase: any, today: string): Promise<string> {
  const { data: merchants, error } = await supabase
    .from("merchants")
    .select("id, business_name, updated_at, logo_url, business_type")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(5000);

  if (error) throw error;

  let xml = getXmlHeader(false, true);

  for (const merchant of merchants || []) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/merchant/${merchant.id}</loc>\n`;
    xml += `    <lastmod>${formatDate(merchant.updated_at)}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    if (merchant.logo_url) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(merchant.logo_url)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(merchant.business_name)} - ${escapeXml(
        merchant.business_type || "Business",
      )} in Jaipur</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += "</urlset>";
  return xml;
}

async function generateLocalitiesSitemap(supabase: any, today: string): Promise<string> {
  const { data: localities, error } = await supabase
    .from("localities")
    .select("slug, name, updated_at, zone")
    .order("name", { ascending: true });

  if (error) throw error;

  let xml = getXmlHeader();

  for (const locality of localities || []) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/jaipur/${locality.slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(locality.updated_at)}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += "</urlset>";
  return xml;
}

function generateZonesSitemap(today: string): string {
  const zones = [
    { slug: "north", name: "North" },
    { slug: "south", name: "South" },
    { slug: "east", name: "East" },
    { slug: "west", name: "West" },
    { slug: "central", name: "Central" },
    { slug: "north-west", name: "North-West" },
    { slug: "north-east", name: "North-East" },
    { slug: "south-west", name: "South-West" },
    { slug: "south-east", name: "South-East" },
  ];

  let xml = getXmlHeader();

  xml += `  <url>\n`;
  xml += `    <loc>${SITE_URL}/jaipur/zones</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.85</priority>\n`;
  xml += `  </url>\n`;

  for (const zone of zones) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/jaipur/zones/${zone.slug}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.80</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += "</urlset>";
  return xml;
}

function generateSitemapIndex(today: string): string {
  const sitemaps = [
    { loc: firstPartySitemapUrl("pages") },
    { loc: firstPartySitemapUrl("localities") },
    { loc: firstPartySitemapUrl("zones") },
    { loc: firstPartySitemapUrl("deals") },
    { loc: firstPartySitemapUrl("merchants") },
    { loc: firstPartySitemapUrl("events") },
    { loc: firstPartySitemapUrl("news") },
    { loc: firstPartySitemapUrl("news-sitemap") },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const sitemap of sitemaps) {
    xml += `  <sitemap>\n`;
    xml += `    <loc>${sitemap.loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `  </sitemap>\n`;
  }

  xml += "</sitemapindex>";
  return xml;
}

/**
 * Builds indexable listing URLs:
 * - /events (always)
 * - /events/:category/:locality only if upcoming published events >= threshold
 */
async function getIndexableEventListingUrls(supabase: any): Promise<string[]> {
  const nowIso = new Date().toISOString();

  // Pull upcoming published events (only minimal fields needed)
  const { data, error } = await supabase
    .from("events")
    .select("category, locality, start_date")
    .eq("status", "published")
    .gte("start_date", nowIso)
    .order("start_date", { ascending: true })
    .limit(5000);

  if (error) throw error;

  const counts = new Map<string, number>();

  for (const row of data || []) {
    const cat = (row.category || "").toString().trim().toLowerCase();
    const loc = (row.locality || "").toString().trim().toLowerCase();
    if (!cat || !loc) continue;

    const key = `${cat}||${loc}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  // Build listing URLs from counts
  const urls: string[] = [];
  urls.push(`${SITE_URL}/events`);

  // Sort by count desc so we keep the strongest if we hit cap
  const pairs = [...counts.entries()]
    .filter(([, c]) => c >= EVENTS_LISTING_INDEX_MIN_UPCOMING)
    .sort((a, b) => b[1] - a[1])
    .slice(0, EVENTS_LISTING_URL_CAP);

  for (const [key] of pairs) {
    const [cat, loc] = key.split("||");
    urls.push(`${SITE_URL}/events/${encodeURIComponent(cat)}/${encodeURIComponent(loc)}`);
  }

  return urls;
}

async function generateEventsSitemap(supabase: any, today: string): Promise<string> {
  const { data: events, error } = await supabase
    .from("events")
    .select("slug, title, updated_at, cover_image, category, start_date, status")
    .eq("status", "published")
    .order("start_date", { ascending: false })
    .limit(5000);

  if (error) throw error;

  const now = new Date();
  let xml = getXmlHeader(false, true);

  // ✅ Add listing pages first (hub + strong scoped pages)
  const listingUrls = await getIndexableEventListingUrls(supabase);
  for (const loc of listingUrls) {
    xml += `  <url>\n`;
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${loc.endsWith("/events") ? "0.90" : "0.70"}</priority>\n`;
    xml += `  </url>\n`;
  }

  // ✅ Event detail pages
  for (const event of events || []) {
    const eventDate = event.start_date ? new Date(event.start_date) : new Date();
    const isUpcoming = eventDate > now;
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let priority = 0.6;
    if (isUpcoming) {
      if (daysUntilEvent <= 7) priority = 0.95;
      else if (daysUntilEvent <= 30) priority = 0.85;
      else priority = 0.75;
    }

    const changefreq = isUpcoming && daysUntilEvent <= 14 ? "daily" : "weekly";

    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/events/${event.slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(event.updated_at)}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    if (event.cover_image) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(event.cover_image)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(event.title)} - ${escapeXml(event.category)} Event in Jaipur</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += "</urlset>";
  return xml;
}

async function generateNewsSitemap(supabase: any, today: string): Promise<string> {
  const { data: articles, error } = await supabase
    .from("news_articles")
    .select("slug, title, category, published_at, cover_image")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(5000);

  if (error) throw error;

  let xml = getXmlHeader(false, true);

  for (const article of articles || []) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/news/${article.category}/${article.slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(article.published_at)}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    if (article.cover_image) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(article.cover_image)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(article.title)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += "</urlset>";
  return xml;
}

async function generateGoogleNewsSitemap(supabase: any): Promise<string> {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const { data: articles, error } = await supabase
    .from("news_articles")
    .select("slug, title, category, published_at, meta_keywords")
    .eq("status", "published")
    .gte("published_at", twoDaysAgo.toISOString())
    .order("published_at", { ascending: false })
    .limit(1000);

  if (error) throw error;

  let xml = getXmlHeader(true);

  for (const article of articles || []) {
    const pubDate = new Date(article.published_at).toISOString();
    const keywords = article.meta_keywords?.slice(0, 5).join(", ") || article.category;

    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/news/${article.category}/${article.slug}</loc>\n`;
    xml += `    <news:news>\n`;
    xml += `      <news:publication>\n`;
    xml += `        <news:name>${SITE_NAME}</news:name>\n`;
    xml += `        <news:language>en</news:language>\n`;
    xml += `      </news:publication>\n`;
    xml += `      <news:publication_date>${pubDate}</news:publication_date>\n`;
    xml += `      <news:title>${escapeXml(article.title)}</news:title>\n`;
    if (keywords) xml += `      <news:keywords>${escapeXml(keywords)}</news:keywords>\n`;
    xml += `    </news:news>\n`;
    xml += `  </url>\n`;
  }

  xml += "</urlset>";
  return xml;
}

async function generateFullSitemap(supabase: any, today: string): Promise<string> {
  const [newsRes, eventsRes, dealsRes, merchantsRes, localitiesRes] = await Promise.all([
    supabase.from("news_articles").select("slug, category, published_at, cover_image, title").eq("status", "published").limit(5000),
    supabase.from("events").select("slug, updated_at, cover_image, title, category, start_date").eq("status", "published").limit(5000),
    supabase.from("deals").select("id, updated_at, image_url, title, discount_percentage").eq("approval_status", "approved").eq("is_active", true).limit(5000),
    supabase.from("merchants").select("id, updated_at, logo_url, business_name, business_type").eq("is_active", true).limit(5000),
    supabase.from("localities").select("slug, updated_at, name").limit(5000),
  ]);

  const zonePages = [
    { loc: "/jaipur/zones", changefreq: "weekly", priority: 0.85 },
    { loc: "/jaipur/zones/north", changefreq: "weekly", priority: 0.8 },
    { loc: "/jaipur/zones/south", changefreq: "weekly", priority: 0.8 },
    { loc: "/jaipur/zones/east", changefreq: "weekly", priority: 0.8 },
    { loc: "/jaipur/zones/west", changefreq: "weekly", priority: 0.8 },
    { loc: "/jaipur/zones/central", changefreq: "weekly", priority: 0.8 },
    { loc: "/jaipur/zones/north-west", changefreq: "weekly", priority: 0.8 },
    { loc: "/jaipur/zones/north-east", changefreq: "weekly", priority: 0.8 },
    { loc: "/jaipur/zones/south-west", changefreq: "weekly", priority: 0.8 },
    { loc: "/jaipur/zones/south-east", changefreq: "weekly", priority: 0.8 },
  ];

  const staticPages = [
    { loc: "/", changefreq: "daily", priority: 1.0 },
    { loc: "/deals", changefreq: "hourly", priority: 0.95 },
    { loc: "/merchants", changefreq: "daily", priority: 0.9 },
    { loc: "/events", changefreq: "daily", priority: 0.9 },
    { loc: "/news", changefreq: "hourly", priority: 0.9 },
    { loc: "/jaipur", changefreq: "weekly", priority: 0.9 },
    { loc: "/jaipur/all", changefreq: "weekly", priority: 0.85 },
    { loc: "/categories", changefreq: "weekly", priority: 0.85 },
    { loc: "/news/city", changefreq: "daily", priority: 0.8 },
    { loc: "/news/events", changefreq: "daily", priority: 0.8 },
    { loc: "/news/food", changefreq: "daily", priority: 0.8 },
    { loc: "/news/culture", changefreq: "daily", priority: 0.8 },
    { loc: "/news/business", changefreq: "daily", priority: 0.8 },
    { loc: "/news/sports", changefreq: "daily", priority: 0.8 },
    { loc: "/pro", changefreq: "monthly", priority: 0.75 },
    { loc: "/leaderboard", changefreq: "daily", priority: 0.7 },
    { loc: "/referral-program", changefreq: "monthly", priority: 0.7 },
    { loc: "/merchant-onboarding", changefreq: "monthly", priority: 0.7 },
    { loc: "/about", changefreq: "monthly", priority: 0.6 },
    { loc: "/help", changefreq: "monthly", priority: 0.55 },
    { loc: "/install", changefreq: "monthly", priority: 0.5 },
    { loc: "/sitemap", changefreq: "weekly", priority: 0.4 },
    ...zonePages,
  ];

  const now = new Date();
  let xml = getXmlHeader(false, true);

  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}${page.loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // ✅ Also include indexable events listing pages in full sitemap
  const listingUrls = await getIndexableEventListingUrls(supabase);
  for (const loc of listingUrls) {
    if (loc === `${SITE_URL}/events`) continue; // already in staticPages
    xml += `  <url>\n`;
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }

  for (const locality of localitiesRes.data || []) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/jaipur/${locality.slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(locality.updated_at)}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  for (const deal of dealsRes.data || []) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/deal/${deal.id}</loc>\n`;
    xml += `    <lastmod>${formatDate(deal.updated_at)}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    if (deal.image_url) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(deal.image_url)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(deal.title)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  for (const merchant of merchantsRes.data || []) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/merchant/${merchant.id}</loc>\n`;
    xml += `    <lastmod>${formatDate(merchant.updated_at)}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    if (merchant.logo_url) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(merchant.logo_url)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(merchant.business_name)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  for (const event of eventsRes.data || []) {
    const eventDate = event.start_date ? new Date(event.start_date) : new Date();
    const isUpcoming = eventDate > now;
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let priority = 0.6;
    if (isUpcoming) {
      if (daysUntilEvent <= 7) priority = 0.95;
      else if (daysUntilEvent <= 30) priority = 0.85;
      else priority = 0.75;
    }

    const changefreq = isUpcoming && daysUntilEvent <= 14 ? "daily" : "weekly";

    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/events/${event.slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(event.updated_at)}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    if (event.cover_image) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(event.cover_image)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(event.title)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  for (const article of newsRes.data || []) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/news/${article.category}/${article.slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(article.published_at)}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    if (article.cover_image) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(article.cover_image)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(article.title)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += "</urlset>";
  return xml;
}
