import { Helmet } from 'react-helmet-async';
import { generateSchema, SchemaData, PageType, detectPageType } from '@/lib/schemaEngine';
import { useLocation } from 'react-router-dom';

interface SchemaInjectorProps {
  pageType?: PageType;
  data?: Partial<SchemaData>;
  // Direct schema override (for custom schemas)
  schema?: object[];
}

/**
 * SchemaInjector - Dynamic JSON-LD Schema Injection Component
 * 
 * Automatically generates and injects structured data for:
 * - Homepage, Pillar pages, Sub-pillar pages
 * - Locality pages with nearby/micro localities
 * - News articles, Events, Deals
 * - Jobs, Businesses, Guides, FAQs
 * 
 * Usage:
 * <SchemaInjector pageType="news" data={{ title, description, url, publishedAt }} />
 */
export function SchemaInjector({ pageType, data, schema: customSchema }: SchemaInjectorProps) {
  const location = useLocation();
  
  // Auto-detect page type if not provided
  const detectedType = pageType || detectPageType(location.pathname);
  
  // Generate schema
  const schemaData: SchemaData = {
    pageType: detectedType,
    url: `https://www.jaipurcircle.com${location.pathname}`,
    ...data
  };
  
  const schemas = customSchema || generateSchema(schemaData);
  
  if (!schemas || schemas.length === 0) return null;

  return (
    <Helmet>
      {schemas.map((schemaItem, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
        >
          {JSON.stringify(schemaItem, null, 2)}
        </script>
      ))}
    </Helmet>
  );
}

/**
 * HomepageSchema - Pre-configured for homepage
 */
export function HomepageSchema() {
  return <SchemaInjector pageType="homepage" />;
}

/**
 * NewsSchema - For news article pages
 */
export function NewsSchema({ 
  title, 
  description, 
  image, 
  publishedAt, 
  updatedAt,
  url 
}: {
  title: string;
  description?: string;
  image?: string;
  publishedAt?: string;
  updatedAt?: string;
  url?: string;
}) {
  return (
    <SchemaInjector 
      pageType="news" 
      data={{ title, description, image, publishedAt, updatedAt, url }} 
    />
  );
}

/**
 * EventSchema - For event detail pages
 */
export function EventSchema({
  title,
  description,
  image,
  startDate,
  endDate,
  venue,
  address,
  ticketUrl,
  price,
  url
}: {
  title: string;
  description?: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  address?: string;
  ticketUrl?: string;
  price?: number;
  url?: string;
}) {
  return (
    <SchemaInjector
      pageType="event"
      data={{ title, description, image, startDate, endDate, venue, address, ticketUrl, price, url }}
    />
  );
}

/**
 * DealSchema - For deal/offer pages
 */
export function DealSchema({
  title,
  description,
  discount,
  expiry,
  businessName,
  url
}: {
  title: string;
  description?: string;
  discount?: number;
  expiry?: string;
  businessName?: string;
  url?: string;
}) {
  return (
    <SchemaInjector
      pageType="deal"
      data={{ title, description, discount, expiry, businessName, url }}
    />
  );
}

/**
 * LocalitySchema - For locality/area pages with enhanced data
 */
export function LocalitySchema({
  name,
  slug,
  zone,
  municipality,
  police_station,
  pin_codes,
  micro_localities,
  nearby_localities,
  assembly_constituency,
  geo
}: {
  name: string;
  slug: string;
  zone?: string;
  municipality?: string;
  police_station?: string;
  pin_codes?: string[];
  micro_localities?: string[];
  nearby_localities?: { name: string; slug: string }[];
  assembly_constituency?: string;
  geo?: { lat: number; lng: number };
}) {
  return (
    <SchemaInjector
      pageType="locality"
      data={{
        locality: {
          id: slug,
          name,
          slug,
          zone,
          municipality,
          police_station,
          pin_codes,
          micro_localities,
          nearby_localities,
          assembly_constituency,
          geo
        }
      }}
    />
  );
}

/**
 * BusinessSchema - For merchant/business pages
 */
export function BusinessSchema({
  name,
  image,
  phone,
  address,
  cuisines,
  url
}: {
  name: string;
  image?: string;
  phone?: string;
  address?: string;
  cuisines?: string[];
  url?: string;
}) {
  return (
    <SchemaInjector
      pageType="business"
      data={{ name, image, phone, address, cuisines, url }}
    />
  );
}

/**
 * FAQSchema - For FAQ pages
 */
export function FAQSchema({
  faqs
}: {
  faqs: { question: string; answer: string }[];
}) {
  return (
    <SchemaInjector
      pageType="faq"
      data={{ faqs }}
    />
  );
}

/**
 * PillarSchema - For category/pillar pages
 */
export function PillarSchema({
  title,
  description,
  items
}: {
  title: string;
  description?: string;
  items?: { url: string; name?: string }[];
}) {
  return (
    <SchemaInjector
      pageType="pillar"
      data={{ title, description, items }}
    />
  );
}

export default SchemaInjector;
