import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Car, MapPin, Phone, Calendar, Fuel, Settings, Users, ChevronRight, Check, ArrowLeft, Share2, Gauge, Zap, Shield, X, Star, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const CarModelPage = () => {
  const { brand, model } = useParams();
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [enquiryType, setEnquiryType] = useState<'price' | 'test-drive'>('price');

  const { data: carModel, isLoading } = useQuery({
    queryKey: ['car-model', brand, model],
    queryFn: async () => {
      const { data } = await supabase
        .from('car_models')
        .select(`
          *,
          brand:car_brands(*)
        `)
        .eq('slug', model)
        .single();
      return data;
    },
    enabled: !!model
  });

  const { data: dealers } = useQuery({
    queryKey: ['car-dealers', brand],
    queryFn: async () => {
      if (!carModel?.brand?.id) return [];
      const { data } = await supabase
        .from('car_dealers')
        .select('*')
        .eq('brand_id', carModel.brand.id)
        .limit(4);
      return data || [];
    },
    enabled: !!carModel?.brand?.id
  });

  const { data: similarCars } = useQuery({
    queryKey: ['similar-cars', carModel?.body_type, carModel?.id],
    queryFn: async () => {
      if (!carModel) return [];
      const { data } = await supabase
        .from('car_models')
        .select(`*, brand:car_brands(name, slug)`)
        .eq('body_type', carModel.body_type)
        .neq('id', carModel.id)
        .limit(4);
      return data || [];
    },
    enabled: !!carModel
  });

  const formatPrice = (price: number) => {
    if (!price) return 'N/A';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleEnquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from('car_inquiries').insert({
      model_id: carModel?.id,
      inquiry_type: enquiryType === 'price' ? 'price-quote' : 'test-drive',
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      locality: formData.get('locality') as string,
      intent_stage: formData.get('intent') as string,
    });

    if (error) {
      toast.error('Failed to submit enquiry. Please try again.');
    } else {
      toast.success('Enquiry submitted! We\'ll connect you with dealers shortly.');
      setShowEnquiry(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-64 w-full rounded-xl mb-4" />
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    );
  }

  if (!carModel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Car not found</h1>
          <Link to="/cars">
            <Button className="mt-4">Back to Cars Hub</Button>
          </Link>
        </div>
      </div>
    );
  }

  const waitingPeriodLabel = carModel.waiting_period_weeks 
    ? carModel.waiting_period_weeks <= 2 ? 'Short' 
    : carModel.waiting_period_weeks <= 6 ? 'Moderate' : 'High'
    : 'Check with dealer';

  const specs = {
    engine: [
      { label: 'Engine CC', value: carModel.engine_cc ? `${carModel.engine_cc} cc` : 'N/A' },
      { label: 'Power', value: carModel.power_bhp ? `${carModel.power_bhp} bhp` : 'N/A' },
      { label: 'Torque', value: carModel.torque_nm ? `${carModel.torque_nm} Nm` : 'N/A' },
      { label: 'Fuel Type', value: carModel.fuel_type || 'Petrol' },
      { label: 'Transmission', value: carModel.transmission || 'Manual' },
    ],
    mileage: [
      { label: 'City Mileage', value: carModel.mileage_city ? `${carModel.mileage_city} kmpl` : 'N/A' },
      { label: 'Highway Mileage', value: carModel.mileage_highway ? `${carModel.mileage_highway} kmpl` : 'N/A' },
    ],
    dimensions: [
      { label: 'Body Type', value: carModel.body_type || 'N/A' },
      { label: 'Seating Capacity', value: carModel.seating_capacity ? `${carModel.seating_capacity} Seater` : '5 Seater' },
    ]
  };

  return (
    <>
      <Helmet>
        <title>{carModel.name} On-Road Price in Jaipur 2025 | {carModel.brand?.name}</title>
        <meta name="description" content={`${carModel.brand?.name} ${carModel.name} on-road price in Jaipur starts from ${formatPrice(carModel.on_road_price_jaipur_min)}. Check variants, features, dealers & book test drive.`} />
        <link rel="canonical" href={`https://jaipurcircle.com/cars/${brand}/${model}/on-road-price-in-jaipur`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": `${carModel.brand?.name} ${carModel.name}`,
            "description": carModel.meta_description,
            "brand": { "@type": "Brand", "name": carModel.brand?.name },
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "INR",
              "lowPrice": carModel.on_road_price_jaipur_min,
              "highPrice": carModel.on_road_price_jaipur_max,
              "offerCount": "1"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-muted to-background">
          {/* Navigation */}
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between">
            <Link to="/cars">
              <Button variant="secondary" size="icon" className="rounded-full shadow-lg">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex gap-2">
              <Link to={`/cars/compare?car1=${carModel.id}`}>
                <Button variant="secondary" size="icon" className="rounded-full shadow-lg">
                  <Scale className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="secondary" size="icon" className="rounded-full shadow-lg">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Car Image */}
          <div className="aspect-[16/10] md:aspect-[21/9] relative">
            {carModel.cover_image ? (
              <img src={carModel.cover_image} alt={carModel.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Car className="w-24 h-24 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </section>

        {/* Main Content */}
        <div className="container px-4 -mt-8 relative z-10">
          <Card className="shadow-xl">
            <CardContent className="p-6">
              {/* Title & Price */}
              <div className="flex flex-wrap gap-2 mb-2">
                {carModel.is_new_launch && <Badge className="bg-green-500 text-white">New Launch</Badge>}
                {carModel.is_ev && <Badge className="bg-emerald-500 text-white">Electric</Badge>}
                {carModel.is_trending && <Badge className="bg-primary text-white">Trending</Badge>}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {carModel.brand?.name} {carModel.name}
              </h1>
              <p className="text-muted-foreground mt-1">On-Road Price in Jaipur (January 2025)</p>
              
              <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(carModel.on_road_price_jaipur_min)}
                  </p>
                  <span className="text-muted-foreground">–</span>
                  <p className="text-xl font-semibold text-foreground">
                    {formatPrice(carModel.on_road_price_jaipur_max)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">*On-road price in Jaipur (incl. RTO, insurance)</p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" /> Waiting: {waitingPeriodLabel}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" /> {dealers?.length || 0}+ Dealers in Jaipur
                  </span>
                </div>
              </div>

              {/* CTA Row */}
              <div className="flex flex-wrap gap-3 mt-6">
                <Button 
                  className="flex-1 md:flex-none"
                  onClick={() => { setEnquiryType('price'); setShowEnquiry(true); }}
                >
                  Get On-Road Price
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 md:flex-none"
                  onClick={() => { setEnquiryType('test-drive'); setShowEnquiry(true); }}
                >
                  Book Test Drive
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Key Specs */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            {[
              { icon: Fuel, label: 'Fuel', value: carModel.fuel_type || 'Petrol' },
              { icon: Settings, label: 'Trans.', value: carModel.transmission?.toUpperCase() || 'Manual' },
              { icon: Gauge, label: 'Mileage', value: carModel.mileage_city ? `${carModel.mileage_city}` : 'N/A' },
              { icon: Users, label: 'Seats', value: carModel.seating_capacity || '5' },
            ].map((spec, i) => (
              <Card key={i} className="text-center">
                <CardContent className="p-3">
                  <spec.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">{spec.label}</p>
                  <p className="font-semibold text-foreground text-sm capitalize">{spec.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Specs Tabs */}
          <Card className="mt-6">
            <Tabs defaultValue="specs">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
                <TabsTrigger value="specs" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Specifications
                </TabsTrigger>
                <TabsTrigger value="pros-cons" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Pros & Cons
                </TabsTrigger>
                <TabsTrigger value="similar" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Similar Cars
                </TabsTrigger>
              </TabsList>

              <TabsContent value="specs" className="p-4 space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" /> Engine & Performance
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {specs.engine.map((spec, i) => (
                      <div key={i} className="flex justify-between p-2 bg-muted/50 rounded">
                        <span className="text-muted-foreground text-sm">{spec.label}</span>
                        <span className="font-medium text-foreground text-sm capitalize">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-primary" /> Mileage
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {specs.mileage.map((spec, i) => (
                      <div key={i} className="flex justify-between p-2 bg-muted/50 rounded">
                        <span className="text-muted-foreground text-sm">{spec.label}</span>
                        <span className="font-medium text-foreground text-sm">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Car className="w-4 h-4 text-primary" /> Dimensions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {specs.dimensions.map((spec, i) => (
                      <div key={i} className="flex justify-between p-2 bg-muted/50 rounded">
                        <span className="text-muted-foreground text-sm">{spec.label}</span>
                        <span className="font-medium text-foreground text-sm capitalize">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pros-cons" className="p-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {carModel.pros && carModel.pros.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                        <Check className="w-4 h-4" /> What We Like
                      </h3>
                      <ul className="space-y-2">
                        {carModel.pros.map((pro: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-foreground">
                            <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3" />
                            </span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {carModel.cons && carModel.cons.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                        <X className="w-4 h-4" /> What Could Be Better
                      </h3>
                      <ul className="space-y-2">
                        {carModel.cons.map((con: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-foreground">
                            <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <X className="w-3 h-3" />
                            </span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {carModel.best_for && carModel.best_for.length > 0 && (
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-3">Best For</h3>
                    <div className="flex flex-wrap gap-2">
                      {carModel.best_for.map((item: string, i: number) => (
                        <Badge key={i} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="similar" className="p-4">
                {similarCars && similarCars.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {similarCars.map((car: any) => (
                      <Link key={car.id} to={`/cars/${car.brand?.slug}/${car.slug}`}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="aspect-video bg-muted rounded mb-2 flex items-center justify-center">
                              {car.cover_image ? (
                                <img src={car.cover_image} alt={car.name} className="w-full h-full object-cover rounded" />
                              ) : (
                                <Car className="w-8 h-8 text-muted-foreground/30" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{car.brand?.name}</p>
                            <h4 className="font-semibold text-foreground text-sm">{car.name}</h4>
                            <p className="text-primary font-bold text-sm mt-1">{formatPrice(car.on_road_price_jaipur_min)}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No similar cars found</p>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          {/* Dealers */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{carModel.brand?.name} Dealers in Jaipur</CardTitle>
              <Link to={`/cars/dealers?brand=${brand}`}>
                <Button variant="ghost" size="sm" className="text-primary">
                  View All <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {dealers && dealers.length > 0 ? (
                <div className="space-y-3">
                  {dealers.map((dealer: any) => (
                    <Link key={dealer.id} to={`/cars/dealers/${dealer.slug}`}>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div>
                          <p className="font-medium text-foreground">{dealer.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {dealer.locality}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {dealer.rating > 0 && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              {dealer.rating}
                            </div>
                          )}
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No dealers found. Check back soon!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sticky Bottom CTA */}
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-card border-t p-3 z-40">
          <div className="container flex gap-2">
            <Button 
              className="flex-1"
              onClick={() => { setEnquiryType('price'); setShowEnquiry(true); }}
            >
              Get Price Quote
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => { setEnquiryType('test-drive'); setShowEnquiry(true); }}
            >
              Book Test Drive
            </Button>
          </div>
        </div>

        {/* Enquiry Modal */}
        <Dialog open={showEnquiry} onOpenChange={setShowEnquiry}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {enquiryType === 'price' ? 'Get On-Road Price' : 'Book Test Drive'} - {carModel.brand?.name} {carModel.name}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEnquirySubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" required />
              </div>
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div>
                <Label htmlFor="locality">Your Locality in Jaipur</Label>
                <Input id="locality" name="locality" placeholder="e.g., Mansarovar, Vaishali Nagar" />
              </div>
              <div>
                <Label htmlFor="intent">Buying Intent</Label>
                <Select name="intent" defaultValue="researching">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="researching">Just Researching</SelectItem>
                    <SelectItem value="likely-to-buy">Planning to Buy in 1-3 Months</SelectItem>
                    <SelectItem value="ready-to-buy">Ready to Buy This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Submit Enquiry</Button>
              <p className="text-xs text-muted-foreground text-center">
                By submitting, you agree to be contacted by authorized {carModel.brand?.name} dealers
              </p>
            </form>
          </DialogContent>
        </Dialog>

        <Footer />
        <NativeBottomNav />
      </div>
    </>
  );
};

export default CarModelPage;
