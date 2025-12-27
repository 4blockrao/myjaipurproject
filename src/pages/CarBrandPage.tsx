import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Car, ArrowLeft, ChevronRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import { Footer } from '@/components/layout/Footer';

const CarBrandPage = () => {
  const { brand } = useParams();

  const { data: brandData } = useQuery({
    queryKey: ['car-brand', brand],
    queryFn: async () => {
      const { data } = await supabase
        .from('car_brands')
        .select('*')
        .eq('slug', brand)
        .single();
      return data;
    },
    enabled: !!brand
  });

  const { data: models, isLoading } = useQuery({
    queryKey: ['brand-models', brandData?.id],
    queryFn: async () => {
      if (!brandData?.id) return [];
      const { data } = await supabase
        .from('car_models')
        .select('*')
        .eq('brand_id', brandData.id)
        .order('on_road_price_jaipur_min');
      return data || [];
    },
    enabled: !!brandData?.id
  });

  const { data: dealers } = useQuery({
    queryKey: ['brand-dealers', brandData?.id],
    queryFn: async () => {
      if (!brandData?.id) return [];
      const { data } = await supabase
        .from('car_dealers')
        .select('*')
        .eq('brand_id', brandData.id)
        .limit(4);
      return data || [];
    },
    enabled: !!brandData?.id
  });

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (!brandData && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Brand not found</h1>
          <Link to="/cars">
            <Button className="mt-4">Back to Cars Hub</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{brandData?.name} Cars Price in Jaipur 2025 — On-Road Prices, Dealers & Offers</title>
        <meta name="description" content={`${brandData?.name} car prices in Jaipur. Check on-road prices for all ${brandData?.name} models, find dealers, and get best offers.`} />
        <link rel="canonical" href={`https://jaipurcircle.com/cars/${brand}`} />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-8">
          <div className="container px-4">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/cars">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              {brandData?.logo_url && (
                <img src={brandData.logo_url} alt={brandData?.name} className="h-10" />
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-foreground">
              {brandData?.name} Cars Price in Jaipur (2025)
            </h1>
            <p className="text-muted-foreground mt-2">
              On-road prices, variants & dealers for all {brandData?.name} models
            </p>
          </div>
        </section>

        {/* Models List */}
        <section className="py-8 container px-4">
          <h2 className="text-xl font-bold text-foreground mb-4">
            All {brandData?.name} Models — On-Road Price in Jaipur
          </h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : models && models.length > 0 ? (
            <div className="space-y-3">
              {models.map((model: any) => (
                <Link key={model.id} to={`/cars/${brand}/${model.slug}/on-road-price-in-jaipur`}>
                  <Card className="hover:shadow-lg hover:border-primary/30 transition-all">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-24 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        {model.cover_image ? (
                          <img src={model.cover_image} alt={model.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Car className="w-10 h-10 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{model.name}</h3>
                          {model.is_new_launch && (
                            <Badge className="bg-green-500 text-white text-xs">New</Badge>
                          )}
                          {model.is_ev && (
                            <Badge className="bg-emerald-500 text-white text-xs">EV</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {model.body_type?.replace('-', ' ')} • {model.fuel_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {formatPrice(model.on_road_price_jaipur_min)}
                        </p>
                        <p className="text-xs text-muted-foreground">onwards</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No models found. Check back soon!</p>
            </div>
          )}
        </section>

        {/* Dealers */}
        {dealers && dealers.length > 0 && (
          <section className="py-8 container px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                {brandData?.name} Dealers in Jaipur
              </h2>
              <Link to={`/cars/dealers/${brand}`}>
                <Button variant="ghost" className="text-primary">
                  View All <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {dealers.map((dealer: any) => (
                <Link key={dealer.id} to={`/cars/dealers/${dealer.slug}`}>
                  <Card className="hover:shadow-lg transition-all">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{dealer.name}</h3>
                        <p className="text-sm text-muted-foreground">{dealer.locality}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Footer />
        <NativeBottomNav />
      </div>
    </>
  );
};

export default CarBrandPage;
