// Route: /jaipur/[slug] — the locality page. Replaces the locality-ssr edge function.
// - generateStaticParams prebuilds the indexable localities at build time.
// - dynamicParams=true renders the long tail on-demand, then caches it (ISR).
// - revalidate=3600 refreshes each page hourly (swap for on-demand revalidation later).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIndexableSlugs, getLocalityData, buildSchemas } from "@/lib/locality";
import { BASE_URL, DEFAULT_IMAGE, SITE_NAME, escJson } from "@/lib/site";
import { LocalityPage } from "@/components/locality/LocalityPage";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getIndexableSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getLocalityData(slug);

  if (!data) {
    return {
      title: `Locality Not Found | ${SITE_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const { locality, eventCount } = data;
  const canonical = `${BASE_URL}/jaipur/${locality.slug}`;
  const title =
    locality.meta_title ||
    `${locality.name}, Jaipur — ${eventCount > 0 ? `${eventCount} Upcoming Events, ` : ""}Complete Locality Guide | ${SITE_NAME}`;
  const description =
    locality.meta_description ||
    `Complete guide to ${locality.name} in Jaipur. Pin code ${locality.pin_code || "N/A"}, Police Station ${locality.police_station_phone || "N/A"}, property rates, schools, hospitals, and more.`;
  const image = locality.featured_image || DEFAULT_IMAGE;

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      locale: "en_IN",
      images: [{ url: image, alt: `${locality.name} - Complete locality guide` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getLocalityData(slug);
  if (!data) notFound();

  const { locality, events, venues, nearby, eventCount } = data;
  const canonical = `${BASE_URL}/jaipur/${locality.slug}`;
  const schemas = buildSchemas(locality, events, venues, canonical);

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: escJson(schema) }}
        />
      ))}
      <LocalityPage
        locality={locality}
        events={events}
        venues={venues}
        nearby={nearby}
        eventCount={eventCount}
      />
    </>
  );
}
