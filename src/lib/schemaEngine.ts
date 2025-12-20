// Dynamic Schema Injection Engine for JaipurCircle.com
// Supports 11 page types with full JSON-LD schema generation

export type PageType = 
  | 'homepage' 
  | 'pillar' 
  | 'subpillar' 
  | 'locality' 
  | 'news' 
  | 'event' 
  | 'deal' 
  | 'job' 
  | 'business' 
  | 'guide' 
  | 'faq';

export interface Locality {
  id: string;
  name: string;
  slug: string;
  zone?: string;
  municipality?: string;
  police_station?: string;
  pin_codes?: string[];
  micro_localities?: string[];
  nearby_localities?: { name: string; slug: string }[];
  assembly_constituency?: string;
  adjacent_localities?: string[];
  geo?: { lat: number; lng: number };
}

export interface SchemaData {
  pageType: PageType;
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  // Pillar/Subpillar
  items?: { url: string; name?: string }[];
  pillarName?: string;
  pillarUrl?: string;
  // News
  publishedAt?: string;
  updatedAt?: string;
  // Event
  startDate?: string;
  endDate?: string;
  venue?: string;
  address?: string;
  ticketUrl?: string;
  price?: number;
  // Deal
  discount?: number;
  expiry?: string;
  businessName?: string;
  // Job
  datePosted?: string;
  employmentType?: string;
  company?: string;
  // Business
  name?: string;
  phone?: string;
  cuisines?: string[];
  // Locality
  locality?: Locality;
  // FAQ
  faqs?: { question: string; answer: string }[];
}

const SITE_URL = 'https://www.jaipurcircle.com';
const SITE_NAME = 'JaipurCircle';
const LOGO_URL = `${SITE_URL}/logo.png`;

// ──────────────────
// 🔵 HOMEPAGE SCHEMA
// ──────────────────
const homepageSchema = () => [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    "name": SITE_NAME,
    "url": SITE_URL,
    "logo": LOGO_URL,
    "sameAs": [
      "https://twitter.com/jaipurcircle",
      "https://facebook.com/jaipurcircle",
      "https://instagram.com/jaipurcircle"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Jaipur",
      "addressRegion": "Rajasthan",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["English", "Hindi"]
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    "url": SITE_URL,
    "name": "JaipurCircle - Your Complete Guide to Jaipur",
    "description": "Discover deals, events, news, and local businesses in Jaipur. Your trusted local platform for everything Pink City.",
    "isPartOf": { "@id": `${SITE_URL}/#website` },
    "about": { "@id": `${SITE_URL}/#organization` }
  }
];

// ──────────────────
// 🔵 PILLAR PAGE SCHEMA (8 pages)
// ──────────────────
const pillarSchema = (data: SchemaData) => [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": data.title,
    "description": data.description,
    "url": data.url,
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
        { "@type": "ListItem", "position": 2, "name": data.title, "item": data.url }
      ]
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": data.items?.map((x, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": x.url,
        "name": x.name
      })) || []
    }
  }
];

// ──────────────────
// 🔵 SUB-PILLAR PAGE SCHEMA (≈80 pages)
// ──────────────────
const subpillarSchema = (data: SchemaData) => [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": data.title,
    "description": data.description,
    "url": data.url,
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
        { "@type": "ListItem", "position": 2, "name": data.pillarName, "item": data.pillarUrl },
        { "@type": "ListItem", "position": 3, "name": data.title, "item": data.url }
      ]
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": data.items?.map((x, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": x.url,
        "name": x.name
      })) || []
    }
  }
];

