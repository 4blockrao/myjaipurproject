import { Helmet } from 'react-helmet-async';
import GlobalSEO from './GlobalSEO';

const SITE_URL = 'https://jaipurcircle.com';

/**
 * Homepage SEO Component
 * Implements exact title/description as specified + comprehensive schema
 */
export const HomeSEO = () => {
  // LocalBusiness Schema for Local SEO
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: 'JaipurCircle',
    description: "Jaipur's local discovery platform for news, events, deals, jobs, and community updates.",
    url: SITE_URL,
    areaServed: {
      '@type': 'City',
      name: 'Jaipur',
      containedInPlace: {
        '@type': 'State',
        name: 'Rajasthan'
      }
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Jaipur',
      addressRegion: 'Rajasthan',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 26.9124,
      longitude: 75.7873
    },
    priceRange: 'Free'
  };

  // BreadcrumbList for Homepage
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL
      }
    ]
  };

  // FAQ Schema for common questions
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is JaipurCircle?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'JaipurCircle is a community-driven digital platform that brings everything happening in Jaipur into one trusted place. From local news and events to exclusive deals, jobs, and neighborhood updates, JaipurCircle helps citizens discover, engage, and participate in their city.'
        }
      },
      {
        '@type': 'Question',
        name: 'What can I find on JaipurCircle?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'JaipurCircle covers Jaipur local news & civic updates, events, concerts, exhibitions & workshops, local business deals & offers, jobs, services & opportunities, and community-submitted stories and updates.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is JaipurCircle free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, JaipurCircle is free to use for discovering news, events, and deals in Jaipur. Some premium features and deals may require registration or purchase.'
        }
      },
      {
        '@type': 'Question',
        name: 'How do I post an event on JaipurCircle?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can post an event by creating an account, navigating to the Events section, and clicking on "Create Event". Your event will be reviewed and published within 24 hours.'
        }
      }
    ]
  };

  return (
    <>
      <GlobalSEO 
        canonical="/"
        keywords={[
          'Jaipur local news',
          'Jaipur events today',
          'Jaipur deals',
          'Jaipur jobs',
          'Pink City news',
          'Jaipur restaurants',
          'Jaipur shopping',
          'local guide Jaipur'
        ]}
      />
      <Helmet>
        {/* Exact Title as specified */}
        <title>JaipurCircle – Jaipur News, Events, Deals, Jobs & Local Guide</title>
        
        {/* Exact Meta Description as specified */}
        <meta 
          name="description" 
          content="JaipurCircle is Jaipur's local discovery platform for latest news, events, exclusive deals, jobs, services, and everything happening in Jaipur." 
        />
        
        {/* Additional Schema */}
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
    </>
  );
};

export default HomeSEO;
