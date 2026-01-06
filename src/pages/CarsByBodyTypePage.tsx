import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Car, ArrowLeft, Truck, CarFront, Fuel, Gauge, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';

const bodyTypes = [
  { key: 'suv', label: 'SUV', icon: Truck },
  { key: 'sedan', label: 'Sedan', icon: CarFront },
  { key: 'hatchback', label: 'Hatchback', icon: Car },
  { key: 'compact-suv', label: 'Compact SUV', icon: Truck },
  { key: 'muv', label: 'MUV', icon: Truck },
  { key: 'coupe', label: 'Coupe', icon: CarFront },
  { key: 'pickup', label: 'Pickup', icon: Truck },
];

// Fallback images for cars when cover_image is missing
const getCarFallbackImage = (bodyType: string) => {
  const bodyTypeImages: Record<string, string> = {
    'suv': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/141867/nexon-exterior-right-front-three-quarter-79.png',
    'compact-suv': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/107541/punch-exterior-right-front-three-quarter-62.png',
    'hatchback': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/102849/swift-exterior-right-front-three-quarter-2.png',
    'sedan': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/144169/verna-exterior-right-front-three-quarter-57.png',
    'muv': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/115025/ertiga-exterior-right-front-three-quarter-3.png',
    'coupe': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/144169/verna-exterior-right-front-three-quarter-57.png',
    'pickup': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/116977/scorpio-n-exterior-right-front-three-quarter-3.png',
  };
  return bodyTypeImages[bodyType] || bodyTypeImages['suv'];
};

const CarsByBodyTypePage = () => {
  const { bodyType } = useParams();
  const selectedType = bodyTypes.find(t => t.key === bodyType) || bodyTypes[0];
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const { data: cars, isLoading } = useQuery({
    queryKey: ['cars-by-body-type', bodyType],
    queryFn: async () => {
      const { data } = await supabase
        .from('car_models')
        .select(`*, brand:car_brands(name, slug, logo_url)`)
        .eq('body_type', bodyType)
        .order('on_road_price_jaipur_min');
      return data || [];
    },
    enabled: !!bodyType
  });

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleImageError = (id: string) => {
    setImageErrors(prev => new Set(prev).add(id));
  };

  return (
    <>
      <Helmet>
        <title>Best {selectedType.label}s in Jaipur 2025 | On-Road Prices & Dealers</title>
        <meta name="description" content={`Find the best ${selectedType.label}s in Jaipur. Compare prices, features, mileage and book test drives at authorized dealers.`} />
        <link rel="canonical" href={`https://jaipurcircle.com/cars/body-type/${bodyType}`} />
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
              <selectedType.icon className="w-8 h-8 text-primary" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Best {selectedType.label}s in Jaipur (2025)
            </h1>
            <p className="text-muted-foreground mt-2">
              {cars?.length || 0} {selectedType.label.toLowerCase()}s with Jaipur on-road prices
            </p>
          </div>
        </section>

        {/* Body Type Tabs */}
        <div className="container px-4 py-4 overflow-x-auto">
          <Tabs value={bodyType} className="w-full">
            <TabsList className="inline-flex w-max gap-1 bg-muted/50 p-1">
              {bodyTypes.map((type) => (
                <Link key={type.key} to={`/cars/body-type/${type.key}`}>
                  <TabsTrigger value={type.key} className="whitespace-nowrap text-sm flex items-center gap-2">
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </TabsTrigger>
                </Link>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Cars Grid */}
        <section className="container px-4 py-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video" />
                  <CardContent className="p-4">
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-3 w-40 mb-4" />
                    <Skeleton className="h-6 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : cars && cars.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cars.map((car: any) => {
                const imageUrl = imageErrors.has(car.id) 
                  ? getCarFallbackImage(car.body_type)
                  : (car.cover_image || getCarFallbackImage(car.body_type));

                return (
                  <Link key={car.id} to={`/cars/${car.brand?.slug}/${car.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all h-full group">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={`${car.brand?.name} ${car.name}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={() => handleImageError(car.id)}
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          {car.is_new_launch && <Badge className="bg-green-500 text-white text-xs">New</Badge>}
                          {car.is_ev && <Badge className="bg-emerald-500 text-white text-xs">EV</Badge>}
                          {car.is_trending && <Badge className="bg-primary text-white text-xs">Trending</Badge>}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">{car.brand?.name}</p>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{car.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 capitalize">
                                <Fuel className="w-3 h-3" /> {car.fuel_type}
                              </span>
                              <span className="flex items-center gap-1 capitalize">
                                <Settings className="w-3 h-3" /> {car.transmission}
                              </span>
                              {car.seating_capacity && (
                                <span>{car.seating_capacity} Seater</span>
                              )}
                            </div>
                          </div>
                          {car.brand?.logo_url && (
                            <img src={car.brand.logo_url} alt={car.brand.name} className="w-8 h-8 object-contain" />
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t flex items-end justify-between">
                          <div>
                            <p className="text-lg font-bold text-primary">
                              {formatPrice(car.on_road_price_jaipur_min)}
                            </p>
                            <p className="text-xs text-muted-foreground">onwards</p>
                          </div>
                          {car.mileage_city && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground flex items-center gap-1">
                                <Gauge className="w-3 h-3" /> {car.mileage_city} kmpl
                              </p>
                              <p className="text-xs text-muted-foreground">mileage</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <selectedType.icon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No {selectedType.label.toLowerCase()}s found</h3>
              <p className="text-muted-foreground mb-4">Check back soon for updates</p>
              <Link to="/cars">
                <Button>Browse All Cars</Button>
              </Link>
            </div>
          )}
        </section>

        <Footer />
        <NativeBottomNav />
      </div>
    </>
  );
};

export default CarsByBodyTypePage;
