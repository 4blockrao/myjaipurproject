import { Helmet } from 'react-helmet-async';

interface GlobalSEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: 'website' | 'article' | 'event' | 'product';
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  children?: React.ReactNode;
}

const SITE_NAME = 'JaipurCircle';
const SITE_URL = 'https://jaipurcircle.com';
const DEFAULT_IMAGE = '/og-image.png';
const DEFAULT_DESCRIPTION = "JaipurCircle is Jaipur's local discovery platform for latest news, events, exclusive deals, jobs, services, and everything happening in Jaipur.";

/**
 * Global SEO Component
 * Provides consistent meta tags, Open Graph, Twitter Cards, and base schema
 */
export const GlobalSEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  type = 'website',
  image = DEFAULT_IMAGE,
  noIndex = false,
  keywords = [],
  publishedTime,
  modifiedTime,
  author,
  children
}: GlobalSEOProps) => {
  const fullTitle = title 
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} – Jaipur News, Events, Deals, Jobs & Local Guide`;
  
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : SITE_URL;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  
  const defaultKeywords = [
    'Jaipur',
    'Jaipur news',
    'Jaipur events',
    'Jaipur deals',
    'Jaipur jobs',
    'Jaipur local',
    'Pink City',
    'Rajasthan',
    'local guide',
    'JaipurCircle'
  ];
  
  const allKeywords = [...new Set([...keywords, ...defaultKeywords])];

  // Organization Schema (Global) - Enhanced for rich snippets
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'JaipurCircle',
    alternateName: 'Jaipur Circle',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/#logo`,
      url: `${SITE_URL}/logo.png`,
      contentUrl: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
      caption: 'JaipurCircle Logo'
    },
    image: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/og-image.png`,
      width: 1200,
      height: 630
    },
    description: "JaipurCircle is Jaipur's leading locality-first urban information platform for discovering neighbourhoods, news, events, deals, jobs, and local services across the Pink City.",
    slogan: "Discover Jaipur, One Locality at a Time",
    foundingDate: '2024',
    foundingLocation: {
      '@type': 'Place',
      name: 'Jaipur, Rajasthan, India'
    },
    areaServed: {
      '@type': 'City',
      name: 'Jaipur',
      '@id': 'https://www.wikidata.org/wiki/Q1950',
      containedInPlace: {
        '@type': 'State',
        name: 'Rajasthan',
        '@id': 'https://www.wikidata.org/wiki/Q1437',
        containedInPlace: {
          '@type': 'Country',
          name: 'India',
          '@id': 'https://www.wikidata.org/wiki/Q668'
        }
      }
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Jaipur',
      addressRegion: 'Rajasthan',
      postalCode: '302001',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 26.9124,
      longitude: 75.7873
    },
    sameAs: [
      'https://twitter.com/jaipurcircle',
      'https://facebook.com/jaipurcircle',
      'https://instagram.com/jaipurcircle',
      'https://linkedin.com/company/jaipurcircle'
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'hello@jaipurcircle.com',
        availableLanguage: ['English', 'Hindi']
      }
    ],
    knowsAbout: [
      'Jaipur localities',
      'Jaipur neighbourhoods',
      'Jaipur news',
      'Jaipur events',
      'Jaipur deals',
      'Jaipur local businesses',
      'Rajasthan tourism'
    ]
  };

  // WebSite Schema with SearchAction - Enhanced
  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'JaipurCircle',
    alternateName: 'Jaipur Circle',
    description: DEFAULT_DESCRIPTION,
    publisher: {
      '@id': `${SITE_URL}/#organization`
    },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/deals?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      },
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/jaipur/{locality_name}`
        },
        'query-input': 'required name=locality_name'
      }
    ],
    inLanguage: 'en-IN',
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: {
      '@id': `${SITE_URL}/#organization`
    }
  };

  // WebPage Schema for current page
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: fullTitle,
    description: description,
    isPartOf: {
      '@id': `${SITE_URL}/#website`
    },
    about: {
      '@id': `${SITE_URL}/#organization`
    },
    inLanguage: 'en-IN',
    ...(publishedTime && { datePublished: publishedTime }),
    ...(modifiedTime && { dateModified: modifiedTime })
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Language & Region */}
      <meta name="language" content="English" />
      <meta name="geo.region" content="IN-RJ" />
      <meta name="geo.placename" content="Jaipur, Rajasthan" />
      <meta name="geo.position" content="26.9124;75.7873" />
      <meta name="ICBM" content="26.9124, 75.7873" />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={title || SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@jaipurcircle" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Mobile & PWA */}
      <meta name="theme-color" content="#e91e63" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      
      {/* Structured Data - Organization, WebSite, WebPage */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webSiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webPageSchema)}
      </script>
      
      {children}
    </Helmet>
  );
};

export default GlobalSEO;
