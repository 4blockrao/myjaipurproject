import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, MapPin, Fuel, Settings, Users, TrendingUp, Zap, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formatPrice = (price: number) => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  return `₹${(price / 100000).toFixed(2)} Lakh`;
};

const CarBrandHubPage = () => {
  const { brand } = useParams<{ brand: string }>();

  const { data: brandData, isLoading: brandLoading } = useQuery({
    queryKey: ['car-brand', brand],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_brands')
        .select('*')
        .eq('slug', brand)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!brand
  });

  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['car-brand-models', brandData?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_models')
        .select('*')
        .eq('brand_id', brandData?.id)
        .order('is_trending', { ascending: false })
        .order('on_road_price_jaipur_min', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!brandData?.id
  });

  const { data: dealers } = useQuery({
    queryKey: ['car-brand-dealers', brandData?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_dealers')
        .select('*')
        .eq('brand_id', brandData?.id)
        .eq('city', 'Jaipur')
        .limit(6);
      
      if (error) throw error;
      return data;
    },
    enabled: !!brandData?.id
  });

  // Group models by body type
  const modelsByBodyType = models?.reduce((acc, model) => {
    const type = model.body_type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(model);
    return acc;
  }, {} as Record<string, typeof models>);

  const bodyTypes = Object.keys(modelsByBodyType || {});
  const trendingModels = models?.filter(m => m.is_trending) || [];
  const evModels = models?.filter(m => m.is_ev) || [];
  const newLaunches = models?.filter(m => m.is_new_launch) || [];

  const isLoading = brandLoading || modelsLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container px-4 py-10">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!brandData) {
    return (
      <AppLayout>
        <div className="container px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Brand Not Found</h1>
          <p className="text-muted-foreground mb-6">The car brand you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/cars/brands">View All Brands</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const lowestPrice = models?.length ? Math.min(...models.map(m => m.on_road_price_jaipur_min || 0).filter(Boolean)) : 0;
  const highestPrice = models?.length ? Math.max(...models.map(m => m.on_road_price_jaipur_max || 0).filter(Boolean)) : 0;

  return (
    <AppLayout>
      <Helmet>
        <title>{brandData.name} Cars Price in Jaipur 2025 | {models?.length || 0} Models, On-Road Price</title>
        <meta name="description" content={`${brandData.name} car prices in Jaipur start from ${formatPrice(lowestPrice)}. Check on-road prices for ${models?.length || 0} models, find dealers, compare specifications and book test drives.`} />
        <link rel="canonical" href={`https://jaipurcircle.com/cars/${brand}`} />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-8 md:py-12">
          <div className="container px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-primary">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/cars" className="hover:text-primary">Cars</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/cars/brands" className="hover:text-primary">Brands</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{brandData.name}</span>
            </nav>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Brand Logo */}
              <div className="shrink-0 bg-card border rounded-xl p-6 flex items-center justify-center">
                {brandData.logo_url ? (
                  <img
                    src={brandData.logo_url}
                    alt={`${brandData.name} logo`}
                    className="h-20 w-20 object-contain"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary">{brandData.name.charAt(0)}</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {brandData.name} Cars Price in Jaipur
                </h1>
                <p className="text-muted-foreground mb-4">
                  {models?.length || 0} models available • Prices from {formatPrice(lowestPrice)} to {formatPrice(highestPrice)}
                </p>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-3">
                  {newLaunches.length > 0 && (
                    <Badge variant="default" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {newLaunches.length} New Launch{newLaunches.length > 1 ? 'es' : ''}
                    </Badge>
                  )}
                  {evModels.length > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <Zap className="h-3 w-3" />
                      {evModels.length} Electric
                    </Badge>
                  )}
                  {dealers && dealers.length > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {dealers.length}+ Dealers in Jaipur
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Models Section */}
        <section className="py-8 container px-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 flex-wrap h-auto gap-2">
              <TabsTrigger value="all" className="gap-1">
                All Models ({models?.length || 0})
              </TabsTrigger>
              {trendingModels.length > 0 && (
                <TabsTrigger value="trending" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Trending ({trendingModels.length})
                </TabsTrigger>
              )}
              {evModels.length > 0 && (
                <TabsTrigger value="ev" className="gap-1">
                  <Zap className="h-3 w-3" />
                  Electric ({evModels.length})
                </TabsTrigger>
              )}
              {bodyTypes.map((type) => (
                <TabsTrigger key={type} value={type.toLowerCase()}>
                  {type} ({modelsByBodyType?.[type]?.length || 0})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              <ModelGrid models={models || []} brandSlug={brand!} />
            </TabsContent>

            <TabsContent value="trending">
              <ModelGrid models={trendingModels} brandSlug={brand!} />
            </TabsContent>

            <TabsContent value="ev">
              <ModelGrid models={evModels} brandSlug={brand!} />
            </TabsContent>

            {bodyTypes.map((type) => (
              <TabsContent key={type} value={type.toLowerCase()}>
                <ModelGrid models={modelsByBodyType?.[type] || []} brandSlug={brand!} />
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Dealers Section */}
        {dealers && dealers.length > 0 && (
          <section className="py-8 container px-4 border-t">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{brandData.name} Dealers in Jaipur</h2>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/cars/dealers?brand=${brand}`}>View All Dealers</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dealers.map((dealer) => (
                <Link
                  key={dealer.id}
                  to={`/cars/dealers/${dealer.slug}`}
                  className="bg-card border rounded-xl p-4 hover:shadow-md hover:border-primary/50 transition-all"
                >
                  <h3 className="font-semibold mb-2">{dealer.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {dealer.locality}, {dealer.city}
                  </p>
                  {dealer.phone && (
                    <p className="text-sm text-primary mt-2">{dealer.phone}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SEO Content */}
        <section className="py-10 container px-4 border-t">
          <div className="max-w-4xl mx-auto prose prose-sm text-muted-foreground">
            <h2 className="text-lg font-bold text-foreground mb-4">
              {brandData.name} Cars in Jaipur - Complete Buying Guide (2025)
            </h2>
            <p>
              {brandData.name} offers {models?.length || 0} car models in Jaipur, ranging from 
              compact hatchbacks to premium SUVs. The price range starts from {formatPrice(lowestPrice)} 
              and goes up to {formatPrice(highestPrice)} (on-road, Jaipur).
            </p>
            <p>
              Popular {brandData.name} models in Jaipur include {trendingModels.slice(0, 3).map(m => m.name).join(', ')}. 
              {evModels.length > 0 && ` The brand also offers ${evModels.length} electric vehicle${evModels.length > 1 ? 's' : ''} 
              with growing charging infrastructure across Jaipur.`}
            </p>
            <p>
              Find authorized {brandData.name} showrooms in Mansarovar, Tonk Road, Vaishali Nagar, 
              and other major localities. Book test drives, check EMI options, and get the best 
              deals on your new {brandData.name} car.
            </p>
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

// Model Card Grid Component
const ModelGrid = ({ models, brandSlug }: { models: any[]; brandSlug: string }) => {
  if (!models.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No models found in this category.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {models.map((model) => (
        <Link
          key={model.id}
          to={`/cars/${brandSlug}/${model.slug}`}
          className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all"
        >
          {/* Image */}
          <div className="aspect-video bg-muted relative overflow-hidden">
            {model.cover_image ? (
              <img
                src={model.cover_image}
                alt={model.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl text-muted-foreground">🚗</span>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              {model.is_new_launch && (
                <Badge variant="default" className="text-xs">New Launch</Badge>
              )}
              {model.is_ev && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Zap className="h-3 w-3" /> EV
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors mb-2">
              {model.name}
            </h3>

            {/* Price */}
            <div className="mb-3">
              <p className="text-lg font-bold text-primary">
                {formatPrice(model.on_road_price_jaipur_min || model.ex_showroom_price_min)}
                <span className="text-xs font-normal text-muted-foreground ml-1">onwards</span>
              </p>
              <p className="text-xs text-muted-foreground">On-road price in Jaipur</p>
            </div>

            {/* Specs */}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {model.fuel_type && (
                <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                  <Fuel className="h-3 w-3" />
                  {model.fuel_type}
                </span>
              )}
              {model.transmission && (
                <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                  <Settings className="h-3 w-3" />
                  {model.transmission}
                </span>
              )}
              {model.seating_capacity && (
                <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                  <Users className="h-3 w-3" />
                  {model.seating_capacity} Seater
                </span>
              )}
            </div>

            {/* Waiting Period */}
            {model.waiting_period_weeks && (
              <p className="text-xs text-orange-600 mt-2">
                ⏱️ {model.waiting_period_weeks} weeks waiting
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CarBrandHubPage;
