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
 * 🔹 BEST PRACTICE SEO IMPROVEMENT
 * Static fallback localities ensure Googlebot sees content+links even if JS hydration is delayed.
 */
const fallbackLocalities = [
  { id: "fl1", name: "Vaishali Nagar", slug: "vaishali-nagar", zone: "Civil Lines Zone" },
  { id: "fl2", name: "Jhotwara", slug: "jhotwara", zone: "Jhotwara Zone" },
  { id: "fl3", name: "Mansarovar", slug: "mansarovar", zone: "Sanganer Zone" },
  { id: "fl4", name: "Malviya Nagar", slug: "malviya-nagar", zone: "Sanganer Zone" },
  { id: "fl5", name: "Vidyadhar Nagar", slug: "vidyadhar-nagar", zone: "Vidyadhar Nagar Zone" },
  { id: "fl6", name: "Jagatpura", slug: "jagatpura", zone: "Sanganer Zone" },
  { id: "fl7", name: "Civil Lines", slug: "civil-lines", zone: "Civil Lines Zone" },
  { id: "fl8", name: "Ajmer Road", slug: "ajmer-road", zone: "Civil Lines Zone" },
];

/**
 * 🔹 1-Line zone descriptions (adds editorial context)
 * Prevents Google from classifying the page as “list-only / programmatic”.
 */
const zoneDescriptions: Record<string, string> = {
  "Civil Lines Zone":
    "Central premium residential & administrative zone with major offices, markets and educational institutions.",
  "Hawa Mahal Zone":
    "Historic walled-city area with heritage architecture, bazaars, tourism landmarks and traditional marketplaces.",
  "Sanganer Zone":
    "Rapidly developing residential, IT and institutional corridor covering Mansarovar, Jagatpura and airport belt.",
  "Jhotwara Zone": "Growing residential-industrial belt with transport hubs and expanding housing clusters.",
  "Vidyadhar Nagar Zone": "Planned residential township with wide roads, community spaces and commercial developments.",
  "Vishwakarma Zone": "Industrial & manufacturing cluster with logistics hubs and workforce residential pockets.",
  "Other Areas": "Additional emerging localities and neighbourhood clusters across Jaipur.",
};

