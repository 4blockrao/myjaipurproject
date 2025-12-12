import { useNavigate } from "react-router-dom";
import { ChevronRight, Flame, Sparkles, TrendingUp } from "lucide-react";
import NativeDealCard from "./NativeDealCard";
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

interface NativeDealsSectionProps {
  deals: Deal[];
  isLoading?: boolean;
  title?: string;
  icon?: 'flame' | 'sparkles' | 'trending';
  variant?: 'horizontal-scroll' | 'vertical-list';
  showViewAll?: boolean;
  maxDeals?: number;
}

const NativeDealsSection = ({ 
  deals, 
  isLoading = false, 
  title = "Today's Deals",
  icon = 'flame',
  variant = 'horizontal-scroll',
  showViewAll = true,
  maxDeals = 6
}: NativeDealsSectionProps) => {
  const navigate = useNavigate();

  const IconComponent = icon === 'flame' ? Flame : icon === 'sparkles' ? Sparkles : TrendingUp;
  const displayDeals = deals.slice(0, maxDeals);

  if (isLoading) {
    return (
      <div className="py-5 bg-background">
        <div className="px-4 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="w-32 h-5" />
          </div>
          <Skeleton className="w-16 h-4" />
        </div>
        
        {variant === 'horizontal-scroll' ? (
          <div className="px-4 flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-44 flex-shrink-0">
                <Skeleton className="h-28 rounded-t-2xl" />
                <div className="p-3 bg-card rounded-b-2xl">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3 mb-2" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 p-3 bg-card rounded-2xl">
                <Skeleton className="w-24 h-24 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3 mb-2" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <div className="py-8 px-4 text-center bg-background">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <IconComponent className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No deals available right now</p>
        <button 
          onClick={() => navigate('/deals')}
          className="text-primary font-medium mt-2"
        >
          Explore Categories
        </button>
      </div>
    );
  }

  return (
    <div className="py-5 bg-background">
      <div className="px-4 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IconComponent className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>
        {showViewAll && (
          <button 
            onClick={() => navigate('/deals')}
            className="flex items-center gap-1 text-sm text-primary font-medium"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {variant === 'horizontal-scroll' ? (
        <div className="px-4 flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {displayDeals.map((deal) => (
            <NativeDealCard key={deal.id} deal={deal} variant="vertical" />
          ))}
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {displayDeals.map((deal) => (
            <NativeDealCard key={deal.id} deal={deal} variant="horizontal" />
          ))}
        </div>
      )}
    </div>
  );
};

export default NativeDealsSection;
