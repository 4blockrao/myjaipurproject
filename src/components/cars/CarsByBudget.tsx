import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, ChevronRight, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const budgetRanges = [
  { label: 'Under ₹5L', value: '5', min: 0, max: 500000 },
  { label: '₹5-10L', value: '10', min: 500000, max: 1000000 },
  { label: '₹10-15L', value: '15', min: 1000000, max: 1500000 },
  { label: '₹15-25L', value: '25', min: 1500000, max: 2500000 },
];

const formatPrice = (price: number | null) => {
  if (!price) return 'TBA';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  return `₹${(price / 100000).toFixed(2)} L`;
};

const CarsByBudget = () => {
  const { data: allCars, isLoading } = useQuery({
    queryKey: ['cars-by-budget'],
    queryFn: async () => {
      const { data } = await supabase
        .from('car_models')
        .select('*, brand:car_brands(name, slug)')
        .order('on_road_price_jaipur_min');
      return data || [];
    }
  });

  const getCarsByBudget = (min: number, max: number) => {
    return allCars?.filter((car: any) => 
      car.on_road_price_jaipur_min >= min && car.on_road_price_jaipur_min < max
    ).slice(0, 4) || [];
  };

  return (
    <section className="py-10 container px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Cars by Budget
          </h2>
          <p className="text-muted-foreground mt-1">Find cars that fit your budget</p>
        </div>
        <Link to="/cars/all">
          <Button variant="ghost" className="text-primary gap-1">
            Explore All <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="10" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 p-1 mb-6">
          {budgetRanges.map((range) => (
            <TabsTrigger 
              key={range.value} 
              value={range.value}
              className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {range.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {budgetRanges.map((range) => (
          <TabsContent key={range.value} value={range.value}>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getCarsByBudget(range.min, range.max).map((car: any) => (
                  <Link 
                    key={car.id} 
                    to={`/cars/${car.brand?.slug}/${car.slug}/on-road-price-in-jaipur`}
                  >
                    <Card className="group hover:shadow-lg hover:border-primary/30 transition-all h-full">
                      <div className="aspect-[4/3] bg-muted relative overflow-hidden rounded-t-lg">
                        {car.cover_image ? (
                          <img 
                            src={car.cover_image} 
                            alt={car.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}
                        {car.is_ev && (
                          <Badge className="absolute top-2 left-2 bg-emerald-500 text-white text-xs">
                            ⚡ EV
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">{car.brand?.name}</p>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {car.name}
                        </h3>
                        <p className="text-sm font-bold text-primary mt-1">
                          {formatPrice(car.on_road_price_jaipur_min)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
            
            <div className="text-center mt-6">
              <Link to={`/cars/budget/${range.label.toLowerCase().replace(/[₹\s]/g, '-').replace('--', '-')}`}>
                <Button variant="outline" className="gap-2">
                  View All Cars {range.label} <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
};

export default CarsByBudget;
