import { Link } from 'react-router-dom';
import { useEventsByZone } from '@/hooks/useEvents';
import { CalendarDays, ArrowRight, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface EventsByZoneProps {
  zoneName: string;
  zoneSlug: string;
  limit?: number;
}

/**
 * Displays events from all localities within a zone
 * Uses the knowledge graph for zone-based event discovery
 */
export function EventsByZone({ zoneName, zoneSlug, limit = 4 }: EventsByZoneProps) {
  const { data: events, isLoading } = useEventsByZone(zoneSlug);

  const displayedEvents = events?.slice(0, limit) || [];

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          Events in {zoneName}
        </h2>
        <Link 
          to={`/events?zone=${zoneSlug}`}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : displayedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedEvents.map((event) => (
            <Link 
              key={event.id} 
              to={`/events/${event.slug}`}
              className="block group"
            >
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 overflow-hidden">
                <CardContent className="p-0 flex">
                  {event.cover_image && (
                    <img 
                      src={event.cover_image} 
                      alt={event.title}
                      className="w-28 h-full object-cover shrink-0"
                    />
                  )}
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      {event.is_free ? (
                        <Badge variant="secondary" className="shrink-0">Free</Badge>
                      ) : (
                        <Badge className="shrink-0">₹{event.ticket_price}</Badge>
                      )}
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(event.start_date), 'MMM d, yyyy • h:mm a')}
                      </p>
                      {event.locality && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.locality}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No upcoming events in {zoneName}. Check back later!
          </CardContent>
        </Card>
      )}
    </section>
  );
}

export default EventsByZone;
