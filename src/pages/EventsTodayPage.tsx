import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import EventDiscoverSummary from "@/components/events/EventDiscoverSummary";
import EventDynamicFAQ from "@/components/events/EventDynamicFAQ";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay } from "date-fns";

const SITE_URL = 'https://www.jaipurcircle.com';

const EventsTodayPage = () => {
  const today = new Date();
  const todayStart = startOfDay(today).toISOString();
  const todayEnd = endOfDay(today).toISOString();
  const formattedDate = format(today, "EEEE, MMMM d, yyyy");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events-today", todayStart],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, slug, start_date, venue_name, locality, cover_image, category, is_free, ticket_price, short_description")
        .eq("status", "published")
        .gte("start_date", todayStart)
        .lte("start_date", todayEnd)
        .order("start_date", { ascending: true })
        .limit(50);

      return data || [];
    }
  });

  // Fetch localities for internal linking
  const { data: localities = [] } = useQuery({
    queryKey: ["localities-for-today"],
    queryFn: async () => {
      const { data } = await supabase
        .from("localities")
        .select("name, slug")
        .limit(8);
      return data || [];
    }
  });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Events in Jaipur Today",
    "description": `Events, activities and things to do in Jaipur on ${formattedDate}`,
    "numberOfItems": events.length,
    "itemListElement": events.slice(0, 20).map((event, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Event",
        "name": event.title,
        "url": `${SITE_URL}/events/${event.slug}`,
        "startDate": event.start_date,
        "location": {
          "@type": "Place",
          "name": event.venue_name || "Jaipur",
          "address": { "@type": "PostalAddress", "addressLocality": event.locality || "Jaipur" }
        },
        "isAccessibleForFree": event.is_free
      }
    }))
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Events & Things To Do in Jaipur Today",
    "description": "Concerts, workshops, exhibitions, cultural programs and activities happening in Jaipur today. Updated daily with verified local events.",
    "url": `${SITE_URL}/events/today`,
    "dateModified": new Date().toISOString(),
    "areaServed": {
      "@type": "City",
      "name": "Jaipur",
      "containedInPlace": { "@type": "State", "name": "Rajasthan" }
    },
    "isPartOf": { "@type": "WebSite", "name": "JaipurCircle", "url": SITE_URL }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What events are happening in Jaipur today?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `We feature ${events.length} verified events happening in Jaipur today including concerts, workshops, exhibitions, cultural programs and community activities. This page updates daily.`
        }
      },
      {
        "@type": "Question",
        "name": "Are there free events in Jaipur today?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, many free events take place in Jaipur daily. Check our listings for free entry events including open exhibitions, community gatherings and cultural programs."
        }
      },
      {
        "@type": "Question",
        "name": "What are the best things to do in Jaipur today?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Today's top activities in Jaipur include live music, art exhibitions, workshops, food festivals, heritage walks and cultural performances. Explore our curated listings for the best experiences."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Events", "item": `${SITE_URL}/events` },
      { "@type": "ListItem", "position": 3, "name": "Today", "item": `${SITE_URL}/events/today` }
    ]
  };

  return (
    <AppLayout
      title="Events Today"
      subtitle={format(today, "EEE, MMM d")}
      showBackButton={true}
      backPath="/events"
      headerRightAction={
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{events.length}</span>
        </div>
      }
      seoTitle="Events in Jaipur Today | Things To Do Today | JaipurCircle"
      seoDescription={`Discover ${events.length}+ events happening in Jaipur today - concerts, workshops, exhibitions and activities. Updated daily with verified local events.`}
      canonical="/events/today"
    >
      <Helmet>
        <meta name="keywords" content="events in jaipur today, things to do in jaipur today, jaipur events today, what's on in jaipur, shows happening today jaipur" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <main className="px-4 py-6 space-y-6">
        {/* Discover Summary */}
        <EventDiscoverSummary
          title="Events & Things To Do in Jaipur Today"
          summary={`Concerts, workshops, exhibitions, cultural programs and activities happening in Jaipur today (${formattedDate}). Auto-curated from verified Jaipur events, updated daily.`}
          eventType="Today's Events"
          eventCount={events.length}
        />

        {/* Time Quick Links */}
        <section className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-full font-medium">
            Today
          </span>
          <Link to="/events/this-week">
            <Button variant="outline" size="sm">This Week</Button>
          </Link>
          <Link to="/events/this-weekend">
            <Button variant="outline" size="sm">This Weekend</Button>
          </Link>
          <Link to="/events/free">
            <Button variant="outline" size="sm">Free Events</Button>
          </Link>
        </section>

        {/* Events Grid */}
        <section>
          <h2 className="text-lg font-bold mb-4">Happening Today in Jaipur</h2>
          
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
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(event.start_date), "h:mm a")}</span>
                        </div>
                        {event.venue_name && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{event.venue_name}{event.locality ? `, ${event.locality}` : ''}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {event.is_free ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              Free Entry
                            </span>
                          ) : event.ticket_price && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              ₹{event.ticket_price}
                            </span>
                          )}
                          {event.category && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                              {event.category}
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
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No events scheduled for today.</p>
              <p className="text-sm text-muted-foreground mt-1">Check out events this week or upcoming events.</p>
              <div className="flex justify-center gap-2 mt-3">
                <Link to="/events/this-week">
                  <Button variant="outline" size="sm">This Week</Button>
                </Link>
                <Link to="/events">
                  <Button variant="outline" size="sm">All Events</Button>
                </Link>
              </div>
            </Card>
          )}
        </section>

        {/* Locality Links */}
        <section className="mt-8">
          <h2 className="text-lg font-bold mb-4">Events by Locality</h2>
          <div className="grid grid-cols-2 gap-2">
            {localities.map(loc => (
              <Link 
                key={loc.slug} 
                to={`/events/in/${loc.slug}`}
                className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="font-medium text-sm">{loc.name}</span>
                <p className="text-xs text-muted-foreground">Events nearby</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Related Links */}
        <section className="mt-6">
          <h2 className="text-lg font-bold mb-3">Explore More Events</h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/events/this-weekend">
              <Button variant="outline" size="sm">This Weekend</Button>
            </Link>
            <Link to="/events/workshops">
              <Button variant="outline" size="sm">Workshops</Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" size="sm">All Events</Button>
            </Link>
          </div>
        </section>

        {/* Dynamic FAQ */}
        <EventDynamicFAQ eventType="today" />
      </main>
    </AppLayout>
  );
};

export default EventsTodayPage;