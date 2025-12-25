import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, MapPin, Calendar, Ticket, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import EventDiscoverSummary from "@/components/events/EventDiscoverSummary";
import EventDynamicFAQ from "@/components/events/EventDynamicFAQ";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const EventsLocalityPage = () => {
  const { locality } = useParams<{ locality: string }>();

  // Fetch locality data
  const { data: localityData } = useQuery({
    queryKey: ["locality", locality],
    queryFn: async () => {
      const { data } = await supabase
        .from("localities")
        .select("name, slug, zone, ward_number, pin_codes, nearby_localities")
        .eq("slug", locality)
        .maybeSingle();
      return data;
    },
    enabled: !!locality
  });

  // Fetch events for this locality
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["locality-events", locality],
    queryFn: async () => {
      if (!localityData?.name) return [];
      
      const { data } = await supabase
        .from("events")
        .select("id, title, slug, start_date, venue_name, locality, cover_image, category, is_free, ticket_price, short_description")
        .eq("status", "published")
        .or(`locality.ilike.%${localityData.name}%,venue_address.ilike.%${localityData.name}%`)
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(50);

      return data || [];
    },
    enabled: !!localityData?.name
  });

  // Fetch nearby localities for linking
  const { data: nearbyLocalities = [] } = useQuery({
    queryKey: ["nearby-localities", locality],
    queryFn: async () => {
      const slugs = localityData?.nearby_localities || [];
      if (slugs.length === 0) {
        // Fallback: get some localities from same zone
        const { data } = await supabase
          .from("localities")
          .select("name, slug")
          .eq("zone", localityData?.zone)
          .neq("slug", locality)
          .limit(6);
        return data || [];
      }
      
      const { data } = await supabase
        .from("localities")
        .select("name, slug")
        .in("slug", slugs)
        .limit(6);
      return data || [];
    },
    enabled: !!localityData
  });

  const localityName = localityData?.name || locality?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Locality';

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Events in ${localityName}, Jaipur`,
    "description": `Upcoming events, activities and things to do in ${localityName}, Jaipur`,
    "numberOfItems": events.length,
    "itemListElement": events.slice(0, 20).map((event, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": event.title,
      "url": `https://www.jaipurcircle.com/events/${event.slug}`
    }))
  };

  const placeSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": `${localityName}, Jaipur`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": localityName,
      "addressRegion": "Rajasthan",
      "addressCountry": "India"
    },
    "containedInPlace": {
      "@type": "City",
      "name": "Jaipur"
    }
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Events & Things To Do in ${localityName}, Jaipur`,
    "description": `Events, activities, workshops and entertainment in ${localityName}, located in ${localityData?.zone || 'Jaipur'} Zone, Jaipur.`,
    "url": `https://www.jaipurcircle.com/events/in/${locality}`,
    "about": placeSchema
  };

  return (
    <>
      <Helmet>
        <title>Events in {localityName}, Jaipur 2025 | Things To Do | JaipurCircle</title>
        <meta name="description" content={`Find events in ${localityName}, Jaipur - concerts, workshops, exhibitions and activities. Discover things to do in ${localityName} area.`} />
        <meta name="keywords" content={`events ${localityName.toLowerCase()}, things to do ${localityName.toLowerCase()}, ${localityName.toLowerCase()} jaipur events, activities ${localityName.toLowerCase()}`} />
        <link rel="canonical" href={`https://www.jaipurcircle.com/events/in/${locality}`} />
        <meta property="og:title" content={`Events in ${localityName}, Jaipur`} />
        <meta property="og:description" content={`Discover events, workshops and activities in ${localityName}, Jaipur.`} />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(placeSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Link to="/events">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Events in {localityName}</h1>
                <p className="text-xs text-muted-foreground">
                  {localityData?.zone ? `${localityData.zone} Zone, Jaipur` : 'Jaipur'}
                </p>
              </div>
            </div>
            <Link to={`/jaipur/${locality}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                <Navigation className="w-4 h-4" />
                Area Guide
              </Button>
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 space-y-6">
          {/* Discover Summary */}
          <EventDiscoverSummary
            title={`Events & Things To Do in ${localityName}`}
            summary={`Events, activities, workshops and entertainment in ${localityName}, located in ${localityData?.zone || 'Jaipur'} Zone, Jaipur. Discover concerts, cultural programs, community gatherings and more happening near you.`}
            locality={localityName}
            eventCount={events.length}
          />

          {/* Quick Filters */}
          <section className="flex flex-wrap gap-2">
            <Link to="/events/free">
              <Button variant="outline" size="sm">Free Events</Button>
            </Link>
            <Link to="/events/workshops">
              <Button variant="outline" size="sm">Workshops</Button>
            </Link>
            <span className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full">
              {localityName}
            </span>
          </section>

          {/* Events Grid */}
          <section>
            <h2 className="text-lg font-bold mb-4">Upcoming Events in {localityName}</h2>
            
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="grid gap-4">
                {events.map(event => (
                  <Link key={event.id} to={`/events/${event.slug}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-0 flex">
                        {event.cover_image && (
                          <img 
                            src={event.cover_image} 
                            alt={event.title}
                            className="w-24 h-24 object-cover"
                            loading="lazy"
                          />
                        )}
                        <div className="p-3 flex-1">
                          <h3 className="font-semibold text-sm line-clamp-2">{event.title}</h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(event.start_date), "EEE, MMM d")}</span>
                          </div>
                          {event.venue_name && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <MapPin className="w-3 h-3" />
                              <span>{event.venue_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {event.is_free ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                Free
                              </span>
                            ) : event.ticket_price && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                ₹{event.ticket_price}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No events currently scheduled in {localityName}.</p>
                <p className="text-sm text-muted-foreground mt-1">Explore nearby areas or check all events.</p>
                <div className="flex justify-center gap-2 mt-3">
                  <Link to="/events">
                    <Button variant="outline" size="sm">All Events</Button>
                  </Link>
                  <Link to={`/jaipur/${locality}`}>
                    <Button variant="outline" size="sm">Explore {localityName}</Button>
                  </Link>
                </div>
              </Card>
            )}
          </section>

          {/* Nearby Localities */}
          {nearbyLocalities.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-bold mb-4">Events in Nearby Areas</h2>
              <div className="grid grid-cols-2 gap-2">
                {nearbyLocalities.map(loc => (
                  <Link 
                    key={loc.slug} 
                    to={`/events/in/${loc.slug}`}
                    className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="font-medium text-sm">{loc.name}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Comedy • Music • Exhibitions
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related Links */}
          <section className="mt-6">
            <h2 className="text-lg font-bold mb-3">Explore More</h2>
            <div className="flex flex-wrap gap-2">
              <Link to="/events/free">
                <Button variant="outline" size="sm">Free Events</Button>
              </Link>
              <Link to="/events/workshops">
                <Button variant="outline" size="sm">Workshops</Button>
              </Link>
              <Link to="/events">
                <Button variant="outline" size="sm">All Events</Button>
              </Link>
              <Link to={`/jaipur/${locality}`}>
                <Button variant="outline" size="sm">{localityName} Guide</Button>
              </Link>
            </div>
          </section>

          {/* Dynamic FAQ */}
          <EventDynamicFAQ locality={localityName} />
        </main>

        <NativeBottomNav />
      </div>
    </>
  );
};

export default EventsLocalityPage;
