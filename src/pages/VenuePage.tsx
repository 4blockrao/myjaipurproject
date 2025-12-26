import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  ExternalLink, 
  Car, 
  Train, 
  Ticket,
  ChevronRight,
  Building2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { useVenue, useVenueUpcomingEvents, useVenuePastEvents } from "@/hooks/useVenues";

const BASE_URL = "https://jaipurcircle.com";
const SITE_NAME = "Jaipur Circle";

const VenuePage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: venue, isLoading: venueLoading } = useVenue(slug);
  const { data: upcomingEvents = [], isLoading: upcomingLoading } = useVenueUpcomingEvents(venue?.name);
  const { data: pastEvents = [] } = useVenuePastEvents(venue?.name, 6);

  if (venueLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Skeleton className="aspect-[16/9] w-full" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Venue not found</h1>
          <Link to="/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canonicalUrl = `${BASE_URL}/venues/${venue.slug}`;
  const pageTitle = `${venue.name} | Events Venue in ${venue.locality || 'Jaipur'} - ${SITE_NAME}`;
  const pageDescription = `Discover events at ${venue.name}${venue.locality ? ` in ${venue.locality}` : ''}, Jaipur. ${upcomingEvents.length} upcoming events. View seating, parking, accessibility info and book tickets.`;

  // Place schema for venue
  const venueSchema = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    "@id": canonicalUrl,
    name: venue.name,
    description: `Event venue in ${venue.locality || 'Jaipur'}, Rajasthan`,
    url: canonicalUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address,
      addressLocality: venue.locality || "Jaipur",
      addressRegion: "Rajasthan",
      addressCountry: "IN"
    },
    ...(venue.latitude && venue.longitude ? {
      geo: {
        "@type": "GeoCoordinates",
        latitude: venue.latitude,
        longitude: venue.longitude
      }
    } : {}),
    event: upcomingEvents.slice(0, 5).map(event => ({
      "@type": "Event",
      name: event.title,
      startDate: event.start_date,
      url: `${BASE_URL}/events/${event.slug}`
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Events", item: `${BASE_URL}/events` },
      { "@type": "ListItem", position: 3, name: "Venues", item: `${BASE_URL}/venues` },
      { "@type": "ListItem", position: 4, name: venue.name, item: canonicalUrl }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="place" />
        {venue.cover_image && <meta property="og:image" content={venue.cover_image} />}
        <script type="application/ld+json">{JSON.stringify(venueSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="relative aspect-[2/1] bg-gradient-to-br from-primary/20 to-primary/5">
          {venue.cover_image && (
            <img
              src={venue.cover_image}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <Link to="/events" className="absolute top-4 left-4">
            <Button variant="secondary" size="icon" className="rounded-full bg-background/80 backdrop-blur-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-white" />
              <span className="text-white/80 text-sm">Event Venue</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{venue.name}</h1>
            {venue.locality && (
              <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {venue.locality}, Jaipur
              </p>
            )}
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground overflow-x-auto">
            <Link to="/" className="hover:text-primary whitespace-nowrap">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <Link to="/events" className="hover:text-primary whitespace-nowrap">Events</Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-foreground whitespace-nowrap">{venue.name}</span>
          </nav>

          {/* Quick Info */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              {venue.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{venue.address}</p>
                  </div>
                </div>
              )}
              
              {venue.zone_name && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Zone</p>
                    <Link 
                      to={`/jaipur/zones/${venue.zone_name?.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {venue.zone_name}
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Events</p>
                  <p className="text-sm text-muted-foreground">
                    {upcomingEvents.length} upcoming • {pastEvents.length}+ past events
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About the Venue */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">About {venue.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                {venue.name} is a popular event venue located in {venue.locality || 'Jaipur'}, Rajasthan. 
                The venue regularly hosts concerts, cultural events, exhibitions, and community gatherings.
              </p>
              {venue.locality && (
                <p>
                  Situated in {venue.locality}, the venue offers excellent connectivity and accessibility 
                  for attendees from across Jaipur and neighboring areas.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Accessibility & Transport */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Getting There</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Car className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Parking facilities available nearby</span>
              </div>
              <div className="flex items-center gap-3">
                <Train className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Accessible via Jaipur Metro and local transport
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          {upcomingLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : upcomingEvents.length > 0 ? (
            <section>
              <h2 className="text-lg font-semibold mb-4">Upcoming Events at {venue.name}</h2>
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <Link key={event.id} to={`/events/${event.slug}`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-3 flex gap-3">
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                          <span className="text-lg font-bold text-primary">
                            {format(new Date(event.start_date), 'd')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(event.start_date), 'MMM')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="mb-1 text-xs capitalize">
                            {event.category}
                          </Badge>
                          <h3 className="font-medium text-sm truncate">{event.title}</h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{format(new Date(event.start_date), 'h:mm a')}</span>
                            <Ticket className="w-3 h-3 ml-2" />
                            <span>{event.is_free ? 'Free' : `₹${event.ticket_price}`}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground self-center" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="py-8 text-center">
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No upcoming events scheduled</p>
                <Link to="/events">
                  <Button variant="link" className="mt-2">Browse all events</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Past Events</h2>
              <div className="grid grid-cols-2 gap-3">
                {pastEvents.slice(0, 4).map(event => (
                  <Link key={event.id} to={`/events/${event.slug}`}>
                    <Card className="hover:bg-muted/50 transition-colors h-full">
                      <CardContent className="p-3">
                        <Badge variant="secondary" className="text-xs capitalize mb-2">
                          {event.category}
                        </Badge>
                        <p className="font-medium text-sm line-clamp-2">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(event.start_date), 'MMM d, yyyy')}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related Locality */}
          {venue.locality_slug && (
            <section>
              <h2 className="text-lg font-semibold mb-3">Explore {venue.locality}</h2>
              <div className="flex gap-2 flex-wrap">
                <Link to={`/jaipur/${venue.locality_slug}`}>
                  <Button variant="outline" size="sm">
                    About {venue.locality}
                  </Button>
                </Link>
                <Link to={`/events/in/${venue.locality_slug}`}>
                  <Button variant="outline" size="sm">
                    All events in {venue.locality}
                  </Button>
                </Link>
              </div>
            </section>
          )}
        </div>

        <NativeBottomNav />
      </div>
    </>
  );
};

export default VenuePage;
