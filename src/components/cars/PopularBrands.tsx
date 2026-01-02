import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Brand logos/colors fallback
const brandStyles: Record<string, { bg: string; text: string }> = {
  maruti: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-600' },
  hyundai: { bg: 'bg-sky-50 dark:bg-sky-950', text: 'text-sky-600' },
  tata: { bg: 'bg-indigo-50 dark:bg-indigo-950', text: 'text-indigo-600' },
  mahindra: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-600' },
  kia: { bg: 'bg-orange-50 dark:bg-orange-950', text: 'text-orange-600' },
  honda: { bg: 'bg-gray-50 dark:bg-gray-900', text: 'text-gray-600' },
  toyota: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-600' },
  mg: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-600' },
  volkswagen: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-600' },
  skoda: { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-600' },
};

const PopularBrands = () => {
  const { data: brands, isLoading } = useQuery({
    queryKey: ['popular-car-brands'],
    queryFn: async () => {
      const { data } = await supabase
        .from('car_brands')
        .select('*')
        .eq('is_popular', true)
        .order('display_order');
      return data || [];
    }
  });

  return (
    <section className="py-10 bg-muted/30">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Popular Brands
            </h2>
            <p className="text-muted-foreground mt-1">Explore cars by your favorite brand</p>
          </div>
          <Link to="/cars/brands">
            <Button variant="ghost" className="text-primary gap-1">
              All Brands <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))
          ) : brands?.map((brand: any) => {
            const style = brandStyles[brand.slug] || { bg: 'bg-muted', text: 'text-foreground' };
            
            return (
              <Link key={brand.id} to={`/cars/${brand.slug}`}>
                <Card className={`group hover:shadow-lg hover:border-primary/30 transition-all ${style.bg}`}>
                  <CardContent className="p-3 flex flex-col items-center justify-center aspect-square">
                    {brand.logo_url ? (
                      <img 
                        src={brand.logo_url} 
                        alt={brand.name}
                        className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" 
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full ${style.bg} flex items-center justify-center`}>
                        <span className={`text-xl font-bold ${style.text}`}>
                          {brand.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <p className="text-xs font-medium text-foreground mt-2 text-center line-clamp-1">
                      {brand.name}
                    </p>
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

export default PopularBrands;
