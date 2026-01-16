/**
 * DealPrerenderedContent - Crawlable HTML content for deal pages
 * 
 * This component renders SEO-critical content that is visible in page source
 * before React hydrates. It provides:
 * - Unique H1 with deal title, price, and location
 * - Crawlable text block (150-300 words) describing the deal
 * - Visible content for Google and AI search engines
 * - Handles expired deals with "Deal Expired" state
 */

import { format, isPast } from 'date-fns';

interface DealPrerenderedContentProps {
  deal: {
    id: string;
    slug?: string;
    title: string;
    description?: string;
    category?: string;
    subcategory?: string;
    location?: string;
    original_price?: number;
    discounted_price?: number;
    discount_percentage?: number;
    start_date?: string;
    end_date?: string;
    max_redemptions?: number;
    current_redemptions?: number;
    inventory_count?: number;
    terms_conditions?: string;
    tags?: string[];
    merchant?: {
      business_name: string;
      business_type?: string;
      address?: string;
      locality?: string;
      phone?: string;
      average_rating?: number;
      total_reviews?: number;
      is_verified?: boolean;
    };
  };
}

export function DealPrerenderedContent({ deal }: DealPrerenderedContentProps) {
  const merchant = deal.merchant;
  const locality = deal.location || merchant?.locality || 'Jaipur';
  const isExpired = deal.end_date ? isPast(new Date(deal.end_date)) : false;
  
  // Calculate availability
  const isUnlimited = !deal.max_redemptions && !deal.inventory_count;
  const available = isUnlimited 
    ? 999 
    : Math.max(
        (deal.max_redemptions || 0) - (deal.current_redemptions || 0),
        deal.inventory_count || 0
      );
  const inStock = available > 0 && !isExpired;

  // Format price for display
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
  
  // Calculate savings
  const savings = deal.original_price && deal.discounted_price 
    ? deal.original_price - deal.discounted_price 
    : 0;

  // Generate SEO-optimized H1
  const h1Title = merchant?.business_name
    ? `${deal.title} - ${deal.discount_percentage}% Off at ${merchant.business_name}, ${locality}`
    : `${deal.title} - ${deal.discount_percentage}% Off in ${locality}, Jaipur`;

  // Generate crawlable description (150-300 words)
  const generateDescription = () => {
    const parts: string[] = [];
    
    // Opening paragraph with deal name and value proposition
    if (isExpired) {
      parts.push(
        `This deal "${deal.title}" has expired. ` +
        `The offer was available at ${merchant?.business_name || 'a local merchant'} in ${locality}, Jaipur. ` +
        `Browse our latest deals for similar offers.`
      );
    } else {
      parts.push(
        `Save ${deal.discount_percentage}% on ${deal.title} at ${merchant?.business_name || 'a trusted local merchant'} in ${locality}, Jaipur. ` +
        `Get this amazing deal for just ${formatPrice(deal.discounted_price || 0)} ` +
        `(original price ${formatPrice(deal.original_price || 0)}).`
      );
    }

    // Merchant and location context
    if (merchant?.business_name && !isExpired) {
      parts.push(
        `${merchant.business_name} is a ${merchant.business_type || 'local business'} ` +
        `located in ${locality}, Jaipur${merchant.address ? ` at ${merchant.address}` : ''}. ` +
        (merchant.is_verified ? 'This is a verified merchant on JaipurCircle. ' : '') +
        (merchant.average_rating && merchant.total_reviews 
          ? `Rated ${merchant.average_rating}/5 based on ${merchant.total_reviews} customer reviews.`
          : '')
      );
    }

    // Deal description
    if (deal.description && !isExpired) {
      parts.push(deal.description);
    }

    // Price and savings highlight
    if (!isExpired && savings > 0) {
      parts.push(
        `You save ${formatPrice(savings)} with this exclusive offer. ` +
        `The discounted price of ${formatPrice(deal.discounted_price || 0)} is ` +
        `${deal.discount_percentage}% less than the regular price.`
      );
    }

    // Availability and validity
    if (!isExpired) {
      const validityParts: string[] = [];
      
      if (deal.end_date) {
        validityParts.push(
          `This deal is valid until ${format(new Date(deal.end_date), 'MMMM d, yyyy')}`
        );
      }
      
      if (!isUnlimited && available > 0) {
        validityParts.push(`Only ${available} vouchers remaining`);
      }
      
      if (validityParts.length > 0) {
        parts.push(validityParts.join('. ') + '.');
      }
    }

    // Category context
    if (deal.category && !isExpired) {
      parts.push(
        `This ${deal.category}${deal.subcategory ? ` (${deal.subcategory})` : ''} deal ` +
        `is one of the best offers available in ${locality}. ` +
        `JaipurCircle brings you verified deals from trusted local merchants in Jaipur.`
      );
    }

    // Terms summary if available
    if (deal.terms_conditions && !isExpired) {
      const termsSnippet = deal.terms_conditions.substring(0, 150);
      parts.push(`Terms and conditions apply: ${termsSnippet}...`);
    }

    return parts.join(' ');
  };

  // This content is always rendered in HTML, visible to crawlers
  // React will hydrate on top without changing the visible content
  return (
    <article 
      className="sr-only-focusable deal-seo-content"
      itemScope 
      itemType="https://schema.org/Product"
    >
      {/* SEO H1 - Critical for crawlers */}
      <h1 
        itemProp="name" 
        className="text-2xl font-bold text-foreground"
        data-seo-h1="true"
      >
        {h1Title}
      </h1>

      {/* Price information */}
      <div 
        itemProp="offers" 
        itemScope 
        itemType="https://schema.org/Offer"
        className="deal-price-block"
      >
        <meta itemProp="priceCurrency" content="INR" />
        <span itemProp="price" content={String(deal.discounted_price || 0)}>
          Price: {formatPrice(deal.discounted_price || 0)}
        </span>
        {deal.original_price && deal.original_price > (deal.discounted_price || 0) && (
          <span className="line-through ml-2">
            Was: {formatPrice(deal.original_price)}
          </span>
        )}
        <meta 
          itemProp="availability" 
          content={inStock ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut'} 
        />
        {deal.end_date && (
          <meta itemProp="priceValidUntil" content={deal.end_date} />
        )}
      </div>

      {/* Location */}
      <div className="deal-location">
        <span itemProp="areaServed">{locality}, Jaipur, Rajasthan</span>
      </div>

      {/* Merchant info */}
      {merchant?.business_name && (
        <div 
          itemProp="brand" 
          itemScope 
          itemType="https://schema.org/Brand"
          className="deal-merchant"
        >
          <span itemProp="name">Offered by: {merchant.business_name}</span>
        </div>
      )}

      {/* Crawlable description block (150-300 words) */}
      <div 
        className="deal-description prose prose-sm max-w-none"
        itemProp="description"
      >
        <p>{generateDescription()}</p>
      </div>

      {/* Tags for additional context */}
      {deal.tags && deal.tags.length > 0 && (
        <div className="deal-tags">
          <span>Related: </span>
          {deal.tags.map((tag, index) => (
            <span key={tag} itemProp="keywords">
              {tag}{index < deal.tags!.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      )}

      {/* Status indicator */}
      {isExpired && (
        <div className="deal-expired-notice text-destructive font-semibold">
          <p>⚠️ This deal has expired.</p>
          <p>Looking for similar deals? Browse our latest offers in {locality}.</p>
        </div>
      )}
    </article>
  );
}

export default DealPrerenderedContent;
