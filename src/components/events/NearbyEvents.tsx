import { Link } from 'react-router-dom';
import { useEventsNearLocality } from '@/hooks/useEvents';
import { CalendarDays, ArrowRight, MapPin, Clock, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface NearbyEventsProps {
  localitySlug: string;
  localityName: string;
}

/**
 * Shows events in a locality plus events from nearby/adjacent localities
 * Uses the knowledge graph for proximity-based discovery
 */
export function NearbyEvents({ localitySlug, localityName }: NearbyEventsProps) {
  const { data, isLoading } = useEventsNearLocality(localitySlug);

  const { locality: localityEvents = [], nearby: nearbyEvents = [] } = data || {};

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  const hasLocalityEvents = localityEvents.length > 0;
  const hasNearbyEvents = nearbyEvents.length > 0;

  if (!hasLocalityEvents && !hasNearbyEvents) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Events in this locality */}
      {hasLocalityEvents && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Events in {localityName}
            </h2>
            <Link 
              to={`/events?locality=${localityName}`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localityEvents.slice(0, 4).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Events nearby */}
      {hasNearbyEvents && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Events Near {localityName}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyEvents.slice(0, 4).map((event) => (
              <EventCard key={event.id} event={event} showLocality />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

interface EventCardProps {
  event: {
    id: string;
    slug: string;
    title: string;
    start_date: string;
    cover_image?: string | null;
    venue_name?: string | null;
    locality?: string | null;
    is_free?: boolean | null;
    ticket_price?: number | null;
  };
  showLocality?: boolean;
}

function EventCard({ event, showLocality = false }: EventCardProps) {
  return (
    <Link 
      to={`/events/${event.slug}`}
      className="block group"
    >
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 overflow-hidden">
        <CardContent className="p-0 flex">
          {event.cover_image && (
            <img 
              src={event.cover_image} 
              alt={event.title}
              className="w-24 h-full object-cover shrink-0"
            />
          )}
          <div className="p-3 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {event.title}
              </h3>
              {event.is_free ? (
                <Badge variant="secondary" className="shrink-0 text-xs">Free</Badge>
              ) : event.ticket_price && (
                <Badge className="shrink-0 text-xs">₹{event.ticket_price}</Badge>
              )}
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(event.start_date), 'MMM d • h:mm a')}
              </p>
              {showLocality && event.locality && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.locality}
                </p>
              )}
              {!showLocality && event.venue_name && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.venue_name}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default NearbyEvents;
