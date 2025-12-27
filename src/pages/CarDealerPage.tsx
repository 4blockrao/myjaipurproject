import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Building2, MapPin, Phone, Mail, Globe, Clock, Car, ChevronRight, ArrowLeft, Navigation, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import { Footer } from '@/components/layout/Footer';

const CarDealerPage = () => {
  const { slug } = useParams();

  const { data: dealer, isLoading } = useQuery({
    queryKey: ['car-dealer', slug],
    queryFn: async () => {
      const { data } = await supabase
        .from('car_dealers')
        .select(`
          *,
          brand:car_brands(*)
        `)
        .eq('slug', slug)
        .single();
      return data;
    },
    enabled: !!slug
  });

  const { data: models } = useQuery({
    queryKey: ['dealer-models', dealer?.brand?.id],
    queryFn: async () => {
      if (!dealer?.brand?.id) return [];
      const { data } = await supabase
        .from('car_models')
        .select('*')
        .eq('brand_id', dealer.brand.id)
        .limit(6);
      return data || [];
    },
    enabled: !!dealer?.brand?.id
  });

  const nearbyLocalities = [
    'Mansarovar', 'Gopalpura', 'Shipra Path', 'Shyam Nagar', 'Raja Park'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-48 w-full rounded-xl mb-4" />
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Dealer not found</h1>
          <Link to="/cars/dealers">
            <Button className="mt-4">Browse All Dealers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{dealer.name} - {dealer.brand?.name} Showroom in {dealer.locality}, Jaipur</title>
        <meta name="description" content={`Visit ${dealer.name}, authorized ${dealer.brand?.name} dealer in ${dealer.locality}, Jaipur. Get prices, book test drive, and explore models.`} />
        <link rel="canonical" href={`https://jaipurcircle.com/cars/dealers/${slug}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoDealer",
            "name": dealer.name,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": dealer.address,
              "addressLocality": dealer.locality,
              "addressRegion": "Rajasthan",
              "addressCountry": "IN"
            },
            "telephone": dealer.phone,
            "url": dealer.website
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 py-4">
          <div className="container px-4 flex items-center gap-4">
            <Link to="/cars/dealers">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <p className="text-sm text-muted-foreground">{dealer.brand?.name} Dealer</p>
              <h1 className="text-xl font-bold text-foreground">{dealer.name}</h1>
            </div>
          </div>
        </div>

        {/* Hero Card */}
        <div className="container px-4 -mt-2">
          <Card className="overflow-hidden shadow-lg">
            {dealer.cover_image && (
              <div className="aspect-video">
                <img src={dealer.cover_image} alt={dealer.name} className="w-full h-full object-cover" />
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {dealer.is_verified && (
                  <Badge className="bg-green-500 text-white">Verified Dealer</Badge>
                )}
                <Badge variant="secondary">{dealer.dealer_type || 'Authorized'}</Badge>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">
                {dealer.name} — {dealer.brand?.name} Showroom in {dealer.locality}, Jaipur
              </h2>

              {/* Rating */}
              {dealer.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{dealer.rating}</span>
                  </div>
                  <span className="text-muted-foreground">({dealer.review_count} reviews)</span>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                {dealer.phone && (
                  <a href={`tel:${dealer.phone}`} className="flex-1">
                    <Button className="w-full">
                      <Phone className="w-4 h-4 mr-2" /> Call
                    </Button>
                  </a>
                )}
                <Button variant="outline" className="flex-1">
                  <Mail className="w-4 h-4 mr-2" /> Enquire
                </Button>
                {dealer.latitude && dealer.longitude && (
                  <a 
                    href={`https://maps.google.com/?q=${dealer.latitude},${dealer.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="secondary" className="w-full">
                      <Navigation className="w-4 h-4 mr-2" /> Directions
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* About */}
        <div className="container px-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>About This Dealership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {dealer.brand?.name} authorized dealership serving {dealer.locality} and nearby areas in Jaipur. 
                Visit us for sales, service, and genuine spare parts.
              </p>
              
              {dealer.services_offered && dealer.services_offered.length > 0 && (
                <div>
                  <p className="font-medium text-foreground mb-2">Services Offered:</p>
                  <div className="flex flex-wrap gap-2">
                    {dealer.services_offered.map((service: string, i: number) => (
                      <Badge key={i} variant="outline">{service}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact & Location */}
        <div className="container px-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dealer.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{dealer.address}</p>
                    <p className="text-sm text-muted-foreground">{dealer.locality}, Jaipur {dealer.pincode}</p>
                  </div>
                </div>
              )}
              
              {dealer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <a href={`tel:${dealer.phone}`} className="text-primary hover:underline">{dealer.phone}</a>
                </div>
              )}
              
              {dealer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <a href={`mailto:${dealer.email}`} className="text-primary hover:underline">{dealer.email}</a>
                </div>
              )}
              
              {dealer.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-primary" />
                  <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Visit Website
                  </a>
                </div>
              )}

              <Button variant="outline" className="w-full mt-4">
                <Navigation className="w-4 h-4 mr-2" /> Open in Maps
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Popular Models */}
        {models && models.length > 0 && (
          <div className="container px-4 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Popular Models at This Showroom</CardTitle>
                <Link to={`/cars/${dealer.brand?.slug}`}>
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {models.map((model: any) => (
                    <Link 
                      key={model.id} 
                      to={`/cars/${dealer.brand?.slug}/${model.slug}/on-road-price-in-jaipur`}
                    >
                      <div className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center">
                        <Car className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="font-medium text-foreground text-sm">{model.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Nearby Localities */}
        <div className="container px-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Nearby Localities Served</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {nearbyLocalities.map((loc, i) => (
                  <Link key={i} to={`/jaipur/${loc.toLowerCase().replace(' ', '-')}`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      {loc}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Footer />
        <NativeBottomNav />
      </div>
    </>
  );
};

export default CarDealerPage;
