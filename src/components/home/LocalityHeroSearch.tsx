import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Search, Navigation, ChevronRight, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Locality {
  id: number;
  name: string;
  slug: string;
  pin_codes: string[] | null;
  nearby_localities: string[] | null;
}

const LocalityHeroSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch all localities for search
  const { data: allLocalities = [], isLoading: searchLoading } = useQuery({
    queryKey: ['all-localities-search'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('localities')
        .select('id, name, slug, pin_codes, nearby_localities')
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Fetch popular localities for grid
  const { data: popularLocalities = [], isLoading: gridLoading } = useQuery({
    queryKey: ['popular-localities-hero'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('localities')
        .select('id, name, slug, pin_codes')
        .order('population_estimate', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data || [];
    },
  });

  // Filter localities based on search
  const filteredLocalities = searchTerm.length >= 2
    ? allLocalities.filter(loc => 
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.pin_codes?.some(pin => pin.includes(searchTerm))
      ).slice(0, 6)
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocalitySelect = (slug: string) => {
    setSearchTerm("");
    setIsSearchOpen(false);
    navigate(`/jaipur/${slug}`);
  };

  return (
    <section className="px-4 py-6 bg-gradient-to-b from-primary/5 to-transparent">
      {/* Hero Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Discover Your Neighborhood
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Search or choose your locality to explore businesses, deals & events nearby
        </p>
      </div>

      {/* Search Box */}
      <div ref={searchRef} className="relative max-w-lg mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Search locality... e.g., Vaishali Nagar, Mansarovar"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="pl-12 pr-12 py-6 text-base rounded-xl border-2 border-primary/20 focus:border-primary shadow-sm"
          />
          <button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
            title="Use my location"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>

        {/* Search Dropdown */}
        {isSearchOpen && searchTerm.length >= 2 && (
          <Card className="absolute z-50 w-full mt-2 shadow-lg border-primary/10">
            <CardContent className="p-0">
              {searchLoading ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : filteredLocalities.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {filteredLocalities.map((locality) => (
                    <button
                      key={locality.id}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b last:border-b-0"
                      onClick={() => handleLocalitySelect(locality.slug)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{locality.name}</p>
                        {locality.pin_codes?.[0] && (
                          <p className="text-xs text-muted-foreground">PIN: {locality.pin_codes[0]}</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No localities found for "{searchTerm}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Popular Localities Grid */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Popular Localities
          </h2>
          <Link 
            to="/jaipur" 
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            View All
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {gridLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {popularLocalities.map((locality) => (
              <Link
                key={locality.id}
                to={`/jaipur/${locality.slug}`}
                className="group"
              >
                <Card className="hover:shadow-md hover:border-primary/30 transition-all">
                  <CardContent className="p-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {locality.name}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Explore All CTA */}
      <div className="text-center mt-4">
        <Link 
          to="/jaipur" 
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <span>Explore all 100+ localities in Jaipur</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default LocalityHeroSearch;
