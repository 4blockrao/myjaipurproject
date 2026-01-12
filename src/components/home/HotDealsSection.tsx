import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import DealCardClean from "./DealCardClean";
import { Skeleton } from "@/components/ui/skeleton";

interface Deal {
  id: string;
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
  const navigate = useNavigate();
  const displayDeals = deals.slice(0, 10);

  if (isLoading) {
    return (
      <section className="py-5">
        <div className="px-4 flex items-center justify-between mb-4">
          <Skeleton className="w-28 h-7" />
          <Skeleton className="w-10 h-5" />
        </div>
        
        <div className="px-4 flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-[280px] flex-shrink-0">
              <Skeleton className="h-36 rounded-t-2xl" />
              <div className="p-4 bg-card rounded-b-2xl border border-t-0 border-border/50">
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-3 w-2/3 mb-3" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <section className="py-5">
        <div className="px-4 flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </div>
        <div className="px-4">
          <p className="text-muted-foreground text-sm">No deals available right now. Check back soon!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5">
      {/* Section header */}
      <div className="px-4 flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <button 
          onClick={() => navigate(viewAllLink)}
          className="flex items-center gap-0.5 text-sm text-primary font-semibold"
        >
          All
          <ChevronRight className="w-4 h-4" />
        </button>
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
