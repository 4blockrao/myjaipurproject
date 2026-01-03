import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import FloatingHeader from "@/components/layout/FloatingHeader";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Building2, Newspaper, Calendar, Tag, Briefcase, ChevronRight, Landmark, Globe } from "lucide-react";

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

  // --- Group localities by zone ---
  const groupedByZone = localities.reduce(
    (acc, locality) => {
      const zone = locality.zone || "Other Areas";
      if (!acc[zone]) acc[zone] = [];
      acc[zone].push(locality);
      return acc;
    },
    {} as Record<string, typeof localities>,
  );

  const sortedZones = Object.keys(groupedByZone).sort();

  // --- City Snapshot ---
  const citySnapshot = [
    { label: "State", value: "Rajasthan" },
    { label: "Country", value: "India" },
    { label: "Municipal Body", value: "Jaipur Municipal Corporation" },
    { label: "Commonly Known As", value: "Pink City" },
    { label: "Major Zones", value: "Hawa Mahal, Sanganer, Civil Lines, Vidyadhar Nagar, Amer" },
  ];

  // --- Category Links ---
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
      description: "Find trusted local services, shops and businesses near you.",
    },
    {
      href: "/events",
      label: "Events in Jaipur",
      icon: Calendar,
      description: "Upcoming Jaipur events, exhibitions, concerts and activities.",
    },
    {
      href: "/deals",
      label: "Deals & Offers in Jaipur",
      icon: Tag,
      description: "Exclusive deals and merchant offers from Jaipur businesses.",
    },
    {
      href: "/news",
      label: "Jaipur News & Updates",
      icon: Newspaper,
      description: "Latest Jaipur news, civic announcements and local developments.",
    },
  ];

  // --- Structured Data (Entity + Breadcrumb + ItemList) ---
  const citySchema = {
    "@context": "https://schema.org",
    "@type": "City",
    name: "Jaipur",
    alternateName: "Pink City",
    url: "https://jaipurcircle.com/jaipur",
    description:
      "Jaipur City Guide — Explore Jaipur localities, zones, neighbourhoods, civic information, ward details, nearby areas, services, events, businesses and city updates.",
    geo: { "@type": "GeoCoordinates", latitude: 26.9124, longitude: 75.7873 },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jaipur",
      addressRegion: "Rajasthan",
      addressCountry: "India",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://jaipurcircle.com/" },
      { "@type": "ListItem", position: 2, name: "Jaipur City Guide", item: "https://jaipurcircle.com/jaipur" },
    ],
  };

  const localitiesListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Localities in Jaipur",
    itemListElement: localities.slice(0, 60).map((l, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Place",
        name: l.name,
        url: `https://jaipurcircle.com/jaipur/${l.slug}`,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>Jaipur City Guide — Localities, Zones, Civic Info, News, Events & Services | JaipurCircle</title>

        <meta
          name="description"
          content="Jaipur City Guide — Browse Jaipur localities, neighbourhoods, zones, ward numbers, civic details, nearby areas, services, events, restaurants, businesses, deals and latest Jaipur news."
        />

        <link rel="canonical" href="https://jaipurcircle.com/jaipur" />

        <script type="application/ld+json">{JSON.stringify(citySchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(localitiesListSchema)}</script>
      </Helmet>

      <FloatingHeader title="Jaipur City Guide" showBackButton />

      <main className="pt-16 px-4 space-y-8 max-w-4xl mx-auto">
        {/* --- Enhanced Narrative Intro (SEO Core Content) --- */}
        <section className="mt-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            Jaipur City Guide — Localities, Neighbourhoods & Civic Zones
          </h1>

          <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Landmark className="w-6 h-6 text-primary" />
                </div>

                <div className="space-y-3 text-muted-foreground leading-relaxed">
                  <p>
                    Jaipur, the capital of Rajasthan and popularly known as the Pink City, is a historic, culturally
                    vibrant and rapidly developing metropolitan region with thriving residential, commercial and tourism
                    hubs. JaipurCircle is a city-first platform that provides verified, locality-wise information
                    including nearby areas, civic & ward details, municipal zone mapping, services, businesses, events
                    and daily Jaipur updates.
                  </p>

                  <p>
                    The city spans major urban clusters such as Vaishali Nagar, Mansarovar, Jagatpura, Jhotwara,
                    Vidyadhar Nagar, Civil Lines, Ajmer Road corridor and the heritage walled-city core. Each locality
                    page on JaipurCircle helps residents, tenants, property seekers and visitors understand the
                    neighbourhood better with nearby landmarks, connectivity references, civic boundaries and relevant
                    local resources.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* --- City Snapshot --- */}
        <section>
          <h2 className="text-xl font-semibold mb-4">City Snapshot</h2>
          <Card>
            <CardContent className="p-0 divide-y">
              {citySnapshot.map((item, i) => (
                <div key={i} className="flex justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* --- Localities by Zone --- */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Localities in Jaipur</h2>

          {isLoading ? (
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
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      {zone}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {groupedByZone[zone].map((loc) => (
                        <Link key={loc.id} to={`/jaipur/${loc.slug}`} className="text-sm text-primary hover:underline">
                          {loc.name}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-4">
            Explore {localities.length}+ Jaipur localities with ward numbers, nearby areas, civic details, local
            services, news, events and neighbourhood insights.
          </p>
        </section>

        {/* --- Explore Categories --- */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Explore Jaipur by Category</h2>

          <div className="grid gap-3">
            {categoryLinks.map((cat) => (
              <Link key={cat.href + cat.label} to={cat.href}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <cat.icon className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium">{cat.label}</h3>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* --- Civic & Local Info --- */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Civic & Local Information</h2>

          <Card>
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Jaipur is governed by the Jaipur Municipal Corporation and divided into civic zones and wards. Each
                locality page on JaipurCircle includes ward numbers, police jurisdiction, municipal zone mapping, nearby
                areas, locality boundaries, services and essential civic identifiers to help residents access
                location-specific information more easily.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* --- Internal Link Footer --- */}
        <section className="border-t pt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>

          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/jaipur" className="text-primary hover:underline">
              View All Localities
            </Link>
            <span>•</span>
            <Link to="/news" className="text-primary hover:underline">
              Latest Jaipur News
            </Link>
            <span>•</span>
            <Link to="/events" className="text-primary hover:underline">
              Upcoming Jaipur Events
            </Link>
            <span>•</span>
            <Link to="/deals" className="text-primary hover:underline">
              Deals & Offers
            </Link>
            <span>•</span>
            <Link to="/merchants" className="text-primary hover:underline">
              Popular Jaipur Services
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            JaipurCircle is your comprehensive Jaipur city guide — covering neighbourhoods, civic information, services,
            businesses, events and real-time city updates.
          </p>
        </section>
      </main>

      <NativeBottomNav />
    </div>
  );
};

export default JaipurPage;
