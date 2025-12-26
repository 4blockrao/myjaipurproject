import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import EventCard from '@/components/events/EventCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar } from 'lucide-react';

const EventCategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const categoryName = category?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  const categorySlug = category?.toLowerCase() || '';

  // Fetch events by category
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events-category', categorySlug],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .ilike('category', `%${categoryName}%`)
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true });
      return data || [];
    },
    enabled: !!categorySlug,
  });

  // Fetch localities with events in this category
  const { data: localities = [] } = useQuery({
    queryKey: ['category-localities', categorySlug],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('locality')
        .ilike('category', `%${categoryName}%`)
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .not('locality', 'is', null);
      
      // Get unique localities
      const unique = [...new Set(data?.map(e => e.locality).filter(Boolean))];
      return unique.slice(0, 8) as string[];
    },
    enabled: !!categorySlug,
  });

  const pageTitle = `${categoryName} Events in Jaipur | Concerts, Shows & Tickets`;
  const pageDescription = `Discover ${categoryName.toLowerCase()} events in Jaipur. Find upcoming ${categoryName.toLowerCase()} shows, concerts, and book tickets. ${events.length} events available.`;
  const canonicalUrl = `https://www.jaipurcircle.com/events/category/${categorySlug}`;

  // Category page schema
  const categoryPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': canonicalUrl,
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    isPartOf: {
      '@type': 'WebSite',
      '@id': 'https://www.jaipurcircle.com#website',
      name: 'Jaipur Circle',
    },
    about: {
      '@type': 'Thing',
      name: `${categoryName} Events`,
    },
    numberOfItems: events.length,
    inLanguage: 'en-IN',
  };

  // ItemList schema for events
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${categoryName} Events in Jaipur`,
    numberOfItems: events.length,
    itemListElement: events.slice(0, 10).map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Event',
        name: event.title,
        url: `https://www.jaipurcircle.com/events/${event.slug}`,
        startDate: event.start_date,
        image: event.cover_image,
        location: {
          '@type': 'Place',
          name: event.venue_name || 'Jaipur',
          address: {
            '@type': 'PostalAddress',
            addressLocality: event.locality || 'Jaipur',
            addressRegion: 'Rajasthan',
            addressCountry: 'India',
          },
        },
        offers: {
          '@type': 'Offer',
          price: event.is_free ? '0' : String(event.ticket_price || 0),
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  return (
    <AppLayout
      title={`${categoryName} Events`}
      subtitle={`${events.length} upcoming in Jaipur`}
      showBackButton
      backPath="/events"
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
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        <script type="application/ld+json">
          {JSON.stringify(categoryPageSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(itemListSchema)}
        </script>
      </Helmet>

      <main className="px-4 py-6 space-y-8">
        {/* Category Hero */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
          <h1 className="text-2xl font-bold mb-2">{categoryName} Events in Jaipur</h1>
          <p className="text-muted-foreground">
            Discover the best {categoryName.toLowerCase()} shows, concerts, and experiences happening in Jaipur. 
            Book tickets and never miss out on {categoryName.toLowerCase()} entertainment.
          </p>
        </section>

        {/* Filter by Locality */}
        {localities.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">{categoryName} Events by Area</h2>
            <div className="flex flex-wrap gap-2">
              {localities.map((loc) => (
                <Link 
                  key={loc} 
                  to={`/events/${categorySlug}/${loc.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Badge 
                    variant="outline" 
                    className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    {loc}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick Time Filters */}
        <section>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Link to={`/events/category/${categorySlug}?when=today`}>
              <Badge variant="secondary" className="whitespace-nowrap">
                <Calendar className="w-3 h-3 mr-1" />
                Today
              </Badge>
            </Link>
            <Link to={`/events/category/${categorySlug}?when=this-week`}>
              <Badge variant="secondary" className="whitespace-nowrap">
                <Calendar className="w-3 h-3 mr-1" />
                This Week
              </Badge>
            </Link>
            <Link to={`/events/category/${categorySlug}?when=weekend`}>
              <Badge variant="secondary" className="whitespace-nowrap">
                <Calendar className="w-3 h-3 mr-1" />
                Weekend
              </Badge>
            </Link>
          </div>
        </section>

        {/* Events Grid */}
        <section>
          <h2 className="text-lg font-semibold mb-4">All Upcoming {categoryName} Events</h2>
          
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 bg-muted/50 rounded-xl">
              <p className="text-muted-foreground mb-4">
                No upcoming {categoryName.toLowerCase()} events at the moment.
              </p>
              <Link to="/events" className="text-primary hover:underline">
                Browse all events →
              </Link>
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

        {/* SEO Content Block */}
        <section className="prose prose-sm text-muted-foreground max-w-none bg-muted/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground">{categoryName} Events Guide - Jaipur</h2>
          <p>
            Looking for the best {categoryName.toLowerCase()} events in Jaipur? JaipurCircle brings you 
            a curated selection of {categoryName.toLowerCase()} experiences across the Pink City. From 
            popular venues in C-Scheme and Malviya Nagar to emerging spaces in Vaishali Nagar, discover 
            {categoryName.toLowerCase()} events happening near you.
          </p>
          <p>
            Whether you're searching for free {categoryName.toLowerCase()} events, weekend shows, or 
            ticketed experiences, our comprehensive events guide helps you find and book the best 
            entertainment in Jaipur. Stay updated with trending {categoryName.toLowerCase()} events 
            and never miss the action.
          </p>
        </section>
      </main>
    </AppLayout>
  );
};

export default EventCategoryPage;
