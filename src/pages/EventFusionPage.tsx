import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import EventCard from '@/components/events/EventCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';

/**
 * Fusion Intent Page - Category × Locality
 * Ranks for: "comedy shows in C-Scheme", "concerts in Mansarovar", etc.
 * Major SEO differentiator - no event platform does this
 */
const EventFusionPage = () => {
  const { category, locality } = useParams<{ category: string; locality: string }>();
  
  const categoryName = category?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  const localityName = locality?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  // Fetch events matching both category and locality
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events-fusion', category, locality],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .ilike('category', `%${categoryName}%`)
        .ilike('locality', `%${localityName}%`)
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true });
      return data || [];
    },
    enabled: !!category && !!locality,
  });

  // Fetch nearby locality events as fallback
  const { data: nearbyEvents = [] } = useQuery({
    queryKey: ['events-fusion-nearby', category],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .ilike('category', `%${categoryName}%`)
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .not('locality', 'ilike', `%${localityName}%`)
        .order('start_date', { ascending: true })
        .limit(4);
      return data || [];
    },
    enabled: !!category && events.length < 4,
  });

  const pageTitle = `${categoryName} Events in ${localityName}, Jaipur | Shows & Tickets`;
  const pageDescription = `Find ${categoryName.toLowerCase()} events in ${localityName}, Jaipur. Browse upcoming ${categoryName.toLowerCase()} shows, concerts and book tickets for events near ${localityName}.`;
  const canonicalUrl = `https://www.jaipurcircle.com/events/${category}/${locality}`;

  // Fusion page schema
  const fusionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': canonicalUrl,
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    about: {
      '@type': 'Thing',
      name: `${categoryName} Events in ${localityName}`,
    },
    spatialCoverage: {
      '@type': 'Place',
      name: localityName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: localityName,
        addressRegion: 'Rajasthan',
        addressCountry: 'India',
      },
    },
    numberOfItems: events.length,
    inLanguage: 'en-IN',
  };

  return (
    <AppLayout
      title={`${categoryName} in ${localityName}`}
      subtitle={`${events.length} events found`}
      showBackButton
      backPath={`/events/category/${category}`}
    >
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:locale" content="en_IN" />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        <script type="application/ld+json">
          {JSON.stringify(fusionPageSchema)}
        </script>
      </Helmet>

      <main className="px-4 py-6 space-y-8">
        {/* Fusion Hero */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{categoryName}</Badge>
            <span className="text-muted-foreground">×</span>
            <Badge variant="outline">
              <MapPin className="w-3 h-3 mr-1" />
              {localityName}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {categoryName} Events in {localityName}
          </h1>
          <p className="text-muted-foreground">
            Discover {categoryName.toLowerCase()} shows and experiences happening in {localityName}, Jaipur. 
            From intimate venues to popular spots, find events near you.
          </p>
        </section>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="flex items-center gap-1 text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li className="mx-1">/</li>
            <li><Link to="/events" className="hover:text-primary">Events</Link></li>
            <li className="mx-1">/</li>
            <li><Link to={`/events/category/${category}`} className="hover:text-primary">{categoryName}</Link></li>
            <li className="mx-1">/</li>
            <li className="text-foreground font-medium">{localityName}</li>
          </ol>
        </nav>

        {/* Events Grid */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            {events.length > 0 ? `${categoryName} Events in ${localityName}` : `No Events Found`}
          </h2>
          
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 bg-muted/50 rounded-xl">
              <p className="text-muted-foreground mb-4">
                No {categoryName.toLowerCase()} events in {localityName} right now.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link to={`/events/category/${category}`}>
                  <Badge variant="outline" className="cursor-pointer">
                    All {categoryName} Events
                  </Badge>
                </Link>
                <Link to={`/events/in/${locality}`}>
                  <Badge variant="outline" className="cursor-pointer">
                    All Events in {localityName}
                  </Badge>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={{
                    ...event,
                    short_description: event.short_description ?? undefined,
                    cover_image: event.cover_image ?? undefined,
                    end_date: event.end_date ?? undefined,
                    venue_name: event.venue_name ?? undefined,
                    locality: event.locality ?? undefined,
                    is_online: event.is_online ?? false,
                    is_free: event.is_free ?? false,
                    ticket_price: event.ticket_price ?? undefined,
                    interested_count: event.interested_count ?? 0,
                    is_featured: event.is_featured ?? false,
                  }} 
                />
              ))}
            </div>
          )}
        </section>

        {/* Nearby Events Fallback */}
        {nearbyEvents.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{categoryName} in Nearby Areas</h2>
              <Link 
                to={`/events/category/${category}`}
                className="text-primary text-sm flex items-center gap-1 hover:underline"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {nearbyEvents.slice(0, 4).map((event) => (
                <EventCard 
                  key={event.id} 
                  event={{
                    ...event,
                    short_description: event.short_description ?? undefined,
                    cover_image: event.cover_image ?? undefined,
                    end_date: event.end_date ?? undefined,
                    venue_name: event.venue_name ?? undefined,
                    locality: event.locality ?? undefined,
                    is_online: event.is_online ?? false,
                    is_free: event.is_free ?? false,
                    ticket_price: event.ticket_price ?? undefined,
                    interested_count: event.interested_count ?? 0,
                    is_featured: event.is_featured ?? false,
                  }}
                  variant="compact"
                />
              ))}
            </div>
          </section>
        )}

        {/* Related Links */}
        <section className="border-t pt-6">
          <h3 className="font-semibold mb-3">Explore More</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link 
              to={`/events/category/${category}`}
              className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="font-medium text-sm">All {categoryName}</span>
              <p className="text-xs text-muted-foreground">Across Jaipur</p>
            </Link>
            <Link 
              to={`/events/in/${locality}`}
              className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="font-medium text-sm">Events in {localityName}</span>
              <p className="text-xs text-muted-foreground">All categories</p>
            </Link>
            <Link 
              to="/events/today"
              className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <Calendar className="w-4 h-4 mb-1 text-primary" />
              <span className="font-medium text-sm">Today's Events</span>
            </Link>
            <Link 
              to="/events/this-weekend"
              className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <Calendar className="w-4 h-4 mb-1 text-primary" />
              <span className="font-medium text-sm">Weekend Events</span>
            </Link>
          </div>
        </section>

        {/* SEO Content */}
        <section className="prose prose-sm text-muted-foreground max-w-none bg-muted/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground">
            {categoryName} Events in {localityName} - Your Complete Guide
          </h2>
          <p>
            Looking for {categoryName.toLowerCase()} events in {localityName}, Jaipur? JaipurCircle 
            is your go-to platform for discovering the best {categoryName.toLowerCase()} experiences 
            in this vibrant locality. {localityName} hosts a variety of entertainment options, from 
            intimate venue performances to larger shows.
          </p>
          <p>
            Stay updated with the latest {categoryName.toLowerCase()} events, book tickets early, 
            and join fellow enthusiasts in {localityName}. Can't find what you're looking for? 
            Browse {categoryName.toLowerCase()} events across Jaipur or explore other entertainment 
            options in {localityName}.
          </p>
        </section>
      </main>
    </AppLayout>
  );
};

export default EventFusionPage;
