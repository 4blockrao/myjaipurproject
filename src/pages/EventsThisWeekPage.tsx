import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Calendar, MapPin, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import EventDiscoverSummary from "@/components/events/EventDiscoverSummary";
import EventDynamicFAQ from "@/components/events/EventDynamicFAQ";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek } from "date-fns";

const SITE_URL = 'https://www.jaipurcircle.com';

const EventsThisWeekPage = () => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
  const weekRange = `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events-this-week", weekStart.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, slug, start_date, venue_name, locality, cover_image, category, is_free, ticket_price, short_description")
        .eq("status", "published")
        .gte("start_date", weekStart.toISOString())
        .lte("start_date", weekEnd.toISOString())
        .order("start_date", { ascending: true })
        .limit(100);

      return data || [];
    }
  });

  // Group events by day
  const eventsByDay = events.reduce((acc, event) => {
    const day = format(new Date(event.start_date), "EEEE, MMM d");
    if (!acc[day]) acc[day] = [];
    acc[day].push(event);
    return acc;
  }, {} as Record<string, typeof events>);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Events in Jaipur This Week",
    "description": `Upcoming events in Jaipur from ${weekRange}`,
    "numberOfItems": events.length,
    "itemListElement": events.slice(0, 30).map((event, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Event",
        "name": event.title,
        "url": `${SITE_URL}/events/${event.slug}`,
        "startDate": event.start_date,
        "location": {
          "@type": "Place",
          "name": event.venue_name || "Jaipur"
        }
      }
    }))
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Events & Things To Do in Jaipur This Week",
    "description": "Upcoming events, music shows, workshops, meetups and cultural programs happening across Jaipur this week. Auto-refreshed weekly.",
    "url": `${SITE_URL}/events/this-week`,
    "dateModified": new Date().toISOString(),
    "areaServed": {
      "@type": "City",
      "name": "Jaipur"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What events are happening in Jaipur this week?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `We feature ${events.length} verified events happening in Jaipur this week (${weekRange}) including concerts, workshops, exhibitions, cultural programs and community activities.`
        }
      },
      {
        "@type": "Question",
        "name": "What are the best things to do in Jaipur this week?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "This week's highlights in Jaipur include live music performances, art exhibitions, skill workshops, food festivals, heritage walks and cultural events. Browse our daily listings for the complete schedule."
        }
      },
      {
        "@type": "Question",
        "name": "Are there free events in Jaipur this week?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, many free events take place in Jaipur throughout the week. Filter by 'Free Events' to find open exhibitions, community programs and cultural activities at no cost."
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
      { "@type": "ListItem", "position": 3, "name": "This Week", "item": `${SITE_URL}/events/this-week` }
    ]
  };

  return (
    <AppLayout
      title="Events This Week"
      subtitle={weekRange}
      showBackButton={true}
      backPath="/events"
      headerRightAction={
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <CalendarDays className="w-4 h-4" />
          <span>{events.length}</span>
        </div>
      }
      seoTitle="Events in Jaipur This Week | Upcoming Activities | JaipurCircle"
      seoDescription={`Discover ${events.length}+ events in Jaipur this week (${weekRange}). Concerts, workshops, exhibitions and activities. Updated weekly.`}
      canonical="/events/this-week"
    >
      <Helmet>
        <meta name="keywords" content="events in jaipur this week, upcoming events jaipur, things to do in jaipur this week, jaipur weekly events, what's happening in jaipur" />
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
          title="Events & Things To Do in Jaipur This Week"
          summary={`Upcoming events, music shows, workshops, meetups and cultural programs happening across Jaipur this week (${weekRange}). Covers Monday through Sunday, auto-refreshed weekly.`}
          eventType="Weekly Events"
          eventCount={events.length}
        />

        {/* Time Quick Links */}
        <section className="flex flex-wrap gap-2">
          <Link to="/events/today">
            <Button variant="outline" size="sm">Today</Button>
          </Link>
          <span className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-full font-medium">
            This Week
          </span>
          <Link to="/events/this-weekend">
            <Button variant="outline" size="sm">This Weekend</Button>
          </Link>
          <Link to="/events/free">
            <Button variant="outline" size="sm">Free Events</Button>
          </Link>
        </section>

        {/* Events by Day */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(eventsByDay).map(([day, dayEvents]) => (
              <section key={day}>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {day}
                </h2>
                <div className="grid gap-3">
                  {(dayEvents as any[]).map((event: any) => (
                    <Link key={event.id} to={`/events/${event.slug}`}>
                      <Card className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0 flex">
                          {event.cover_image && (
                            <img 
                              src={event.cover_image} 
                              alt={event.title}
                              className="w-20 h-20 object-cover"
                              loading="lazy"
                            />
                          )}
                          <div className="p-3 flex-1">
                            <h3 className="font-semibold text-sm line-clamp-1">{event.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span>{format(new Date(event.start_date), "h:mm a")}</span>
                              {event.venue_name && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {event.venue_name}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              {event.is_free && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                  Free
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
              </section>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No events scheduled this week.</p>
            <p className="text-sm text-muted-foreground mt-1">Browse all upcoming events or check back later.</p>
            <Link to="/events" className="mt-3 inline-block">
              <Button variant="outline" size="sm">All Events</Button>
            </Link>
          </Card>
        )}

        {/* Related Links */}
        <section className="mt-6">
          <h2 className="text-lg font-bold mb-3">Explore More</h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/events/today">
              <Button variant="outline" size="sm">Today</Button>
            </Link>
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
        <EventDynamicFAQ eventType="this-week" />
      </main>
    </AppLayout>
  );
};

export default EventsThisWeekPage;