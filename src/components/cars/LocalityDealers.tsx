import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, ChevronRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUserLocality } from '@/hooks/useUserLocality';

const popularLocalities = [
  { name: 'Mansarovar', slug: 'mansarovar' },
  { name: 'Vaishali Nagar', slug: 'vaishali-nagar' },
  { name: 'Malviya Nagar', slug: 'malviya-nagar' },
  { name: 'Tonk Road', slug: 'tonk-road' },
  { name: 'C-Scheme', slug: 'c-scheme' },
  { name: 'Jagatpura', slug: 'jagatpura' },
  { name: 'Raja Park', slug: 'raja-park' },
  { name: 'Sodala', slug: 'sodala' },
  { name: 'Durgapura', slug: 'durgapura' },
  { name: 'Sitapura', slug: 'sitapura' },
  { name: 'Ajmer Road', slug: 'ajmer-road' },
  { name: 'Jhotwara', slug: 'jhotwara' },
];

const LocalityDealers = () => {
  const { userLocality } = useUserLocality();

  const { data: dealerStats } = useQuery({
    queryKey: ['dealer-locality-stats'],
    queryFn: async () => {
      const { data } = await supabase
        .from('car_dealers')
        .select('locality');
      
      // Count dealers per locality
      const counts: Record<string, number> = {};
      data?.forEach((dealer: any) => {
        if (dealer.locality) {
          const loc = dealer.locality.toLowerCase();
          counts[loc] = (counts[loc] || 0) + 1;
        }
      });
      return counts;
    }
  });

  // Sort localities - user's locality first, then by dealer count
  const sortedLocalities = [...popularLocalities].sort((a, b) => {
    if (userLocality?.slug === a.slug) return -1;
    if (userLocality?.slug === b.slug) return 1;
    const countA = dealerStats?.[a.name.toLowerCase()] || 0;
    const countB = dealerStats?.[b.name.toLowerCase()] || 0;
    return countB - countA;
  });

  return (
    <section className="py-10 bg-muted/30">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              Car Showrooms by Locality
            </h2>
            <p className="text-muted-foreground mt-1">Find authorized dealers near you in Jaipur</p>
          </div>
          <Link to="/cars/dealers">
            <Button variant="ghost" className="text-primary gap-1">
              All Dealers <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sortedLocalities.slice(0, 12).map((locality) => {
            const isUserLocality = userLocality?.slug === locality.slug;
            const dealerCount = dealerStats?.[locality.name.toLowerCase()] || 0;
            
            return (
              <Link key={locality.slug} to={`/cars/dealers/in/${locality.slug}`}>
                <Card className={`group hover:shadow-lg transition-all cursor-pointer h-full ${
                  isUserLocality ? 'border-primary bg-primary/5' : 'hover:border-primary/30'
                }`}>
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                      isUserLocality ? 'bg-primary/20' : 'bg-muted'
                    } group-hover:scale-110 transition-transform`}>
                      <MapPin className={`w-6 h-6 ${isUserLocality ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <h3 className="font-medium text-foreground line-clamp-1">{locality.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dealerCount > 0 ? `${dealerCount} showrooms` : 'View dealers'}
                    </p>
                    {isUserLocality && (
                      <p className="text-xs text-primary font-medium mt-1">Your area</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LocalityDealers;
