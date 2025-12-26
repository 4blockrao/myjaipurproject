import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { MapPin, Calendar, Navigation, Building2, Tag, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/layout/AppLayout";
import EventDiscoverSummary from "@/components/events/EventDiscoverSummary";
import EventDynamicFAQ from "@/components/events/EventDynamicFAQ";
import EventLocalityInsights from "@/components/events/EventLocalityInsights";
import { supabase } from "@/integrations/supabase/client";
import { format, isPast, parseISO } from "date-fns";
import { parseConnectivity } from "@/hooks/useLocality";

const SITE_URL = 'https://www.jaipurcircle.com';

const EventsLocalityPage = () => {
  const { locality } = useParams<{ locality: string }>();

  // Fetch locality data with full details
  const { data: localityData, isLoading: localityLoading } = useQuery({
    queryKey: ["locality-full", locality],
    queryFn: async () => {
      const { data } = await supabase
        .from("localities")
        .select("id, name, slug, zone, ward_number, pin_codes, nearby_localities, tags, connectivity, major_landmarks, meta")
        .eq("slug", locality)
        .maybeSingle();
      return data;
    },
    enabled: !!locality
  });

  // Fetch upcoming events for this locality
  const { data: upcomingEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["locality-upcoming-events", locality, localityData?.name],
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

  // Fetch past events for this locality (for authority)
  const { data: pastEvents = [] } = useQuery({
    queryKey: ["locality-past-events", locality, localityData?.name],
    queryFn: async () => {
      if (!localityData?.name) return [];
      
      const { data } = await supabase
        .from("events")
        .select("id, title, slug, start_date, venue_name, category, cover_image")
        .eq("status", "published")
        .or(`locality.ilike.%${localityData.name}%,venue_address.ilike.%${localityData.name}%`)
        .lt("start_date", new Date().toISOString())
        .order("start_date", { ascending: false })
        .limit(10);

      return data || [];
    },
    enabled: !!localityData?.name
  });

  // Fetch top venues in this locality
  const { data: topVenues = [] } = useQuery({
    queryKey: ["locality-venues", locality, localityData?.name],
    queryFn: async () => {
      if (!localityData?.name) return [];
      
      // Get unique venues from events in this locality
      const { data } = await supabase
        .from("events")
        .select("venue_name, venue_address")
        .or(`locality.ilike.%${localityData.name}%,venue_address.ilike.%${localityData.name}%`)
        .not('venue_name', 'is', null)
        .limit(100);

      // Count and deduplicate venues
      const venueMap = new Map<string, number>();
      data?.forEach(e => {
        if (e.venue_name) {
          venueMap.set(e.venue_name, (venueMap.get(e.venue_name) || 0) + 1);
        }
      });
      
      return Array.from(venueMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count]) => ({ name, eventCount: count }));
    },
    enabled: !!localityData?.name
  });

  // Fetch nearby localities for linking
  const { data: nearbyLocalities = [] } = useQuery({
    queryKey: ["nearby-localities-events", locality],
    queryFn: async () => {
      const slugs = localityData?.nearby_localities || [];
      if (slugs.length === 0) {
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
  const connectivity = localityData?.connectivity ? parseConnectivity(localityData.connectivity) : null;
  
  // Calculate category breakdown
  const categoryBreakdown = upcomingEvents.reduce((acc, event) => {
    const cat = event.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Schema markup
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Events in ${localityName}, Jaipur`,
    "description": `Upcoming events, activities and things to do in ${localityName}, Jaipur`,
    "numberOfItems": upcomingEvents.length,
    "itemListElement": upcomingEvents.slice(0, 20).map((event, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": event.title,
      "url": `${SITE_URL}/events/${event.slug}`
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
    "description": `Discover concerts, workshops, exhibitions and activities in ${localityName}. ${upcomingEvents.length} upcoming events.`,
    "url": `${SITE_URL}/events/in/${locality}`,
    "about": placeSchema,
    "mainEntity": itemListSchema
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Events", "item": `${SITE_URL}/events` },
      { "@type": "ListItem", "position": 3, "name": localityName, "item": `${SITE_URL}/events/in/${locality}` }
    ]
  };

  const isLoading = localityLoading || eventsLoading;

  return (
    <AppLayout
      title={`Events in ${localityName}`}
      subtitle={localityData?.zone ? `${localityData.zone} Zone, Jaipur` : 'Jaipur'}
      showBackButton={true}
      backPath="/events"
      headerRightAction={
        <Link to={`/jaipur/${locality}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <Navigation className="w-4 h-4" />
            Area Guide
          </Button>
        </Link>
      }
      seoTitle={`Events in ${localityName}, Jaipur 2025 | Concerts, Workshops & Activities`}
      seoDescription={`Find ${upcomingEvents.length}+ events in ${localityName}, Jaipur - concerts, workshops, exhibitions and activities. Top venues, category guides & local event discovery.`}
      canonical={`/events/in/${locality}`}
    >
      <Helmet>
        <meta name="keywords" content={`events ${localityName.toLowerCase()}, things to do ${localityName.toLowerCase()}, ${localityName.toLowerCase()} jaipur events, activities ${localityName.toLowerCase()}, concerts ${localityName.toLowerCase()}`} />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(placeSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <main className="px-4 py-6 space-y-6">
        {/* Discover Summary with Event Count */}
        <EventDiscoverSummary
          title={`Events & Things To Do in ${localityName}`}
          summary={`Discover ${upcomingEvents.length} upcoming events in ${localityName}, located in ${localityData?.zone || 'Jaipur'} Zone. From concerts and workshops to exhibitions and community gatherings — find the best activities happening near you.`}
          locality={localityName}
          eventCount={upcomingEvents.length}
        />

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center p-3">
            <p className="text-2xl font-bold text-primary">{upcomingEvents.length}</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </Card>
          <Card className="text-center p-3">
            <p className="text-2xl font-bold text-primary">{topVenues.length}</p>
            <p className="text-xs text-muted-foreground">Venues</p>
          </Card>
          <Card className="text-center p-3">
            <p className="text-2xl font-bold text-primary">{pastEvents.length}+</p>
            <p className="text-xs text-muted-foreground">Past Events</p>
          </Card>
        </div>

        {/* Category Breakdown */}
        {topCategories.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Popular Categories in {localityName}
            </h2>
            <div className="flex flex-wrap gap-2">
              {topCategories.map(([category, count]) => (
                <Link key={category} to={`/events/${category.toLowerCase().replace(/\s+/g, '-')}/${locality}`}>
                  <Badge variant="secondary" className="gap-1 hover:bg-secondary/80">
                    {category}
                    <span className="text-xs opacity-70">({count})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Top Venues in Locality */}
        {topVenues.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Top Venues in {localityName}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {topVenues.map(venue => (
                <Link 
                  key={venue.name} 
                  to={`/venues/${venue.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <p className="font-medium text-sm truncate">{venue.name}</p>
                  <p className="text-xs text-muted-foreground">{venue.eventCount} events hosted</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick Filters */}
        <section className="flex flex-wrap gap-2">
          <Link to="/events/free">
            <Button variant="outline" size="sm">Free Events</Button>
          </Link>
          <Link to="/events/workshops">
            <Button variant="outline" size="sm">Workshops</Button>
          </Link>
          <Link to="/events/today">
            <Button variant="outline" size="sm">Today</Button>
          </Link>
          <Link to="/events/this-weekend">
            <Button variant="outline" size="sm">This Weekend</Button>
          </Link>
        </section>

        {/* Upcoming Events Grid */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Events in {localityName}
          </h2>
          
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid gap-4">
              {upcomingEvents.map(event => (
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
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{event.category}</Badge>
                          {event.is_free && (
                            <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">Free</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm line-clamp-2">{event.title}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(parseISO(event.start_date), "EEE, MMM d • h:mm a")}</span>
                        </div>
                        {event.venue_name && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{event.venue_name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center px-2">
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
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

        {/* Past Events Section (Authority Building) */}
        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Past Events in {localityName}
            </h2>
            <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4">
              {pastEvents.map(event => (
                <Link 
                  key={event.id} 
                  to={`/events/past/${event.slug}`}
                  className="shrink-0 w-40"
                >
                  <Card className="overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                    {event.cover_image && (
                      <img 
                        src={event.cover_image} 
                        alt={event.title}
                        className="w-full h-20 object-cover grayscale"
                        loading="lazy"
                      />
                    )}
                    <CardContent className="p-2">
                      <p className="text-xs font-medium line-clamp-2">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(parseISO(event.start_date), "MMM yyyy")}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Locality Insights for Attendees */}
        <EventLocalityInsights 
          locality={localityName}
          venueName={null}
        />

        {/* Nearby Localities with Events */}
        {nearbyLocalities.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Events in Nearby Areas
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {nearbyLocalities.map(loc => (
                <Link 
                  key={loc.slug} 
                  to={`/events/in/${loc.slug}`}
                  className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="font-medium text-sm">{loc.name}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Explore events →
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Links */}
        <section className="border-t pt-6">
          <h2 className="text-sm font-semibold mb-3">Explore More</h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/events/free">
              <Button variant="outline" size="sm">Free Events Jaipur</Button>
            </Link>
            <Link to="/events/workshops">
              <Button variant="outline" size="sm">Workshops</Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" size="sm">All Jaipur Events</Button>
            </Link>
            <Link to={`/jaipur/${locality}`}>
              <Button variant="outline" size="sm">{localityName} Guide</Button>
            </Link>
            {localityData?.zone && (
              <Link to={`/jaipur/zones/${localityData.zone.toLowerCase().replace(/\s+/g, '-')}`}>
                <Button variant="outline" size="sm">{localityData.zone} Zone</Button>
              </Link>
            )}
          </div>
        </section>

        {/* Dynamic FAQ */}
        <EventDynamicFAQ locality={localityName} />
      </main>
    </AppLayout>
  );
};

export default EventsLocalityPage;
