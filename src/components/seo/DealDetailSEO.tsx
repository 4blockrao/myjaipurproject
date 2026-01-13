import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://jaipurcircle.com';

interface DealDetailSEOProps {
  deal: {
    id: string;
    title: string;
    description?: string;
    category?: string;
    subcategory?: string;
    location?: string;
    image_url?: string;
    original_price?: number;
    discounted_price?: number;
    discount_percentage?: number;
    start_date?: string;
    end_date?: string;
    max_redemptions?: number;
    current_redemptions?: number;
    inventory_count?: number;
    tags?: string[];
    terms_conditions?: string;
    jaicoin_reward?: number;
    merchant?: {
      business_name?: string;
      business_type?: string;
      address?: string;
      phone?: string;
      website?: string;
      average_rating?: number;
      total_reviews?: number;
      is_verified?: boolean;
      logo_url?: string;
    };
  };
}

/**
 * DealDetailSEO - Best-in-class SEO component for individual deal pages
 * Implements Product, Offer, LocalBusiness, AggregateRating, and Review schemas
 * Optimized for Google Shopping, Rich Snippets, and AI discovery
 */
export function DealDetailSEO({ deal }: DealDetailSEOProps) {
  const merchant = deal.merchant;
  const canonicalUrl = `${SITE_URL}/deal/${deal.id}`;
  
  // Generate SEO-optimized title (under 60 chars)
  const seoTitle = merchant?.business_name 
    ? `${deal.title} | ${deal.discount_percentage}% Off at ${merchant.business_name}`
    : `${deal.title} | ${deal.discount_percentage}% Off in Jaipur`;
  const truncatedTitle = seoTitle.length > 60 ? seoTitle.substring(0, 57) + '...' : seoTitle;
  
  // Generate meta description (under 160 chars)
  const baseDescription = deal.description || `Get ${deal.discount_percentage}% off on ${deal.title}`;
  const locationText = deal.location ? ` in ${deal.location}` : ' in Jaipur';
  const merchantText = merchant?.business_name ? ` at ${merchant.business_name}` : '';
  const priceText = deal.discounted_price ? ` Only ₹${deal.discounted_price}.` : '';
  const seoDescription = `${baseDescription}${merchantText}${locationText}.${priceText} Limited time offer!`;
  const truncatedDescription = seoDescription.length > 160 ? seoDescription.substring(0, 157) + '...' : seoDescription;

  // Calculate availability
  const isUnlimited = !deal.max_redemptions && !deal.inventory_count;
  const available = isUnlimited 
    ? 999 
    : Math.max(
        (deal.max_redemptions || 0) - (deal.current_redemptions || 0),
        deal.inventory_count || 0
      );
  const inStock = available > 0;

  // Keywords for SEO
  const keywords = [
    deal.title,
    deal.category,
    deal.subcategory,
    deal.location,
    merchant?.business_name,
    'Jaipur deals',
    'discount offers',
    'coupons Jaipur',
    ...(deal.tags || [])
  ].filter(Boolean).join(', ');

  // Product Schema (for Google Shopping)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonicalUrl}#product`,
    name: deal.title,
    description: deal.description || `${deal.discount_percentage}% off deal`,
    image: deal.image_url || `${SITE_URL}/placeholder.svg`,
    url: canonicalUrl,
    sku: deal.id,
    category: deal.category || 'Deals',
    brand: merchant?.business_name ? {
      '@type': 'Brand',
      name: merchant.business_name
    } : undefined,
    offers: {
      '@type': 'Offer',
      '@id': `${canonicalUrl}#offer`,
      url: canonicalUrl,
      price: deal.discounted_price || 0,
      priceCurrency: 'INR',
      priceValidUntil: deal.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      itemCondition: 'https://schema.org/NewCondition',
      seller: merchant?.business_name ? {
        '@type': 'Organization',
        name: merchant.business_name,
        url: merchant.website || SITE_URL
      } : {
        '@type': 'Organization',
        name: 'JaipurCircle',
        url: SITE_URL
      },
      ...(deal.original_price && deal.original_price > (deal.discounted_price || 0) && {
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: deal.discounted_price,
          priceCurrency: 'INR',
          valueAddedTaxIncluded: true
        }
      })
    },
    ...(merchant?.average_rating && merchant.total_reviews && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: merchant.average_rating,
        reviewCount: merchant.total_reviews,
        bestRating: 5,
        worstRating: 1
      }
    })
  };

  // LocalBusiness Schema (for merchant)
  const localBusinessSchema = merchant?.business_name ? {
    '@context': 'https://schema.org',
    '@type': merchant.business_type === 'Restaurant' ? 'Restaurant' : 'LocalBusiness',
    '@id': `${canonicalUrl}#localbusiness`,
    name: merchant.business_name,
    image: merchant.logo_url,
    url: merchant.website || SITE_URL,
    telephone: merchant.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: merchant.address,
      addressLocality: deal.location || 'Jaipur',
      addressRegion: 'Rajasthan',
      postalCode: '302000',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 26.9124,
      longitude: 75.7873
    },
    priceRange: '₹₹',
    ...(merchant.average_rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: merchant.average_rating,
        reviewCount: merchant.total_reviews || 0
      }
    }),
    makesOffer: {
      '@id': `${canonicalUrl}#offer`
    }
  } : null;

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
      ...(deal.category ? [{
        '@type': 'ListItem',
        position: 3,
        name: deal.category,
        item: `${SITE_URL}/deals?category=${encodeURIComponent(deal.category)}`
      }] : []),
      {
        '@type': 'ListItem',
        position: deal.category ? 4 : 3,
        name: deal.title,
        item: canonicalUrl
      }
    ]
  };

  // WebPage Schema
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: truncatedTitle,
    description: truncatedDescription,
    isPartOf: {
      '@id': `${SITE_URL}/#website`
    },
    primaryImageOfPage: deal.image_url ? {
      '@type': 'ImageObject',
      url: deal.image_url
    } : undefined,
    mainEntity: {
      '@id': `${canonicalUrl}#product`
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.deal-description', '.deal-price']
    }
  };

  // FAQ Schema (from terms & conditions)
  const faqSchema = deal.terms_conditions ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What are the terms and conditions for this deal?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: deal.terms_conditions
        }
      },
      {
        '@type': 'Question',
        name: 'How long is this deal valid?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: deal.end_date 
            ? `This deal is valid until ${new Date(deal.end_date).toLocaleDateString('en-IN', { dateStyle: 'long' })}.`
            : 'Please check the deal page for current validity.'
        }
      },
      {
        '@type': 'Question',
        name: 'Where can I redeem this deal?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: merchant?.business_name 
            ? `You can redeem this deal at ${merchant.business_name}${merchant.address ? `, located at ${merchant.address}` : ''}${deal.location ? ` in ${deal.location}, Jaipur` : ''}.`
            : `This deal can be redeemed in ${deal.location || 'Jaipur'}.`
        }
      }
    ]
  } : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{truncatedTitle}</title>
      <meta name="title" content={truncatedTitle} />
      <meta name="description" content={truncatedDescription} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="product" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={truncatedTitle} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:image" content={deal.image_url || `${SITE_URL}/placeholder.svg`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="JaipurCircle" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Product-specific OG tags */}
      <meta property="product:price:amount" content={String(deal.discounted_price || 0)} />
      <meta property="product:price:currency" content="INR" />
      <meta property="product:availability" content={inStock ? 'in stock' : 'out of stock'} />
      <meta property="product:condition" content="new" />
      {deal.category && <meta property="product:category" content={deal.category} />}
      {merchant?.business_name && <meta property="product:retailer" content={merchant.business_name} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={truncatedTitle} />
      <meta name="twitter:description" content={truncatedDescription} />
      <meta name="twitter:image" content={deal.image_url || `${SITE_URL}/placeholder.svg`} />
      <meta name="twitter:site" content="@jaipurcircle" />
      <meta name="twitter:label1" content="Price" />
      <meta name="twitter:data1" content={`₹${deal.discounted_price || 0}`} />
      <meta name="twitter:label2" content="Discount" />
      <meta name="twitter:data2" content={`${deal.discount_percentage || 0}% OFF`} />
      
      {/* Geo Tags */}
      <meta name="geo.region" content="IN-RJ" />
      <meta name="geo.placename" content={deal.location || 'Jaipur'} />
      <meta name="geo.position" content="26.9124;75.7873" />
      <meta name="ICBM" content="26.9124, 75.7873" />
      
      {/* Additional SEO Tags */}
      <meta name="author" content="JaipurCircle" />
      <meta name="publisher" content="JaipurCircle" />
      <meta name="copyright" content="JaipurCircle" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="1 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webPageSchema)}
      </script>
      {localBusinessSchema && (
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      )}
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
    </Helmet>
  );
}

export default DealDetailSEO;
