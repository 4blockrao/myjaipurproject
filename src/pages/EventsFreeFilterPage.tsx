import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Ticket, MapPin, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import EventDiscoverSummary from "@/components/events/EventDiscoverSummary";
import EventDynamicFAQ from "@/components/events/EventDynamicFAQ";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const SITE_URL = 'https://www.jaipurcircle.com';

const EventsFreeFilterPage = () => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["free-events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, slug, start_date, venue_name, locality, cover_image, category, short_description")
        .eq("is_free", true)
        .eq("status", "published")
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(50);

      return data || [];
    }
  });

  // Fetch localities for internal linking
  const { data: localities = [] } = useQuery({
    queryKey: ["localities-for-events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("localities")
        .select("name, slug")
        .limit(12);
      return data || [];
    }
  });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Free Events in Jaipur",
    "description": "Complete listing of free events, workshops, concerts and activities in Jaipur",
    "numberOfItems": events.length,
    "itemListElement": events.slice(0, 20).map((event, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": event.title,
      "url": `${SITE_URL}/events/${event.slug}`
    }))
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Free Events & Things To Do in Jaipur",
    "description": "Discover free concerts, workshops, cultural events, exhibitions and community activities happening across Jaipur.",
    "url": `${SITE_URL}/events/free`,
    "areaServed": {
      "@type": "City",
      "name": "Jaipur",
      "containedInPlace": {
        "@type": "State",
        "name": "Rajasthan"
      }
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "JaipurCircle",
      "url": SITE_URL
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Events", "item": `${SITE_URL}/events` },
      { "@type": "ListItem", "position": 3, "name": "Free Events", "item": `${SITE_URL}/events/free` }
    ]
  };

  return (
    <AppLayout
      title="Free Events"
      subtitle="No tickets required"
      showBackButton={true}
      backPath="/events"
      headerRightAction={
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Ticket className="w-4 h-4" />
          <span>{events.length}</span>
        </div>
      }
      seoTitle="Free Events in Jaipur 2025 | Concerts, Workshops & Activities"
      seoDescription="Discover free events in Jaipur - concerts, workshops, cultural festivals, exhibitions and community activities. Find free things to do across Jaipur localities."
      canonical="/events/free"
    >
      <Helmet>
        <meta name="keywords" content="free events jaipur, free activities jaipur, free workshops jaipur, free things to do jaipur, free concerts jaipur" />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <main className="px-4 py-6 space-y-6">
        {/* Discover Summary */}
        <EventDiscoverSummary
          title="Free Events & Things To Do in Jaipur"
          summary="Explore free concerts, workshops, cultural events, exhibitions and community activities happening across Jaipur. From heritage walks to open mic nights, discover budget-friendly entertainment and learning opportunities in the Pink City."
          eventType="Free Events"
          eventCount={events.length}
        />

        {/* Events Grid */}
        <section>
          <h2 className="text-lg font-bold mb-4">Upcoming Free Events</h2>
          
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
                            <span>{event.venue_name}{event.locality ? `, ${event.locality}` : ''}</span>
                          </div>
                        )}
                        <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          Free Entry
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No free events scheduled at the moment.</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon or explore all events.</p>
              <Link to="/events" className="mt-3 inline-block">
                <Button variant="outline" size="sm">Browse All Events</Button>
              </Link>
            </Card>
          )}
        </section>

        {/* Locality Links */}
        <section className="mt-8">
          <h2 className="text-lg font-bold mb-4">Free Events by Locality</h2>
          <div className="grid grid-cols-2 gap-2">
            {localities.map(loc => (
              <Link 
                key={loc.slug} 
                to={`/events/in/${loc.slug}`}
                className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="font-medium text-sm">{loc.name}</span>
                <p className="text-xs text-muted-foreground">Free events nearby</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Related Links */}
        <section className="mt-6">
          <h2 className="text-lg font-bold mb-3">Explore More</h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/events/workshops">
              <Button variant="outline" size="sm">Workshops</Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" size="sm">All Events</Button>
            </Link>
            <Link to="/categories/events">
              <Button variant="outline" size="sm">Event Categories</Button>
            </Link>
          </div>
        </section>

        {/* Dynamic FAQ */}
        <EventDynamicFAQ eventType="free" />
      </main>
    </AppLayout>
  );
};

export default EventsFreeFilterPage;