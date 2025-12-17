import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Plus, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsFeed } from '@/components/news/NewsFeed';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import GlobalSEO from '@/components/seo/GlobalSEO';

const SITE_URL = 'https://jaipurcircle.com';

export default function NewsPage() {
  // News Collection Page Schema
  const newsCollectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/news#webpage`,
    url: `${SITE_URL}/news`,
    name: 'Jaipur News - Latest Local Updates',
    description: 'Stay updated with the latest news from Jaipur. Local events, city updates, food, culture, business and sports news from the Pink City.',
    isPartOf: {
      '@id': `${SITE_URL}/#website`
    },
    about: {
      '@type': 'Thing',
      name: 'Jaipur Local News',
      description: 'News and updates from Jaipur, Rajasthan'
    },
    publisher: {
      '@id': `${SITE_URL}/#organization`
    }
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'News',
        item: `${SITE_URL}/news`
      }
    ]
  };

  return (
    <>
      <GlobalSEO
        title="Jaipur News - Latest Local Updates"
        description="Stay updated with the latest news from Jaipur. Local events, city updates, food, culture, business and sports news from the Pink City."
        canonical="/news"
        keywords={['Jaipur news', 'Jaipur local news', 'Pink City news', 'Rajasthan news', 'Jaipur events', 'Jaipur updates']}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(newsCollectionSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Newspaper className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">Jaipur News</h1>
                  <p className="text-xs text-muted-foreground">Latest from the Pink City</p>
                </div>
              </div>
            </div>
            <Link to="/news/create">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Write
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4">
          <NewsFeed showHeader={false} />
        </main>

        <NativeBottomNav />
      </div>
    </>
  );
}
