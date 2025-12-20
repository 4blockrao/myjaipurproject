import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import NativeBottomNav from "@/components/home/NativeBottomNav";
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
    <>
      <EventsListSEO events={events} />
      <PillarSchema 
        title="Events in Jaipur"
        description="Discover concerts, festivals, exhibitions and things to do in Jaipur. Find upcoming events in the Pink City."
        items={events.map(e => ({ url: `https://www.jaipurcircle.com/events/${e.slug}`, name: e.title }))}
      />

      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Events in Jaipur</h1>
                <p className="text-xs text-muted-foreground">Concerts, Festivals & Things to Do</p>
              </div>
            </div>
            <Link to="/events/create">
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" />
                Create
              </Button>
            </Link>
          </div>
        </header>

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

        <NativeBottomNav />
      </div>
    </>
  );
};

export default EventsPage;
