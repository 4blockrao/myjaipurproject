import { Helmet } from "react-helmet-async";

interface LocalitySEOProps {
  locality: {
    id: number;
    name: string;
    slug: string;
    zone: string | null;
    municipality: string | null;
    ward_number: string | null;
    ward_name: string | null;
    police_station: string | null;
    pin_codes: string[] | null;
    assembly_constituency: string | null;
    population_estimate: number | null;
    geo_lat: number | null;
    geo_lng: number | null;
    micro_localities: string[] | null;
    nearby_localities: string[] | null;
    adjacent_localities: string[] | null;
    major_landmarks: unknown;
    connectivity: Record<string, unknown> | null;
    tags: string[] | null;
  };
}

export function LocalitySEO({ locality }: LocalitySEOProps) {
  if (!locality) return null;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
  
  // Unique SEO-optimized title: {Locality}, Jaipur — Locality Guide, Ward, PIN, Nearby Areas
  const title = `${locality.name}, Jaipur — Locality Guide, Ward, PIN, Nearby Areas`;

  // Unique meta description: 150-160 chars, factual, no adjectives
  const nearbyList = (locality.nearby_localities || [])
    .slice(0, 3)
    .map((l: string) => l.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()))
    .join(", ") || "central Jaipur";
  
  const pinCode = locality.pin_codes?.[0] || "302xxx";
  const wardInfo = locality.ward_number ? `Ward ${locality.ward_number}` : "";
  const zoneInfo = locality.zone ? `${locality.zone} Zone` : "Jaipur";
  
  // Unique, factual description for this locality
  const description = `${locality.name} in ${zoneInfo}, Jaipur${wardInfo ? `, ${wardInfo}` : ""}. PIN ${pinCode}. Near ${nearbyList}. Ward details, pin codes, map & connectivity.`.slice(0, 160);

  const canonicalUrl = `https://www.jaipurcircle.com/jaipur/${locality.slug}`;
  const ogImage = "https://www.jaipurcircle.com/og-images/locality-default.png";
  
  // EEAT Signal: Last updated timestamp
  const lastUpdated = `${currentMonth} ${currentYear}`;
  
  // Characteristics for schema
  const characteristics = (locality.tags || []).slice(0, 2).join(" & ") || "residential area";

  // Place Schema
  const placeSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${locality.name}, Jaipur`,
    description: `${locality.name} is a locality in ${locality.zone || "central"} Jaipur, Rajasthan, India. ${characteristics}.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: locality.name,
      addressRegion: "Jaipur, Rajasthan",
      postalCode: locality.pin_codes?.[0],
      addressCountry: "IN",
    },
    geo: locality.geo_lat && locality.geo_lng ? {
      "@type": "GeoCoordinates",
      latitude: locality.geo_lat,
      longitude: locality.geo_lng,
    } : undefined,
    hasMap: locality.geo_lat && locality.geo_lng 
      ? `https://maps.google.com/?q=${locality.geo_lat},${locality.geo_lng}` 
      : `https://maps.google.com/?q=${encodeURIComponent(`${locality.name}, Jaipur, Rajasthan`)}`,
    containedInPlace: {
      "@type": "City",
      name: "Jaipur",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Rajasthan",
        addressCountry: "IN",
      },
    },
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
      ...(locality.zone ? [{
        "@type": "ListItem",
        position: 3,
        name: locality.zone,
        item: `https://www.jaipurcircle.com/jaipur?zone=${encodeURIComponent(locality.zone)}`,
      }] : []),
      {
        "@type": "ListItem",
        position: locality.zone ? 4 : 3,
        name: locality.name,
        item: canonicalUrl,
      },
    ],
  };

  // Nearby Localities ItemList Schema
  const nearbyListSchema = locality.nearby_localities?.length ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Nearby Localities of ${locality.name}`,
    description: `Localities adjacent to and near ${locality.name}, Jaipur`,
    itemListElement: locality.nearby_localities.map((slug, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      url: `https://www.jaipurcircle.com/jaipur/${slug}`,
    })),
  } : null;

  // FAQ Schema - auto-generated from locality data
  const connectivity = locality.connectivity || {};
  const faqEntries = [
    {
      question: `What is the pin code of ${locality.name}, Jaipur?`,
      answer: locality.pin_codes?.length
        ? `The pin codes for ${locality.name} include ${locality.pin_codes.join(", ")}.`
        : "Pin code details are being verified.",
    },
    {
      question: `Which zone does ${locality.name} fall under?`,
      answer: locality.zone
        ? `${locality.name} is located in the ${locality.zone} zone of Jaipur, Rajasthan.`
        : "Zone details are being verified.",
    },
    {
      question: `What is the ward number of ${locality.name}?`,
      answer: locality.ward_number
        ? `${locality.name} falls under Ward ${locality.ward_number}${
            locality.ward_name ? ` (${locality.ward_name})` : ""
          } of Jaipur Municipal Corporation.`
        : "Ward details are being verified.",
    },
    {
      question: `Which police station serves ${locality.name}?`,
      answer: locality.police_station
        ? `${locality.name} is administratively covered by ${locality.police_station} Police Station.`
        : "Police station details are being verified.",
    },
    {
      question: `Which localities are near ${locality.name}?`,
      answer: locality.nearby_localities?.length
        ? `Nearby localities include ${locality.nearby_localities
            .slice(0, 5)
            .map((l: string) => l.replace(/-/g, " "))
            .join(", ")}.`
        : "Nearby locality details are being verified.",
    },
    {
      question: `How is the connectivity of ${locality.name}, Jaipur?`,
      answer: (() => {
        const parts: string[] = [];
        const metro = connectivity.nearest_metro as string | undefined;
        const railway = connectivity.nearest_railway_station as string | undefined;
        const airportKm = connectivity.distance_to_airport_km as number | undefined;
        const airport = connectivity.distance_to_airport as string | undefined;
        
        if (metro) {
          parts.push(`The nearest metro station is ${metro}.`);
        }
        if (railway) {
          parts.push(`${railway} provides railway connectivity.`);
        }
        if (typeof airportKm === "number") {
          parts.push(`Jaipur International Airport is approximately ${airportKm} km away.`);
        } else if (airport) {
          parts.push(`Jaipur International Airport is ${airport} away.`);
        }
        return parts.length ? parts.join(" ") : "Connectivity details are being verified.";
      })(),
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  // Keywords for SEO
  const keywords = [
    `${locality.name} jaipur`,
    `${locality.name} pin code`,
    `${locality.name} ward number`,
    `${locality.name} map`,
    `${locality.name} news`,
    `nearby ${locality.name}`,
    ...(locality.tags || []),
  ].join(", ");

  return (
    <Helmet>
      {/* Primary Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* EEAT Trust Signals */}
      <meta name="last-updated" content={`Information verified as of ${lastUpdated}`} />
      <meta name="data-sources" content="Municipal ward data, urban zone references, locality boundaries, public infrastructure datasets" />
      <meta name="author" content="JaipurCircle Editorial Team" />
      <meta name="content-type" content="Locality Information Guide" />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="JaipurCircle" />
      <meta property="og:locale" content="en_IN" />
      <meta property="article:modified_time" content={new Date().toISOString()} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@jaipurcircle" />

      {/* Geo Tags */}
      {locality.geo_lat && locality.geo_lng && (
        <>
          <meta name="geo.position" content={`${locality.geo_lat};${locality.geo_lng}`} />
          <meta name="geo.placename" content={`${locality.name}, Jaipur, Rajasthan`} />
          <meta name="geo.region" content="IN-RJ" />
        </>
      )}

      {/* Schema: Place */}
      <script type="application/ld+json">
        {JSON.stringify(placeSchema)}
      </script>

      {/* Schema: Breadcrumb */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      {/* Schema: Nearby Localities ItemList */}
      {nearbyListSchema && (
        <script type="application/ld+json">
          {JSON.stringify(nearbyListSchema)}
        </script>
      )}

      {/* Schema: FAQ */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
}