import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, MapPin, Bed, Bath, Maximize, ChevronLeft, Phone, 
  Mail, Share2, Heart, Calendar, Compass, Home, IndianRupee,
  CheckCircle2, AlertCircle
} from 'lucide-react';

const formatPrice = (price: number, listingType: string) => {
  if (listingType === 'rent') {
    return `₹${price.toLocaleString('en-IN')}/month`;
  }
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Crore`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lakh`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
};

const amenityLabels: Record<string, string> = {
  'parking': 'Parking',
  'lift': 'Lift',
  'security': '24x7 Security',
  'power-backup': 'Power Backup',
  'gym': 'Gymnasium',
  'swimming-pool': 'Swimming Pool',
  'garden': 'Garden',
  'club-house': 'Club House',
  'ac': 'Air Conditioning',
  'wifi': 'WiFi',
  'meals': 'Meals Included',
  'laundry': 'Laundry',
  'corner-plot': 'Corner Plot',
  'road-facing': 'Road Facing',
  'main-road': 'Main Road',
};

export default function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Property Not Found</h1>
        <p className="text-muted-foreground mb-6">The property you're looking for doesn't exist.</p>
        <Link to="/properties">
          <Button>Browse All Properties</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{property.title} | {property.locality} | JaipurCircle Properties</title>
        <meta name="description" content={property.meta_description || property.description?.slice(0, 160) || `${property.title} in ${property.locality}, Jaipur. ${property.bedrooms ? property.bedrooms + ' BHK' : ''} ${property.property_type} for ${property.listing_type}.`} />
        <link rel="canonical" href={`https://www.jaipurcircle.com/properties/${property.slug}`} />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
          <div className="container max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link to="/properties" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Image Gallery */}
        <section className="relative aspect-video md:aspect-[21/9] bg-muted">
          {property.cover_image ? (
            <img 
              src={property.cover_image} 
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <Building2 className="h-24 w-24 text-primary/30" />
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-background/90 text-foreground backdrop-blur-sm">
              {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
            </Badge>
            {property.is_verified && (
              <Badge className="bg-green-500/90 text-white backdrop-blur-sm">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </section>

        {/* Content */}
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Price */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">{property.title}</h1>
                </div>
                <p className="text-muted-foreground flex items-center gap-1 mb-4">
                  <MapPin className="h-4 w-4" />
                  {property.address || property.locality}, Jaipur {property.pincode && `- ${property.pincode}`}
                </p>
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(property.price, property.listing_type)}
                </p>
                {property.price_per_sqft && (
                  <p className="text-sm text-muted-foreground">
                    ₹{property.price_per_sqft.toLocaleString('en-IN')} per sq.ft
                  </p>
                )}
              </div>

              <Separator />

              {/* Key Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Property Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {property.bedrooms && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Bed className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Bedrooms</p>
                          <p className="font-semibold">{property.bedrooms} BHK</p>
                        </div>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Bath className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Bathrooms</p>
                          <p className="font-semibold">{property.bathrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.carpet_area && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Maximize className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Carpet Area</p>
                          <p className="font-semibold">{property.carpet_area} sq.ft</p>
                        </div>
                      </div>
                    )}
                    {property.facing && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Compass className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Facing</p>
                          <p className="font-semibold">{property.facing}</p>
                        </div>
                      </div>
                    )}
                    {property.furnishing && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Home className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Furnishing</p>
                          <p className="font-semibold capitalize">{property.furnishing.replace('-', ' ')}</p>
                        </div>
                      </div>
                    )}
                    {property.floor_number && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Building2 className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Floor</p>
                          <p className="font-semibold">{property.floor_number} of {property.total_floors}</p>
                        </div>
                      </div>
                    )}
                    {property.property_age && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Property Age</p>
                          <p className="font-semibold capitalize">{property.property_age}</p>
                        </div>
                      </div>
                    )}
                    {property.listing_type === 'rent' && property.security_deposit && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <IndianRupee className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Security Deposit</p>
                          <p className="font-semibold">₹{property.security_deposit.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {property.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity: string) => (
                        <Badge key={amenity} variant="secondary" className="py-2 px-3">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                          {amenityLabels[amenity] || amenity.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Contact */}
            <div className="space-y-6">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="text-lg">Contact {property.owner_type === 'owner' ? 'Owner' : 'Agent'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full gap-2" size="lg">
                    <Phone className="h-4 w-4" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="w-full gap-2" size="lg">
                    <Mail className="h-4 w-4" />
                    Send Inquiry
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    By contacting, you agree to our Terms of Service
                  </p>
                </CardContent>
              </Card>

              {/* Locality Link */}
              {property.locality_slug && (
                <Card>
                  <CardContent className="p-4">
                    <Link 
                      to={`/jaipur/${property.locality_slug}`}
                      className="flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          Explore {property.locality}
                        </p>
                        <p className="text-sm text-muted-foreground">View locality profile</p>
                      </div>
                      <MapPin className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <NativeBottomNav />
    </>
  );
}