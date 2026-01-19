import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Calendar, MapPin, Clock, Users, Ticket } from "lucide-react";
import { format, isSameDay, addDays } from "date-fns";
import { getEventPlaceholder } from "@/utils/placeholderImages";

const EventsHomeSection = () => {
  const navigate = useNavigate();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['home-events-premium'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .order('is_featured', { ascending: false })
        .order('start_date', { ascending: true })
        .limit(6);
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
      return { text: 'Today', color: 'bg-red-500' };
    }
    if (isSameDay(eventDate, tomorrow)) {
      return { text: 'Tomorrow', color: 'bg-orange-500' };
    }
    return null;
  };

  if (isLoading) {
    return (
      <section className="py-4">
        <div className="px-4 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-foreground">Events in Jaipur</h2>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pl-4 pb-2 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-56 h-52 rounded-2xl shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="py-4">
        <div className="px-4 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-foreground">Events in Jaipur</h2>
          </div>
          <Link to="/events/create" className="text-xs text-primary font-medium">
            + Create Event
          </Link>
        </div>
        <Card className="mx-4 bg-purple-50 border-purple-100">
          <CardContent className="p-6 text-center">
            <Calendar className="w-10 h-10 mx-auto text-purple-400 mb-2" />
            <p className="text-sm text-purple-700 font-medium">No upcoming events</p>
            <p className="text-xs text-purple-500 mt-1">Be the first to create an event!</p>
            <Link to="/events/create">
              <button className="mt-3 text-xs bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition-colors">
                Create Event
              </button>
            </Link>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="py-4">
      <div className="px-4 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Events in Jaipur</h2>
            <p className="text-[10px] text-muted-foreground">Concerts, Workshops & More</p>
          </div>
        </div>
        <Link 
          to="/events" 
          className="text-xs text-primary flex items-center gap-1 hover:underline font-medium"
        >
          View All
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pl-4 pb-2 scrollbar-hide">
        {events.map((event) => {
          const badge = getEventBadge(event.start_date);
          const imageUrl = event.cover_image || getEventPlaceholder(event.category);
          
          return (
            <Card 
              key={event.id}
              onClick={() => navigate(`/events/${event.slug}`)}
              className="w-56 shrink-0 cursor-pointer group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-32 overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = getEventPlaceholder(event.category);
                  }}
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {badge && (
                    <Badge className={`${badge.color} text-[10px] font-bold px-1.5 py-0.5`}>
                      {badge.text}
                    </Badge>
                  )}
                  {event.is_free && (
                    <Badge className="bg-green-500 text-[10px] font-bold px-1.5 py-0.5">
                      Free
                    </Badge>
                  )}
                </div>
                
                {/* Date Card */}
                <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur rounded-xl p-2 text-center shadow-lg">
                  <p className="text-[10px] font-bold text-primary uppercase">
                    {format(new Date(event.start_date), 'MMM')}
                  </p>
                  <p className="text-lg font-black leading-none text-foreground">
                    {format(new Date(event.start_date), 'd')}
                  </p>
                </div>
                
                {/* Category */}
                <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] bg-white/90">
                  {event.category}
                </Badge>
              </div>

              {/* Content */}
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2 text-foreground mb-1.5 leading-tight">
                  {event.title}
                </h3>
                
                {/* Venue */}
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="line-clamp-1">{event.venue_name || event.locality || 'Jaipur'}</span>
                </div>
                
                {/* Time & Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {format(new Date(event.start_date), 'h:mm a')}
                  </div>
                  {!event.is_free && event.ticket_price && (
                    <Badge variant="outline" className="text-[10px] font-bold">
                      <Ticket className="w-2.5 h-2.5 mr-0.5" />
                      ₹{event.ticket_price}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {/* View More Card */}
        <Link to="/events">
          <Card className="w-36 h-52 shrink-0 flex items-center justify-center bg-purple-50 border-dashed border-2 border-purple-200 hover:border-purple-400 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-purple-500 flex items-center justify-center mb-2">
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-medium text-purple-700">All Events</p>
              <p className="text-xs text-purple-600">in Jaipur</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
};

export default EventsHomeSection;