const JaipurPage = () => {
  /**
   * 🔹 React Query — Dynamic data (still loads normally)
   */
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
   * 🔹 SEO Improvement:
   * Google sees fallback data FIRST → then hydrates with live data
   */
  const effectiveLocalities = isLoading || !localities.length ? fallbackLocalities : localities;

  // Group localities by zone
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

  // Category links for SEO Topical Relevance
  const categoryLinks = [
    {
      href: "/merchants",
      label: "Restaurants in Jaipur",
      icon: Building2,
      description: "Discover local restaurants, cafes and eateries across Jaipur.",
    },
    {
      href: "/merchants",
      label: "Services in Jaipur",
      icon: Briefcase,
      description: "Find trusted service providers, shops and businesses near you.",
    },
    {
      href: "/events",
      label: "Events in Jaipur",
      icon: Calendar,
      description: "Check upcoming events, exhibitions, concerts and city activities.",
    },
    {
      href: "/deals",
      label: "Deals & Offers in Jaipur",
      icon: Tag,
      description: "Exclusive deals and merchant offers across Jaipur localities.",
    },
    {
      href: "/news",
      label: "Jaipur News & Local Updates",
      icon: Newspaper,
      description: "Latest Jaipur news, civic updates, traffic alerts and announcements.",
    },
  ];

  // City Snapshot
  const citySnapshot = [
    { label: "State", value: "Rajasthan" },
    { label: "Country", value: "India" },
    { label: "Municipal Body", value: "Jaipur Municipal Corporation" },
    { label: "Commonly Known As", value: "Pink City" },
    { label: "Major Zones", value: "Hawa Mahal, Sanganer, Civil Lines, Vidyadhar Nagar, Amer" },
  ];

  /**
   * 🔹 Structured Data — Primary Entity
   */
  const citySchema = {
    "@context": "https://schema.org",
    "@type": "City",
    name: "Jaipur",
    alternateName: "Pink City",
    description:
      "Jaipur City Guide — Localities, neighbourhoods, civic information, ward details, services, businesses, news and events across Jaipur, Rajasthan.",
    url: "https://jaipurcircle.com/jaipur",
    geo: { "@type": "GeoCoordinates", latitude: 26.9124, longitude: 75.7873 },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jaipur",
      addressRegion: "Rajasthan",
      addressCountry: "India",
    },
  };

  /**
   * 🔹 ItemList Schema — Locality Directory
   */
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

  /**
   * 🔹 Breadcrumb Schema — strengthens hub page authority
   */
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
        <title>Jaipur City Guide — Localities, Areas, Zones, Civic Info, News & Services | JaipurCircle</title>

        <meta
          name="description"
          content="Jaipur City Guide — Explore Jaipur localities, zones, neighbourhoods, ward numbers, civic details, nearby areas, services, news, events, restaurants, businesses and daily city updates."
        />

        <meta
          name="keywords"
          content="Jaipur city guide, Jaipur localities, Jaipur areas list, Jaipur neighbourhoods, Jaipur zones, Jaipur ward details, Jaipur civic information, Jaipur services, Jaipur news, Jaipur events"
        />

        <link rel="canonical" href="https://jaipurcircle.com/jaipur" />

        {/* Open Graph */}
        <meta property="og:title" content="Jaipur City Guide | Localities, Zones & Civic Information" />
        <meta
          property="og:description"
          content="Browse Jaipur localities, civic zones, ward details, services, events, businesses, news & city updates — powered by JaipurCircle."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jaipurcircle.com/jaipur" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Jaipur — Localities, Zones, Civic & City Information" />
        <meta
          name="twitter:description"
          content="Jaipur locality directory, civic details, ward information, nearby areas, services, events and city updates."
        />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(citySchema)}</script>
        <script type="application/ld+json">{JSON.stringify(localitiesListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <FloatingHeader title="Jaipur City Guide" showBackButton />

      <main className="pt-16 px-4 space-y-8 max-w-4xl mx-auto">
        {/* Intro — more narrative depth for indexing */}
        <section className="mt-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Jaipur City Guide — Localities, Zones & Neighbourhoods
          </h1>

          <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Landmark className="w-6 h-6 text-primary" />
                </div>

                <div className="space-y-3">
                  <p className="text-muted-foreground leading-relaxed">
                    Jaipur — the capital city of Rajasthan — is a historic, culturally rich and rapidly developing
                    metropolitan region, popularly known as the Pink City. JaipurCircle provides locality-wise
                    neighbourhood insights, civic information, ward numbers, nearby areas, services, news updates,
                    events and business listings to help residents, businesses and visitors navigate the city better.
                  </p>

                  <p className="text-muted-foreground leading-relaxed">
                    The city is spread across major urban clusters including Vaishali Nagar, Mansarovar, Jagatpura,
                    Jhotwara, Vidyadhar Nagar, Civil Lines, Ajmer Road and the walled-city heritage core. Each locality
                    page on JaipurCircle includes civic zone mapping, nearby neighbourhoods, connectivity landmarks,
                    service providers and local area updates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* City Snapshot */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">City Snapshot</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {citySnapshot.map((item, index) => (
                  <div key={index} className="flex justify-between items-center px-4 py-3">
                    <span className="text-muted-foreground text-sm">{item.label}</span>
                    <span className="font-medium text-foreground text-sm text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Localities by Zone */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Localities in Jaipur</h2>

          {isLoading && !localities.length ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {sortedZones.map((zone) => (
                <Card key={zone}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          {zone}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {zoneDescriptions[zone] || "Neighbourhood cluster and residential zone in Jaipur."}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {groupedByZone[zone].map((locality) => (
                        <Link
                          key={locality.id}
                          to={`/jaipur/${locality.slug}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {locality.name}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-4">
            Explore {effectiveLocalities.length}+ Jaipur localities with ward numbers, nearby areas, civic details,
            services, news, events and neighbourhood insights.
          </p>
        </section>

        {/* Explore by Category */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Explore Jaipur by Category</h2>

          <div className="grid gap-3">
            {categoryLinks.map((category) => (
              <Link key={category.href + category.label} to={category.href}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <category.icon className="w-5 h-5 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground">{category.label}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>

                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Civic Info */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Civic & Local Information</h2>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-foreground" />
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  Jaipur is administered by the Jaipur Municipal Corporation and divided into civic zones and wards.
                  Each locality page on JaipurCircle provides ward numbers, police jurisdiction, municipal zone mapping,
                  nearby areas, locality boundaries, services and essential urban information for residents and
                  businesses.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Internal Link Footer */}
        <section className="border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>

          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/jaipur" className="text-primary hover:underline">
              View All Localities
            </Link>
            <span className="text-muted-foreground">•</span>

            <Link to="/news" className="text-primary hover:underline">
              Latest Jaipur News
            </Link>
            <span className="text-muted-foreground">•</span>

            <Link to="/events" className="text-primary hover:underline">
              Upcoming Jaipur Events
            </Link>
            <span className="text-muted-foreground">•</span>

            <Link to="/deals" className="text-primary hover:underline">
              Deals & Offers
            </Link>
            <span className="text-muted-foreground">•</span>

            <Link to="/merchants" className="text-primary hover:underline">
              Popular Services in Jaipur
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            JaipurCircle is your comprehensive Jaipur city guide — covering localities, neighbourhoods, civic
            information, services, businesses, events and real-time local updates across the city.
          </p>
        </section>
      </main>

      <NativeBottomNav />
    </div>
  );
};

export default JaipurPage;
