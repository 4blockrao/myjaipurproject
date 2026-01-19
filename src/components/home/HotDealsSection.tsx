import { useNavigate } from "react-router-dom";
import { ChevronRight, Flame, Clock, TrendingUp } from "lucide-react";
import DealCardClean from "./DealCardClean";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface Deal {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  discount_percentage?: number;
  original_price?: number;
  discounted_price?: number;
  location?: string;
  category?: string;
  image_url?: string;
  is_featured?: boolean;
  end_date?: string;
  jaicoin_reward?: number;
  merchants?: {
    business_name: string;
    is_verified?: boolean;
    average_rating?: number;
  };
}

interface HotDealsSectionProps {
  deals: Deal[];
  isLoading?: boolean;
  title?: string;
  viewAllLink?: string;
}

const HotDealsSection = ({ 
  deals, 
  isLoading = false, 
  title = "Hot Deals",
  viewAllLink = '/deals'
}: HotDealsSectionProps) => {
  const displayDeals = deals.slice(0, 10);

  if (isLoading) {
    return (
      <section className="py-6">
        <div className="px-4 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <Skeleton className="w-32 h-7" />
          </div>
          <Skeleton className="w-16 h-5" />
        </div>
        <div className="px-4 flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-[280px] flex-shrink-0">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-28 rounded-b-2xl -mt-2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <section className="py-6">
        <div className="px-4 flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            {title}
          </h2>
        </div>
        <div className="px-4">
          <div className="bg-muted/50 rounded-2xl p-6 text-center">
            <TrendingUp className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No deals available right now.</p>
            <p className="text-muted-foreground text-xs mt-1">Check back soon for exciting offers!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6">
      {/* Section header */}
      <div className="px-4 flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          {title}
        </h2>
        <Link 
          to={viewAllLink}
          className="flex items-center gap-0.5 text-sm text-primary font-semibold hover:underline"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal scroll carousel */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2 snap-x snap-mandatory">
        {displayDeals.map((deal) => (
          <div key={deal.id} className="snap-start">
            <DealCardClean deal={deal} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default HotDealsSection;
