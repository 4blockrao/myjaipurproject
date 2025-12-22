import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import FloatingHeader from "@/components/layout/FloatingHeader";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Search, ChevronRight, Building2, Users } from "lucide-react";

const LocalitiesIndexPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");

  const { data: localities = [], isLoading } = useQuery({
    queryKey: ['all-localities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('localities')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Get unique zones
  const zones = ['all', ...new Set(localities.map(l => l.zone).filter(Boolean))];

  const filteredLocalities = localities.filter(locality => {
    const matchesSearch = locality.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      locality.ward_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = selectedZone === 'all' || locality.zone === selectedZone;
    return matchesSearch && matchesZone;
  });

  // Group by first letter for alphabetical navigation
  const groupedLocalities = filteredLocalities.reduce((acc, locality) => {
    const letter = locality.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(locality);
    return acc;
  }, {} as Record<string, typeof localities>);

  const sortedLetters = Object.keys(groupedLocalities).sort();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>All Localities in Jaipur - Explore Neighborhoods, Wards & Areas | JaipurCircle</title>
        <meta name="description" content="Explore all localities, neighborhoods, and areas in Jaipur. Find pin codes, ward numbers, nearby places, news, events, and deals for every locality in Jaipur." />
        <link rel="canonical" href="https://jaipurcircle.com/jaipur" />
      </Helmet>

      <FloatingHeader title="Jaipur Localities" showBackButton />

      <main className="pt-16 px-4 space-y-4 max-w-2xl mx-auto">
        {/* Hero Section */}
        <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-0">
          <CardContent className="p-6 text-center">
            <MapPin className="w-10 h-10 text-primary mx-auto mb-3" />
            <h1 className="text-xl font-bold mb-2">Explore Jaipur</h1>
            <p className="text-sm text-muted-foreground">
              Discover {localities.length}+ localities with news, events, deals & more
            </p>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search localities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Zone Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {zones.slice(0, 8).map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedZone === zone
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {zone === 'all' ? 'All Zones' : zone}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filteredLocalities.length} localities</span>
        </div>

        {/* Localities List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredLocalities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No localities found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedLetters.map((letter) => (
              <div key={letter}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-primary">{letter}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-2">
                  {groupedLocalities[letter].map((locality) => (
                    <Link key={locality.id} to={`/jaipur/${locality.slug}`}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm">{locality.name}</h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                {locality.zone && (
                                  <Badge variant="outline" className="text-xs py-0">
                                    {locality.zone}
                                  </Badge>
                                )}
                                {locality.ward_number && (
                                  <span className="text-xs text-muted-foreground">
                                    Ward {locality.ward_number}
                                  </span>
                                )}
                                {locality.pin_codes?.[0] && (
                                  <span className="text-xs text-muted-foreground">
                                    {locality.pin_codes[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <NativeBottomNav />
    </div>
  );
};

export default LocalitiesIndexPage;
