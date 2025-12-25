import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, GraduationCap, MapPin, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import EventDiscoverSummary from "@/components/events/EventDiscoverSummary";
import EventDynamicFAQ from "@/components/events/EventDynamicFAQ";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const EventsWorkshopsPage = () => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["workshop-events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, slug, start_date, venue_name, locality, cover_image, category, is_free, ticket_price, short_description")
        .eq("status", "published")
        .or("category.ilike.%workshop%,category.ilike.%learning%,category.ilike.%class%,title.ilike.%workshop%,title.ilike.%class%,title.ilike.%training%")
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(50);

      return data || [];
    }
  });

  // Workshop types for internal linking
  const workshopTypes = [
    { label: "Photography Workshops", slug: "photography" },
    { label: "Art & Craft Classes", slug: "art-craft" },
    { label: "Cooking Classes", slug: "cooking" },
    { label: "Music Lessons", slug: "music" },
    { label: "Coding Bootcamps", slug: "coding" },
    { label: "Pottery & Ceramics", slug: "pottery" },
    { label: "Block Printing", slug: "block-printing" },
    { label: "Dance Classes", slug: "dance" }
  ];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Workshops & Learning Events in Jaipur",
    "description": "Hands-on workshops, skill classes and training programs in Jaipur",
    "numberOfItems": events.length,
    "itemListElement": events.slice(0, 20).map((event, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": event.title,
      "url": `https://www.jaipurcircle.com/events/${event.slug}`
    }))
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Workshops & Learning Events in Jaipur",
    "description": "Discover hands-on learning workshops, skill classes, training programs, creative arts, photography, music, business and tech sessions in Jaipur.",
    "url": "https://www.jaipurcircle.com/events/workshops",
    "about": {
      "@type": "Thing",
      "name": "Educational Workshops",
      "description": "Skill development and learning programs"
    },
    "areaServed": {
      "@type": "City",
      "name": "Jaipur"
    }
  };

  return (
    <>
      <Helmet>
        <title>Workshops in Jaipur 2025 | Classes, Training & Learning Events | JaipurCircle</title>
        <meta name="description" content="Find workshops in Jaipur - photography, art & craft, cooking, music, coding, pottery and more. Hands-on learning experiences across Jaipur localities." />
        <meta name="keywords" content="workshops jaipur, classes jaipur, learning events jaipur, photography workshop jaipur, cooking class jaipur, art workshop jaipur" />
        <link rel="canonical" href="https://www.jaipurcircle.com/events/workshops" />
        <meta property="og:title" content="Workshops & Learning Events in Jaipur" />
        <meta property="og:description" content="Discover hands-on workshops and skill classes in Jaipur. Photography, art, cooking, music and more." />
        <meta property="og:url" content="https://www.jaipurcircle.com/events/workshops" />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
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
                <h1 className="text-xl font-bold">Workshops & Classes</h1>
                <p className="text-xs text-muted-foreground">Learn & Create</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <GraduationCap className="w-4 h-4" />
              <span>{events.length} workshops</span>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 space-y-6">
          {/* Discover Summary */}
          <EventDiscoverSummary
            title="Workshops & Learning Events in Jaipur"
            summary="Hands-on learning workshops, skill classes, training programs, creative arts, photography, music, business and tech sessions in Jaipur. Whether you're looking to learn a new skill or refine existing talents, find the perfect workshop near you."
            eventType="Workshops & Classes"
            eventCount={events.length}
          />

          {/* Workshop Types Grid */}
          <section>
            <h2 className="text-lg font-bold mb-3">Browse by Type</h2>
            <div className="flex flex-wrap gap-2">
              {workshopTypes.map(type => (
                <span 
                  key={type.slug}
                  className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {type.label}
                </span>
              ))}
            </div>
          </section>

          {/* Events Grid */}
          <section>
            <h2 className="text-lg font-bold mb-4">Upcoming Workshops</h2>
            
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
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              Workshop
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No workshops scheduled at the moment.</p>
                <p className="text-sm text-muted-foreground mt-1">Check back soon or explore all events.</p>
                <Link to="/events" className="mt-3 inline-block">
                  <Button variant="outline" size="sm">Browse All Events</Button>
                </Link>
              </Card>
            )}
          </section>

          {/* Related Links */}
          <section className="mt-6">
            <h2 className="text-lg font-bold mb-3">Explore More</h2>
            <div className="flex flex-wrap gap-2">
              <Link to="/events/free">
                <Button variant="outline" size="sm">Free Events</Button>
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
          <EventDynamicFAQ eventType="workshops" />
        </main>

        <NativeBottomNav />
      </div>
    </>
  );
};

export default EventsWorkshopsPage;
