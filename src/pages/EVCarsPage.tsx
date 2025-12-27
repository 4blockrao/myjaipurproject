import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Zap, Battery, MapPin, Car, ArrowLeft, ChevronRight, Leaf, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import { Footer } from '@/components/layout/Footer';

const EVCarsPage = () => {
  const { data: evCars, isLoading } = useQuery({
    queryKey: ['ev-cars'],
    queryFn: async () => {
      const { data } = await supabase
        .from('car_models')
        .select(`*, brand:car_brands(name, slug)`)
        .eq('is_ev', true)
        .order('on_road_price_jaipur_min');
      return data || [];
    }
  });

  const { data: chargingStations } = useQuery({
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
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const evBenefits = [
    { icon: Leaf, title: 'Zero Emissions', desc: 'Contribute to cleaner air in Jaipur' },
    { icon: Battery, title: 'Lower Running Cost', desc: '₹1-2/km vs ₹5-8/km for petrol' },
    { icon: TrendingUp, title: 'Tax Benefits', desc: 'Road tax exemption in Rajasthan' },
  ];

  return (
    <>
      <Helmet>
        <title>Electric Cars (EV) in Jaipur 2025 — Prices, Range & Charging Stations</title>
        <meta name="description" content="Complete guide to electric cars in Jaipur. Compare EV prices, range, charging infrastructure, running costs, and ownership experience. Find EV dealers near you." />
        <meta name="keywords" content="electric cars jaipur, ev cars jaipur, ev charging stations jaipur, tata ev jaipur, ev car price jaipur" />
        <link rel="canonical" href="https://jaipurcircle.com/cars/ev" />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 py-10">
          <div className="container px-4">
            <div className="flex items-center gap-4 mb-6">
              <Link to="/cars">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <Badge className="bg-green-500 text-white">
                <Zap className="w-3 h-3 mr-1" /> Electric Vehicles
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Electric Cars (EV) in Jaipur — 2025 Guide
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
              Explore the best electric cars available in Jaipur. Compare prices, range, and find charging stations near you.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/80 dark:bg-card/80 rounded-lg px-4 py-3">
                <p className="text-2xl font-bold text-green-600">{evCars?.length || 0}</p>
                <p className="text-sm text-muted-foreground">EV Models Available</p>
              </div>
              <div className="bg-white/80 dark:bg-card/80 rounded-lg px-4 py-3">
                <p className="text-2xl font-bold text-green-600">{chargingStations}+</p>
                <p className="text-sm text-muted-foreground">Charging Stations</p>
              </div>
              <div className="bg-white/80 dark:bg-card/80 rounded-lg px-4 py-3">
                <p className="text-2xl font-bold text-green-600">0%</p>
                <p className="text-sm text-muted-foreground">Road Tax (RJ)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-8 container px-4">
          <h2 className="text-xl font-bold text-foreground mb-4">Why Go Electric in Jaipur?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {evBenefits.map((benefit, i) => (
              <Card key={i} className="border-green-200 dark:border-green-800">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* EV Cars List */}
        <section className="py-8 container px-4">
          <h2 className="text-xl font-bold text-foreground mb-4">Electric Cars Available in Jaipur</h2>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : evCars && evCars.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evCars.map((car: any) => (
                <Link key={car.id} to={`/cars/${car.brand?.slug}/${car.slug}/on-road-price-in-jaipur`}>
                  <Card className="group hover:shadow-xl transition-all h-full border-green-200/50 dark:border-green-800/50">
                    <div className="aspect-video bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 relative">
                      {car.cover_image ? (
                        <img src={car.cover_image} alt={car.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Battery className="w-16 h-16 text-green-300" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-green-500 text-white">
                        <Zap className="w-3 h-3 mr-1" /> Electric
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase">{car.brand?.name}</p>
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-green-600 transition-colors">
                        {car.name}
                      </h3>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        {formatPrice(car.on_road_price_jaipur_min)} onwards
                      </p>
                      {car.best_for && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Best for: {car.best_for.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Battery className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No EV models found. Check back soon!</p>
            </div>
          )}
        </section>

        {/* Charging Stations CTA */}
        <section className="py-8 container px-4">
          <Link to="/cars/charging-stations">
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl transition-all">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Find Charging Stations</h3>
                    <p className="text-green-100">Locate EV chargers across Jaipur</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6" />
              </CardContent>
            </Card>
          </Link>
        </section>

        <Footer />
        <NativeBottomNav />
      </div>
    </>
  );
};

export default EVCarsPage;
