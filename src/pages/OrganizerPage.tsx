import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone,
  ChevronRight,
  Users,
  Ticket,
  Clock,
  Star,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { useOrganizer, useOrganizerUpcomingEvents, useOrganizerPastEvents } from "@/hooks/useOrganizers";

const BASE_URL = "https://jaipurcircle.com";
const SITE_NAME = "Jaipur Circle";

const OrganizerPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: organizer, isLoading: organizerLoading } = useOrganizer(slug);
  const { data: upcomingEvents = [], isLoading: upcomingLoading } = useOrganizerUpcomingEvents(organizer?.name);
  const { data: pastEvents = [] } = useOrganizerPastEvents(organizer?.name, 6);

  if (organizerLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Organizer not found</h1>
          <Link to="/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canonicalUrl = `${BASE_URL}/organizer/${organizer.slug}`;
  const pageTitle = `${organizer.name} | Event Organizer in Jaipur - ${SITE_NAME}`;
  const pageDescription = `Events by ${organizer.name} in Jaipur. ${organizer.total_events} total events, ${organizer.upcoming_events} upcoming. View upcoming shows, concerts, and workshops.`;

  // Organization schema
  const organizerSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": canonicalUrl,
    name: organizer.name,
    description: `Event organizer based in Jaipur, Rajasthan`,
    url: canonicalUrl,
    ...(organizer.email ? { email: organizer.email } : {}),
    ...(organizer.phone ? { telephone: organizer.phone } : {}),
    areaServed: {
      "@type": "City",
      name: "Jaipur",
      containedIn: {
        "@type": "State",
        name: "Rajasthan"
      }
    },
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
      { "@type": "ListItem", position: 3, name: "Organizers", item: `${BASE_URL}/organizers` },
      { "@type": "ListItem", position: 4, name: organizer.name, item: canonicalUrl }
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
        <meta property="og:type" content="profile" />
        <script type="application/ld+json">{JSON.stringify(organizerSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 px-4 pt-4 pb-6">
          <Link to="/events" className="mb-4 inline-block">
            <Button variant="secondary" size="icon" className="rounded-full bg-background/80 backdrop-blur-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="mb-1">Event Organizer</Badge>
              <h1 className="text-xl font-bold">{organizer.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {organizer.total_events} events • {organizer.upcoming_events} upcoming
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground overflow-x-auto">
            <Link to="/" className="hover:text-primary whitespace-nowrap">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <Link to="/events" className="hover:text-primary whitespace-nowrap">Events</Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-foreground whitespace-nowrap">{organizer.name}</span>
          </nav>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <CardContent className="py-4">
                <p className="text-2xl font-bold text-primary">{organizer.total_events}</p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-4">
                <p className="text-2xl font-bold text-primary">{organizer.upcoming_events}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-4">
                <p className="text-2xl font-bold text-primary">{organizer.localities_active.length}</p>
                <p className="text-xs text-muted-foreground">Localities</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          {(organizer.email || organizer.phone) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {organizer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-primary" />
                    <a href={`mailto:${organizer.email}`} className="text-sm text-primary hover:underline">
                      {organizer.email}
                    </a>
                  </div>
                )}
                {organizer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <a href={`tel:${organizer.phone}`} className="text-sm text-primary hover:underline">
                      {organizer.phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Active Localities */}
          {organizer.localities_active.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3">Active in</h2>
              <div className="flex gap-2 flex-wrap">
                {organizer.localities_active.map(locality => (
                  <Link key={locality} to={`/events/in/${locality.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {locality}
                    </Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Focus Categories */}
          {organizer.categories_focus.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3">Event Categories</h2>
              <div className="flex gap-2 flex-wrap">
                {organizer.categories_focus.map(category => (
                  <Link key={category} to={`/events/category/${category}`}>
                    <Badge variant="outline" className="capitalize">
                      {category}
                    </Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Events */}
          {upcomingLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : upcomingEvents.length > 0 ? (
            <section>
              <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
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
                            {event.venue_name && (
                              <>
                                <Building2 className="w-3 h-3" />
                                <span className="truncate">{event.venue_name}</span>
                              </>
                            )}
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
                <p className="text-muted-foreground">No upcoming events</p>
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
        </div>

        <NativeBottomNav />
      </div>
    </>
  );
};

export default OrganizerPage;
