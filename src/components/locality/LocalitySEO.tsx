import { Helmet } from "react-helmet-async";

interface LocalitySEOProps {
  locality: any;
  faqSchema?: any;
  nearbyListSchema?: any;
}

export function LocalitySEO({
  locality,
  faqSchema,
  nearbyListSchema,
}: LocalitySEOProps) {
  if (!locality) return null;

  const title = `${locality.name}, Jaipur – Map, Ward, Pin Code, News & Local Guide (2025)`;

  const description =
    `${locality.name} in ${locality.zone || "Jaipur"} is a prominent locality under Ward ${
      locality.ward_number || ""
    }. Nearby areas include ${(locality.nearby_localities || [])
      .slice(0, 4)
      .join(", ")}. Pin codes: ${locality.pin_codes?.join(
      ", "
    )}. Explore news, events, places, connectivity & more.`;

  const canonicalUrl = `https://www.jaipurcircle.com/jaipur/${locality.slug}`;

  /* -------------------------------
     PLACE SCHEMA
  --------------------------------*/
  const placeSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${locality.name}, Jaipur`,
    description,
    address: {
      "@type": "PostalAddress",
      addressLocality: locality.name,
      addressRegion: "Jaipur, Rajasthan",
      postalCode: locality.pin_codes?.[0],
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: locality.geo_lat,
      longitude: locality.geo_lng,
    },
    hasMap: `https://maps.google.com/?q=${locality.geo_lat},${locality.geo_lng}`,
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

  return (
    <Helmet>
      {/* Primary Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta
        property="og:image"
        content="https://www.jaipurcircle.com/og-images/locality-default.png"
      />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {/* Schema: Place */}
      <script type="application/ld+json">
        {JSON.stringify(placeSchema)}
      </script>

      {/* Schema: Nearby Localities ItemList */}
      {nearbyListSchema && (
        <script type="application/ld+json">
          {JSON.stringify(nearbyListSchema)}
        </script>
      )}

      {/* Schema: FAQ */}
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
    </Helmet>
  );
}