// ──────────────────
// 🔵 LOCALITY PAGE SCHEMA (Enhanced with nearby localities)
// ──────────────────
const localitySchema = (data: SchemaData) => {
  const loc = data.locality;
  if (!loc) return [];

  const schemas: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "Place",
      "@id": `${SITE_URL}/jaipur/${loc.slug}#place`,
      "name": `${loc.name}, Jaipur`,
      "url": `${SITE_URL}/jaipur/${loc.slug}`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": loc.name,
        "addressRegion": "Rajasthan",
        "postalCode": loc.pin_codes?.join(", "),
        "addressCountry": "IN"
      },
      ...(loc.geo && {
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": loc.geo.lat,
          "longitude": loc.geo.lng
        }
      }),
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": loc.zone || loc.municipality || "Jaipur"
      },
      "amenityFeature": loc.police_station ? [
        {
          "@type": "LocationFeatureSpecification",
          "name": "Police Station",
          "value": loc.police_station
        }
      ] : undefined,
      "additionalProperty": loc.assembly_constituency ? [
        {
          "@type": "PropertyValue",
          "name": "Assembly Constituency",
          "value": loc.assembly_constituency
        }
      ] : undefined
    }
  ];

  // Add nearby localities as ItemList
  if (loc.nearby_localities && loc.nearby_localities.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `Nearby Localities to ${loc.name}`,
      "itemListElement": loc.nearby_localities.map((nearby, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": `${SITE_URL}/jaipur/${nearby.slug}`,
        "name": nearby.name
      }))
    });
  }

  // Add micro localities as ItemList
  if (loc.micro_localities && loc.micro_localities.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `Micro Localities within ${loc.name}`,
      "itemListElement": loc.micro_localities.map((micro, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": micro
      }))
    });
  }

  // Add breadcrumb
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Jaipur", "item": `${SITE_URL}/jaipur` },
      { "@type": "ListItem", "position": 3, "name": loc.name, "item": `${SITE_URL}/jaipur/${loc.slug}` }
    ]
  });

  return schemas;
};

// ──────────────────
// 🔵 NEWS ARTICLE SCHEMA
// ──────────────────
const newsSchema = (data: SchemaData) => [
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": data.title,
    "datePublished": data.publishedAt,
    "dateModified": data.updatedAt || data.publishedAt,
    "description": data.description,
    "url": data.url,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": data.url
    },
    "author": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": LOGO_URL
      }
    },
    "image": data.image ? {
      "@type": "ImageObject",
      "url": data.image
    } : undefined
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "News", "item": `${SITE_URL}/news` },
      { "@type": "ListItem", "position": 3, "name": data.title, "item": data.url }
    ]
  }
];

// ──────────────────
// 🔵 EVENT SCHEMA
// ──────────────────
const eventSchema = (data: SchemaData) => [
  {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": data.title,
    "startDate": data.startDate,
    "endDate": data.endDate,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": data.venue,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": data.address,
        "addressLocality": "Jaipur",
        "addressRegion": "Rajasthan",
        "addressCountry": "IN"
      }
    },
    "image": data.image,
    "description": data.description,
    "organizer": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL
    },
    ...(data.ticketUrl && {
      "offers": {
        "@type": "Offer",
        "url": data.ticketUrl,
        "price": data.price || 0,
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "validFrom": new Date().toISOString()
      }
    })
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Events", "item": `${SITE_URL}/events` },
      { "@type": "ListItem", "position": 3, "name": data.title, "item": data.url }
    ]
  }
];

// ──────────────────
// 🔵 DEAL / OFFER SCHEMA
// ──────────────────
const dealSchema = (data: SchemaData) => [
  {
    "@context": "https://schema.org",
    "@type": "Offer",
    "name": data.title,
    "url": data.url,
    "description": data.description,
    "price": data.discount,
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock",
    "availabilityEnds": data.expiry,
    "seller": {
      "@type": "Organization",
      "name": SITE_NAME
    },
    "itemOffered": {
      "@type": "LocalBusiness",
      "name": data.businessName,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Jaipur",
        "addressRegion": "Rajasthan",
        "addressCountry": "IN"
      }
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Deals", "item": `${SITE_URL}/deals` },
      { "@type": "ListItem", "position": 3, "name": data.title, "item": data.url }
    ]
  }
];

