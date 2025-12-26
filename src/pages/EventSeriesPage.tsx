import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { format, parseISO, isPast, isFuture } from "date-fns";
import { Calendar, MapPin, Clock, ArrowRight, ChevronRight, TrendingUp, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/layout/AppLayout";

const SITE_URL = 'https://www.jaipurcircle.com';

interface EventEdition {
  id: string;
  title: string;
  slug: string;
  start_date: string;
  end_date: string | null;
  venue_name: string | null;
  locality: string | null;
  cover_image: string | null;
  is_free: boolean | null;
  ticket_price: number | null;
  status: string | null;
}

const EventSeriesPage = () => {
  const { seriesSlug } = useParams<{ seriesSlug: string }>();

  // Parse series slug to find related events
  // Series slug format: "event-name-jaipur" or similar base pattern
  const basePattern = seriesSlug?.replace(/-\d{4}$/, '').replace(/-jaipur$/, '') || '';

  // Fetch all related events (past and future editions)
  const { data: allEditions = [], isLoading } = useQuery({
    queryKey: ['event-series', basePattern],
    queryFn: async () => {
      if (!basePattern) return [];
      
      // Search for events with similar titles
      const { data, error } = await supabase
        .from('events')
        .select('id, title, slug, start_date, end_date, venue_name, locality, cover_image, is_free, ticket_price, status')
        .or(`slug.ilike.%${basePattern}%,title.ilike.%${basePattern.replace(/-/g, ' ')}%`)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return (data || []) as EventEdition[];
    },
    enabled: !!basePattern
  });

  const upcomingEditions = allEditions.filter(e => isFuture(parseISO(e.start_date)));
  const pastEditions = allEditions.filter(e => isPast(parseISO(e.start_date)));
  const latestEdition = upcomingEditions[0] || pastEditions[0];
  
  const seriesName = latestEdition?.title?.replace(/\s*\d{4}\s*/, '').replace(/Jaipur\s*/i, '').trim() || 
    basePattern.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // JSON-LD EventSeries schema
  const eventSeriesSchema = {
    "@context": "https://schema.org",
    "@type": "EventSeries",
    "name": `${seriesName} - Jaipur`,
    "description": `All editions of ${seriesName} in Jaipur. ${upcomingEditions.length} upcoming, ${pastEditions.length} past events.`,
    "url": `${SITE_URL}/events/series/${seriesSlug}`,
    "location": {
      "@type": "City",
      "name": "Jaipur",
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "Rajasthan",
        "addressCountry": "IN"
      }
    },
    "subEvent": allEditions.slice(0, 10).map(edition => ({
      "@type": "Event",
      "name": edition.title,
      "startDate": edition.start_date,
      "endDate": edition.end_date || edition.start_date,
      "eventStatus": isPast(parseISO(edition.start_date)) 
        ? "https://schema.org/EventEnded" 
        : "https://schema.org/EventScheduled",
      "url": `${SITE_URL}/events/${edition.slug}`,
      "location": edition.venue_name ? {
        "@type": "Place",
        "name": edition.venue_name,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": edition.locality || "Jaipur"
        }
      } : undefined
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Events", "item": `${SITE_URL}/events` },
      { "@type": "ListItem", "position": 3, "name": seriesName, "item": `${SITE_URL}/events/series/${seriesSlug}` }
    ]
  };

  if (isLoading) {
    return (
      <AppLayout title="Loading..." showBackButton backPath="/events">
        <div className="container mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (allEditions.length === 0) {
    return (
      <AppLayout title="Event Series Not Found" showBackButton backPath="/events">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Event Series Not Found</h1>
          <p className="text-muted-foreground mb-6">We couldn't find any events matching this series.</p>
          <Link to="/events">
            <Button>Browse All Events</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={`${seriesName} - All Editions`}
      subtitle={`${allEditions.length} events in Jaipur`}
      showBackButton
      backPath="/events"
      seoTitle={`${seriesName} Jaipur | All Editions & Upcoming Shows`}
      seoDescription={`${seriesName} in Jaipur - ${upcomingEditions.length} upcoming editions, ${pastEditions.length} past events. Complete event history and ticket information.`}
      canonical={`/events/series/${seriesSlug}`}
    >
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(eventSeriesSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <main className="px-4 py-6 space-y-6">
        {/* Series Header */}
        <section className="text-center">
          <h1 className="text-2xl font-bold mb-2">{seriesName}</h1>
          <p className="text-muted-foreground">
            {allEditions.length} edition{allEditions.length !== 1 ? 's' : ''} in Jaipur
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{upcomingEditions.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">{pastEditions.length}</p>
              <p className="text-xs text-muted-foreground">Past</p>
            </div>
          </div>
        </section>

        {/* Upcoming Editions */}
        {upcomingEditions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Upcoming Editions
            </h2>
            <div className="space-y-4">
              {upcomingEditions.map(edition => (
                <Link key={edition.id} to={`/events/${edition.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="p-0 flex">
                      {edition.cover_image && (
                        <img 
                          src={edition.cover_image} 
                          alt={edition.title}
                          className="w-28 h-28 object-cover"
                        />
                      )}
                      <div className="p-4 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-primary text-primary-foreground">Upcoming</Badge>
                          {edition.is_free && (
                            <Badge variant="secondary">Free</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold line-clamp-1">{edition.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{format(parseISO(edition.start_date), "EEEE, MMMM d, yyyy")}</span>
                        </div>
                        {edition.venue_name && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{edition.venue_name}</span>
                          </div>
                        )}
                        {!edition.is_free && edition.ticket_price && (
                          <p className="text-sm font-medium text-primary mt-2">
                            From ₹{edition.ticket_price}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center px-4">
                        <Button size="sm">
                          Get Tickets
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Past Editions */}
        {pastEditions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" />
              Past Editions
            </h2>
            <div className="grid gap-3">
              {pastEditions.map(edition => (
                <Link key={edition.id} to={`/events/past/${edition.slug}`}>
                  <Card className="overflow-hidden hover:bg-muted/50 transition-colors opacity-80 hover:opacity-100">
                    <CardContent className="p-3 flex items-center gap-4">
                      {edition.cover_image && (
                        <img 
                          src={edition.cover_image} 
                          alt={edition.title}
                          className="w-16 h-16 object-cover rounded grayscale"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{edition.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(parseISO(edition.start_date), "MMMM d, yyyy")}</span>
                        </div>
                        {edition.venue_name && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {edition.venue_name}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="shrink-0">Past</Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Series Info */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">About {seriesName}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              {seriesName} is a recurring event series in Jaipur with {allEditions.length} edition{allEditions.length !== 1 ? 's' : ''} hosted over time.
            </p>
            {upcomingEditions.length > 0 && (
              <p>
                The next edition is scheduled for {format(parseISO(upcomingEditions[0].start_date), "MMMM d, yyyy")} at {upcomingEditions[0].venue_name || 'a venue in Jaipur'}.
              </p>
            )}
            <p>
              Stay updated on JaipurCircle for the latest announcements and ticket availability.
            </p>
          </CardContent>
        </Card>

        {/* Related Links */}
        <section className="border-t pt-6">
          <h3 className="text-sm font-semibold mb-3">Explore More</h3>
          <div className="flex flex-wrap gap-2">
            <Link to="/events">
              <Button variant="outline" size="sm">All Events</Button>
            </Link>
            <Link to="/events/this-weekend">
              <Button variant="outline" size="sm">This Weekend</Button>
            </Link>
            {latestEdition?.locality && (
              <Link to={`/events/in/${latestEdition.locality.toLowerCase().replace(/\s+/g, '-')}`}>
                <Button variant="outline" size="sm">Events in {latestEdition.locality}</Button>
              </Link>
            )}
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default EventSeriesPage;
