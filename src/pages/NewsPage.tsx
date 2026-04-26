import { Link } from 'react-router-dom';
import { Plus, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsFeed } from '@/components/news/NewsFeed';
import { PublicationsLatestSection } from '@/components/news/PublicationsLatestSection';
import AppLayout from '@/components/layout/AppLayout';
import GlobalSEO from '@/components/seo/GlobalSEO';
import { PillarSchema } from '@/components/seo/SchemaInjector';
import { Helmet } from 'react-helmet-async';

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
    <AppLayout
      title="Jaipur News"
      subtitle="Latest from the Pink City"
      showBackButton={true}
      backPath="/"
      headerRightAction={
        <Link to="/news/create">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Write
          </Button>
        </Link>
      }
      seoTitle="Jaipur News - Latest Local Updates"
      seoDescription="Stay updated with the latest news from Jaipur. Local events, city updates, food, culture, business and sports news from the Pink City."
      canonical="/news"
    >
      <GlobalSEO
        title="Jaipur News - Latest Local Updates"
        description="Stay updated with the latest news from Jaipur. Local events, city updates, food, culture, business and sports news from the Pink City."
        canonical="/news"
        keywords={['Jaipur news', 'Jaipur local news', 'Pink City news', 'Rajasthan news', 'Jaipur events', 'Jaipur updates']}
      />
      <PillarSchema 
        title="Jaipur News - Latest Local Updates"
        description="Stay updated with the latest news from Jaipur. Local events, city updates, food, culture, business and sports news from the Pink City."
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(newsCollectionSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <main className="p-4">
        <PublicationsLatestSection
          contentType="news"
          heading="Latest News"
          limit={18}
          className="mb-8"
        />
        <NewsFeed showHeader={false} />
      </main>
    </AppLayout>
  );
}