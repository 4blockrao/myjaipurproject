import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import EventCard from "./EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

const UpcomingEvents = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(4);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!events?.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Upcoming Events</h2>
        </div>
        <Link to="/events">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            See All <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
      <div className="space-y-2">
        {events.map((event) => (
          <EventCard key={event.id} event={event} variant="compact" />
        ))}
      </div>
    </section>
  );
};

export default UpcomingEvents;
