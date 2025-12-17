import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import EventCard from "./EventCard";
import EventFilters, { EventFiltersState } from "./EventFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";

interface EventsFeedProps {
  showFilters?: boolean;
  limit?: number;
  featured?: boolean;
}

const EventsFeed = ({ showFilters = true, limit, featured }: EventsFeedProps) => {
  const [filters, setFilters] = useState<EventFiltersState>({
    search: "",
    category: "all",
    locality: "All Localities",
    dateFrom: undefined,
    dateTo: undefined,
    priceRange: [0, 5000],
    freeOnly: false,
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", filters, featured, limit],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true });

      if (filters.category !== "all") {
        query = query.eq("category", filters.category);
      }
      if (filters.locality !== "All Localities") {
        query = query.eq("locality", filters.locality);
      }
      if (filters.dateFrom) {
        query = query.gte("start_date", filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        query = query.lte("start_date", filters.dateTo.toISOString());
      }
      if (filters.freeOnly) {
        query = query.eq("is_free", true);
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

  // Client-side filtering for search and price
  const filteredEvents = events?.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(filters.search.toLowerCase());
    const matchesPrice = filters.freeOnly
      ? event.is_free
      : event.is_free || (event.ticket_price >= filters.priceRange[0] && event.ticket_price <= filters.priceRange[1]);
    return matchesSearch && matchesPrice;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showFilters && <Skeleton className="h-40 w-full" />}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-[16/10] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && <EventFilters filters={filters} onFiltersChange={setFilters} />}

      {filteredEvents?.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg mb-1">No events found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
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
