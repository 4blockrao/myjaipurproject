import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import EventCard from "./EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, Plus } from "lucide-react";

const EventHomeSection = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["home-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .gte("start_date", new Date().toISOString())
        .order("is_featured", { ascending: false })
        .order("start_date", { ascending: true })
        .limit(4);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Events in Jaipur</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/events/create">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <Plus className="w-3 h-3" />
              Create
            </Button>
          </Link>
          <Link to="/events">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>

      {events?.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-xl">
          <CalendarDays className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">No upcoming events</p>
          <Link to="/events/create">
            <Button size="sm" className="mt-3">
              Create Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {events?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
};

export default EventHomeSection;
