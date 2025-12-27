import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Car, MapPin, Phone, Calendar, Fuel, Settings, Users, ChevronRight, Check, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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

  const formatPrice = (price: number) => {
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

      <div className="min-h-screen bg-background pb-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-muted to-background">
          {/* Navigation */}
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between">
            <Link to="/cars">
              <Button variant="secondary" size="icon" className="rounded-full shadow-lg">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="secondary" size="icon" className="rounded-full shadow-lg">
              <Share2 className="w-5 h-5" />
            </Button>
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
                {carModel.brand?.name} {carModel.name} On-Road Price in Jaipur (2025)
              </h1>
              
              <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-sm text-muted-foreground">Jaipur On-Road Estimate</p>
                <p className="text-3xl font-bold text-primary mt-1">
                  {formatPrice(carModel.on_road_price_jaipur_min)} – {formatPrice(carModel.on_road_price_jaipur_max)}
                </p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" /> Waiting: {waitingPeriodLabel}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" /> Available Citywide
                  </span>
                </div>
              </div>

              {/* CTA Row */}
              <div className="flex flex-wrap gap-3 mt-6">
                <Button 
                  className="flex-1 md:flex-none"
                  onClick={() => { setEnquiryType('price'); setShowEnquiry(true); }}
                >
                  Get Price Quote
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 md:flex-none"
                  onClick={() => { setEnquiryType('test-drive'); setShowEnquiry(true); }}
                >
                  Book Test Drive
                </Button>
                <Link to={`/cars/${brand}/compare`} className="flex-1 md:flex-none">
                  <Button variant="secondary" className="w-full">Compare</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Key Specs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { icon: Fuel, label: 'Fuel Type', value: carModel.fuel_type?.replace('-', ' ') || 'Petrol' },
              { icon: Settings, label: 'Transmission', value: carModel.transmission?.toUpperCase() || 'Manual' },
              { icon: Car, label: 'Body Type', value: carModel.body_type?.replace('-', ' ') || 'SUV' },
              { icon: Users, label: 'Seating', value: carModel.seating_capacity ? `${carModel.seating_capacity} Seater` : '5 Seater' },
            ].map((spec, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <spec.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">{spec.label}</p>
                  <p className="font-semibold text-foreground capitalize">{spec.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Best For */}
          {carModel.best_for && carModel.best_for.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Who This Car is Best For</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {carModel.best_for.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-foreground">
                      <Check className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Dealers */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Dealers Selling {carModel.name} in Jaipur</CardTitle>
              <Link to={`/cars/dealers/${brand}`}>
                <Button variant="ghost" size="sm" className="text-primary">
                  View All <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {dealers && dealers.length > 0 ? (
                <div className="space-y-3">
                  {dealers.map((dealer: any) => (
                    <div key={dealer.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{dealer.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {dealer.locality}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {dealer.phone && (
                          <a href={`tel:${dealer.phone}`}>
                            <Button size="sm" variant="outline">
                              <Phone className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        <Button size="sm">Enquire</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No dealers found. Check back soon!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sticky Bottom CTA */}
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-card border-t p-4 z-40">
          <div className="container flex gap-3">
            <Button 
              className="flex-1"
              onClick={() => { setEnquiryType('price'); setShowEnquiry(true); }}
            >
              Enquire Now
            </Button>
            <Button variant="outline" className="flex-1">
              <Phone className="w-4 h-4 mr-2" /> Call Dealer
            </Button>
          </div>
        </div>

        {/* Enquiry Modal */}
        <Dialog open={showEnquiry} onOpenChange={setShowEnquiry}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {enquiryType === 'price' ? 'Get Price Quote' : 'Book Test Drive'} - {carModel.brand?.name} {carModel.name}
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
                <Label htmlFor="locality">Your Locality</Label>
                <Input id="locality" name="locality" placeholder="e.g., Mansarovar" />
              </div>
              <div>
                <Label htmlFor="intent">Buying Intent</Label>
                <Select name="intent" defaultValue="researching">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="researching">Just Researching</SelectItem>
                    <SelectItem value="likely-to-buy">Likely to Buy Soon</SelectItem>
                    <SelectItem value="ready-to-buy">Ready to Buy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Submit Enquiry</Button>
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
