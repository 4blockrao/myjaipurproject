import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import FloatingHeader from "@/components/layout/FloatingHeader";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { Download, Globe, FileText, Calendar, Newspaper, RefreshCw, MapPin, Store, Map, ExternalLink } from "lucide-react";

const SITE_URL = 'https://www.jaipurcircle.com';

const SitemapPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sitemapXml, setSitemapXml] = useState<string>('');
  const [stats, setStats] = useState({ pages: 0, news: 0, events: 0, localities: 0, merchants: 0, deals: 0 });

  const staticPages = [
    { loc: '/', label: 'Homepage', changefreq: 'daily', priority: 1.0 },
    { loc: '/deals', label: 'Deals', changefreq: 'hourly', priority: 0.95 },
    { loc: '/merchants', label: 'Merchants', changefreq: 'daily', priority: 0.9 },
    { loc: '/events', label: 'Events', changefreq: 'daily', priority: 0.9 },
    { loc: '/news', label: 'News', changefreq: 'hourly', priority: 0.9 },
    { loc: '/categories', label: 'Categories', changefreq: 'weekly', priority: 0.85 },
    { loc: '/jaipur', label: 'Jaipur Hub', changefreq: 'weekly', priority: 0.9 },
    { loc: '/jaipur/all', label: 'All Localities', changefreq: 'weekly', priority: 0.85 },
    { loc: '/jaipur/zones', label: 'All Zones', changefreq: 'weekly', priority: 0.85 },
    { loc: '/pro', label: 'Pro Membership', changefreq: 'monthly', priority: 0.75 },
    { loc: '/referral-program', label: 'Referral Program', changefreq: 'monthly', priority: 0.7 },
    { loc: '/leaderboard', label: 'Leaderboard', changefreq: 'daily', priority: 0.7 },
    { loc: '/merchant-onboarding', label: 'Become a Merchant', changefreq: 'monthly', priority: 0.7 },
    { loc: '/about', label: 'About Us', changefreq: 'monthly', priority: 0.6 },
    { loc: '/help', label: 'Help Center', changefreq: 'monthly', priority: 0.55 },
    { loc: '/install', label: 'Install App', changefreq: 'monthly', priority: 0.5 },
  ];

  const zonePages = [
    { loc: '/jaipur/zones/north', label: 'North Zone' },
    { loc: '/jaipur/zones/south', label: 'South Zone' },
    { loc: '/jaipur/zones/east', label: 'East Zone' },
    { loc: '/jaipur/zones/west', label: 'West Zone' },
    { loc: '/jaipur/zones/central', label: 'Central Zone' },
    { loc: '/jaipur/zones/north-west', label: 'North-West Zone' },
    { loc: '/jaipur/zones/north-east', label: 'North-East Zone' },
    { loc: '/jaipur/zones/south-west', label: 'South-West Zone' },
    { loc: '/jaipur/zones/south-east', label: 'South-East Zone' },
  ];

  const newsCategories = [
    { slug: 'city', label: 'City News' },
    { slug: 'events', label: 'Events News' },
    { slug: 'food', label: 'Food News' },
    { slug: 'culture', label: 'Culture News' },
    { slug: 'business', label: 'Business News' },
    { slug: 'sports', label: 'Sports News' },
  ];

  const generateSitemap = async () => {
    setIsGenerating(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch all content in parallel
      const [newsRes, eventsRes, localitiesRes, merchantsRes, dealsRes] = await Promise.all([
        supabase.from('news_articles').select('slug, category, published_at').eq('status', 'published'),
        supabase.from('events').select('slug, updated_at').eq('status', 'published'),
        supabase.from('localities').select('slug, updated_at'),
        supabase.from('merchants').select('id, updated_at').eq('is_active', true),
        supabase.from('deals').select('id, updated_at').eq('is_active', true).eq('approval_status', 'approved'),
      ]);

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      // Add static pages
      staticPages.forEach(page => {
        xml += '  <url>\n';
        xml += `    <loc>${SITE_URL}${page.loc}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += '  </url>\n';
      });

      // Add zone pages
      zonePages.forEach(page => {
        xml += '  <url>\n';
        xml += `    <loc>${SITE_URL}${page.loc}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      });
      
      // Add news category pages
      newsCategories.forEach(category => {
        xml += '  <url>\n';
        xml += `    <loc>${SITE_URL}/news/${category.slug}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      });

      // Add localities
      localitiesRes.data?.forEach(locality => {
        xml += '  <url>\n';
        xml += `    <loc>${SITE_URL}/jaipur/${locality.slug}</loc>\n`;
        xml += `    <lastmod>${locality.updated_at?.split('T')[0] || today}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      });
      
      // Add news articles
      newsRes.data?.forEach(article => {
        xml += '  <url>\n';
        xml += `    <loc>${SITE_URL}/news/${article.category}/${article.slug}</loc>\n`;
        xml += `    <lastmod>${article.published_at?.split('T')[0] || today}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        xml += '  </url>\n';
      });
      
      // Add events
      eventsRes.data?.forEach(event => {
        xml += '  <url>\n';
        xml += `    <loc>${SITE_URL}/events/${event.slug}</loc>\n`;
        xml += `    <lastmod>${event.updated_at?.split('T')[0] || today}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        xml += '  </url>\n';
      });

      // Add merchants
      merchantsRes.data?.forEach(merchant => {
        xml += '  <url>\n';
        xml += `    <loc>${SITE_URL}/merchant/${merchant.id}</loc>\n`;
        xml += `    <lastmod>${merchant.updated_at?.split('T')[0] || today}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.6</priority>\n';
        xml += '  </url>\n';
      });

      // Add deals
      dealsRes.data?.forEach(deal => {
        xml += '  <url>\n';
        xml += `    <loc>${SITE_URL}/deal/${deal.id}</loc>\n`;
        xml += `    <lastmod>${deal.updated_at?.split('T')[0] || today}</lastmod>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        xml += '  </url>\n';
      });
      
      xml += '</urlset>';
      
      setSitemapXml(xml);
      setStats({
        pages: staticPages.length + zonePages.length + newsCategories.length,
        news: newsRes.data?.length || 0,
        events: eventsRes.data?.length || 0,
        localities: localitiesRes.data?.length || 0,
        merchants: merchantsRes.data?.length || 0,
        deals: dealsRes.data?.length || 0,
      });
      
    } catch (error) {
      console.error('Error generating sitemap:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSitemap = () => {
    const blob = new Blob([sitemapXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sitemapXml);
  };

  useEffect(() => {
    generateSitemap();
  }, []);

  const totalUrls = stats.pages + stats.news + stats.events + stats.localities + stats.merchants + stats.deals;

  return (
    <div className="min-h-screen bg-background pb-20">
      <FloatingHeader title="HTML Sitemap" showBackButton backPath="/" />
      
      <main className="pt-16 px-4 max-w-4xl mx-auto py-4 space-y-6">
        {/* Stats Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">JaipurCircle Sitemap</h1>
                <p className="text-blue-100 text-sm">{totalUrls}+ indexed URLs</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
              <div className="bg-white/20 rounded-lg p-2 text-center">
                <FileText className="w-4 h-4 mx-auto mb-1" />
                <p className="text-lg font-bold">{stats.pages}</p>
                <p className="text-xs text-blue-100">Pages</p>
              </div>
              <div className="bg-white/20 rounded-lg p-2 text-center">
                <MapPin className="w-4 h-4 mx-auto mb-1" />
                <p className="text-lg font-bold">{stats.localities}</p>
                <p className="text-xs text-blue-100">Localities</p>
              </div>
              <div className="bg-white/20 rounded-lg p-2 text-center">
                <Store className="w-4 h-4 mx-auto mb-1" />
                <p className="text-lg font-bold">{stats.merchants}</p>
                <p className="text-xs text-blue-100">Merchants</p>
              </div>
              <div className="bg-white/20 rounded-lg p-2 text-center">
                <Newspaper className="w-4 h-4 mx-auto mb-1" />
                <p className="text-lg font-bold">{stats.news}</p>
                <p className="text-xs text-blue-100">Articles</p>
              </div>
              <div className="bg-white/20 rounded-lg p-2 text-center">
                <Calendar className="w-4 h-4 mx-auto mb-1" />
                <p className="text-lg font-bold">{stats.events}</p>
                <p className="text-xs text-blue-100">Events</p>
              </div>
              <div className="bg-white/20 rounded-lg p-2 text-center">
                <Map className="w-4 h-4 mx-auto mb-1" />
                <p className="text-lg font-bold">{stats.deals}</p>
                <p className="text-xs text-blue-100">Deals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HTML Sitemap - Quick Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Core Pages */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Core Pages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {staticPages.slice(0, 8).map(page => (
                <Link 
                  key={page.loc} 
                  to={page.loc} 
                  className="block text-sm text-primary hover:underline"
                >
                  {page.label}
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Zone Pages */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Map className="w-4 h-4" />
                Jaipur Zones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Link to="/jaipur/zones" className="block text-sm text-primary hover:underline font-medium">
                All Zones
              </Link>
              {zonePages.map(page => (
                <Link 
                  key={page.loc} 
                  to={page.loc} 
                  className="block text-sm text-primary hover:underline"
                >
                  {page.label}
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* News Categories */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                News Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Link to="/news" className="block text-sm text-primary hover:underline font-medium">
                All News
              </Link>
              {newsCategories.map(category => (
                <Link 
                  key={category.slug} 
                  to={`/news/${category.slug}`} 
                  className="block text-sm text-primary hover:underline"
                >
                  {category.label}
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Other Pages */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Other Pages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {staticPages.slice(8).map(page => (
                <Link 
                  key={page.loc} 
                  to={page.loc} 
                  className="block text-sm text-primary hover:underline"
                >
                  {page.label}
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Dynamic Content */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Store className="w-4 h-4" />
                Dynamic Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Link to="/jaipur/all" className="block text-sm text-primary hover:underline">
                All Localities ({stats.localities})
              </Link>
              <Link to="/merchants" className="block text-sm text-primary hover:underline">
                All Merchants ({stats.merchants})
              </Link>
              <Link to="/deals" className="block text-sm text-primary hover:underline">
                All Deals ({stats.deals})
              </Link>
              <Link to="/events" className="block text-sm text-primary hover:underline">
                All Events ({stats.events})
              </Link>
            </CardContent>
          </Card>

          {/* XML Sitemaps */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                XML Sitemaps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <a href="/sitemap.xml" target="_blank" rel="noopener" className="block text-primary hover:underline">
                sitemap.xml (index)
              </a>
              <a href="/sitemap-pages.xml" target="_blank" rel="noopener" className="block text-primary hover:underline">
                sitemap-pages.xml
              </a>
              <p className="text-muted-foreground text-xs mt-2">
                Dynamic sitemaps for localities, zones, deals, merchants, events, and news are served via edge functions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* XML Generator Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>XML Sitemap Generator</span>
              <div className="flex gap-2">
                <Button 
                  onClick={generateSitemap} 
                  disabled={isGenerating}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                <Button 
                  onClick={downloadSitemap} 
                  disabled={!sitemapXml}
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-64 text-xs font-mono">
              {sitemapXml ? sitemapXml.substring(0, 2000) + (sitemapXml.length > 2000 ? '\n... (truncated)' : '') : 'Generating...'}
            </pre>
          </CardContent>
        </Card>

        {/* SEO Info */}
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Submitting to Search Engines</h3>
            <p className="text-sm text-muted-foreground mb-3">
              The main sitemap index is available at <code className="bg-muted px-1 rounded">{SITE_URL}/sitemap.xml</code>
            </p>
            <ol className="text-sm text-muted-foreground space-y-1">
              <li>1. Go to Google Search Console</li>
              <li>2. Navigate to Sitemaps → Add a new sitemap</li>
              <li>3. Enter: sitemap.xml and submit</li>
              <li>4. Repeat for Bing Webmaster Tools</li>
            </ol>
          </CardContent>
        </Card>
      </main>

      <NativeBottomNav />
    </div>
  );
};

export default SitemapPage;
