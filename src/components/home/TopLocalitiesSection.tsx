import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, ChevronRight, Building2, Users, TrendingUp } from "lucide-react";

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

  // Static locality images based on zone/area character
  const localityImages: Record<string, string> = {
    'malviya-nagar': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80',
    'vaishali-nagar': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
    'c-scheme': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80',
    'jagatpura': 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80',
    'mansarovar': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&q=80',
    'default': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
  };

  const getLocalityImage = (slug: string) => {
    return localityImages[slug] || localityImages.default;
  };

  if (isLoading) {
    return (
      <section className="py-4">
        <div className="px-4 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-foreground">Explore Localities</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 px-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (localities.length === 0) return null;

  return (
    <section className="py-4">
      <div className="px-4 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Explore Jaipur</h2>
            <p className="text-[10px] text-muted-foreground">Discover neighborhoods</p>
          </div>
        </div>
        <Link 
          to="/jaipur" 
          className="text-xs text-primary flex items-center gap-1 hover:underline font-medium"
        >
          View All
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4">
        {localities.slice(0, 6).map((locality, index) => (
          <Link key={locality.id} to={`/jaipur/${locality.slug}`}>
            <Card className={`hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-md group ${
              index === 0 ? 'col-span-2' : ''
            }`}>
              <div className={`relative ${index === 0 ? 'h-28' : 'h-20'} overflow-hidden`}>
                <img 
                  src={getLocalityImage(locality.slug)}
                  alt={locality.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 p-3 flex flex-col justify-end">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Building2 className="w-3 h-3 text-white" />
                    <h3 className="font-bold text-sm text-white">{locality.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[10px] text-white/80">
                    {locality.pin_codes?.[0] && (
                      <span>📍 {locality.pin_codes[0]}</span>
                    )}
                    {locality.zone && (
                      <span>{locality.zone}</span>
                    )}
                  </div>
                </div>
                
                {/* Trending indicator for first */}
                {index === 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    Popular
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* View More */}
      <Link to="/jaipur" className="block mx-4 mt-3">
        <Card className="bg-rose-50 hover:bg-rose-100 transition-colors border-rose-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-center gap-2 text-sm text-rose-700">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">Explore all 100+ localities in Jaipur</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </section>
  );
};

export default TopLocalitiesSection;
