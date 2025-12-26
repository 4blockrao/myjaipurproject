import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Calendar, CalendarDays, Sparkles, Ticket, GraduationCap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import EventsFeed from "@/components/events/EventsFeed";
import FeaturedEvents from "@/components/events/FeaturedEvents";
import { EventsListSEO } from "@/components/events/EventSEO";
import { supabase } from "@/integrations/supabase/client";
import { PillarSchema } from "@/components/seo/SchemaInjector";

const EventsPage = () => {
  // Fetch events for SEO structured data
  const { data: events = [] } = useQuery({
    queryKey: ["events-seo"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, slug, start_date, cover_image, is_free, ticket_price")
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
        .limit(8);
      return data || [];
    },
  });

  const quickFilters = [
    { label: "Today", icon: Calendar, href: "/events/today", color: "bg-orange-100 text-orange-700" },
    { label: "This Week", icon: CalendarDays, href: "/events/this-week", color: "bg-blue-100 text-blue-700" },
    { label: "This Weekend", icon: Sparkles, href: "/events/this-weekend", color: "bg-purple-100 text-purple-700" },
    { label: "Free Events", icon: Ticket, href: "/events/free", color: "bg-green-100 text-green-700" },
    { label: "Workshops", icon: GraduationCap, href: "/events/workshops", color: "bg-pink-100 text-pink-700" },
  ];

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
        title="Events in Jaipur"
        description="Discover concerts, festivals, exhibitions and things to do in Jaipur. Find upcoming events in the Pink City."
        items={events.map(e => ({ url: `https://www.jaipurcircle.com/events/${e.slug}`, name: e.title }))}
      />

      <main className="px-4 py-6 space-y-8" role="main">
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

        {/* Events by Locality */}
        {localities.length > 0 && (
          <section aria-labelledby="locality-events-heading">
            <h2 id="locality-events-heading" className="text-lg font-bold mb-3">Events by Locality</h2>
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
                    Comedy • Music • Exhibitions
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
        
        {/* All Upcoming Events */}
        <section aria-labelledby="upcoming-events-heading">
          <h2 id="upcoming-events-heading" className="text-lg font-bold mb-4">All Upcoming Events</h2>
          <EventsFeed />
        </section>
      </main>
    </AppLayout>
  );
};

export default EventsPage;
