import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, ChevronRight, Car, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const formatPrice = (price: number | null) => {
  if (!price) return 'Price TBA';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  return `₹${(price / 100000).toFixed(2)} L`;
};

const TrendingCars = () => {
  const { data: trendingModels, isLoading } = useQuery({
    queryKey: ['trending-cars-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_models')
        .select('*, brand:car_brands(*)')
        .eq('is_trending', true)
        .order('on_road_price_jaipur_min')
        .limit(8);
      if (error) throw error;
      return data;
    }
  });

  return (
    <section className="py-10 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              Trending Cars in Jaipur
            </h2>
            <p className="text-muted-foreground mt-1">Most searched cars by Jaipur buyers this month</p>
          </div>
          <Link to="/cars/all?sort=trending">
            <Button variant="ghost" className="text-primary gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Horizontal scrollable on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible scrollbar-hide">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="min-w-[260px] md:min-w-0 h-72 rounded-xl flex-shrink-0" />
            ))
          ) : trendingModels?.map((model: any) => (
            <Link 
              key={model.id} 
              to={`/cars/${model.brand?.slug}/${model.slug}/on-road-price-in-jaipur`}
              className="min-w-[260px] md:min-w-0 flex-shrink-0"
            >
              <Card className="group h-full hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-card">
                {/* Car Image */}
                <div className="aspect-[16/10] bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                  {model.cover_image ? (
                    <img 
                      src={model.cover_image} 
                      alt={model.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {model.is_new_launch && (
                      <Badge className="bg-green-500 text-white text-xs shadow">New Launch</Badge>
                    )}
                    {model.is_ev && (
                      <Badge className="bg-emerald-500 text-white text-xs shadow">⚡ Electric</Badge>
                    )}
                    {model.is_trending && (
                      <Badge className="bg-orange-500 text-white text-xs shadow">
                        <TrendingUp className="w-3 h-3 mr-1" /> Trending
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Brand Name */}
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    {model.brand?.name}
                  </p>
                  
                  {/* Model Name */}
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {model.name}
                  </h3>
                  
                  {/* Specs Preview */}
                  <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="capitalize">{model.fuel_type || 'Petrol'}</span>
                    <span>•</span>
                    <span className="capitalize">{model.transmission || 'Manual'}</span>
                    {model.seating_capacity && (
                      <>
                        <span>•</span>
                        <span>{model.seating_capacity} Seater</span>
                      </>
                    )}
                  </div>
                  
                  {/* Price */}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">On-Road Price Jaipur</p>
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(model.on_road_price_jaipur_min)}
                      {model.on_road_price_jaipur_max && model.on_road_price_jaipur_max !== model.on_road_price_jaipur_min && (
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          onwards
                        </span>
                      )}
                    </p>
                  </div>
                  
                  {/* Waiting Period */}
                  {model.waiting_period_weeks && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      ⏱️ Waiting: ~{model.waiting_period_weeks} weeks
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingCars;
