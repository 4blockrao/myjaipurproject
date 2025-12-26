import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { format, parseISO, isPast } from "date-fns";
import { Calendar, MapPin, Clock, AlertCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EventSimilarEvents from "@/components/events/EventSimilarEvents";
import EventBreadcrumb from "@/components/events/EventBreadcrumb";

const PastEventPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['past-event', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });

  // Get similar upcoming events
  const { data: upcomingEvents } = useQuery({
    queryKey: ['upcoming-similar-events', event?.category, event?.locality],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('events')
        .select('id, title, slug, start_date, venue_name, locality, category, cover_image, is_free, ticket_price')
        .gte('start_date', now)
        .eq('status', 'published')
        .or(`category.eq.${event?.category},locality.eq.${event?.locality}`)
        .neq('id', event?.id)
        .order('start_date', { ascending: true })
        .limit(6);
      
      return data || [];
    },
    enabled: !!event?.category
  });

  if (eventLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
        <p className="text-muted-foreground mb-4">This event may have been removed.</p>
        <Link to="/events">
          <Button>Browse Events</Button>
        </Link>
      </div>
    );
  }

  const eventDate = parseISO(event.start_date);
  const formattedDate = format(eventDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(eventDate, 'h:mm a');

  // JSON-LD for past event
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description || event.short_description,
    "startDate": event.start_date,
    "endDate": event.end_date || event.start_date,
    "eventStatus": "https://schema.org/EventCancelled",
    "eventAttendanceMode": event.is_online 
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    "location": event.is_online ? {
      "@type": "VirtualLocation",
      "url": event.online_url
    } : {
      "@type": "Place",
      "name": event.venue_name,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.locality || "Jaipur",
        "addressRegion": "Rajasthan",
        "addressCountry": "IN"
      }
    },
    "image": event.cover_image,
    "organizer": event.organizer_name ? {
      "@type": "Organization",
      "name": event.organizer_name
    } : undefined
  };

  return (
    <>
      <Helmet>
        <title>{event.title} (Past Event) | JaipurCircle Events Archive</title>
        <meta 
          name="description" 
          content={`${event.title} was held on ${formattedDate} at ${event.venue_name || event.locality || 'Jaipur'}. View event details and discover similar upcoming events in Jaipur.`} 
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.jaipurcircle.com/events/past/${event.slug}`} />
        
        <meta property="og:title" content={`${event.title} (Past Event)`} />
        <meta property="og:description" content={`This ${event.category} event was held on ${formattedDate}. Discover similar upcoming events.`} />
        <meta property="og:image" content={event.cover_image || '/placeholder.svg'} />
        <meta property="og:type" content="website" />
        
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        <EventBreadcrumb 
          event={{
            title: event.title,
            slug: event.slug,
            category: event.category,
            locality: event.locality,
          }}
        />

        {/* Past Event Notice */}
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">This event has ended</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This event took place on {formattedDate}. Check out similar upcoming events below.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Event Header */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            {event.cover_image && (
              <img 
                src={event.cover_image} 
                alt={event.title}
                className="w-full h-64 md:h-80 object-cover rounded-lg grayscale opacity-80"
              />
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{event.category}</Badge>
              <Badge variant="outline" className="text-muted-foreground">Past Event</Badge>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold">{event.title}</h1>
            
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formattedTime}</span>
              </div>
              {event.venue_name && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.venue_name}{event.locality ? `, ${event.locality}` : ''}</span>
                </div>
              )}
            </div>

            <Link to="/events">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse Upcoming Events
              </Button>
            </Link>
          </div>
        </div>

        {/* Event Description */}
        {event.description && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">About This Event</h2>
              <div 
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </CardContent>
          </Card>
        )}

        {/* Similar/Upcoming Events */}
        <EventSimilarEvents 
          currentEventId={event.id}
          category={event.category}
          venueName={event.venue_name}
          locality={event.locality}
        />

        {/* Upcoming Events in Same Category */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Upcoming {event.category} Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map((upEvent) => (
                <Link key={upEvent.id} to={`/events/${upEvent.slug}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      {upEvent.cover_image && (
                        <img 
                          src={upEvent.cover_image} 
                          alt={upEvent.title}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <Badge variant="secondary" className="mb-2">{upEvent.category}</Badge>
                      <h3 className="font-medium line-clamp-2">{upEvent.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(parseISO(upEvent.start_date), 'MMM d, yyyy')}
                      </p>
                      {upEvent.venue_name && (
                        <p className="text-sm text-muted-foreground">{upEvent.venue_name}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default PastEventPage;
