import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Car, Zap, MapPin, Users, TrendingUp, ChevronRight, Search, Building2, Fuel, Battery, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import { Footer } from '@/components/layout/Footer';

const CarsHubPage = () => {
  const { data: brands } = useQuery({
    queryKey: ['car-brands'],
    queryFn: async () => {
      const { data } = await supabase
        .from('car_brands')
        .select('*')
        .eq('is_popular', true)
        .order('display_order');
      return data || [];
    }
  });

  const { data: trendingModels, isLoading } = useQuery({
    queryKey: ['trending-cars'],
    queryFn: async () => {
      const { data } = await supabase
        .from('car_models')
        .select(`
          *,
          brand:car_brands(name, slug)
        `)
        .eq('is_trending', true)
        .limit(6);
      return data || [];
    }
  });

  const localities = [
    { name: 'Mansarovar', slug: 'mansarovar' },
    { name: 'Tonk Road', slug: 'tonk-road' },
    { name: 'Vaishali Nagar', slug: 'vaishali-nagar' },
    { name: 'Ajmer Road', slug: 'ajmer-road' },
    { name: 'C-Scheme', slug: 'c-scheme' },
    { name: 'Malviya Nagar', slug: 'malviya-nagar' },
  ];

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <>
      <Helmet>
        <title>Cars in Jaipur — Prices, Dealers, EVs & Buying Guide 2025</title>
        <meta name="description" content="Complete guide to buying cars in Jaipur. Compare on-road prices, find authorized dealers, explore EVs, and read ownership stories. Your hyperlocal car research hub." />
        <meta name="keywords" content="cars in jaipur, car dealers jaipur, on road price jaipur, ev cars jaipur, used cars jaipur, car showroom jaipur" />
        <link rel="canonical" href="https://jaipurcircle.com/cars" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Cars in Jaipur",
            "description": "Hyperlocal car buying guide for Jaipur",
            "url": "https://jaipurcircle.com/cars",
            "isPartOf": {
              "@type": "WebSite",
              "name": "JaipurCircle",
              "url": "https://jaipurcircle.com"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 md:py-20">
          <div className="absolute inset-0 bg-[url('/images/tata-sierra-jaipur.png')] bg-cover bg-center opacity-10" />
          <div className="container relative z-10 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Car className="w-3 h-3 mr-1" /> Jaipur's #1 Car Hub
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Cars in Jaipur — Prices, Dealers, EVs & Buying Guide
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Hyperlocal research hub for car buyers in Jaipur. Compare prices, find dealers, explore EVs.
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search car model or dealer..."
                  className="pl-12 pr-4 py-6 text-lg rounded-full border-2 border-primary/20 focus:border-primary shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Trending Cars */}
        <section className="py-10 container px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Trending Cars in Jaipur
              </h2>
              <p className="text-muted-foreground">Popular choices among Jaipur buyers</p>
            </div>
            <Link to="/cars/all">
              <Button variant="ghost" className="text-primary">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))
            ) : trendingModels?.map((model: any) => (
              <Link 
                key={model.id} 
                to={`/cars/${model.brand?.slug}/${model.slug}/on-road-price-in-jaipur`}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-card">
                  <div className="aspect-[16/10] bg-gradient-to-br from-muted to-muted/50 relative">
                    {model.cover_image ? (
                      <img src={model.cover_image} alt={model.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {model.is_new_launch && (
                        <Badge className="bg-green-500 text-white">New Launch</Badge>
                      )}
                      {model.is_trending && (
                        <Badge className="bg-primary text-white">High Demand</Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      {model.brand?.name}
                    </p>
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {model.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      On-road in Jaipur
                    </p>
                    <p className="text-lg font-bold text-primary mt-1">
                      {formatPrice(model.on_road_price_jaipur_min)} - {formatPrice(model.on_road_price_jaipur_max)}
                    </p>
                    {model.waiting_period_weeks && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Waiting: ~{model.waiting_period_weeks} weeks
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* On-Road Price Guides by Brand */}
        <section className="py-10 bg-muted/30">
          <div className="container px-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              On-Road Price Guides (By Brand)
            </h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {brands?.map((brand: any) => (
                <Link key={brand.id} to={`/cars/${brand.slug}`}>
                  <Button 
                    variant="outline" 
                    className="rounded-full border-primary/30 hover:bg-primary hover:text-white hover:border-primary"
                  >
                    {brand.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Dealers by Locality */}
        <section className="py-10 container px-4">
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Dealers by Locality
          </h2>
          <p className="text-muted-foreground mb-6">Find authorized showrooms near you</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {localities.map(loc => (
              <Link key={loc.slug} to={`/cars/dealers/in/${loc.slug}`}>
                <Card className="group hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <MapPin className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-medium text-foreground">Dealers in</p>
                    <p className="text-primary font-semibold">{loc.name}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* EV Cars & Charging */}
        <section className="py-10 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <div className="container px-4">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Zap className="w-6 h-6 text-green-500" />
              EV Cars & Charging in Jaipur
            </h2>
            <p className="text-muted-foreground mb-6">
              Know running costs, charging options & ownership experience
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/cars/ev">
                <Card className="group hover:shadow-xl transition-all h-full border-green-200 dark:border-green-800">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Battery className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">EV Cars in Jaipur</h3>
                      <p className="text-muted-foreground">Compare electric cars, range & prices</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/cars/charging-stations">
                <Card className="group hover:shadow-xl transition-all h-full border-green-200 dark:border-green-800">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">Charging Stations</h3>
                      <p className="text-muted-foreground">Find EV chargers across Jaipur</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Used Cars */}
        <section className="py-10 container px-4">
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Used Cars (Curated & Verified)
          </h2>
          <p className="text-muted-foreground mb-6">Trusted pre-owned cars in Jaipur</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link to="/cars/used/under-5-lakh">
              <Card className="group hover:shadow-xl hover:border-primary/30 transition-all">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary">
                    Used Cars Under ₹5 Lakh
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Budget-friendly options with verified history
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/cars/dealers/used">
              <Card className="group hover:shadow-xl hover:border-primary/30 transition-all">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary">
                    Trusted Used Car Dealers
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Certified dealers with warranty options
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Ownership Stories */}
        <section className="py-10 bg-muted/30">
          <div className="container px-4">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Ownership Stories from Jaipur
            </h2>
            <p className="text-muted-foreground mb-6">Real experiences from local car owners</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Bought my first EV in Jaipur...", excerpt: "The charging infrastructure is better than expected" },
                { title: "Family upgrade from hatchback to SUV...", excerpt: "Perfect for Jaipur roads and highway drives" },
                { title: "6 months with Tata Punch...", excerpt: "City-friendly, safe, and great mileage" }
              ].map((story, i) => (
                <Card key={i} className="hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground">{story.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{story.excerpt}</p>
                    <Button variant="link" className="p-0 h-auto text-primary mt-2">
                      Read more <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-6">
              <Link to="/cars/stories/share">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Share Your Story
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Bottom Sub-Navigation */}
        <section className="py-6 border-t bg-card sticky bottom-16 md:bottom-0 z-40">
          <div className="container px-4">
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: 'Models', href: '/cars/all' },
                { label: 'Dealers', href: '/cars/dealers' },
                { label: 'EV', href: '/cars/ev' },
                { label: 'Used Cars', href: '/cars/used' },
                { label: 'Guides', href: '/cars/guides' },
              ].map(item => (
                <Link key={item.label} to={item.href}>
                  <Button variant="secondary" size="sm" className="rounded-full">
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Footer />
        <NativeBottomNav />
      </div>
    </>
  );
};

export default CarsHubPage;
