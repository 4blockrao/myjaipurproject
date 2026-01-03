import { Helmet } from 'react-helmet-async';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Car, ArrowLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';

const budgetRanges = [
  { key: 'under-5-lakh', label: 'Under ₹5 Lakh', min: 0, max: 500000 },
  { key: '5-10-lakh', label: '₹5-10 Lakh', min: 500000, max: 1000000 },
  { key: '10-15-lakh', label: '₹10-15 Lakh', min: 1000000, max: 1500000 },
  { key: '15-25-lakh', label: '₹15-25 Lakh', min: 1500000, max: 2500000 },
  { key: '25-50-lakh', label: '₹25-50 Lakh', min: 2500000, max: 5000000 },
  { key: 'above-50-lakh', label: 'Above ₹50 Lakh', min: 5000000, max: 100000000 },
];

const CarsByBudgetPage = () => {
  const { range } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const fuelFilter = searchParams.get('fuel') || 'all';

  const selectedRange = budgetRanges.find(r => r.key === range) || budgetRanges[1];

  const { data: cars, isLoading } = useQuery({
    queryKey: ['cars-by-budget', selectedRange.min, selectedRange.max, fuelFilter],
    queryFn: async () => {
      let query = supabase
        .from('car_models')
        .select(`*, brand:car_brands(name, slug, logo_url)`)
        .gte('on_road_price_jaipur_min', selectedRange.min)
        .lte('on_road_price_jaipur_min', selectedRange.max)
        .order('on_road_price_jaipur_min');

      if (fuelFilter !== 'all') {
        query = query.eq('fuel_type', fuelFilter);
      }

      const { data } = await query;
      return data || [];
    }
  });

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <>
      <Helmet>
        <title>Best Cars {selectedRange.label} in Jaipur 2025 | On-Road Prices</title>
        <meta name="description" content={`Find the best cars ${selectedRange.label} in Jaipur. Compare on-road prices, features, and book test drives at authorized dealers.`} />
        <link rel="canonical" href={`https://jaipurcircle.com/cars/budget/${range}`} />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-6">
          <div className="container px-4">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/cars">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Best Cars {selectedRange.label} in Jaipur (2025)
            </h1>
            <p className="text-muted-foreground mt-2">
              {cars?.length || 0} cars available with on-road price estimates
            </p>
          </div>
        </section>

        {/* Budget Tabs */}
        <div className="container px-4 py-4 overflow-x-auto">
          <Tabs value={range} className="w-full">
            <TabsList className="inline-flex w-max gap-1 bg-muted/50 p-1">
              {budgetRanges.map((budget) => (
                <Link key={budget.key} to={`/cars/budget/${budget.key}`}>
                  <TabsTrigger value={budget.key} className="whitespace-nowrap text-sm">
                    {budget.label}
                  </TabsTrigger>
                </Link>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Fuel Filters */}
        <div className="container px-4 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {['all', 'petrol', 'diesel', 'electric', 'hybrid'].map((fuel) => (
              <Button
                key={fuel}
                variant={fuelFilter === fuel ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchParams({ fuel })}
                className="capitalize whitespace-nowrap"
              >
                {fuel === 'all' ? 'All Fuels' : fuel}
              </Button>
            ))}
          </div>
        </div>

        {/* Cars Grid */}
        <section className="container px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : cars && cars.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cars.map((car: any) => (
                <Link key={car.id} to={`/cars/${car.brand?.slug}/${car.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all h-full">
                    <div className="aspect-video bg-muted relative">
                      {car.cover_image ? (
                        <img src={car.cover_image} alt={car.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 flex gap-1">
                        {car.is_new_launch && <Badge className="bg-green-500 text-white text-xs">New</Badge>}
                        {car.is_ev && <Badge className="bg-emerald-500 text-white text-xs">EV</Badge>}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">{car.brand?.name}</p>
                          <h3 className="font-semibold text-foreground">{car.name}</h3>
                          <p className="text-xs text-muted-foreground capitalize mt-1">
                            {car.body_type?.replace('-', ' ')} • {car.fuel_type} • {car.transmission}
                          </p>
                        </div>
                        {car.brand?.logo_url && (
                          <img src={car.brand.logo_url} alt={car.brand.name} className="w-8 h-8 object-contain" />
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(car.on_road_price_jaipur_min)}
                        </p>
                        <p className="text-xs text-muted-foreground">onwards (on-road Jaipur)</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No cars found</h3>
              <p className="text-muted-foreground">Try adjusting your budget or fuel type filter</p>
            </div>
          )}
        </section>

        <Footer />
        <NativeBottomNav />
      </div>
    </>
  );
};

export default CarsByBudgetPage;
