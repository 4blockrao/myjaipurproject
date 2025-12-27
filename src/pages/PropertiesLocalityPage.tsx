import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, MapPin, ChevronLeft, Bed, Bath, Maximize, Star
} from 'lucide-react';

const formatPrice = (price: number, listingType: string) => {
  if (listingType === 'rent') {
    return `₹${price.toLocaleString('en-IN')}/mo`;
  }
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lac`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
};

const PropertyCard = ({ property }: { property: any }) => {
  return (
    <Link to={`/properties/${property.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {property.cover_image ? (
            <img 
              src={property.cover_image} 
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <Building2 className="h-16 w-16 text-primary/30" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs font-medium">
              {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
            </Badge>
            {property.is_featured && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-lg font-bold text-foreground">
              {formatPrice(property.price, property.listing_type)}
            </span>
          </div>
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {property.title}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              {property.locality}, Jaipur
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {property.bedrooms && (
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                {property.bedrooms} BHK
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                {property.bathrooms}
              </span>
            )}
            {property.carpet_area && (
              <span className="flex items-center gap-1">
                <Maximize className="h-4 w-4" />
                {property.carpet_area} sq.ft
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function PropertiesLocalityPage() {
  const { locality } = useParams<{ locality: string }>();
  const localityName = locality?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || '';

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties-locality', locality],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .eq('locality_slug', locality)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!locality,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <>
      <Helmet>
        <title>Properties in {localityName} | Buy & Rent Flats, Houses | JaipurCircle</title>
        <meta name="description" content={`Find properties in ${localityName}, Jaipur. Browse apartments, houses, villas & plots for sale and rent.`} />
        <link rel="canonical" href={`https://www.jaipurcircle.com/properties/in/${locality}`} />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
          <div className="container max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
            <Link to="/properties" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-semibold text-foreground">Properties in {localityName}</h1>
              <p className="text-xs text-muted-foreground">{properties.length} properties found</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="py-6 px-4">
          <div className="container max-w-6xl mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-muted rounded-t-lg" />
                    <div className="p-4 space-y-3 border border-t-0 rounded-b-lg">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No properties in {localityName}</h3>
                <p className="text-muted-foreground mb-6">Check back later or explore other localities</p>
                <Link to="/properties">
                  <Button>Browse All Properties</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      <NativeBottomNav />
    </>
  );
}