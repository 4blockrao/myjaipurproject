import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, ChevronRight, Ticket, MapPin, Zap, IndianRupee } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface EventAlternativesProps {
  currentEventId: string;
  eventDate: string;
  category: string;
  locality?: string | null;
  ticketPrice?: number | null;
  isFree?: boolean | null;
}

/**
 * Shows alternative events - same day, cheaper, nearby, or free
 * Intent rescue section to improve session retention
 */
const EventAlternatives = ({ 
  currentEventId,
  eventDate,
  category,
  locality,
  ticketPrice,
  isFree
}: EventAlternativesProps) => {
  const eventDateObj = new Date(eventDate);
  const startOfDay = new Date(eventDateObj);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(eventDateObj);
  endOfDay.setHours(23, 59, 59, 999);

  // Get same-day events
  const { data: sameDayEvents = [], isLoading: sameDayLoading } = useQuery({
    queryKey: ['same-day-events', eventDate, currentEventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, slug, start_date, venue_name, locality, is_free, ticket_price, category')
        .eq('status', 'published')
        .neq('id', currentEventId)
        .gte('start_date', startOfDay.toISOString())
        .lte('start_date', endOfDay.toISOString())
        .order('start_date', { ascending: true })
        .limit(4);
      
      if (error) return [];
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Get free events nearby if current is paid
  const { data: freeEvents = [], isLoading: freeLoading } = useQuery({
    queryKey: ['free-nearby-events', locality, currentEventId],
    queryFn: async () => {
      if (isFree) return [];
      
      let query = supabase
        .from('events')
        .select('id, title, slug, start_date, venue_name, locality, category')
        .eq('status', 'published')
        .eq('is_free', true)
        .neq('id', currentEventId)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(4);

      if (locality) {
        query = query.ilike('locality', locality);
      }
      
      const { data, error } = await query;
      if (error) return [];
      return data || [];
    },
    enabled: !isFree,
    staleTime: 1000 * 60 * 10,
  });

  // Get cheaper alternatives if current is expensive
  const { data: cheaperEvents = [], isLoading: cheaperLoading } = useQuery({
    queryKey: ['cheaper-events', category, ticketPrice, currentEventId],
    queryFn: async () => {
      if (isFree || !ticketPrice || ticketPrice < 500) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('id, title, slug, start_date, venue_name, locality, is_free, ticket_price')
        .eq('status', 'published')
        .eq('category', category)
        .neq('id', currentEventId)
        .gte('start_date', new Date().toISOString())
        .lt('ticket_price', ticketPrice)
        .order('ticket_price', { ascending: true })
        .limit(4);
      
      if (error) return [];
      return data || [];
    },
    enabled: !isFree && !!ticketPrice && ticketPrice >= 500,
    staleTime: 1000 * 60 * 10,
  });

  const isLoading = sameDayLoading || freeLoading || cheaperLoading;
  const hasSameDayEvents = sameDayEvents.length > 0;
  const hasFreeEvents = freeEvents.length > 0;
  const hasCheaperEvents = cheaperEvents.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!hasSameDayEvents && !hasFreeEvents && !hasCheaperEvents) return null;

  return (
    <div className="space-y-6">
      {/* Same Day Events */}
      {hasSameDayEvents && (
        <section>
          <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                Also Happening on {format(eventDateObj, 'MMM d')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Other events on the same day — in case you want more options or a plan B.
              </p>
              <div className="space-y-2">
                {sameDayEvents.map(event => (
                  <Link key={event.id} to={`/events/${event.slug}`}>
                    <Card className="hover:bg-background transition-colors border-0 shadow-sm">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {event.category}
                            </Badge>
                            {event.is_free && (
                              <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                Free
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span>{format(new Date(event.start_date), 'h:mm a')}</span>
                            {event.venue_name && (
                              <>
                                <span>•</span>
                                <span className="truncate">{event.venue_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Free Events Nearby */}
      {hasFreeEvents && (
        <section>
          <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Ticket className="w-4 h-4 text-green-600" />
                Free Events {locality && `in ${locality}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Looking for something free? Check out these no-cost events nearby.
              </p>
              <div className="space-y-2">
                {freeEvents.map(event => (
                  <Link key={event.id} to={`/events/${event.slug}`}>
                    <Card className="hover:bg-background transition-colors border-0 shadow-sm">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-green-700 dark:text-green-300">
                            {format(new Date(event.start_date), 'd')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.start_date), 'MMM d')} • {event.locality || 'Jaipur'}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 shrink-0">
                          Free
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <Link to="/events/free" className="block mt-3">
                <p className="text-sm text-green-600 hover:underline flex items-center gap-1">
                  View all free events <ChevronRight className="w-3 h-3" />
                </p>
              </Link>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Cheaper Alternatives */}
      {hasCheaperEvents && (
        <section>
          <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-blue-600" />
                Budget-Friendly Alternatives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Similar {category.toLowerCase()} events at a lower price point.
              </p>
              <div className="space-y-2">
                {cheaperEvents.map(event => (
                  <Link key={event.id} to={`/events/${event.slug}`}>
                    <Card className="hover:bg-background transition-colors border-0 shadow-sm">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span>{format(new Date(event.start_date), 'MMM d')}</span>
                            {event.venue_name && (
                              <>
                                <span>•</span>
                                <span className="truncate">{event.venue_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          ₹{event.ticket_price}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};

export default EventAlternatives;
