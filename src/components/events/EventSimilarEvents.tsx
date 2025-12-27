import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, ChevronRight, Ticket, Sparkles, Clock, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface EventSimilarEventsProps {
  currentEventId: string;
  venueName?: string | null;
  category: string;
  locality?: string | null;
}

/**
 * Shows similar events - past editions at same venue + similar category events
 * Helps with EEAT signals and session retention
 */
const EventSimilarEvents = ({ 
  currentEventId, 
  venueName, 
  category, 
  locality 
}: EventSimilarEventsProps) => {
  // Get past events at same venue
  const { data: pastVenueEvents = [], isLoading: pastLoading } = useQuery({
    queryKey: ['past-venue-events', venueName, currentEventId],
    queryFn: async () => {
      if (!venueName) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('id, title, slug, start_date, category, cover_image, is_free, ticket_price')
        .ilike('venue_name', `%${venueName}%`)
        .neq('id', currentEventId)
        .lt('start_date', new Date().toISOString())
        .order('start_date', { ascending: false })
        .limit(4);
      
      if (error) return [];
      return data || [];
    },
    enabled: !!venueName,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  // Get similar category events
  const { data: similarEvents = [], isLoading: similarLoading } = useQuery({
    queryKey: ['similar-category-events', category, locality, currentEventId],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('id, title, slug, start_date, venue_name, locality, cover_image, is_free, ticket_price')
        .eq('category', category)
        .eq('status', 'published')
        .neq('id', currentEventId)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(4);
      
      // Prefer events in same locality
      if (locality) {
        query = query.ilike('locality', locality);
      }
      
      const { data, error } = await query;
      if (error) return [];
      return data || [];
    },
    enabled: !!category,
    staleTime: 1000 * 60 * 10,
  });

  const isLoading = pastLoading || similarLoading;
  const hasPastEvents = pastVenueEvents.length > 0;
  const hasSimilarEvents = similarEvents.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!hasPastEvents && !hasSimilarEvents) return null;

  return (
    <div className="space-y-6">
      {/* Past Events at Same Venue */}
      {hasPastEvents && (
        <section>
          <Card className="bg-muted/30 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Previous Shows at This Venue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Past events held at {venueName} — showing the venue's event history and experience.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {pastVenueEvents.map(event => (
                  <Link key={event.id} to={`/events/${event.slug}`}>
                    <Card className="hover:bg-background/80 transition-colors h-full border-0 shadow-sm">
                      <CardContent className="p-3">
                        <Badge variant="secondary" className="text-xs capitalize mb-2">
                          {event.category}
                        </Badge>
                        <p className="font-medium text-sm line-clamp-2">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(event.start_date), 'MMM yyyy')}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Similar Category Events */}
      {hasSimilarEvents && (
        <section>
          <Card className="bg-muted/30 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Similar {category} Events {locality && `in ${locality}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                More {category.toLowerCase()} events you might enjoy — explore alternatives and similar experiences.
              </p>
              <div className="space-y-2">
                {similarEvents.map(event => (
                  <Link key={event.id} to={`/events/${event.slug}`}>
                    <Card className="hover:bg-background/80 transition-colors border-0 shadow-sm">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {format(new Date(event.start_date), 'd')}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(event.start_date), 'MMM')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            {event.venue_name && (
                              <span className="truncate">{event.venue_name}</span>
                            )}
                            <span>•</span>
                            <span>{event.is_free ? 'Free' : `₹${event.ticket_price}`}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <Link to={`/events/category/${category}`} className="block mt-3">
                <p className="text-sm text-primary hover:underline flex items-center gap-1">
                  View all {category} events <ChevronRight className="w-3 h-3" />
                </p>
              </Link>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};

export default EventSimilarEvents;
