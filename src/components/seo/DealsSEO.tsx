import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://jaipurcircle.com';

interface DealsSEOProps {
  category?: string;
  locality?: string;
}

/**
 * Deals Page SEO Component
 * Implements LocalBusiness and Offer schema for deals
 */
export const DealsSEO = ({ category, locality }: DealsSEOProps) => {
  const categoryText = category && category !== 'all' ? category : 'All';
  const localityText = locality || 'Jaipur';
  
  const title = category && category !== 'all'
    ? `${category} Deals in ${localityText} | JaipurCircle`
    : `Best Deals & Offers in ${localityText} | JaipurCircle`;
    
  const description = category && category !== 'all'
    ? `Discover the best ${category.toLowerCase()} deals and offers in ${localityText}. Save big with exclusive discounts from verified local businesses on JaipurCircle.`
    : `Find exclusive deals, discounts, and offers from local businesses in ${localityText}. Save money on food, shopping, wellness, and more with JaipurCircle.`;

  // CollectionPage Schema
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/deals#webpage`,
    url: `${SITE_URL}/deals`,
    name: title,
    description: description,
    isPartOf: {
      '@id': `${SITE_URL}/#website`
    },
    about: {
      '@type': 'ItemList',
      name: `${categoryText} Deals in ${localityText}`,
      description: `Collection of ${categoryText.toLowerCase()} deals and offers available in ${localityText}`
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
        name: 'Deals',
        item: `${SITE_URL}/deals`
      },
      ...(category && category !== 'all' ? [{
        '@type': 'ListItem',
        position: 3,
        name: category,
        item: `${SITE_URL}/deals?category=${encodeURIComponent(category)}`
      }] : [])
    ]
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${SITE_URL}/deals`} />
      
      <meta name="keywords" content={`${localityText} deals, ${categoryText.toLowerCase()} offers, discount ${localityText}, local deals, JaipurCircle deals, ${localityText} coupons`} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${SITE_URL}/deals`} />
      <meta property="og:site_name" content="JaipurCircle" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@jaipurcircle" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* Geo Tags */}
      <meta name="geo.region" content="IN-RJ" />
      <meta name="geo.placename" content={localityText} />
      
      <script type="application/ld+json">
        {JSON.stringify(collectionPageSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
};

export default DealsSEO;
