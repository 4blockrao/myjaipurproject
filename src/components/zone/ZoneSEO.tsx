import { Helmet } from 'react-helmet-async';

interface ZoneSEOProps {
  zone: {
    name: string;
    slug: string;
    totalLocalities: number;
    localities: any[];
    allPinCodes: string[];
    uniqueWards: string[];
  };
}

export function ZoneSEO({ zone }: ZoneSEOProps) {
  const title = `${zone.name} Zone, Jaipur – Localities, Wards, Map & Pin Codes (2025)`;
  
  const description = `Explore ${zone.name} Zone in Jaipur with ${zone.totalLocalities} localities. Find ward details, pin codes, nearby areas, connectivity, news, and events in ${zone.name} Zone, Rajasthan.`;

  const canonicalUrl = `https://www.jaipurcircle.com/jaipur/zones/${zone.slug}`;

  const localityNames = zone.localities.slice(0, 10).map(l => l.name);

  // Place Schema for the zone
  const placeSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${zone.name} Zone`,
    description: `${zone.name} Zone is an administrative zone in Jaipur, Rajasthan, India comprising ${zone.totalLocalities} localities.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jaipur",
      addressRegion: "Rajasthan",
      addressCountry: "IN",
      postalCode: zone.allPinCodes[0] || "",
    },
    containedInPlace: {
      "@type": "City",
      name: "Jaipur",
      containedInPlace: {
        "@type": "State",
        name: "Rajasthan",
      },
    },
  };

  // ItemList Schema for localities
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Localities in ${zone.name} Zone, Jaipur`,
    description: `Complete list of ${zone.totalLocalities} localities in ${zone.name} Zone`,
    numberOfItems: zone.totalLocalities,
    itemListElement: zone.localities.slice(0, 50).map((locality, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Place",
        name: locality.name,
        url: `https://www.jaipurcircle.com/jaipur/${locality.slug}`,
      },
    })),
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.jaipurcircle.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Jaipur",
        item: "https://www.jaipurcircle.com/jaipur",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${zone.name} Zone`,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={`${zone.name} zone jaipur, ${localityNames.join(", ")}, ${zone.name} localities, jaipur zones`} />
      
      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:site_name" content="JaipurCircle" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {/* Geo Tags */}
      <meta name="geo.region" content="IN-RJ" />
      <meta name="geo.placename" content={`${zone.name} Zone, Jaipur`} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(placeSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(itemListSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
}
