I have jaipurpage.tsx


import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import FloatingHeader from "@/components/layout/FloatingHeader";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Building2, 
  Newspaper, 
  Calendar, 
  Tag, 
  Briefcase,
  ChevronRight,
  Landmark,
  Globe
} from "lucide-react";

const JaipurPage = () => {
  const { data: localities = [], isLoading } = useQuery({
    queryKey: ['jaipur-all-localities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('localities')
        .select('id, name, slug, zone')
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Group localities by zone
  const groupedByZone = localities.reduce((acc, locality) => {
    const zone = locality.zone || 'Other Areas';
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(locality);
    return acc;
  }, {} as Record<string, typeof localities>);

  const sortedZones = Object.keys(groupedByZone).sort();

  // Category links for SEO
  const categoryLinks = [
    { href: "/merchants", label: "Restaurants in Jaipur", icon: Building2, description: "Discover local restaurants and eateries" },
    { href: "/merchants", label: "Services in Jaipur", icon: Briefcase, description: "Find trusted local service providers" },
    { href: "/events", label: "Events in Jaipur", icon: Calendar, description: "Upcoming events and happenings" },
    { href: "/deals", label: "Deals & Offers in Jaipur", icon: Tag, description: "Exclusive offers from local merchants" },
    { href: "/news", label: "Jaipur News", icon: Newspaper, description: "Latest news and updates from the city" },
  ];

  // City snapshot data
  const citySnapshot = [
    { label: "State", value: "Rajasthan" },
    { label: "Country", value: "India" },
    { label: "Municipal Body", value: "Jaipur Municipal Corporation" },
    { label: "Commonly Known As", value: "Pink City" },
    { label: "Major Zones", value: "Hawa Mahal, Sanganer, Civil Lines, Vidyadhar Nagar, Amer" },
  ];

  // Structured data for SEO
  const citySchema = {
    "@context": "https://schema.org",
    "@type": "City",
    "name": "Jaipur",
    "alternateName": "Pink City",
    "description": "Jaipur is the capital city of Rajasthan, India, and a major cultural, tourism, and economic center.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Jaipur",
      "addressRegion": "Rajasthan",
      "addressCountry": "India"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 26.9124,
      "longitude": 75.7873
    }
  };

  const localitiesListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Localities in Jaipur",
    "itemListElement": localities.slice(0, 50).map((locality, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Place",
        "name": locality.name,
        "url": `https://jaipurcircle.com/jaipur/${locality.slug}`
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>Jaipur City Guide | Localities, News, Events & Services – JaipurCircle</title>
        <meta 
          name="description" 
          content="Explore Jaipur city with detailed locality guides, latest news, events, services, restaurants, deals, and civic information – powered by JaipurCircle." 
        />
        <link rel="canonical" href="https://jaipurcircle.com/jaipur" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Jaipur City Guide | JaipurCircle" />
        <meta property="og:description" content="Explore Jaipur city with detailed locality guides, latest news, events, services, restaurants, deals, and civic information." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jaipurcircle.com/jaipur" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Jaipur City Guide | JaipurCircle" />
        <meta name="twitter:description" content="Your complete guide to Jaipur's localities, news, events, and services." />
        
        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(citySchema)}</script>
        <script type="application/ld+json">{JSON.stringify(localitiesListSchema)}</script>
      </Helmet>

      <FloatingHeader title="Jaipur City Guide" showBackButton />

      <main className="pt-16 px-4 space-y-8 max-w-4xl mx-auto">
        
        {/* Section 1: AI City Summary */}
        <section className="mt-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Jaipur City Guide
          </h1>
          <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Landmark className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground leading-relaxed">
                    Jaipur is the capital city of Rajasthan, India, and a major cultural, tourism, and economic center. 
                    JaipurCircle provides locality-wise information, civic details, events, services, and daily updates 
                    to help residents and visitors navigate the city.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: City Snapshot */}
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

        {/* Section 3: Localities by Zone (Core SEO Section) */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Localities in Jaipur</h2>
          
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
                      {groupedByZone[zone].map((locality) => (
                        <Link
                          key={locality.id}
                          to={`/jaipur/${locality.slug}`}
                          className="text-sm text-primary hover:underline transition-colors"
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
            Explore {localities.length}+ localities across Jaipur with detailed information on pin codes, 
            ward numbers, nearby areas, news, events, and local services.
          </p>
        </section>

        {/* Section 4: Explore by Category */}
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

        {/* Section 5: Civic & Local Information */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Civic & Local Information</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-foreground" />
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Jaipur is administered by the Jaipur Municipal Corporation and divided into multiple zones 
                  and wards for civic governance. Locality-level administration includes ward offices, 
                  police stations, and municipal service departments. Each locality page on JaipurCircle 
                  provides specific civic details including ward numbers, police station jurisdiction, 
                  and municipal zone information.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 6: Internal Link Footer */}
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
              Upcoming Events in Jaipur
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
            JaipurCircle is your comprehensive guide to Jaipur, Rajasthan. 
            Explore locality-specific information, stay updated with local news, 
            discover events, and find the best deals from trusted merchants across the city.
          </p>
        </section>

      </main>

      <NativeBottomNav />
    </div>
  );
};

export default JaipurPage;
