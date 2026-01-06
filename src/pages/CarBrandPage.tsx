import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Car, ArrowLeft, ChevronRight, Building2, Fuel, Settings, Gauge, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';

// Fallback images for cars when cover_image is missing
const getCarFallbackImage = (bodyType: string) => {
  const bodyTypeImages: Record<string, string> = {
    'suv': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/141867/nexon-exterior-right-front-three-quarter-79.png',
    'compact-suv': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/107541/punch-exterior-right-front-three-quarter-62.png',
    'hatchback': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/102849/swift-exterior-right-front-three-quarter-2.png',
    'sedan': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/144169/verna-exterior-right-front-three-quarter-57.png',
    'muv': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/115025/ertiga-exterior-right-front-three-quarter-3.png',
  };
  return bodyTypeImages[bodyType] || bodyTypeImages['suv'];
};

const CarBrandPage = () => {
  const { brand } = useParams();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const { data: brandData, isLoading: brandLoading } = useQuery({
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

  const handleImageError = (id: string) => {
    setImageErrors(prev => new Set(prev).add(id));
  };

  if (!brandData && !brandLoading && !isLoading) {
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
                <img src={brandData.logo_url} alt={brandData?.name} className="h-12 w-12 object-contain rounded-lg bg-white p-1" />
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-foreground">
              {brandData?.name || 'Loading...'} Cars Price in Jaipur (2025)
            </h1>
            <p className="text-muted-foreground mt-2">
              On-road prices, variants & dealers for all {brandData?.name} models
            </p>
            
            {/* Quick stats */}
            <div className="flex gap-4 mt-4">
              <div className="bg-background/80 rounded-lg px-4 py-2">
                <p className="text-2xl font-bold text-primary">{models?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Models</p>
              </div>
              <div className="bg-background/80 rounded-lg px-4 py-2">
                <p className="text-2xl font-bold text-primary">{dealers?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Dealers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Models Grid */}
        <section className="py-8 container px-4">
          <h2 className="text-xl font-bold text-foreground mb-4">
            All {brandData?.name} Models — On-Road Price in Jaipur
          </h2>
          
          {isLoading || brandLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-3 w-24 mb-4" />
                    <Skeleton className="h-6 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : models && models.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((model: any) => {
                const imageUrl = imageErrors.has(model.id)
                  ? getCarFallbackImage(model.body_type)
                  : (model.cover_image || getCarFallbackImage(model.body_type));

                return (
                  <Link key={model.id} to={`/cars/${brand}/${model.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all h-full group">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={`${brandData?.name} ${model.name}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={() => handleImageError(model.id)}
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                          {model.is_new_launch && <Badge className="bg-green-500 text-white text-xs">New Launch</Badge>}
                          {model.is_ev && <Badge className="bg-emerald-500 text-white text-xs">⚡ Electric</Badge>}
                          {model.is_trending && (
                            <Badge className="bg-orange-500 text-white text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" /> Trending
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{model.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 capitalize">
                            <Fuel className="w-3 h-3" /> {model.fuel_type}
                          </span>
                          <span className="flex items-center gap-1 capitalize">
                            <Settings className="w-3 h-3" /> {model.transmission}
                          </span>
                          {model.mileage_city && (
                            <span className="flex items-center gap-1">
                              <Gauge className="w-3 h-3" /> {model.mileage_city} kmpl
                            </span>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(model.on_road_price_jaipur_min)}
                            <span className="text-sm font-normal text-muted-foreground ml-1">onwards</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No models found. Check back soon!</p>
              <Link to="/cars">
                <Button>Browse All Cars</Button>
              </Link>
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
              <Link to={`/cars/dealers?brand=${brand}`}>
                <Button variant="ghost" className="text-primary">
                  View All <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {dealers.map((dealer: any) => (
                <Link key={dealer.id} to={`/cars/dealers/${dealer.slug}`}>
                  <Card className="hover:shadow-lg hover:border-primary/30 transition-all">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{dealer.name}</h3>
                        <p className="text-sm text-muted-foreground">{dealer.locality}, Jaipur</p>
                        {dealer.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm font-medium">{dealer.rating}</span>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
