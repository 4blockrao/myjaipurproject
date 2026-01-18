import { Helmet } from 'react-helmet-async';
import { isPast } from 'date-fns';

const SITE_URL = 'https://www.jaipurcircle.com';

interface EnhancedDealSEOProps {
  deal: {
    id: string;
    slug?: string;
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
      locality?: string;
    };
  };
}

/**
 * EnhancedDealSEO - Complete SEO implementation for deal pages
 * 
 * Features:
 * - Dynamic meta tags per deal (no generic homepage meta)
 * - Canonical URL with slug support
 * - Comprehensive JSON-LD schemas (Offer, LocalBusiness, Product, FAQ)
 * - Expired deal handling
 * - Full indexability
 */
export function EnhancedDealSEO({ deal }: EnhancedDealSEOProps) {
  const merchant = deal.merchant;
  const locality = deal.location || merchant?.locality || 'Jaipur';
  const isExpired = deal.end_date ? isPast(new Date(deal.end_date)) : false;
  
  // Canonical URL - prefer slug, fallback to ID
  const canonicalPath = deal.slug ? `/deals/${deal.slug}` : `/deal/${deal.id}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  
  // Calculate availability
  const isUnlimited = !deal.max_redemptions && !deal.inventory_count;
  const available = isUnlimited 
    ? 999 
    : Math.max(
        (deal.max_redemptions || 0) - (deal.current_redemptions || 0),
        deal.inventory_count || 0
      );
  const inStock = available > 0 && !isExpired;

  // SEO Title (under 60 chars) - UNIQUE per deal
  const seoTitle = isExpired
    ? `${deal.title} | Deal Expired - JaipurCircle`
    : merchant?.business_name 
      ? `${deal.title} | ${deal.discount_percentage}% Off at ${merchant.business_name}`
      : `${deal.title} | ${deal.discount_percentage}% Off in Jaipur`;
  const truncatedTitle = seoTitle.length > 60 ? seoTitle.substring(0, 57) + '...' : seoTitle;
  
  // Meta Description (under 160 chars) - UNIQUE per deal
  const baseDescription = isExpired
    ? `This deal has expired. ${deal.title} was available at ${merchant?.business_name || 'a local merchant'} in ${locality}.`
    : deal.description || `Get ${deal.discount_percentage}% off on ${deal.title}`;
  const locationText = ` in ${locality}, Jaipur`;
  const merchantText = merchant?.business_name && !isExpired ? ` at ${merchant.business_name}` : '';
  const priceText = deal.discounted_price && !isExpired ? ` Only ₹${deal.discounted_price}.` : '';
  const seoDescription = isExpired
    ? baseDescription
    : `${baseDescription}${merchantText}${locationText}.${priceText} Limited time offer!`;
  const truncatedDescription = seoDescription.length > 160 ? seoDescription.substring(0, 157) + '...' : seoDescription;

  // Keywords
  const keywords = [
    deal.title,
    deal.category,
    deal.subcategory,
    locality,
    'Jaipur',
    merchant?.business_name,
    'deals',
    'discounts',
    'offers',
    ...(deal.tags || [])
  ].filter(Boolean).join(', ');

  // Offer Schema (JSON-LD)
  const offerSchema = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    '@id': `${canonicalUrl}#offer`,
    name: deal.title,
    description: truncatedDescription,
    url: canonicalUrl,
    image: deal.image_url || `${SITE_URL}/placeholder.svg`,
    price: deal.discounted_price || 0,
    priceCurrency: 'INR',
    availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    validFrom: deal.start_date || new Date().toISOString(),
    validThrough: deal.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    priceSpecification: deal.original_price ? {
      '@type': 'PriceSpecification',
      price: deal.discounted_price || 0,
      priceCurrency: 'INR',
      valueAddedTaxIncluded: true
    } : undefined,
    seller: {
      '@type': 'Organization',
      name: merchant?.business_name || 'JaipurCircle',
      url: merchant?.website || SITE_URL
    },
    areaServed: {
      '@type': 'City',
      name: 'Jaipur',
      containedInPlace: {
        '@type': 'State',
        name: 'Rajasthan'
      }
    }
  };

  // LocalBusiness Schema
  const localBusinessSchema = merchant?.business_name ? {
    '@context': 'https://schema.org',
    '@type': merchant.business_type === 'Restaurant' ? 'Restaurant' : 'LocalBusiness',
    '@id': `${canonicalUrl}#business`,
    name: merchant.business_name,
    image: merchant.logo_url,
    url: merchant.website || `${SITE_URL}/merchant/${deal.id}`,
    telephone: merchant.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: merchant.address || '',
      addressLocality: locality,
      addressRegion: 'Rajasthan',
      postalCode: '302000',
      addressCountry: 'IN'
    },
    areaServed: 'Jaipur',
    priceRange: '₹₹',
    ...(merchant.average_rating && merchant.total_reviews && merchant.total_reviews > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: merchant.average_rating,
        reviewCount: merchant.total_reviews,
        bestRating: 5,
        worstRating: 1
      }
    } : {}),
    makesOffer: {
      '@id': `${canonicalUrl}#offer`
    }
  } : null;

  // Product Schema (for Google Shopping)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonicalUrl}#product`,
    name: deal.title,
    description: deal.description || truncatedDescription,
    image: deal.image_url || `${SITE_URL}/placeholder.svg`,
    url: canonicalUrl,
    sku: deal.id,
    category: deal.category || 'Deals',
    brand: merchant?.business_name ? {
      '@type': 'Brand',
      name: merchant.business_name
    } : {
      '@type': 'Brand',
      name: 'JaipurCircle'
    },
    offers: {
      '@id': `${canonicalUrl}#offer`
    }
  };

  // BreadcrumbList Schema
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

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the price of ${deal.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The discounted price for ${deal.title} is ₹${deal.discounted_price}${deal.original_price ? ` (was ₹${deal.original_price}, save ${deal.discount_percentage}%)` : ''}.`
        }
      },
      {
        '@type': 'Question',
        name: `Where can I redeem this deal in Jaipur?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: merchant?.business_name 
            ? `You can redeem this deal at ${merchant.business_name}${merchant.address ? `, located at ${merchant.address}` : ''} in ${locality}, Jaipur.`
            : `This deal can be redeemed in ${locality}, Jaipur.`
        }
      },
      ...(deal.end_date ? [{
        '@type': 'Question',
        name: 'How long is this deal valid?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: isExpired 
            ? 'This deal has expired.'
            : `This deal is valid until ${new Date(deal.end_date).toLocaleDateString('en-IN', { dateStyle: 'long' })}.`
        }
      }] : []),
      ...(deal.terms_conditions ? [{
        '@type': 'Question',
        name: 'What are the terms and conditions?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: deal.terms_conditions
        }
      }] : [])
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags - UNIQUE per deal */}
      <title>{truncatedTitle}</title>
      <meta name="title" content={truncatedTitle} />
      <meta name="description" content={truncatedDescription} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL - slug-based when available */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots - Always indexable */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      
      {/* Open Graph */}
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
      <meta name="geo.placename" content={locality} />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(offerSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      {localBusinessSchema && (
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      )}
    </Helmet>
  );
}

export default EnhancedDealSEO;
