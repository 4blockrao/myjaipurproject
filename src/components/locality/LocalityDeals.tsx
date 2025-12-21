import { Link } from 'react-router-dom';
import { useLocalityDeals } from '@/hooks/useLocality';
import { Tag, ArrowRight, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface LocalityDealsProps {
  localityName: string;
}

export function LocalityDeals({ localityName }: LocalityDealsProps) {
  const { data: deals, isLoading } = useLocalityDeals(localityName);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Tag className="h-6 w-6 text-primary" />
          Deals & Offers Nearby
        </h2>
        <Link 
          to={`/deals?location=${localityName}`}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : deals?.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {deals.map((deal) => (
            <Link 
              key={deal.id} 
              to={`/deal/${deal.id}`}
              className="block group"
            >
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 overflow-hidden">
                {deal.image_url && (
                  <div className="relative">
                    <img 
                      src={deal.image_url} 
                      alt={deal.title}
                      className="w-full h-28 object-cover"
                    />
                    {deal.discount_percentage && deal.discount_percentage > 0 && (
                      <Badge className="absolute top-2 right-2 bg-destructive">
                        <Percent className="h-3 w-3 mr-1" />
                        {deal.discount_percentage}% OFF
                      </Badge>
                    )}
                  </div>
                )}
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {deal.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-bold text-primary">₹{deal.discounted_price}</span>
                    {deal.original_price && deal.original_price > (deal.discounted_price || 0) && (
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{deal.original_price}
                      </span>
                    )}
                  </div>
                  {deal.category && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {deal.category}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No active deals in {localityName}. Check back later!
          </CardContent>
        </Card>
      )}
    </section>
  );
}
