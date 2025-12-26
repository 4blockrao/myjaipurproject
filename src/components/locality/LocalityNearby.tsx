import { Link } from 'react-router-dom';
import { Locality } from '@/hooks/useLocality';
import { useNearbyLocalitiesEnhanced } from '@/hooks/useNearbyLocalities';
import { MapPin, ArrowRight, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LocalityNearbyProps {
  locality: Locality;
}

export function LocalityNearby({ locality }: LocalityNearbyProps) {
  const { data: nearbyLocalities, isLoading } = useNearbyLocalitiesEnhanced(
    locality.slug,
    locality.adjacent_localities,
    locality.nearby_localities,
    locality.zone_id || null
  );

  // Don't render if no nearby data available
  if (!locality.nearby_localities?.length && !locality.adjacent_localities?.length && !locality.zone_id) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
        <Navigation className="h-6 w-6 text-primary" />
        Nearby Localities & Areas
      </h2>
      <p className="text-muted-foreground mb-4">
        Explore connected neighborhoods around {locality.name}
      </p>
      
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : nearbyLocalities && nearbyLocalities.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {nearbyLocalities.map((nearby) => (
            <Link 
              key={nearby.id} 
              to={`/jaipur/${nearby.slug}`}
              className="group"
            >
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-1">
                        {nearby.name}
                      </h3>
                    </div>
                    {/* Show contextual hint without zone reference */}
                    <p className="text-xs text-muted-foreground">
                      {nearby.isAdjacent ? 'Adjacent area' : 'Nearby'}
                    </p>
                    {nearby.tags?.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {nearby.tags.slice(0, 2).join(' • ')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Nearby area information is being updated.
        </p>
      )}
    </section>
  );
}
