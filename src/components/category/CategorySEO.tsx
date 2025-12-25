import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Category } from '@/hooks/useCategories';

interface CategorySEOProps {
  category: Category;
  breadcrumbs: Category[];
  childCategories?: Category[];
  localityName?: string;
  localitySlug?: string;
}

export const CategorySEO: React.FC<CategorySEOProps> = ({
  category,
  breadcrumbs,
  childCategories = [],
  localityName,
  localitySlug,
}) => {
  const baseUrl = 'https://www.jaipurcircle.com';
  
  // Build title
  const title = localityName
    ? `${category.seo_title || category.name} in ${localityName}, Jaipur | JaipurCircle`
    : category.seo_title || `${category.name} in Jaipur | JaipurCircle`;
  
  // Build description
  const description = localityName
    ? `Discover ${category.name.toLowerCase()} in ${localityName}, Jaipur. ${category.seo_description || `Find the best ${category.name.toLowerCase()} options, deals, and services.`}`
    : category.seo_description || `Explore ${category.name.toLowerCase()} in Jaipur. Find deals, services, events, and local businesses in this category.`;
  
  // Build canonical URL
  const canonicalUrl = localitySlug
    ? `${baseUrl}/jaipur/${localitySlug}/${category.slug}`
    : `${baseUrl}/categories/${category.slug}`;
  
  // Generate BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Categories',
        item: `${baseUrl}/categories`,
      },
      ...breadcrumbs.map((cat, index) => ({
        '@type': 'ListItem',
        position: index + 3,
        name: cat.name,
        item: `${baseUrl}/categories/${cat.slug}`,
      })),
      ...(localityName
        ? [
            {
              '@type': 'ListItem',
              position: breadcrumbs.length + 3,
              name: localityName,
              item: `${baseUrl}/jaipur/${localitySlug}/${category.slug}`,
            },
          ]
        : []),
    ],
  };
  
  // Generate ItemList schema for subcategories or listings
  const itemListSchema = childCategories.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${category.name} Categories`,
        description: `Subcategories of ${category.name} in Jaipur`,
        numberOfItems: childCategories.length,
        itemListElement: childCategories.map((child, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: child.name,
          url: `${baseUrl}/categories/${child.slug}`,
        })),
      }
    : null;
  
  // Generate FAQPage schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What are the best ${category.name.toLowerCase()} options in ${localityName || 'Jaipur'}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `JaipurCircle offers a curated list of ${category.name.toLowerCase()} in ${localityName || 'Jaipur'}, including verified merchants, exclusive deals, and community reviews to help you make informed decisions.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do I find ${category.name.toLowerCase()} near me in Jaipur?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Use JaipurCircle's locality filter to explore ${category.name.toLowerCase()} in your specific area. We cover all major localities across Jaipur with detailed listings and reviews.`,
        },
      },
      {
        '@type': 'Question',
        name: `Are there any deals available for ${category.name.toLowerCase()} in Jaipur?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes! JaipurCircle regularly features exclusive deals and discounts on ${category.name.toLowerCase()} from verified merchants across Jaipur. Check our deals section for current offers.`,
        },
      },
    ],
  };
  
  // Use custom schema type if provided
  const categoryTypeSchema = category.schema_type
    ? {
        '@context': 'https://schema.org',
        '@type': category.schema_type,
        name: category.name,
        description: category.description || description,
        url: canonicalUrl,
        ...(localityName && {
          location: {
            '@type': 'Place',
            name: localityName,
            address: {
              '@type': 'PostalAddress',
              addressLocality: localityName,
              addressRegion: 'Rajasthan',
              addressCountry: 'IN',
            },
          },
        }),
      }
    : null;
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="JaipurCircle" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      
      {itemListSchema && (
        <script type="application/ld+json">
          {JSON.stringify(itemListSchema)}
        </script>
      )}
      
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      
      {categoryTypeSchema && (
        <script type="application/ld+json">
          {JSON.stringify(categoryTypeSchema)}
        </script>
      )}
    </Helmet>
  );
};
