import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { PropertiesListSEO } from '@/components/seo/PropertySEO';
import { useUserLocality } from '@/hooks/useUserLocality';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Building2, Home, MapPin, Search, IndianRupee, Bed, Bath, 
  Maximize, ChevronRight, Filter, TrendingUp, Star, Building,
  LandPlot, Store, Users, ArrowRight
} from 'lucide-react';

const propertyTypes = [
  { value: 'apartment', label: 'Apartment', icon: Building2 },
  { value: 'house', label: 'House', icon: Home },
  { value: 'villa', label: 'Villa', icon: Building },
  { value: 'plot', label: 'Plot', icon: LandPlot },
  { value: 'commercial', label: 'Commercial', icon: Store },
  { value: 'pg', label: 'PG/Hostel', icon: Users },
];

const popularLocalities = [
  { name: 'Malviya Nagar', slug: 'malviya-nagar', count: 156 },
  { name: 'Vaishali Nagar', slug: 'vaishali-nagar', count: 142 },
  { name: 'Mansarovar', slug: 'mansarovar', count: 198 },
  { name: 'Jagatpura', slug: 'jagatpura', count: 167 },
  { name: 'C-Scheme', slug: 'c-scheme', count: 89 },
  { name: 'Raja Park', slug: 'raja-park', count: 76 },
  { name: 'Tonk Road', slug: 'tonk-road', count: 112 },
  { name: 'Jawahar Nagar', slug: 'jawahar-nagar', count: 94 },
];

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
              alt={`${property.title} - ${property.bedrooms ? property.bedrooms + ' BHK' : ''} ${property.property_type} in ${property.locality}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
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
          
          {property.furnishing && (
            <Badge variant="outline" className="text-xs capitalize">
              {property.furnishing.replace('-', ' ')}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default function PropertiesHubPage() {
  const [listingType, setListingType] = useState<'all' | 'sale' | 'rent'>('all');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { userLocality } = useUserLocality();

  // Fetch properties - prioritize user's locality
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties', listingType, selectedType, userLocality?.slug],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(12);

      if (listingType !== 'all') {
        query = query.eq('listing_type', listingType);
      }
      if (selectedType) {
        query = query.eq('property_type', selectedType);
      }
      // Prioritize user's locality if set
      if (userLocality?.slug) {
        query = query.or(`locality_slug.eq.${userLocality.slug},locality_slug.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['property-stats'],
    queryFn: async () => {
      const { count: totalCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: saleCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('listing_type', 'sale');

      const { count: rentCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('listing_type', 'rent');

      return {
        total: totalCount || 0,
        sale: saleCount || 0,
        rent: rentCount || 0,
      };
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <AppLayout
      title="Properties"
      subtitle={userLocality ? `in ${userLocality.name}` : 'Buy & Rent in Jaipur'}
      showBackButton={true}
      backPath="/"
    >
      <PropertiesListSEO 
        listingType={listingType} 
        totalCount={stats?.total} 
      />

      <main className="space-y-0" role="main">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-8 px-4" aria-labelledby="properties-heading">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-6">
              <Badge variant="secondary" className="mb-3">
                <Building2 className="h-3.5 w-3.5 mr-1" />
                {userLocality ? `Properties in ${userLocality.name}` : 'Jaipur Properties'}
              </Badge>
              <h1 id="properties-heading" className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Find Your Perfect Property in Jaipur
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
                Browse {stats?.total || '100+'}  verified properties for sale & rent across all localities
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search by locality, property name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-12 text-base rounded-xl border-2 focus:border-primary"
                  aria-label="Search properties"
                />
                <Button className="absolute right-2 top-1/2 -translate-y-1/2 h-8">
                  Search
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex justify-center gap-6 mt-6">
              <div className="text-center">
                <p className="text-xl font-bold text-primary">{stats?.sale || 0}</p>
                <p className="text-xs text-muted-foreground">For Sale</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <p className="text-xl font-bold text-primary">{stats?.rent || 0}</p>
                <p className="text-xs text-muted-foreground">For Rent</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <p className="text-xl font-bold text-primary">{popularLocalities.length}+</p>
                <p className="text-xs text-muted-foreground">Localities</p>
              </div>
            </div>
          </div>
        </section>

        {/* Property Types */}
        <section className="py-4 px-4 border-b" aria-label="Property type filters">
          <div className="container max-w-6xl mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {propertyTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.value;
                return (
                  <Button
                    key={type.value}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(isSelected ? null : type.value)}
                    className="flex-shrink-0 gap-2"
                    aria-pressed={isSelected}
                  >
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-6 px-4" aria-labelledby="listings-heading">
          <div className="container max-w-6xl mx-auto">
            <h2 id="listings-heading" className="sr-only">Property Listings</h2>
            <Tabs value={listingType} onValueChange={(v) => setListingType(v as any)} className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Properties</TabsTrigger>
                  <TabsTrigger value="sale">Buy</TabsTrigger>
                  <TabsTrigger value="rent">Rent</TabsTrigger>
                </TabsList>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              <TabsContent value="all" className="mt-0">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[4/3] bg-muted rounded-t-lg" />
                        <div className="p-4 space-y-3 border border-t-0 rounded-b-lg">
                          <div className="h-5 bg-muted rounded w-3/4" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                          <div className="flex gap-4">
                            <div className="h-4 bg-muted rounded w-16" />
                            <div className="h-4 bg-muted rounded w-16" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : properties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">No properties found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="sale" className="mt-0">
                {properties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">No properties for sale</h3>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="rent" className="mt-0">
                {properties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">No properties for rent</h3>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Browse by Locality */}
        <section className="py-6 px-4 bg-muted/30" aria-labelledby="localities-heading">
          <div className="container max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="localities-heading" className="text-lg font-bold text-foreground">Browse by Locality</h2>
                <p className="text-sm text-muted-foreground">Find properties in your preferred area</p>
              </div>
              <Link to="/jaipur">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {popularLocalities.map((locality) => (
                <Link key={locality.slug} to={`/properties/in/${locality.slug}`}>
                  <Card className="group hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">
                          {locality.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{locality.count}+ properties</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why JaipurCircle Properties - SEO Content Block */}
        <section className="py-8 px-4" aria-labelledby="why-heading">
          <div className="container max-w-6xl mx-auto">
            <h2 id="why-heading" className="text-lg font-bold text-foreground text-center mb-6">Why Choose JaipurCircle Properties?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center p-5">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-sm">Verified Listings</h3>
                <p className="text-xs text-muted-foreground">All properties are verified for authenticity before listing</p>
              </Card>
              <Card className="text-center p-5">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-sm">Hyper-Local Focus</h3>
                <p className="text-xs text-muted-foreground">Deep locality insights for informed decisions</p>
              </Card>
              <Card className="text-center p-5">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IndianRupee className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-sm">Best Price Discovery</h3>
                <p className="text-xs text-muted-foreground">Compare prices across localities</p>
              </Card>
            </div>
            
            {/* SEO Intro Paragraph */}
            <div className="mt-8 prose prose-sm max-w-none text-muted-foreground">
              <p>
                Looking for properties in Jaipur? JaipurCircle is your trusted partner for finding apartments, houses, villas, plots, and commercial spaces across the Pink City. Whether you're buying your first home in Malviya Nagar, renting an apartment in Vaishali Nagar, or investing in a plot in Jagatpura — we have verified listings from trusted owners and agents. Our hyperlocal approach means you get detailed insights about each locality, including connectivity, amenities, and price trends.
              </p>
            </div>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
