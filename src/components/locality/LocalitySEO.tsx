import { Helmet } from 'react-helmet-async';
import { Locality } from '@/hooks/useLocality';

interface LocalitySEOProps {
  locality: Locality;
}

export function LocalitySEO({ locality }: LocalitySEOProps) {
  const title = `${locality.name}, Jaipur – Map, Wards, News, Places, Pin Codes (2025)`;
  
  const nearbyNames = locality.nearby_localities?.slice(0, 3).join(', ') || '';
  const description = `${locality.name} is located in ${locality.zone || 'Jaipur'}, Ward ${locality.ward_number || 'N/A'}. ${
    nearbyNames ? `Nearby: ${nearbyNames}.` : ''
  } Find pin codes, map, news, events, and local services.`.slice(0, 160);

  const canonicalUrl = `https://www.jaipurcircle.com/jaipur/${locality.slug}`;
  const ogImage = 'https://www.jaipurcircle.com/logo.png';

  // Generate JSON-LD schemas
  const placeSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": `${locality.name}, Jaipur`,
    "description": description,
    "url": canonicalUrl,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": locality.name,
      "addressRegion": "Rajasthan",
      "postalCode": locality.pin_codes?.join(", ") || "",
      "addressCountry": "IN"
    },
    ...(locality.geo_lat && locality.geo_lng ? {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": locality.geo_lat,
        "longitude": locality.geo_lng
      },
      "hasMap": `https://www.google.com/maps?q=${locality.geo_lat},${locality.geo_lng}`
    } : {}),
    "containedInPlace": {
      "@type": "AdministrativeArea",
      "name": "Jaipur, Rajasthan, India"
    }
  };

  const nearbyListSchema = locality.nearby_localities && locality.nearby_localities.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Nearby Localities to ${locality.name}`,
    "itemListElement": locality.nearby_localities.map((slug, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `https://www.jaipurcircle.com/jaipur/${slug}`
    }))
  } : null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is the pin code of ${locality.name}, Jaipur?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": locality.pin_codes?.length ? `The pin codes for ${locality.name} are ${locality.pin_codes.join(', ')}.` : "Pin code details being verified."
        }
      },
      {
        "@type": "Question",
        "name": `Which zone is ${locality.name} in?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": locality.zone ? `${locality.name} is located in ${locality.zone} zone of Jaipur.` : "Zone details being verified."
        }
      },
      {
        "@type": "Question",
        "name": `What is the ward number of ${locality.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": locality.ward_number ? `${locality.name} falls under Ward ${locality.ward_number}${locality.ward_name ? ` (${locality.ward_name})` : ''}.` : "Ward details being verified."
        }
      },
      {
        "@type": "Question",
        "name": `Which police station covers ${locality.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": locality.police_station ? `${locality.name} is covered by ${locality.police_station} Police Station.` : "Police station details being verified."
        }
      },
      {
        "@type": "Question",
        "name": `What localities are near ${locality.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": locality.nearby_localities?.length ? `Nearby localities include ${locality.nearby_localities.slice(0, 5).join(', ')}.` : "Nearby locality details being verified."
        }
      },
      {
        "@type": "Question",
        "name": `How to reach ${locality.name}, Jaipur?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": locality.connectivity ? `${locality.name} is accessible via ${locality.connectivity.nearest_metro || 'road transport'}. ${locality.connectivity.distance_to_airport || ''}` : "Connectivity details being verified."
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
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="JaipurCircle" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Schemas */}
      <script type="application/ld+json">{JSON.stringify(placeSchema)}</script>
      {nearbyListSchema && <script type="application/ld+json">{JSON.stringify(nearbyListSchema)}</script>}
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>
  );
}
