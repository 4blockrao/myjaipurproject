import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import EventCard from "./EventCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  { value: "all", label: "All Events" },
  { value: "music", label: "Music" },
  { value: "arts", label: "Arts & Culture" },
  { value: "food", label: "Food & Drinks" },
  { value: "sports", label: "Sports" },
  { value: "business", label: "Business" },
  { value: "community", label: "Community" },
  { value: "education", label: "Education" },
  { value: "festivals", label: "Festivals" },
];

interface EventsFeedProps {
  showFilters?: boolean;
  limit?: number;
  featured?: boolean;
}

const EventsFeed = ({ showFilters = true, limit, featured }: EventsFeedProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", selectedCategory, featured, limit],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      if (featured) {
        query = query.eq("is_featured", true);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredEvents = events?.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showFilters && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[16/10] rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
                className="whitespace-nowrap rounded-full"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {filteredEvents?.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg mb-1">No events found</h3>
          <p className="text-muted-foreground text-sm">
            Check back later for upcoming events in Jaipur
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsFeed;
