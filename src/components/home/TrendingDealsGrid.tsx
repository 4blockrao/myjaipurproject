import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Flame, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import DealCard, { type DealCardData } from "@/components/deals/DealCard";

const TrendingDealsGrid = () => {
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["trending-deals-grid-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select(
          `id, slug, title, description, category, discount_percentage,
           original_price, discounted_price, location, image_url, end_date,
           is_featured, inventory_count, max_redemptions, current_redemptions,
           merchants (business_name, is_verified, average_rating)`
        )
        .eq("status", "published")
        .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
        .order("discount_percentage", { ascending: false, nullsFirst: false })
        .limit(6);
      if (error) throw error;
      return (data as unknown as DealCardData[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!isLoading && deals.length === 0) return null;

  return (
    <section className="px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Flame className="h-5 w-5 animate-pulse text-orange-500" />
          🔥 Trending Deals in Jaipur
        </h2>
        <Link
          to="/deals"
          className="flex items-center gap-0.5 text-sm font-semibold text-primary hover:underline"
        >
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </section>
  );
};

export default TrendingDealsGrid;