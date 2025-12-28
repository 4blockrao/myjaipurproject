import { Helmet } from "react-helmet-async";

const BASE_URL = "https://jaipurcircle.com";
const SITE_NAME = "JaipurCircle";
const DEFAULT_IMAGE = "/og-image.png";

interface PropertySEOProps {
  property: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    property_type: string;
    listing_type: 'sale' | 'rent';
    price: number;
    bedrooms?: number | null;
    bathrooms?: number | null;
    carpet_area?: number | null;
    locality: string;
    locality_slug?: string | null;
    address?: string | null;
    pincode?: string | null;
    cover_image?: string | null;
    amenities?: string[] | null;
    is_verified?: boolean | null;
    is_featured?: boolean | null;
    meta_title?: string | null;
    meta_description?: string | null;
  };
}

const formatPrice = (price: number, listingType: string): string => {
  if (listingType === 'rent') {
    return `₹${price.toLocaleString('en-IN')}/month`;
  }
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Crore`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lakh`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
};

export const PropertySEO = ({ property }: PropertySEOProps) => {
  const canonicalUrl = `${BASE_URL}/properties/${property.slug}`;
  const priceText = formatPrice(property.price, property.listing_type);
  const listingText = property.listing_type === 'rent' ? 'For Rent' : 'For Sale';
  const bhkText = property.bedrooms ? `${property.bedrooms} BHK` : '';
  
  // SEO Title: {BHK} {Type} {For Sale/Rent} in {Locality} Jaipur | {Price} | JaipurCircle
  const pageTitle = property.meta_title || 
    `${bhkText} ${property.property_type} ${listingText} in ${property.locality}, Jaipur | ${priceText}`.trim();
  
  // Meta Description with transactional intent
  const pageDescription = property.meta_description || 
    `${bhkText} ${property.property_type} ${listingText.toLowerCase()} in ${property.locality}, Jaipur at ${priceText}. ${property.carpet_area ? `Area: ${property.carpet_area} sq.ft.` : ''} Contact owner directly on JaipurCircle.`.trim();
  
  const propertyImage = property.cover_image || `${BASE_URL}${DEFAULT_IMAGE}`;
  
  // Keywords targeting transactional intent
  const keywords = [
    `${bhkText} ${property.property_type} ${property.listing_type} ${property.locality}`,
    `${property.property_type} ${property.listing_type} ${property.locality} Jaipur`,
    `${property.locality} property`,
    `buy ${property.property_type} ${property.locality}`,
    property.listing_type === 'rent' && `rent ${property.property_type} ${property.locality}`,
    `Jaipur real estate`,
    `property in ${property.locality}`,
    `${property.property_type} for ${property.listing_type} in Jaipur`,
  ].filter(Boolean).join(', ');

  // RealEstateListing Schema.org
  const propertySchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": canonicalUrl,
    name: property.title,
    description: property.description || pageDescription,
    url: canonicalUrl,
    datePosted: new Date().toISOString(),
    image: propertyImage,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address || property.locality,
      addressLocality: property.locality,
      addressRegion: "Rajasthan",
      postalCode: property.pincode || "302001",
      addressCountry: "IN"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 26.9124,
      longitude: 75.7873
    },
    ...(property.bedrooms && { numberOfRooms: property.bedrooms }),
    ...(property.carpet_area && { floorSize: {
      "@type": "QuantitativeValue",
      value: property.carpet_area,
      unitCode: "SQF"
    }}),
    ...(property.amenities && property.amenities.length > 0 && {
      amenityFeature: property.amenities.map(a => ({
        "@type": "LocationFeatureSpecification",
        name: a.replace('-', ' '),
        value: true
      }))
    })
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Properties", item: `${BASE_URL}/properties` },
      { "@type": "ListItem", position: 3, name: property.locality, item: `${BASE_URL}/properties/in/${property.locality_slug || property.locality.toLowerCase().replace(/\s+/g, '-')}` },
      { "@type": "ListItem", position: 4, name: property.title, item: canonicalUrl }
    ]
  };

  // WebPage Schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: pageTitle,
    description: pageDescription,
    isPartOf: { "@type": "WebSite", "@id": `${BASE_URL}#website`, name: SITE_NAME, url: BASE_URL },
    primaryImageOfPage: { "@type": "ImageObject", url: propertyImage },
    inLanguage: "en-IN"
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
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={propertyImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@jaipurcircle" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={propertyImage} />
      
      {/* Location Meta */}
      <meta name="geo.region" content="IN-RJ" />
      <meta name="geo.placename" content={`${property.locality}, Jaipur`} />
      
      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(propertySchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
    </Helmet>
  );
};

// Properties List SEO
interface PropertiesListSEOProps {
  listingType?: 'sale' | 'rent' | 'all';
  propertyType?: string;
  locality?: string;
  localityName?: string;
  totalCount?: number;
}

export const PropertiesListSEO = ({ 
  listingType = 'all', 
  propertyType, 
  locality,
  localityName,
  totalCount = 0
}: PropertiesListSEOProps) => {
  let canonicalPath = '/properties';
  let pageTitle = 'Properties in Jaipur | Buy, Rent Apartments, Houses, Plots';
  let pageDescription = 'Find your dream property in Jaipur. Browse verified apartments, houses, villas, plots & commercial spaces for sale and rent across all localities.';

  if (locality && localityName) {
    canonicalPath = `/properties/in/${locality}`;
    const listingText = listingType === 'rent' ? 'for Rent' : listingType === 'sale' ? 'for Sale' : 'for Sale & Rent';
    pageTitle = `Properties ${listingText} in ${localityName}, Jaipur | ${totalCount}+ Listings`;
    pageDescription = `Browse ${totalCount}+ verified properties ${listingText.toLowerCase()} in ${localityName}, Jaipur. Find apartments, houses, villas with photos, prices & direct owner contact.`;
  } else if (listingType === 'rent') {
    pageTitle = 'Rental Properties in Jaipur | Apartments, Houses for Rent';
    pageDescription = 'Find rental properties in Jaipur. Browse apartments, houses, PG accommodations for rent with verified listings and owner contact.';
  } else if (listingType === 'sale') {
    pageTitle = 'Properties for Sale in Jaipur | Buy Apartments, Houses, Plots';
    pageDescription = 'Buy properties in Jaipur. Browse apartments, houses, villas, plots for sale with verified listings and direct owner contact.';
  }

  const canonicalUrl = `${BASE_URL}${canonicalPath}`;

  const keywords = [
    'properties in Jaipur',
    'real estate Jaipur',
    'buy property Jaipur',
    'rent property Jaipur',
    'apartments Jaipur',
    'houses for sale Jaipur',
    'flats for rent Jaipur',
    locality && `properties in ${localityName}`,
    locality && `${localityName} real estate`,
    propertyType && `${propertyType} in Jaipur`,
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
    about: { "@type": "Thing", name: "Real Estate in Jaipur" },
    inLanguage: "en-IN",
    numberOfItems: totalCount
  };

  // Breadcrumb Schema
  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Properties", item: `${BASE_URL}/properties` },
  ];
  
  if (locality && localityName) {
    breadcrumbItems.push({
      "@type": "ListItem", position: 3, name: localityName, item: canonicalUrl
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
      <meta name="geo.placename" content={locality ? `${localityName}, Jaipur` : 'Jaipur, Rajasthan'} />
      
      <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
};

export default PropertySEO;
