import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import FloatingHeader from "@/components/layout/FloatingHeader";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { Download, Globe, FileText, Calendar, Newspaper, RefreshCw } from "lucide-react";

const SITE_URL = 'https://jaipurcircle.com';

const SitemapPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sitemapXml, setSitemapXml] = useState<string>('');
  const [stats, setStats] = useState({ pages: 0, news: 0, events: 0 });

  const staticPages = [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/about', changefreq: 'monthly', priority: 0.8 },
    { loc: '/news', changefreq: 'hourly', priority: 0.9 },
    { loc: '/events', changefreq: 'daily', priority: 0.9 },
    { loc: '/deals', changefreq: 'daily', priority: 0.9 },
    { loc: '/categories', changefreq: 'weekly', priority: 0.7 },
    { loc: '/help', changefreq: 'monthly', priority: 0.5 },
    { loc: '/merchant-onboarding', changefreq: 'monthly', priority: 0.6 },
    { loc: '/referral-program', changefreq: 'monthly', priority: 0.7 },
    { loc: '/leaderboard', changefreq: 'daily', priority: 0.6 },
    { loc: '/jaicoin-zone', changefreq: 'weekly', priority: 0.7 },
  ];

  const newsCategories = ['city', 'events', 'food', 'culture', 'business', 'sports'];

  const generateSitemap = async () => {
    setIsGenerating(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch news articles
      const { data: news } = await supabase
        .from('news_articles')
        .select('slug, category, published_at, title')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      // Fetch events
      const { data: events } = await supabase
        .from('events')
        .select('slug, updated_at, start_date, title')
        .eq('status', 'published')
        .order('start_date', { ascending: false });

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
      news?.forEach(article => {
        xml += '  <url>\n';
        xml += `    <loc>${SITE_URL}/news/${article.category}/${article.slug}</loc>\n`;
        xml += `    <lastmod>${article.published_at?.split('T')[0] || today}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        xml += '  </url>\n';
      });
      
      // Add events
      events?.forEach(event => {
        xml += '  <url>\n';
        xml += `    <loc>${SITE_URL}/events/${event.slug}</loc>\n`;
        xml += `    <lastmod>${event.updated_at?.split('T')[0] || today}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        xml += '  </url>\n';
      });
      
      xml += '</urlset>';
      
      setSitemapXml(xml);
      setStats({
        pages: staticPages.length + newsCategories.length,
        news: news?.length || 0,
        events: events?.length || 0
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <FloatingHeader title="XML Sitemap" showBackButton backPath="/account" />
      
      <main className="pt-16 px-4 max-w-2xl mx-auto py-4 space-y-4">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Sitemap Generator</h1>
                <p className="text-blue-100 text-sm">For Google Search Console submission</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <FileText className="w-5 h-5 mx-auto mb-1" />
                <p className="text-2xl font-bold">{stats.pages}</p>
                <p className="text-xs text-blue-100">Pages</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <Newspaper className="w-5 h-5 mx-auto mb-1" />
                <p className="text-2xl font-bold">{stats.news}</p>
                <p className="text-xs text-blue-100">Articles</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <Calendar className="w-5 h-5 mx-auto mb-1" />
                <p className="text-2xl font-bold">{stats.events}</p>
                <p className="text-xs text-blue-100">Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button 
            onClick={generateSitemap} 
            disabled={isGenerating}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
          <Button 
            onClick={downloadSitemap} 
            disabled={!sitemapXml}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download XML
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Sitemap XML Preview</span>
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono">
              {sitemapXml || 'Generating...'}
            </pre>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">How to Submit to Google</h3>
            <ol className="text-sm text-muted-foreground space-y-2">
              <li>1. Download the sitemap.xml file</li>
              <li>2. Upload to your website root: {SITE_URL}/sitemap.xml</li>
              <li>3. Go to Google Search Console</li>
              <li>4. Navigate to Sitemaps → Add a new sitemap</li>
              <li>5. Enter: sitemap.xml and submit</li>
            </ol>
          </CardContent>
        </Card>
      </main>

      <NativeBottomNav />
    </div>
  );
};

export default SitemapPage;