// ──────────────────
// 🔵 JOB POSTING SCHEMA
// ──────────────────
const jobSchema = (data: SchemaData) => [
  {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": data.title,
    "description": data.description,
    "datePosted": data.datePosted,
    "validThrough": data.expiry,
    "employmentType": data.employmentType || "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": data.company,
      "sameAs": SITE_URL
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Jaipur",
        "addressRegion": "Rajasthan",
        "addressCountry": "IN"
      }
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Jobs", "item": `${SITE_URL}/jobs` },
      { "@type": "ListItem", "position": 3, "name": data.title, "item": data.url }
    ]
  }
];

// ──────────────────
// 🔵 BUSINESS / RESTAURANT SCHEMA
// ──────────────────
const businessSchema = (data: SchemaData) => [
  {
    "@context": "https://schema.org",
    "@type": data.cuisines ? "Restaurant" : "LocalBusiness",
    "name": data.name || data.title,
    "image": data.image,
    "url": data.url,
    "@id": data.url,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": data.address,
      "addressLocality": "Jaipur",
      "addressRegion": "Rajasthan",
      "addressCountry": "IN"
    },
    "telephone": data.phone,
    ...(data.cuisines && { "servesCuisine": data.cuisines }),
    "priceRange": "₹₹",
    "areaServed": {
      "@type": "City",
      "name": "Jaipur"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Businesses", "item": `${SITE_URL}/merchants` },
      { "@type": "ListItem", "position": 3, "name": data.name || data.title, "item": data.url }
    ]
  }
];

// ──────────────────
// 🔵 GUIDE / ARTICLE SCHEMA
// ──────────────────
const guideSchema = (data: SchemaData) => [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": data.title,
    "description": data.description,
    "url": data.url,
    "image": data.image,
    "datePublished": data.publishedAt,
    "dateModified": data.updatedAt || data.publishedAt,
    "author": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": LOGO_URL
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": data.url
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Guides", "item": `${SITE_URL}/guides` },
      { "@type": "ListItem", "position": 3, "name": data.title, "item": data.url }
    ]
  }
];

// ──────────────────
// 🔵 FAQ PAGE SCHEMA
// ──────────────────
const faqSchema = (data: SchemaData) => [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faqs?.map((q) => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    })) || []
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "FAQ", "item": `${SITE_URL}/help` }
    ]
  }
];

// ──────────────────
// 🔵 MASTER SCHEMA GENERATOR
// ──────────────────
export function generateSchema(data: SchemaData): object[] {
  switch (data.pageType) {
    case 'homepage':
      return homepageSchema();
    case 'pillar':
      return pillarSchema(data);
    case 'subpillar':
      return subpillarSchema(data);
    case 'locality':
      return localitySchema(data);
    case 'news':
      return newsSchema(data);
    case 'event':
      return eventSchema(data);
    case 'deal':
      return dealSchema(data);
    case 'job':
      return jobSchema(data);
    case 'business':
      return businessSchema(data);
    case 'guide':
      return guideSchema(data);
    case 'faq':
      return faqSchema(data);
    default:
      return [];
  }
}

// Helper to detect page type from URL
export function detectPageType(pathname: string): PageType {
  if (pathname === '/' || pathname === '') return 'homepage';
  if (pathname.startsWith('/news/')) return 'news';
  if (pathname.startsWith('/events/')) return 'event';
  if (pathname.startsWith('/deals/') || pathname.startsWith('/deal/')) return 'deal';
  if (pathname.startsWith('/jobs/')) return 'job';
  if (pathname.startsWith('/merchants/') || pathname.startsWith('/merchant/')) return 'business';
  if (pathname.startsWith('/jaipur/')) return 'locality';
  if (pathname.startsWith('/guides/') || pathname.startsWith('/guide/')) return 'guide';
  if (pathname === '/help' || pathname === '/faq') return 'faq';
  
  // Check for pillar pages
  const pillarPages = ['/deals', '/events', '/news', '/jobs', '/merchants', '/explore', '/categories', '/challenges'];
  if (pillarPages.includes(pathname)) return 'pillar';
  
  return 'pillar'; // Default to pillar for category-like pages
}
