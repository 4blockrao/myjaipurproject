import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
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
        <section aria-labelledby="featured-events-heading">
          <h2 id="featured-events-heading" className="sr-only">Featured Events</h2>
          <FeaturedEvents />
        </section>
        
        <section aria-labelledby="upcoming-events-heading">
          <h2 id="upcoming-events-heading" className="text-lg font-bold mb-4">All Upcoming Events</h2>
          <EventsFeed />
        </section>
      </main>
    </AppLayout>
  );
};

export default EventsPage;
