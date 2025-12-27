import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Building2, MapPin, Phone, Star, Filter, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';

const CarDealersListPage = () => {
  const { brand, locality } = useParams();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(brand || null);

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

  const { data: dealers, isLoading } = useQuery({
    queryKey: ['car-dealers', selectedBrand, locality],
    queryFn: async () => {
      let query = supabase.from('car_dealers').select(`*, brand:car_brands(*)`);
      
      if (selectedBrand) {
        const brandData = brands?.find((b: any) => b.slug === selectedBrand);
        if (brandData) {
          query = query.eq('brand_id', brandData.id);
        }
      }
      
      if (locality) {
        query = query.ilike('locality', `%${locality.replace('-', ' ')}%`);
      }
      
      const { data } = await query.order('is_verified', { ascending: false });
      return data || [];
    },
    enabled: brands !== undefined
  });

  const title = locality 
    ? `Car Dealers in ${locality.replace('-', ' ')}, Jaipur`
    : selectedBrand 
    ? `${brands?.find((b: any) => b.slug === selectedBrand)?.name} Dealers in Jaipur`
    : 'Car Dealers in Jaipur';

  return (
    <>
      <Helmet>
        <title>{title} - Authorized Showrooms & Service Centers</title>
        <meta name="description" content={`Find ${title}. Browse authorized dealers, service centers, and multi-brand showrooms. Get contact details and directions.`} />
        <link rel="canonical" href={`https://jaipurcircle.com/cars/dealers${locality ? `/in/${locality}` : brand ? `/${brand}` : ''}`} />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 py-6">
          <div className="container px-4">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/cars">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                <p className="text-muted-foreground">Authorized showrooms & service centers</p>
              </div>
            </div>

            {/* Brand Filter */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button 
                variant={!selectedBrand ? "default" : "outline"} 
                size="sm" 
                className="rounded-full"
                onClick={() => setSelectedBrand(null)}
              >
                All Brands
              </Button>
              {brands?.map((b: any) => (
                <Button 
                  key={b.id}
                  variant={selectedBrand === b.slug ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-full"
                  onClick={() => setSelectedBrand(b.slug)}
                >
                  {b.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Dealers List */}
        <div className="container px-4 py-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : dealers && dealers.length > 0 ? (
            <div className="space-y-4">
              {dealers.map((dealer: any) => (
                <Link key={dealer.id} to={`/cars/dealers/${dealer.slug}`}>
                  <Card className="hover:shadow-lg transition-all">
                    <CardContent className="p-4 flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        {dealer.cover_image ? (
                          <img src={dealer.cover_image} alt={dealer.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Building2 className="w-10 h-10 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground truncate">{dealer.name}</h3>
                            <p className="text-sm text-muted-foreground">{dealer.brand?.name}</p>
                          </div>
                          {dealer.is_verified && (
                            <Badge className="bg-green-500 text-white text-xs">Verified</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {dealer.locality}
                        </p>
                        {dealer.rating > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{dealer.rating}</span>
                            <span className="text-xs text-muted-foreground">({dealer.review_count})</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {dealer.phone && (
                          <a href={`tel:${dealer.phone}`} onClick={e => e.stopPropagation()}>
                            <Button size="sm" variant="outline">
                              <Phone className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground">No dealers found</h2>
              <p className="text-muted-foreground mt-2">Try changing your filters</p>
            </div>
          )}
        </div>

        <Footer />
        <NativeBottomNav />
      </div>
    </>
  );
};

export default CarDealersListPage;
