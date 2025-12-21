import { Link } from 'react-router-dom';
import { useLocalityMerchants } from '@/hooks/useLocality';
import { Store, ArrowRight, Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface LocalityMerchantsProps {
  localityName: string;
}

export function LocalityMerchants({ localityName }: LocalityMerchantsProps) {
  const { data: merchants, isLoading } = useLocalityMerchants(localityName);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" />
          Restaurants & Services
        </h2>
        <Link 
          to={`/deals?location=${localityName}`}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : merchants?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {merchants.map((merchant) => (
            <Card key={merchant.id} className="h-full transition-all hover:shadow-md">
              <CardContent className="p-4 flex gap-4">
                {merchant.logo_url ? (
                  <img 
                    src={merchant.logo_url} 
                    alt={merchant.business_name}
                    className="w-16 h-16 object-cover rounded-lg shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    <Store className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground line-clamp-1">
                    {merchant.business_name}
                  </h3>
                  {merchant.business_type && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {merchant.business_type}
                    </Badge>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    {merchant.average_rating && merchant.average_rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {Number(merchant.average_rating).toFixed(1)}
                        {merchant.total_reviews && (
                          <span>({merchant.total_reviews})</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No registered businesses in {localityName} yet. 
            <Link to="/merchant-onboarding" className="text-primary hover:underline ml-1">
              Register your business
            </Link>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
