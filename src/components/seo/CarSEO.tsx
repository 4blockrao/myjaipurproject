import { Helmet } from "react-helmet-async";

const BASE_URL = "https://jaipurcircle.com";
const SITE_NAME = "JaipurCircle";

interface CarModelSEOProps {
  car: {
    id: string;
    name: string;
    slug: string;
    brand?: { name: string; slug: string } | null;
    body_type?: string | null;
    fuel_type?: string | null;
    transmission?: string | null;
    seating_capacity?: number | null;
    on_road_price_jaipur_min?: number | null;
    on_road_price_jaipur_max?: number | null;
    ex_showroom_price_min?: number | null;
    cover_image?: string | null;
    is_ev?: boolean | null;
    is_new_launch?: boolean | null;
    meta_title?: string | null;
    meta_description?: string | null;
  };
}

const formatPrice = (price: number): string => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lakh`;
  return `₹${price.toLocaleString('en-IN')}`;
};

export const CarModelSEO = ({ car }: CarModelSEOProps) => {
  const brandName = car.brand?.name || '';
  const brandSlug = car.brand?.slug || '';
  const canonicalUrl = `${BASE_URL}/cars/${brandSlug}/${car.slug}/on-road-price-in-jaipur`;
  
  const priceRange = car.on_road_price_jaipur_min && car.on_road_price_jaipur_max
    ? `${formatPrice(car.on_road_price_jaipur_min)} - ${formatPrice(car.on_road_price_jaipur_max)}`
    : 'Price on Request';
  
  // SEO Title: {Brand} {Model} On-Road Price in Jaipur 2025 | {Price Range}
  const currentYear = new Date().getFullYear();
  const pageTitle = car.meta_title || 
    `${brandName} ${car.name} On-Road Price in Jaipur ${currentYear} | ${priceRange}`;
  
  // Transactional Meta Description
  const pageDescription = car.meta_description || 
    `${brandName} ${car.name} on-road price in Jaipur starts from ${formatPrice(car.on_road_price_jaipur_min || 0)}. Check variants, features, ${car.fuel_type || 'petrol'} mileage, and book test drive at authorized ${brandName} dealers in Jaipur.`;
  
  const carImage = car.cover_image || `${BASE_URL}/og-image.png`;
  
  // Transactional keywords
  const keywords = [
    `${brandName} ${car.name} price Jaipur`,
    `${brandName} ${car.name} on road price`,
    `${car.name} Jaipur`,
    `${brandName} showroom Jaipur`,
    `${car.name} test drive Jaipur`,
    car.is_ev && `${car.name} EV Jaipur`,
    car.body_type && `${car.body_type} cars Jaipur`,
    `best ${car.fuel_type || 'petrol'} cars Jaipur`,
    `${brandName} dealers Jaipur`,
  ].filter(Boolean).join(', ');

  // Product Schema for Car
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": canonicalUrl,
    name: `${brandName} ${car.name}`,
    description: pageDescription,
    url: canonicalUrl,
    image: carImage,
    brand: {
      "@type": "Brand",
      name: brandName
    },
    category: car.body_type || "Car",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: car.on_road_price_jaipur_min,
      highPrice: car.on_road_price_jaipur_max,
      offerCount: 1,
      availability: "https://schema.org/InStock",
      areaServed: {
        "@type": "City",
        name: "Jaipur"
      }
    },
    ...(car.fuel_type && { fuelType: car.fuel_type }),
    ...(car.seating_capacity && { seatingCapacity: car.seating_capacity }),
    ...(car.transmission && { vehicleTransmission: car.transmission })
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Cars", item: `${BASE_URL}/cars` },
      { "@type": "ListItem", position: 3, name: brandName, item: `${BASE_URL}/cars/${brandSlug}` },
      { "@type": "ListItem", position: 4, name: car.name, item: canonicalUrl }
    ]
  };

  // FAQ Schema for common questions
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the on-road price of ${brandName} ${car.name} in Jaipur?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The on-road price of ${brandName} ${car.name} in Jaipur ranges from ${priceRange}. This includes ex-showroom price, road tax, insurance, and registration charges.`
        }
      },
      {
        "@type": "Question",
        name: `Where can I book a ${brandName} ${car.name} test drive in Jaipur?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `You can book a test drive at authorized ${brandName} dealerships in Jaipur through JaipurCircle. We connect you with verified dealers across Mansarovar, Tonk Road, Vaishali Nagar, and other localities.`
        }
      }
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle} | {SITE_NAME}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content="product" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={carImage} />
      <meta property="og:locale" content="en_IN" />
      <meta property="product:price:amount" content={String(car.on_road_price_jaipur_min || 0)} />
      <meta property="product:price:currency" content="INR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@jaipurcircle" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={carImage} />
      
      {/* Location Meta */}
      <meta name="geo.region" content="IN-RJ" />
      <meta name="geo.placename" content="Jaipur, Rajasthan" />
      
      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>
  );
};

// Cars Hub List SEO
interface CarsListSEOProps {
  brand?: { name: string; slug: string };
  bodyType?: string;
  fuelType?: string;
  totalCount?: number;
}

export const CarsListSEO = ({ brand, bodyType, fuelType, totalCount = 0 }: CarsListSEOProps) => {
  const currentYear = new Date().getFullYear();
  let canonicalPath = '/cars';
  let pageTitle = `Cars in Jaipur ${currentYear} — Prices, Dealers, EVs & Buying Guide`;
  let pageDescription = 'Complete guide to buying cars in Jaipur. Compare on-road prices, find authorized dealers, explore EVs, and read ownership stories. Your hyperlocal car research hub.';

  if (brand) {
    canonicalPath = `/cars/${brand.slug}`;
    pageTitle = `${brand.name} Cars in Jaipur ${currentYear} | On-Road Prices & Dealers`;
    pageDescription = `${brand.name} car prices in Jaipur. Compare on-road prices, find ${brand.name} showrooms, book test drives. Complete ${brand.name} buying guide for Jaipur.`;
  }

  if (bodyType) {
    pageTitle = `Best ${bodyType} Cars in Jaipur ${currentYear} | Prices & Reviews`;
    pageDescription = `Compare ${bodyType.toLowerCase()} cars in Jaipur with on-road prices, features, and dealer info.`;
  }

  const canonicalUrl = `${BASE_URL}${canonicalPath}`;

  const keywords = [
    'cars in Jaipur',
    'car dealers Jaipur',
    'on road price Jaipur',
    'car showroom Jaipur',
    'test drive Jaipur',
    brand && `${brand.name} Jaipur`,
    brand && `${brand.name} showroom Jaipur`,
    bodyType && `${bodyType} cars Jaipur`,
    fuelType && `${fuelType} cars Jaipur`,
    'EV cars Jaipur',
    'used cars Jaipur',
  ].filter(Boolean).join(', ');

  // CollectionPage Schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: pageTitle,
    description: pageDescription,
    isPartOf: { "@type": "WebSite", "@id": `${BASE_URL}#website`, name: SITE_NAME, url: BASE_URL },
    about: { "@type": "Thing", name: brand ? `${brand.name} Cars` : "Cars in Jaipur" },
    inLanguage: "en-IN",
    numberOfItems: totalCount
  };

  // Breadcrumb Schema
  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Cars", item: `${BASE_URL}/cars` },
  ];
  
  if (brand) {
    breadcrumbItems.push({
      "@type": "ListItem", position: 3, name: brand.name, item: canonicalUrl
    });
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems
  };

  return (
    <Helmet>
      <title>{pageTitle} | {SITE_NAME}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <link rel="canonical" href={canonicalUrl} />
      
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:locale" content="en_IN" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@jaipurcircle" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      
      <meta name="geo.region" content="IN-RJ" />
      <meta name="geo.placename" content="Jaipur, Rajasthan" />
      
      <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
};

export default CarModelSEO;
