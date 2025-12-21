import { Link } from 'react-router-dom';
import { Locality, useNearbyLocalities } from '@/hooks/useLocality';
import { MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LocalityNearbyProps {
  locality: Locality;
}

export function LocalityNearby({ locality }: LocalityNearbyProps) {
  const { data: nearbyLocalities, isLoading } = useNearbyLocalities(locality.nearby_localities);

  if (!locality.nearby_localities?.length) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <MapPin className="h-6 w-6 text-primary" />
        Nearby Localities
      </h2>
      <p className="text-muted-foreground mb-4">
        Explore areas connected to {locality.name}:
      </p>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nearbyLocalities?.map((nearby) => (
            <Link 
              key={nearby.id} 
              to={`/jaipur/${nearby.slug}`}
              className="group"
            >
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {nearby.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {nearby.zone || 'Jaipur'}
                      </p>
                      {nearby.tags?.length && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {nearby.tags.slice(0, 2).join(' • ')}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          
          {/* Show remaining as simple links if DB doesn't have them */}
          {locality.nearby_localities
            ?.filter(slug => !nearbyLocalities?.find(n => n.slug === slug))
            .map((slug) => (
              <Link 
                key={slug} 
                to={`/jaipur/${slug}`}
                className="group"
              >
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors capitalize">
                          {slug.replace(/-/g, ' ')}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Adjacent area
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      )}
    </section>
  );
}
