import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ChevronRight, MapPin, Fuel, Settings, Users, Zap, Calendar, 
  Gauge, Car, ThumbsUp, ThumbsDown, CheckCircle, Phone, Clock,
  ChevronDown, ChevronUp, TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const formatPrice = (price: number) => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  return `₹${(price / 100000).toFixed(2)} Lakh`;
};

const CarModelDetailPage = () => {
  const { brand, model } = useParams<{ brand: string; model: string }>();
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { data: brandData } = useQuery({
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

  const { data: carModel, isLoading } = useQuery({
    queryKey: ['car-model', model],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_models')
        .select('*')
        .eq('slug', model)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!model
  });

  const { data: similarCars } = useQuery({
    queryKey: ['similar-cars', carModel?.body_type, carModel?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_models')
        .select('*, car_brands!inner(name, slug)')
        .eq('body_type', carModel?.body_type)
        .neq('id', carModel?.id)
        .limit(4);
      
      if (error) throw error;
      return data;
    },
    enabled: !!carModel?.body_type
  });

  const { data: dealers } = useQuery({
    queryKey: ['car-dealers', brandData?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_dealers')
        .select('*')
        .eq('brand_id', brandData?.id)
        .eq('city', 'Jaipur')
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!brandData?.id
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container px-4 py-10">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-72 w-full rounded-xl mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!carModel || !brandData) {
    return (
      <AppLayout>
        <div className="container px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Car Not Found</h1>
          <p className="text-muted-foreground mb-6">The car model you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/cars">Browse Cars</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const fullName = `${brandData.name} ${carModel.name}`;
  const onRoadPrice = carModel.on_road_price_jaipur_min || carModel.ex_showroom_price_min || 0;

  return (
    <AppLayout>
      <Helmet>
        <title>{fullName} Price in Jaipur 2025 | On-Road Price, Specs, Mileage</title>
        <meta name="description" content={`${fullName} price starts at ${formatPrice(onRoadPrice)} in Jaipur. Check on-road price, variants, specifications, mileage, colors, and find dealers.`} />
        <link rel="canonical" href={`https://jaipurcircle.com/cars/${brand}/${model}`} />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container px-4 py-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/" className="hover:text-primary">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/cars" className="hover:text-primary">Cars</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to={`/cars/${brand}`} className="hover:text-primary">{brandData.name}</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{carModel.name}</span>
            </nav>
          </div>

          {/* Main Hero Content */}
          <div className="container px-4 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left - Image */}
              <div className="relative">
                <div className="aspect-video bg-card rounded-xl overflow-hidden border">
                  <img
                    src={imageError ? getCarFallbackImage(carModel.body_type) : (carModel.cover_image || getCarFallbackImage(carModel.body_type))}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    loading="lazy"
                  />
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                  {carModel.is_new_launch && (
                    <Badge className="bg-green-500 text-white">New Launch</Badge>
                  )}
                  {carModel.is_trending && (
                    <Badge className="bg-orange-500 text-white gap-1">
                      <TrendingUp className="h-3 w-3" /> Trending
                    </Badge>
                  )}
                  {carModel.is_ev && (
                    <Badge className="bg-emerald-500 text-white gap-1">
                      <Zap className="h-3 w-3" /> Electric
                    </Badge>
                  )}
                </div>
              </div>

              {/* Right - Info */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  {brandData.logo_url && (
                    <img src={brandData.logo_url} alt={brandData.name} className="h-8 w-8 object-contain" />
                  )}
                  <span className="text-muted-foreground">{brandData.name}</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-4">{carModel.name}</h1>

                {/* Price Box */}
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">On-Road Price in Jaipur</p>
                        <p className="text-3xl font-bold text-primary">
                          {formatPrice(onRoadPrice)}
                          <span className="text-sm font-normal text-muted-foreground ml-2">onwards</span>
                        </p>
                        {carModel.ex_showroom_price_min && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Ex-showroom: {formatPrice(carModel.ex_showroom_price_min)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {carModel.waiting_period_weeks && (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {carModel.waiting_period_weeks} weeks
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Specs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {carModel.fuel_type && (
                    <div className="bg-card border rounded-lg p-3 text-center">
                      <Fuel className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-xs text-muted-foreground">Fuel Type</p>
                      <p className="font-medium text-sm">{carModel.fuel_type}</p>
                    </div>
                  )}
                  {carModel.transmission && (
                    <div className="bg-card border rounded-lg p-3 text-center">
                      <Settings className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-xs text-muted-foreground">Transmission</p>
                      <p className="font-medium text-sm">{carModel.transmission}</p>
                    </div>
                  )}
                  {(carModel.mileage_city || carModel.mileage_highway) && (
                    <div className="bg-card border rounded-lg p-3 text-center">
                      <Gauge className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-xs text-muted-foreground">Mileage</p>
                      <p className="font-medium text-sm">{carModel.mileage_city || carModel.mileage_highway} km/l</p>
                    </div>
                  )}
                  {carModel.seating_capacity && (
                    <div className="bg-card border rounded-lg p-3 text-center">
                      <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-xs text-muted-foreground">Seating</p>
                      <p className="font-medium text-sm">{carModel.seating_capacity} Seater</p>
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <Button className="flex-1 gap-2">
                    <Phone className="h-4 w-4" />
                    Get Best Offer
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Book Test Drive
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Details Tabs */}
        <section className="py-8 container px-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6 flex-wrap h-auto gap-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="pros-cons">Pros & Cons</TabsTrigger>
              <TabsTrigger value="dealers">Dealers</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Key Highlights */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Key Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {carModel.engine_cc && (
                        <div className="border rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Engine</p>
                          <p className="font-semibold">{carModel.engine_cc} cc</p>
                        </div>
                      )}
                      {carModel.power_bhp && (
                        <div className="border rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Power</p>
                          <p className="font-semibold">{carModel.power_bhp} bhp</p>
                        </div>
                      )}
                      {carModel.torque_nm && (
                        <div className="border rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Torque</p>
                          <p className="font-semibold">{carModel.torque_nm} Nm</p>
                        </div>
                      )}
                      {carModel.mileage_city && (
                        <div className="border rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">City Mileage</p>
                          <p className="font-semibold">{carModel.mileage_city} km/l</p>
                        </div>
                      )}
                      {carModel.mileage_highway && (
                        <div className="border rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Highway Mileage</p>
                          <p className="font-semibold">{carModel.mileage_highway} km/l</p>
                        </div>
                      )}
                      {carModel.body_type && (
                        <div className="border rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Body Type</p>
                          <p className="font-semibold">{carModel.body_type}</p>
                        </div>
                      )}
                    </div>

                    {/* Best For */}
                    {carModel.best_for && carModel.best_for.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-3">Best For</h4>
                        <div className="flex flex-wrap gap-2">
                          {carModel.best_for.map((item: string, i: number) => (
                            <Badge key={i} variant="outline" className="gap-1">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Price Calculator */}
                <Card>
                  <CardHeader>
                    <CardTitle>Price Breakdown (Jaipur)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ex-Showroom Price</span>
                        <span className="font-medium">{formatPrice(carModel.ex_showroom_price_min || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RTO</span>
                        <span className="font-medium">~{formatPrice((carModel.ex_showroom_price_min || 0) * 0.08)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Insurance</span>
                        <span className="font-medium">~{formatPrice((carModel.ex_showroom_price_min || 0) * 0.03)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Other Charges</span>
                        <span className="font-medium">~₹25,000</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between">
                        <span className="font-semibold">On-Road Price</span>
                        <span className="font-bold text-primary">{formatPrice(onRoadPrice)}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4">Check EMI Options</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="specs">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Engine & Performance */}
                    <div>
                      <h4 className="font-semibold mb-3 text-primary">Engine & Performance</h4>
                      <div className="space-y-2">
                        {carModel.engine_cc && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Engine Displacement</span>
                            <span className="font-medium">{carModel.engine_cc} cc</span>
                          </div>
                        )}
                        {carModel.power_bhp && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Max Power</span>
                            <span className="font-medium">{carModel.power_bhp} bhp</span>
                          </div>
                        )}
                        {carModel.torque_nm && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Max Torque</span>
                            <span className="font-medium">{carModel.torque_nm} Nm</span>
                          </div>
                        )}
                        {carModel.fuel_type && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Fuel Type</span>
                            <span className="font-medium">{carModel.fuel_type}</span>
                          </div>
                        )}
                        {carModel.transmission && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Transmission</span>
                            <span className="font-medium">{carModel.transmission}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dimensions & Comfort */}
                    <div>
                      <h4 className="font-semibold mb-3 text-primary">Dimensions & Comfort</h4>
                      <div className="space-y-2">
                        {carModel.seating_capacity && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Seating Capacity</span>
                            <span className="font-medium">{carModel.seating_capacity} Persons</span>
                          </div>
                        )}
                        {carModel.body_type && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Body Type</span>
                            <span className="font-medium">{carModel.body_type}</span>
                          </div>
                        )}
                        {carModel.mileage_city && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">City Mileage</span>
                            <span className="font-medium">{carModel.mileage_city} km/l</span>
                          </div>
                        )}
                        {carModel.mileage_highway && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Highway Mileage</span>
                            <span className="font-medium">{carModel.mileage_highway} km/l</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pros-cons">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pros */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <ThumbsUp className="h-5 w-5" />
                      Things We Like
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {carModel.pros && carModel.pros.length > 0 ? (
                      <ul className="space-y-3">
                        {carModel.pros.map((pro: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No pros listed yet.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Cons */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <ThumbsDown className="h-5 w-5" />
                      Things We Don't Like
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {carModel.cons && carModel.cons.length > 0 ? (
                      <ul className="space-y-3">
                        {carModel.cons.map((con: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="h-5 w-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs shrink-0 mt-0.5">✕</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No cons listed yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="dealers">
              {dealers && dealers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dealers.map((dealer) => (
                    <Card key={dealer.id}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{dealer.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                          <MapPin className="h-3 w-3" />
                          {dealer.address || `${dealer.locality}, ${dealer.city}`}
                        </p>
                        {dealer.phone && (
                          <Button variant="outline" size="sm" className="w-full gap-2">
                            <Phone className="h-4 w-4" />
                            {dealer.phone}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No dealers listed yet</h3>
                    <p className="text-muted-foreground mb-4">
                      We're working on adding {brandData.name} dealers in Jaipur.
                    </p>
                    <Button>Get Dealer Info</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="faq">
              <Card>
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="price">
                      <AccordionTrigger>What is the price of {fullName} in Jaipur?</AccordionTrigger>
                      <AccordionContent>
                        The on-road price of {fullName} in Jaipur starts from {formatPrice(onRoadPrice)}. 
                        The ex-showroom price starts at {formatPrice(carModel.ex_showroom_price_min || 0)}. 
                        Final price may vary based on variant and offers.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="mileage">
                      <AccordionTrigger>What is the mileage of {fullName}?</AccordionTrigger>
                      <AccordionContent>
                        The {fullName} delivers {carModel.mileage_city || 'N/A'} km/l in city 
                        and {carModel.mileage_highway || 'N/A'} km/l on highways. 
                        Actual mileage may vary based on driving conditions.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="waiting">
                      <AccordionTrigger>What is the waiting period for {fullName}?</AccordionTrigger>
                      <AccordionContent>
                        The current waiting period for {fullName} in Jaipur is approximately 
                        {carModel.waiting_period_weeks ? ` ${carModel.waiting_period_weeks} weeks` : ' varies by variant'}. 
                        Contact your nearest dealer for exact delivery timelines.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="emi">
                      <AccordionTrigger>What is the EMI for {fullName}?</AccordionTrigger>
                      <AccordionContent>
                        With a down payment of 20% and loan tenure of 5 years at ~9% interest, 
                        the estimated EMI for {fullName} starts from approximately 
                        ₹{Math.round(((onRoadPrice * 0.8) * (0.09/12) * Math.pow(1 + 0.09/12, 60)) / (Math.pow(1 + 0.09/12, 60) - 1)).toLocaleString()}/month.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Similar Cars */}
        {similarCars && similarCars.length > 0 && (
          <section className="py-8 container px-4 border-t">
            <h2 className="text-2xl font-bold mb-6">Similar Cars to {carModel.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarCars.map((car: any) => (
                <Link
                  key={car.id}
                  to={`/cars/${car.car_brands.slug}/${car.slug}`}
                  className="group bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={car.cover_image || getCarFallbackImage(car.body_type)}
                      alt={`${car.car_brands.name} ${car.name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground">{car.car_brands.name}</p>
                    <h3 className="font-semibold group-hover:text-primary">{car.name}</h3>
                    <p className="text-sm text-primary font-medium">
                      {formatPrice(car.on_road_price_jaipur_min || car.ex_showroom_price_min)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </AppLayout>
  );
};

export default CarModelDetailPage;
