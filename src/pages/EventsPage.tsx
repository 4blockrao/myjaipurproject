import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import EventsFeed from "@/components/events/EventsFeed";
import FeaturedEvents from "@/components/events/FeaturedEvents";

const EventsPage = () => {
  return (
    <>
      <Helmet>
        <title>Events in Jaipur | Jaipur Circle - Discover Local Events</title>
        <meta
          name="description"
          content="Discover the best events happening in Jaipur. Music, arts, food festivals, cultural events, and more. Find and attend events near you."
        />
        <meta
          name="keywords"
          content="Jaipur events, events in Jaipur, concerts Jaipur, festivals Jaipur, cultural events, things to do in Jaipur"
        />
        <link rel="canonical" href="https://jaipurcircle.com/events" />
        <meta property="og:title" content="Events in Jaipur | Jaipur Circle" />
        <meta
          property="og:description"
          content="Discover the best events happening in Jaipur. Music, arts, food festivals, and more."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jaipurcircle.com/events" />
      </Helmet>

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
                <h1 className="text-xl font-bold">Events</h1>
                <p className="text-xs text-muted-foreground">Discover events in Jaipur</p>
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

        <main className="px-4 py-6 space-y-8">
          <FeaturedEvents />
          
          <section>
            <h2 className="text-lg font-bold mb-4">All Upcoming Events</h2>
            <EventsFeed />
          </section>
        </main>

        <NativeBottomNav />
      </div>
    </>
  );
};

export default EventsPage;
