import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsFeed } from '@/components/news/NewsFeed';
import NativeBottomNav from '@/components/home/NativeBottomNav';

const categoryLabels: Record<string, string> = {
  city: 'City News',
  events: 'Events & Entertainment',
  food: 'Food & Dining',
  culture: 'Arts & Culture',
  business: 'Business & Finance',
  sports: 'Sports',
};

const categoryDescriptions: Record<string, string> = {
  city: 'Latest city news, civic updates, infrastructure developments, and local government news from Jaipur.',
  events: 'Upcoming events, concerts, festivals, exhibitions, and entertainment news from Jaipur.',
  food: 'Restaurant reviews, new openings, food festivals, and culinary trends in Jaipur.',
  culture: 'Arts, heritage, traditions, museums, and cultural events from the Pink City.',
  business: 'Business news, startups, real estate, markets, and economic updates from Jaipur.',
  sports: 'Sports news, match updates, local tournaments, and athlete stories from Jaipur.',
};

const categoryEmojis: Record<string, string> = {
  city: '🏛️',
  events: '🎉',
  food: '🍽️',
  culture: '🎭',
  business: '💼',
  sports: '⚽',
};

const BASE_URL = 'https://jaipurcircle.com';

export default function NewsCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const validCategory = category && categoryLabels[category] ? category : 'city';
  
  const pageTitle = `${categoryLabels[validCategory]} - Jaipur News | JaipurCircle`;
  const pageDescription = categoryDescriptions[validCategory];
  const canonicalUrl = `${BASE_URL}/news/${validCategory}`;

  // ItemList Schema for news listings
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': canonicalUrl,
    url: canonicalUrl,
    name: pageTitle,
    description: pageDescription,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${BASE_URL}#website`,
      name: 'JaipurCircle',
      url: BASE_URL
    },
    about: {
      '@type': 'Thing',
      name: `${categoryLabels[validCategory]} in Jaipur`
    },
    inLanguage: 'en-IN'
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'News',
        item: `${BASE_URL}/news`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryLabels[validCategory],
        item: canonicalUrl
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${validCategory} news Jaipur, Jaipur ${validCategory}, Pink City ${validCategory} news, Rajasthan news`} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="JaipurCircle" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(itemListSchema)}
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
              <Link to="/news">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <span className="text-lg">{categoryEmojis[validCategory]}</span>
                </div>
                <div>
                  <h1 className="font-bold text-lg">{categoryLabels[validCategory]}</h1>
                  <p className="text-xs text-muted-foreground">Jaipur News</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Category description for SEO */}
        <div className="px-4 py-3 bg-muted/30 border-b">
          <p className="text-sm text-muted-foreground">{pageDescription}</p>
        </div>

        {/* Main Content */}
        <main className="p-4">
          <NewsFeed showHeader={false} filterCategory={validCategory} />
        </main>

        <NativeBottomNav />
      </div>
    </>
  );
}
