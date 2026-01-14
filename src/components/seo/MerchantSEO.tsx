import { Helmet } from "react-helmet-async";

interface MerchantSEOProps {
  merchant: {
    id: string;
    business_name: string;
    business_type?: string;
    description?: string;
    address?: string;
    locality?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo_url?: string;
    average_rating?: number;
    total_reviews?: number;
    is_verified?: boolean;
  };
  dealsCount?: number;
}

export const MerchantSEO = ({ merchant, dealsCount = 0 }: MerchantSEOProps) => {
  const currentYear = new Date().getFullYear();
  const locality = merchant.locality || 'Jaipur';
  
  // SEO-optimized title
  const title = `${merchant.business_name} ${locality} — Deals, Offers, Address & Reviews ${currentYear} | JaipurCircle`;
  
  // SEO-optimized description
  const description = merchant.description 
    ? `${merchant.description.substring(0, 120)}... Find exclusive deals, contact info, reviews and offers from ${merchant.business_name} in ${locality}, Jaipur.`
    : `Explore exclusive deals and offers from ${merchant.business_name} in ${locality}, Jaipur. ${dealsCount > 0 ? `${dealsCount} active offers available.` : ''} Contact info, address, reviews and more.`;

  const canonicalUrl = `https://myjaipurproject.lovable.app/merchant/${merchant.id}`;
  const logoUrl = merchant.logo_url || 'https://myjaipurproject.lovable.app/favicon.png';

  // LocalBusiness Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": canonicalUrl,
    "name": merchant.business_name,
    "description": merchant.description || `${merchant.business_name} in ${locality}, Jaipur`,
    "url": canonicalUrl,
    "image": logoUrl,
    "telephone": merchant.phone || undefined,
    "email": merchant.email || undefined,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": merchant.address || undefined,
      "addressLocality": locality,
      "addressRegion": "Rajasthan",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 26.9124,
      "longitude": 75.7873
    },
    ...(merchant.average_rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": merchant.average_rating.toFixed(1),
        "reviewCount": merchant.total_reviews || 1,
        "bestRating": 5,
        "worstRating": 1
      }
    }),
    "priceRange": "₹₹",
    ...(merchant.website && { "sameAs": [merchant.website] })
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://myjaipurproject.lovable.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Merchants",
        "item": "https://myjaipurproject.lovable.app/merchants"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": merchant.business_name,
        "item": canonicalUrl
      }
    ]
  };

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Where is ${merchant.business_name} located in Jaipur?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": merchant.address 
            ? `${merchant.business_name} is located at ${merchant.address}, ${locality}, Jaipur.`
            : `${merchant.business_name} is located in ${locality}, Jaipur. Contact them for exact address.`
        }
      },
      {
        "@type": "Question",
        "name": `How many deals does ${merchant.business_name} offer?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dealsCount > 0 
            ? `${merchant.business_name} currently has ${dealsCount} active deals and offers on JaipurCircle.`
            : `Check JaipurCircle for the latest deals from ${merchant.business_name}.`
        }
      },
      {
        "@type": "Question",
        "name": `Is ${merchant.business_name} verified on JaipurCircle?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": merchant.is_verified 
            ? `Yes, ${merchant.business_name} is a verified merchant on JaipurCircle.`
            : `${merchant.business_name} is listed on JaipurCircle. Contact them directly for verification.`
        }
      }
    ]
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content="business.business" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={logoUrl} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:site_name" content="JaipurCircle" />
      <meta property="business:contact_data:locality" content={locality} />
      <meta property="business:contact_data:region" content="Rajasthan" />
      <meta property="business:contact_data:country_name" content="India" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={logoUrl} />
      
      {/* Keywords */}
      <meta name="keywords" content={`${merchant.business_name}, ${merchant.business_type || 'business'}, ${locality}, Jaipur, deals, offers, discounts, reviews, contact`} />
      
      {/* Schemas */}
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
  );
};

export default MerchantSEO;
