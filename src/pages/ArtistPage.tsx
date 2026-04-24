import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, MapPin, Music, Mic2, Users, ExternalLink, Ticket, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { getArtistNameFromSlug, extractArtistFromTitle, generateArtistSlug } from "@/utils/artistExtractor";

const ArtistPage = () => {
  const { slug } = useParams<{ slug: string }>();

  // Early validation - no slug
  if (!slug) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Artist Not Found</h1>
          <p className="text-muted-foreground mb-4">No artist specified.</p>
          <Link to="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const artistName = getArtistNameFromSlug(slug);

  // Early validation - no artist name from slug
  if (!artistName || artistName === "") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Artist Not Found</h1>
          <p className="text-muted-foreground mb-4">We couldn't find the artist "{slug}".</p>
          <Link to="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const artistInitials = artistName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Fetch events by this artist - search by name in title AND performer_name column
  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["artist-events", slug, artistName],
    queryFn: async () => {
      // Search for events containing artist name in title OR performer_name column
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .or(`title.ilike.%${artistName}%,performer_name.ilike.%${artistName}%,artist_name.ilike.%${artistName}%`)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!slug && !!artistName,
    staleTime: 1000 * 60 * 5,
  });

  const upcomingEvents = events?.filter((e) => new Date(e.start_date) >= new Date()) || [];
  const pastEvents = events?.filter((e) => new Date(e.start_date) < new Date()) || [];

  // Get artist category from first event
  const artistCategory = events?.[0]?.category || "performer";

  // Generate bio based on category
  const getArtistBio = () => {
    const totalShows = events?.length || 0;
    const jaipurShows = events?.filter((e) => e.city === "Jaipur").length || 0;

    switch (artistCategory.toLowerCase()) {
      case "comedy":
        return `${artistName} is a renowned stand-up comedian known for captivating audiences across India. With ${totalShows} shows in Jaipur, ${artistName} has become a favorite performer in the Pink City's comedy scene.`;
      case "music":
        return `${artistName} is a popular music artist who has performed ${totalShows} times in Jaipur. Known for their energetic live performances, ${artistName} continues to draw large crowds at venues across the city.`;
      default:
        return `${artistName} is a talented performer who has hosted ${totalShows} events in Jaipur. Their performances are known for engaging audiences and delivering memorable experiences.`;
    }
  };

  const getCategoryIcon = () => {
    switch (artistCategory.toLowerCase()) {
      case "comedy":
        return <Mic2 className="w-5 h-5" />;
      case "music":
        return <Music className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
        <NativeBottomNav />
      </div>
    );
  }

  // Show not found if no events and loading is done
  if ((!events || events.length === 0) && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">No Events Found</h1>
          <p className="text-muted-foreground mb-4">We couldn't find any events for {artistName} in Jaipur.</p>
          <Link to="/events">
            <Button>Browse All Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{artistName} Events in Jaipur — Tickets, Dates & Venue | JaipurCircle</title>
        <meta
          name="description"
          content={`${artistName} upcoming and past events in Jaipur. Book tickets for ${artistName} shows, get venue details, dates, and pricing. ${upcomingEvents.length} upcoming shows.`}
        />
        <link rel="canonical" href={`https://www.jaipurcircle.com/artists/${slug}`} />

        {/* Open Graph */}
        <meta property="og:title" content={`${artistName} Events in Jaipur`} />
        <meta
          property="og:description"
          content={`Book tickets for ${artistName} shows in Jaipur. ${upcomingEvents.length} upcoming events.`}
        />
        <meta property="og:url" content={`https://www.jaipurcircle.com/artists/${slug}`} />
        <meta property="og:type" content="profile" />

        {/* JSON-LD Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: artistName,
            url: `https://www.jaipurcircle.com/artists/${slug}`,
            description: getArtistBio(),
            performerIn: upcomingEvents.slice(0, 5).map((event) => ({
              "@type": "Event",
              name: event.title,
              startDate: event.start_date,
              location: {
                "@type": "Place",
                name: event.venue_name || "TBA",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Jaipur",
                  addressRegion: "Rajasthan",
                  addressCountry: "IN",
                },
              },
            })),
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background pb-32">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background p-4 pt-6">
          <Link to="/events" className="inline-block mb-4">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              All Events
            </Button>
          </Link>

          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20 border-4 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                {artistInitials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="capitalize gap-1">
                  {getCategoryIcon()}
                  {artistCategory}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold">{artistName}</h1>
              <p className="text-muted-foreground text-sm mt-1">{events?.length || 0} events in Jaipur</p>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="p-4">
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <h2 className="font-semibold mb-2">About {artistName}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{getArtistBio()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Breadcrumb */}
        <nav className="px-4 py-2" aria-label="Breadcrumb">
          <ol className="flex items-center text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li className="mx-2">/</li>
            <li>
              <Link to="/events" className="hover:text-primary">
                Events
              </Link>
            </li>
            <li className="mx-2">/</li>
            <li>
              <Link to="/artists" className="hover:text-primary">
                Artists
              </Link>
            </li>
            <li className="mx-2">/</li>
            <li className="text-foreground font-medium">{artistName}</li>
          </ol>
        </nav>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <section className="p-4">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Shows ({upcomingEvents.length})
            </h2>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Link key={event.id} to={`/events/${event.slug}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex">
                      <div className="w-24 h-24 flex-shrink-0">
                        <img
                          src={
                            event.cover_image ||
                            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop"
                          }
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-3 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(event.start_date), "MMM d")}
                          </Badge>
                          {event.is_free && <Badge className="bg-green-600 text-white text-xs">Free</Badge>}
                        </div>
                        <h3 className="font-semibold text-sm line-clamp-1">{event.title}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          {event.venue_name || event.locality || "Jaipur"}
                        </div>
                        {!event.is_free && event.ticket_price && (
                          <div className="flex items-center gap-1 text-xs text-primary mt-1">
                            <Ticket className="w-3 h-3" />
                            From ₹{event.ticket_price}
                          </div>
                        )}
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section className="p-4">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              Past Shows ({pastEvents.length})
            </h2>
            <div className="space-y-3">
              {pastEvents.slice(0, 5).map((event) => (
                <Link key={event.id} to={`/events/${event.slug}`}>
                  <Card className="overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {format(new Date(event.start_date), "MMM d, yyyy")}
                          </p>
                          <h3 className="font-medium text-sm line-clamp-1">{event.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {event.venue_name || event.locality || "Jaipur"}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {pastEvents.length > 5 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                + {pastEvents.length - 5} more past events
              </p>
            )}
          </section>
        )}

        {/* Related Artists Section */}
        <section className="p-4 border-t border-border mt-4">
          <h2 className="text-lg font-bold mb-4">Similar Artists in Jaipur</h2>
          <p className="text-sm text-muted-foreground">
            Discover more {artistCategory} events and performances in Jaipur.
          </p>
          <Link to={`/events/category/${artistCategory.toLowerCase()}`}>
            <Button variant="outline" className="mt-3 w-full">
              View All {artistCategory} Events
            </Button>
          </Link>
        </section>
      </div>

      <NativeBottomNav />
    </>
  );
};

export default ArtistPage;
