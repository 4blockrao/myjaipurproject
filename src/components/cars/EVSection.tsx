import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Zap, Battery, ChevronRight, Leaf, TrendingUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const EVSection = () => {
  const { data: evCars } = useQuery({
    queryKey: ['ev-cars-preview'],
    queryFn: async () => {
      const { data } = await supabase
        .from('car_models')
        .select('*, brand:car_brands(name, slug)')
        .eq('is_ev', true)
        .order('on_road_price_jaipur_min')
        .limit(3);
      return data || [];
    }
  });

  const { data: chargingCount } = useQuery({
    queryKey: ['charging-stations-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('ev_charging_stations')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    return `₹${(price / 100000).toFixed(2)} L`;
  };

  return (
    <section className="py-10">
      <div className="container px-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/40 dark:to-emerald-950/40 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left - Info */}
            <div className="md:w-1/3">
              <Badge className="bg-green-500 text-white mb-4">
                <Zap className="w-3 h-3 mr-1" /> Electric Vehicles
              </Badge>
              
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Go Electric in Jaipur
              </h2>
              
              <p className="text-muted-foreground mb-6">
                Rajasthan offers 0% road tax on EVs. Explore electric cars with complete charging infrastructure info for Jaipur.
              </p>

              {/* EV Benefits */}
              <div className="space-y-3 mb-6">
                {[
                  { icon: Leaf, text: 'Zero emissions, cleaner Jaipur' },
                  { icon: TrendingUp, text: '₹1-2/km running cost' },
                  { icon: MapPin, text: `${chargingCount}+ charging stations` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-green-700 dark:text-green-300" />
                    </div>
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/cars/ev">
                  <Button className="bg-green-600 hover:bg-green-700 gap-2">
                    <Battery className="w-4 h-4" /> Explore EVs
                  </Button>
                </Link>
                <Link to="/cars/charging-stations">
                  <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-100 dark:hover:bg-green-900 gap-2">
                    <Zap className="w-4 h-4" /> Charging Stations
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right - EV Cars Preview */}
            <div className="md:w-2/3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Popular EVs in Jaipur</h3>
                <Link to="/cars/ev">
                  <Button variant="ghost" size="sm" className="text-green-600 gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid sm:grid-cols-3 gap-4">
                {evCars?.map((car: any) => (
                  <Link 
                    key={car.id} 
                    to={`/cars/${car.brand?.slug}/${car.slug}/on-road-price-in-jaipur`}
                  >
                    <Card className="group hover:shadow-lg transition-all bg-white/80 dark:bg-card/80 border-green-200/50 dark:border-green-800/50">
                      <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 relative overflow-hidden rounded-t-lg">
                        {car.cover_image ? (
                          <img 
                            src={car.cover_image} 
                            alt={car.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Battery className="w-12 h-12 text-green-300" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">{car.brand?.name}</p>
                        <h4 className="font-semibold text-foreground group-hover:text-green-600 transition-colors line-clamp-1">
                          {car.name}
                        </h4>
                        <p className="text-sm font-bold text-green-600 mt-1">
                          {formatPrice(car.on_road_price_jaipur_min)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EVSection;
