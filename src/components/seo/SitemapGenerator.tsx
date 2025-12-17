/**
 * Sitemap Generator Utility
 * Generates XML sitemaps for SEO
 * Note: In production, this should be generated server-side or via build process
 */

const SITE_URL = 'https://jaipurcircle.com';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface NewsItem {
  slug: string;
  category: string;
  published_at: string;
  title: string;
}

interface EventItem {
  slug: string;
  updated_at?: string;
  start_date: string;
  title: string;
}

// Static pages for the sitemap
export const staticPages: SitemapUrl[] = [
  { loc: '/', changefreq: 'daily', priority: 1.0 },
  { loc: '/about', changefreq: 'monthly', priority: 0.8 },
  { loc: '/news', changefreq: 'hourly', priority: 0.9 },
  { loc: '/events', changefreq: 'daily', priority: 0.9 },
  { loc: '/deals', changefreq: 'daily', priority: 0.9 },
  { loc: '/categories', changefreq: 'weekly', priority: 0.7 },
  { loc: '/help', changefreq: 'monthly', priority: 0.5 },
  { loc: '/merchant-onboarding', changefreq: 'monthly', priority: 0.6 },
];

// News categories
export const newsCategories = [
  'city',
  'events',
  'food',
  'culture',
  'business',
  'sports'
];

/**
 * Generate main sitemap XML
 */
export const generateSitemapXML = (
  news: NewsItem[] = [],
  events: EventItem[] = []
): string => {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add static pages
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}${page.loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    if (page.changefreq) xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    if (page.priority) xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  // Add news category pages
  newsCategories.forEach(category => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}/news/${category}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });
  
  // Add news articles
  news.forEach(article => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}/news/${article.category}/${article.slug}</loc>\n`;
    xml += `    <lastmod>${article.published_at?.split('T')[0] || today}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  });
  
  // Add events
  events.forEach(event => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}/events/${event.slug}</loc>\n`;
    xml += `    <lastmod>${event.updated_at?.split('T')[0] || today}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
};

/**
 * Generate news sitemap XML (for Google News)
 */
export const generateNewsSitemapXML = (news: NewsItem[] = []): string => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';
  
  // Only include articles from last 2 days for Google News
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  const recentNews = news.filter(article => {
    const publishDate = new Date(article.published_at);
    return publishDate >= twoDaysAgo;
  });
  
  recentNews.forEach(article => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}/news/${article.category}/${article.slug}</loc>\n`;
    xml += '    <news:news>\n';
    xml += '      <news:publication>\n';
    xml += '        <news:name>JaipurCircle</news:name>\n';
    xml += '        <news:language>en</news:language>\n';
    xml += '      </news:publication>\n';
    xml += `      <news:publication_date>${article.published_at}</news:publication_date>\n`;
    xml += `      <news:title>${escapeXml(article.title)}</news:title>\n`;
    xml += '    </news:news>\n';
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
};

/**
 * Escape XML special characters
 */
const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export default { generateSitemapXML, generateNewsSitemapXML, staticPages, newsCategories };
