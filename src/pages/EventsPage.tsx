import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Calendar, CalendarDays, Sparkles, Ticket, GraduationCap, MapPin, Music, Laugh, Theater, Utensils, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/layout/AppLayout";
import EventsFeed from "@/components/events/EventsFeed";
import FeaturedEvents from "@/components/events/FeaturedEvents";
import { EventsListSEO } from "@/components/events/EventSEO";
import { supabase } from "@/integrations/supabase/client";
import { PillarSchema } from "@/components/seo/SchemaInjector";
import { format } from "date-fns";

const currentYear = new Date().getFullYear();
const currentMonth = format(new Date(), 'MMMM');

const EventsPage = () => {
  // Fetch events for SEO structured data
  const { data: events = [] } = useQuery({
    queryKey: ["events-seo"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, slug, start_date, cover_image, is_free, ticket_price, category")
        .eq("status", "published")
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(20);
      return data || [];
    },
  });

  // Fetch localities for internal linking
  const { data: localities = [] } = useQuery({
    queryKey: ["events-localities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("localities")
        .select("name, slug")
        .limit(12);
      return data || [];
    },
  });

  // Fetch category counts for hub links
  const { data: categoryCounts = [] } = useQuery({
    queryKey: ["events-category-counts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("category")
        .eq("status", "published")
        .gte("start_date", new Date().toISOString());
      
      const counts: Record<string, number> = {};
      (data || []).forEach(e => {
        counts[e.category] = (counts[e.category] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    },
  });

  const quickFilters = [
    { label: "Today", icon: Calendar, href: "/events/today", color: "bg-orange-100 text-orange-700" },
    { label: "This Week", icon: CalendarDays, href: "/events/this-week", color: "bg-blue-100 text-blue-700" },
    { label: "This Weekend", icon: Sparkles, href: "/events/this-weekend", color: "bg-purple-100 text-purple-700" },
    { label: "Free Events", icon: Ticket, href: "/events/free", color: "bg-green-100 text-green-700" },
    { label: "Workshops", icon: GraduationCap, href: "/events/workshops", color: "bg-pink-100 text-pink-700" },
  ];

  const categoryIcons: Record<string, typeof Music> = {
    music: Music, comedy: Laugh, concert: Music, theatre: Theater,
    food: Utensils, art: Palette, workshop: GraduationCap,
  };

  return (
    <AppLayout
      title="Events in Jaipur"
      subtitle="Concerts, Festivals & Things to Do"
      showBackButton={true}
      backPath="/"
      headerRightAction={
        <Link to="/events/create">
          <Button size="sm" className="gap-1">
            <Plus className="w-4 h-4" />
            Create
          </Button>
        </Link>
      }
    >
      <EventsListSEO events={events} />
      <PillarSchema 
        title={`Events in Jaipur ${currentYear}`}
        description={`Discover concerts, festivals, exhibitions and things to do in Jaipur in ${currentMonth} ${currentYear}. Find upcoming events in the Pink City.`}
        items={events.map(e => ({ url: `https://www.jaipurcircle.com/events/${e.slug}`, name: e.title }))}
      />

      <main className="px-4 py-6 space-y-8" role="main">
        {/* SEO H1 - Entity-rich, year-optimized */}
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            Events in Jaipur {currentYear} — Concerts, Shows, Festivals & Things to Do
          </h1>
          
          {/* Crawlable intro paragraph for snippet optimization */}
          <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
            Discover the best events happening in Jaipur in {currentMonth} {currentYear}. 
            Browse {events.length}+ upcoming concerts, comedy shows, art exhibitions, food festivals, 
            workshops, and cultural events across the Pink City. Find events by date, locality, venue, 
            or category — with verified timings, ticket prices, and booking info. Updated daily on JaipurCircle.
          </p>

          {/* Event count badge for freshness signal */}
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="text-xs">
              {events.length} upcoming events
            </Badge>
            <Badge variant="outline" className="text-xs">
              Updated {format(new Date(), 'MMM d, yyyy')}
            </Badge>
          </div>
        </header>

        {/* Quick Time Filters */}
        <section aria-labelledby="quick-filters-heading">
          <h2 id="quick-filters-heading" className="text-lg font-bold mb-3">Browse Events</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickFilters.map((filter) => (
              <Link key={filter.href} to={filter.href}>
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all hover:scale-105 ${filter.color}`}>
                  <filter.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{filter.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Events */}
        <section aria-labelledby="featured-events-heading">
          <h2 id="featured-events-heading" className="sr-only">Featured Events</h2>
          <FeaturedEvents />
        </section>

        {/* Events by Category - Hub Links for topical authority */}
        {categoryCounts.length > 0 && (
          <section aria-labelledby="category-hub-heading">
            <h2 id="category-hub-heading" className="text-lg font-bold mb-3">
              Events by Category in Jaipur
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Explore Jaipur's event scene by type — from live music and standup comedy to art exhibitions and food festivals.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {categoryCounts.map((cat) => {
                const slug = cat.name.toLowerCase().replace(/\s+/g, '-');
                const IconComp = categoryIcons[slug] || Sparkles;
                return (
                  <Link 
                    key={cat.name} 
                    to={`/events/category/${slug}`}
                    className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <IconComp className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm capitalize">{cat.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                      {cat.count} upcoming event{cat.count !== 1 ? 's' : ''}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Events by Locality */}
        {localities.length > 0 && (
          <section aria-labelledby="locality-events-heading">
            <h2 id="locality-events-heading" className="text-lg font-bold mb-3">
              Events by Locality in Jaipur
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Find events happening near you — browse by neighbourhood across Jaipur.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {localities.map((loc) => (
                <Link 
                  key={loc.slug} 
                  to={`/events/in/${loc.slug}`}
                  className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">{loc.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                    Events nearby
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
        
        {/* All Upcoming Events */}
        <section aria-labelledby="upcoming-events-heading">
          <h2 id="upcoming-events-heading" className="text-lg font-bold mb-4">
            All Upcoming Events in Jaipur
          </h2>
          <EventsFeed />
        </section>

        {/* Bottom SEO Content Block - Crawlable long-tail targeting */}
        <section className="mt-8 pt-6 border-t border-border space-y-4" aria-label="About Events in Jaipur">
          <h2 className="text-lg font-bold">About Events in Jaipur {currentYear}</h2>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Jaipur, the Pink City of Rajasthan, hosts hundreds of events every month — from international 
              music concerts and comedy specials by top Indian comedians to heritage walks, art exhibitions, 
              food festivals, and cultural performances. JaipurCircle is Jaipur's most comprehensive events 
              discovery platform, featuring verified listings with complete details on venue, timing, ticket 
              pricing, and booking links.
            </p>
            <p>
              Whether you're looking for <Link to="/events/free" className="text-primary hover:underline">free events in Jaipur</Link>, 
              {" "}<Link to="/events/this-weekend" className="text-primary hover:underline">weekend plans</Link>, 
              {" "}<Link to="/events/workshops" className="text-primary hover:underline">workshops and classes</Link>, 
              or premium concerts and shows — find it all here with real-time availability and easy booking. 
              Events are organized by date, locality, venue, and category to help you discover exactly what's 
              happening near you in Jaipur.
            </p>
            <p>
              Popular event venues in Jaipur include Birla Auditorium, Jawahar Kala Kendra, 
              Albert Hall Museum, Hawa Mahal, and numerous boutique venues across Malviya Nagar, 
              C-Scheme, Vaishali Nagar, and Tonk Road. 
              <Link to="/events/today" className="text-primary hover:underline"> Check what's happening today →</Link>
            </p>
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default EventsPage;
