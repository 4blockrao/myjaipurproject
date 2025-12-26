import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Calendar, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import EventDiscoverSummary from "@/components/events/EventDiscoverSummary";
import EventDynamicFAQ from "@/components/events/EventDynamicFAQ";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay, isSaturday, isSunday, nextSaturday, addDays } from "date-fns";

const SITE_URL = 'https://www.jaipurcircle.com';

// Get this weekend's date range (Saturday-Sunday)
const getWeekendRange = () => {
  const today = new Date();
  let saturday: Date;
  
  if (isSaturday(today)) {
    saturday = today;
  } else if (isSunday(today)) {
    // If today is Sunday, show today as the weekend end
    saturday = addDays(today, -1);
  } else {
    // Get the next Saturday
    saturday = nextSaturday(today);
  }
  
  const sunday = addDays(saturday, 1);
  
  return {
    start: startOfDay(saturday),
    end: endOfDay(sunday),
    saturday,
    sunday
  };
};

const EventsThisWeekendPage = () => {
  const { start: weekendStart, end: weekendEnd, saturday, sunday } = getWeekendRange();
  const weekendRange = `${format(saturday, "EEE, MMM d")} - ${format(sunday, "EEE, MMM d")}`;

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events-this-weekend", weekendStart.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, slug, start_date, venue_name, locality, cover_image, category, is_free, ticket_price, short_description")
        .eq("status", "published")
        .gte("start_date", weekendStart.toISOString())
        .lte("start_date", weekendEnd.toISOString())
        .order("start_date", { ascending: true })
        .limit(100);

      return data || [];
    }
  });

  // Separate Saturday and Sunday events
  const saturdayEvents = events.filter(e => 
    format(new Date(e.start_date), "EEEE") === "Saturday"
  );
  const sundayEvents = events.filter(e => 
    format(new Date(e.start_date), "EEEE") === "Sunday"
  );

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Events in Jaipur This Weekend",
    "description": `Weekend events in Jaipur - ${weekendRange}`,
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
        },
        "isAccessibleForFree": event.is_free
      }
    }))
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Events & Things To Do in Jaipur This Weekend",
    "description": "Concerts, nightlife, festivals, comedy shows and family events happening in Jaipur this weekend. Covers Saturday & Sunday, updated weekly.",
    "url": `${SITE_URL}/events/this-weekend`,
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
        "name": "What events are happening in Jaipur this weekend?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `We feature ${events.length} verified events happening in Jaipur this weekend (${weekendRange}) including concerts, nightlife, festivals, comedy shows, family activities and more.`
        }
      },
      {
        "@type": "Question",
        "name": "What are the best things to do in Jaipur this weekend?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "This weekend's top activities in Jaipur include live music, rooftop parties, art exhibitions, food festivals, heritage walks, family-friendly activities and cultural performances."
        }
      },
      {
        "@type": "Question",
        "name": "Are there family-friendly events this weekend in Jaipur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Jaipur hosts many family-friendly weekend events including kids workshops, cultural programs, food festivals, heritage walks and outdoor activities perfect for all ages."
        }
      },
      {
        "@type": "Question",
        "name": "Where can I find nightlife events in Jaipur this weekend?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Find the best weekend nightlife events in Jaipur including DJ nights, live music, rooftop parties and club events. Check our listings for the complete weekend party schedule."
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
      { "@type": "ListItem", "position": 3, "name": "This Weekend", "item": `${SITE_URL}/events/this-weekend` }
    ]
  };

  const renderEventCard = (event: typeof events[0]) => (
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
  );

  return (
    <AppLayout
      title="This Weekend"
      subtitle={weekendRange}
      showBackButton={true}
      backPath="/events"
      headerRightAction={
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          <span>{events.length}</span>
        </div>
      }
      seoTitle="Jaipur Events This Weekend | Things To Do | JaipurCircle"
      seoDescription={`Discover ${events.length}+ events in Jaipur this weekend (${weekendRange}). Concerts, nightlife, festivals, family activities and more. Updated weekly.`}
      canonical="/events/this-weekend"
    >
      <Helmet>
        <meta name="keywords" content="jaipur events this weekend, things to do in jaipur this weekend, weekend activities jaipur, weekend family events jaipur, jaipur nightlife weekend" />
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
          title="Events & Things To Do in Jaipur This Weekend"
          summary={`Concerts, nightlife, festivals, comedy shows and family events happening in Jaipur this weekend (${weekendRange}). Covers Saturday & Sunday, updated weekly.`}
          eventType="Weekend Events"
          eventCount={events.length}
        />

        {/* Time Quick Links */}
        <section className="flex flex-wrap gap-2">
          <Link to="/events/today">
            <Button variant="outline" size="sm">Today</Button>
          </Link>
          <Link to="/events/this-week">
            <Button variant="outline" size="sm">This Week</Button>
          </Link>
          <span className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-full font-medium">
            This Weekend
          </span>
          <Link to="/events/free">
            <Button variant="outline" size="sm">Free Events</Button>
          </Link>
        </section>

        {/* Weekend Events */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-6">
            {/* Saturday Events */}
            {saturdayEvents.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Saturday, {format(saturday, "MMM d")}
                </h2>
                <div className="grid gap-3">
                  {saturdayEvents.map(renderEventCard)}
                </div>
              </section>
            )}

            {/* Sunday Events */}
            {sundayEvents.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Sunday, {format(sunday, "MMM d")}
                </h2>
                <div className="grid gap-3">
                  {sundayEvents.map(renderEventCard)}
                </div>
              </section>
            )}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No events scheduled this weekend.</p>
            <p className="text-sm text-muted-foreground mt-1">Check out events this week or browse all upcoming events.</p>
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

        {/* Related Links */}
        <section className="mt-6">
          <h2 className="text-lg font-bold mb-3">Explore More</h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/events/today">
              <Button variant="outline" size="sm">Today</Button>
            </Link>
            <Link to="/events/free">
              <Button variant="outline" size="sm">Free Events</Button>
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
        <EventDynamicFAQ eventType="this-weekend" />
      </main>
    </AppLayout>
  );
};

export default EventsThisWeekendPage;