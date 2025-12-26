import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, ChevronRight, Building2 } from "lucide-react";

const TopLocalitiesSection = () => {
  const { data: localities = [], isLoading } = useQuery({
    queryKey: ['top-localities-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('localities')
        .select('*')
        .order('population_estimate', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Top Localities
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (localities.length === 0) return null;

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Explore Jaipur Localities
        </h2>
        <Link 
          to="/jaipur" 
          className="text-sm text-primary flex items-center gap-1 hover:underline"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {localities.slice(0, 6).map((locality) => (
          <Link key={locality.id} to={`/jaipur/${locality.slug}`}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm line-clamp-1">{locality.name}</h3>
                    {locality.pin_codes?.[0] && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        📍 {locality.pin_codes[0]}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* More Button */}
      <Link to="/jaipur" className="block mt-3">
        <Card className="bg-muted/50 hover:bg-muted transition-colors">
          <CardContent className="p-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Explore all {localities.length > 8 ? '100+' : localities.length} localities in Jaipur</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </section>
  );
};

export default TopLocalitiesSection;
