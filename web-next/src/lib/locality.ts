// Locality data loaders + JSON-LD schema builder.
// Ported from supabase/functions/locality-ssr/index.ts (fetchCompleteLocalityData + generateAllSchemas).
// This is the "loader" the Next.js route calls at build / revalidate / on-demand time.

import "server-only";
import { cache } from "react";
import { supabaseServer } from "./supabase-server";
import { BASE_URL, truncate } from "./site";

// Loose types — the localities row is wide and several JSON blobs are typed `any` in the
// generated types (which are stale). We type the fields we render and keep blobs as Record.
export type Json = Record<string, any>;

export interface Locality {
  slug: string;
  name: string;
  [key: string]: any;
}

export interface EventRow {
  title: string;
  slug: string;
  start_date: string;
  venue_name: string | null;
  cover_image: string | null;
  ticket_price: number | null;
  is_free: boolean | null;
  category: string | null;
}

export interface VenueRow {
  name: string;
  slug: string;
  category: string | null;
  rating: number | null;
  image: string | null;
}

export interface NearbyRow {
  name: string;
  slug: string;
  distance_km?: number | null;
}

export interface LocalityData {
  locality: Locality;
  events: EventRow[];
  venues: VenueRow[];
  nearby: NearbyRow[];
  eventCount: number;
}

// `cache()` dedupes the fetch across generateMetadata + the page render in one request,
// so we only hit Supabase once per locality per render.
export const getLocalityData = cache(async (slug: string): Promise<LocalityData | null> => {
  const normalized = slug.trim().toLowerCase();

  const { data: locality, error } = await supabaseServer
    .from("localities")
    .select("*")
    .eq("slug", normalized)
    .maybeSingle();

  if (error || !locality) return null;

  const nowIso = new Date().toISOString();
  const in90dIso = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data: events } = await supabaseServer
    .from("events")
    .select("title, slug, start_date, venue_name, cover_image, ticket_price, is_free, category")
    .eq("locality_slug", normalized)
    .gte("start_date", nowIso)
    .lte("start_date", in90dIso)
    .order("start_date", { ascending: true })
    .limit(12);

  const { data: venues } = await supabaseServer
    .from("venues")
    .select("name, slug, category, rating, image")
    .eq("locality_slug", normalized)
    .eq("is_indexable", true)
    .order("rating", { ascending: false, nullsFirst: false })
    .limit(8);

  let nearby: NearbyRow[] = [];
  if (locality.geo_lat && locality.geo_lng) {
    const { data: nearbyData } = await supabaseServer.rpc("nearby_localities_simple", {
      lat: locality.geo_lat,
      lng: locality.geo_lng,
      exclude_slug: normalized,
      max_distance_km: 5,
      limit_count: 8,
    });
    nearby = (nearbyData as NearbyRow[]) || [];
  } else {
    const { data: fallback } = await supabaseServer
      .from("localities")
      .select("name, slug")
      .neq("slug", normalized)
      .limit(8);
    nearby = (fallback as NearbyRow[]) || [];
  }

  return {
    locality: locality as Locality,
    events: (events as EventRow[]) || [],
    venues: (venues as VenueRow[]) || [],
    nearby,
    eventCount: events?.length || 0,
  };
});

// The set of slugs to statically pre-render at build time. We prebuild the indexable set and
// let dynamicParams render the long tail on-demand via ISR (the scalable pattern).
export async function getIndexableSlugs(): Promise<string[]> {
  // Prefer the trigger-computed `should_index` flag; if the column/filter isn't available,
  // fall back to all localities so the build still produces pages.
  const primary = await supabaseServer
    .from("localities")
    .select("slug")
    .eq("should_index", true);

  const rows = primary.error ? null : primary.data;
  if (rows && rows.length > 0) return rows.map((r: { slug: string }) => r.slug);

  const { data } = await supabaseServer.from("localities").select("slug");
  return (data || []).map((r: { slug: string }) => r.slug);
}

// ---- JSON-LD schemas (ported from generateAllSchemas, no fake AggregateRating) ----
export function buildSchemas(
  locality: Locality,
  events: EventRow[],
  venues: VenueRow[],
  canonical: string,
): Json[] {
  const schemas: Json[] = [];

  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Jaipur", item: `${BASE_URL}/jaipur` },
      { "@type": "ListItem", position: 3, name: "Localities", item: `${BASE_URL}/jaipur/localities` },
      { "@type": "ListItem", position: 4, name: locality.name, item: canonical },
    ],
  });

  const placeSchema: Json = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${locality.name}, Jaipur`,
    url: canonical,
    description: truncate(
      locality.seo_blurb || locality.description || `Complete guide to ${locality.name} in Jaipur.`,
      500,
    ),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jaipur",
      addressRegion: "Rajasthan",
      addressCountry: "IN",
    },
  };
  if (locality.pin_code) placeSchema.address.postalCode = locality.pin_code;
  if (locality.geo_lat && locality.geo_lng) {
    placeSchema.geo = {
      "@type": "GeoCoordinates",
      latitude: locality.geo_lat,
      longitude: locality.geo_lng,
    };
  }
  if (Array.isArray(locality.known_for)) placeSchema.keywords = locality.known_for.join(", ");
  if (locality.police_station_name) {
    placeSchema.additionalProperty = [
      {
        "@type": "PropertyValue",
        name: "Police Station",
        value: locality.police_station_name,
        telephone: locality.police_station_phone,
      },
    ];
  }
  if (events.length > 0) placeSchema.numberOfUpcomingEvents = events.length;
  schemas.push(placeSchema);

  events.slice(0, 5).forEach((event) => {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      startDate: event.start_date,
      location: {
        "@type": "Place",
        name: event.venue_name || locality.name,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Jaipur",
          addressRegion: "Rajasthan",
          addressCountry: "IN",
        },
      },
      image: event.cover_image,
      url: `${BASE_URL}/events/${event.slug}`,
      offers: event.is_free
        ? { "@type": "Offer", price: 0, priceCurrency: "INR" }
        : event.ticket_price
          ? { "@type": "Offer", price: event.ticket_price, priceCurrency: "INR" }
          : undefined,
    });
  });

  if (venues.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Popular Venues in ${locality.name}`,
      description: `Recommended venues and attractions in ${locality.name}, Jaipur`,
      numberOfItems: venues.length,
      itemListElement: venues.map((venue, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: venue.name,
        url: `${BASE_URL}/venues/${venue.slug}`,
        description: `${venue.name} is a popular ${venue.category || "venue"} in ${locality.name}.`,
      })),
    });
  }

  const faqs: any[] = Array.isArray(locality.faq_json) ? locality.faq_json : [];
  if (faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.slice(0, 10).map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  return schemas;
}
