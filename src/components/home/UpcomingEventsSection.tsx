import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronRight, MapPin, Clock, Ticket } from "lucide-react";
import { format, isSameDay, addDays } from "date-fns";

const UpcomingEventsSection = () => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['upcoming-events-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(4);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const getEventBadge = (startDate: string) => {
    const eventDate = new Date(startDate);
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    if (isSameDay(eventDate, today)) {
      return <Badge className="bg-red-500 text-xs">Today</Badge>;
    }
    if (isSameDay(eventDate, tomorrow)) {
      return <Badge className="bg-orange-500 text-xs">Tomorrow</Badge>;
    }
    return null;
  };

  if (isLoading) {
    return (
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Events
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-64 h-40 rounded-xl shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Events
          </h2>
        </div>
        <Card className="bg-muted/50">
          <CardContent className="p-6 text-center">
            <Calendar className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No upcoming events</p>
            <Link to="/events/create">
              <button className="mt-3 text-sm text-primary hover:underline">
                Create an Event
              </button>
            </Link>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Upcoming Events
        </h2>
        <Link 
          to="/events" 
          className="text-sm text-primary flex items-center gap-1 hover:underline"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {events.map((event) => (
          <Link key={event.id} to={`/events/${event.slug}`}>
            <Card className="w-64 shrink-0 hover:shadow-md transition-shadow overflow-hidden">
              <div className="relative h-32 bg-muted">
                {event.cover_image ? (
                  <img 
                    src={event.cover_image} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  {getEventBadge(event.start_date)}
                  {event.is_free && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      Free
                    </Badge>
                  )}
                </div>
                {/* Date Card */}
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur rounded-lg p-2 text-center">
                  <p className="text-xs font-medium text-primary">
                    {format(new Date(event.start_date), 'MMM')}
                  </p>
                  <p className="text-lg font-bold leading-none">
                    {format(new Date(event.start_date), 'd')}
                  </p>
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-sm line-clamp-2">{event.title}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{event.venue_name || event.locality || 'Jaipur'}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {format(new Date(event.start_date), 'h:mm a')}
                  </div>
                  {!event.is_free && event.ticket_price && (
                    <Badge variant="outline" className="text-xs">
                      ₹{event.ticket_price}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default UpcomingEventsSection;
