import { Link } from 'react-router-dom';
import { useLocalityEvents } from '@/hooks/useLocality';
import { CalendarDays, ArrowRight, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface LocalityEventsProps {
  localityName: string;
}

export function LocalityEvents({ localityName }: LocalityEventsProps) {
  const { data: events, isLoading } = useLocalityEvents(localityName);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          Upcoming Events
        </h2>
        <Link 
          to={`/events?locality=${localityName}`}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : events?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
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
                      {event.venue_name && (
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
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No upcoming events in {localityName}. Check back later!
          </CardContent>
        </Card>
      )}
    </section>
  );
}
