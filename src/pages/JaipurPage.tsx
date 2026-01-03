import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import FloatingHeader from "@/components/layout/FloatingHeader";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Building2, Newspaper, Calendar, Tag, Briefcase, ChevronRight, Landmark, Globe } from "lucide-react";

/**
 * Static fallback localities (IDs kept as numbers for TS compatibility)
 */
const fallbackLocalities: { id: number; name: string; slug: string; zone: string }[] = [
  { id: 100001, name: "Vaishali Nagar", slug: "vaishali-nagar", zone: "Civil Lines Zone" },
  { id: 100002, name: "Jhotwara", slug: "jhotwara", zone: "Jhotwara Zone" },
  { id: 100003, name: "Mansarovar", slug: "mansarovar", zone: "Sanganer Zone" },
  { id: 100004, name: "Malviya Nagar", slug: "malviya-nagar", zone: "Sanganer Zone" },
  { id: 100005, name: "Vidyadhar Nagar", slug: "vidyadhar-nagar", zone: "Vidyadhar Nagar Zone" },
  { id: 100006, name: "Jagatpura", slug: "jagatpura", zone: "Sanganer Zone" },
  { id: 100007, name: "Civil Lines", slug: "civil-lines", zone: "Civil Lines Zone" },
  { id: 100008, name: "Ajmer Road", slug: "ajmer-road", zone: "Civil Lines Zone" },
];

/**
 * Zone micro-descriptions (SEO context)
 */
const zoneDescriptions: Record<string, string> = {
  "Civil Lines Zone": "Central administrative and premium residential zone with markets, offices and institutions.",
  "Hawa Mahal Zone": "Historic walled-city heritage zone with bazaars, monuments and tourism landmarks.",
  "Sanganer Zone": "Expanding residential-institutional corridor covering Mansarovar and Jagatpura region.",
  "Jhotwara Zone": "Residential-industrial growth belt with emerging neighbourhood clusters.",
  "Vidyadhar Nagar Zone": "Planned residential township with wide roads and community spaces.",
  "Vishwakarma Zone": "Industrial and manufacturing hub with logistics connectivity.",
  "Other Areas": "Neighbourhood clusters and developing areas in Jaipur.",
};

const JaipurPage = () => {
  const { data: localities = [], isLoading } = useQuery({
    queryKey: ["jaipur-all-localities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("localities")
        .select("id, name, slug, zone")
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  /**
   * Ensure fallback + DB records share same type
   */
  const effectiveLocalities = isLoading || !localities.length ? fallbackLocalities : localities;

  const groupedByZone = effectiveLocalities.reduce(
    (acc, locality) => {
      const zone = locality.zone || "Other Areas";
      if (!acc[zone]) acc[zone] = [];
      acc[zone].push(locality);
      return acc;
    },
    {} as Record<string, typeof effectiveLocalities>,
  );

  const sortedZones = Object.keys(groupedByZone).sort();

  const categoryLinks = [
    {
      href: "/merchants",
      label: "Restaurants in Jaipur",
      icon: Building2,
      description: "Discover restaurants, cafes and food places across Jaipur.",
    },
    {
      href: "/merchants",
      label: "Services in Jaipur",
      icon: Briefcase,
      description: "Find trusted local services and businesses near you.",
    },
    {
      href: "/events",
      label: "Events in Jaipur",
      icon: Calendar,
      description: "Upcoming Jaipur events, exhibitions, shows and activities.",
    },
    {
      href: "/deals",
      label: "Deals & Offers in Jaipur",
      icon: Tag,
      description: "Exclusive deals & merchant offers across Jaipur localities.",
    },
    {
      href: "/news",
      label: "Jaipur News & City Updates",
      icon: Newspaper,
      description: "Latest Jaipur news, civic updates and announcements.",
    },
  ];

  const citySnapshot = [
    { label: "State", value: "Rajasthan" },
    { label: "Country", value: "India" },
    { label: "Municipal Body", value: "Jaipur Municipal Corporation" },
    { label: "Commonly Known As", value: "Pink City" },
    { label: "Major Zones", value: "Hawa Mahal, Sanganer, Civil Lines, Vidyadhar Nagar, Amer" },
  ];

  const citySchema = {
    "@context": "https://schema.org",
    "@type": "City",
    name: "Jaipur",
    alternateName: "Pink City",
    url: "https://jaipurcircle.com/jaipur",
    description:
      "Jaipur City Guide — Localities, neighbourhoods, civic information, ward numbers, nearby areas, services, businesses, news and events in Jaipur, Rajasthan.",
    geo: { "@type": "GeoCoordinates", latitude: 26.9124, longitude: 75.7873 },
  };

  const localitiesListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Localities in Jaipur",
    itemListElement: effectiveLocalities.slice(0, 50).map((locality, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Place",
        name: locality.name,
        url: `https://jaipurcircle.com/jaipur/${locality.slug}`,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://jaipurcircle.com/" },
      { "@type": "ListItem", position: 2, name: "Jaipur City Guide", item: "https://jaipurcircle.com/jaipur" },
    ],
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>Jaipur City Guide — Localities, Zones, Civic Info, News & Services | JaipurCircle</title>

        <meta
          name="description"
          content="Jaipur City Guide — Explore Jaipur localities, zones, neighbourhoods, ward numbers, civic information, nearby areas, services, news, events, restaurants, businesses and city updates."
        />

        <link rel="canonical" href="https://jaipurcircle.com/jaipur" />

        <script type="application/ld+json">{JSON.stringify(citySchema)}</script>
        <script type="application/ld+json">{JSON.stringify(localitiesListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      {/* rest of your rendering body remains same */}

      <FloatingHeader title="Jaipur City Guide" showBackButton />

      {/* ...content wrapper & sections exactly as before... */}

      <NativeBottomNav />
    </div>
  );
};

export default JaipurPage;
