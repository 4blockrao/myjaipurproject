import { useNavigate } from "react-router-dom";
import { ChevronRight, Flame, Sparkles, TrendingUp, Zap } from "lucide-react";
import DealCardHeritage from "./DealCardHeritage";
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

interface DealsCarouselProps {
  deals: Deal[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  icon?: 'flame' | 'sparkles' | 'trending' | 'zap';
  maxDeals?: number;
  viewAllLink?: string;
}

const iconMap = {
  flame: Flame,
  sparkles: Sparkles,
  trending: TrendingUp,
  zap: Zap,
};

const DealsCarousel = ({ 
  deals, 
  isLoading = false, 
  title = "Today's Deals",
  subtitle,
  icon = 'flame',
  maxDeals = 8,
  viewAllLink = '/deals'
}: DealsCarouselProps) => {
  const navigate = useNavigate();
  const IconComponent = iconMap[icon];
  const displayDeals = deals.slice(0, maxDeals);

  if (isLoading) {
    return (
      <section className="py-6">
        <div className="px-4 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="w-32 h-6" />
          </div>
          <Skeleton className="w-16 h-4" />
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
    return null;
  }

  return (
    <section className="py-6">
      {/* Section header */}
      <div className="px-4 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <IconComponent className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        <button 
          onClick={() => navigate(viewAllLink)}
          className="flex items-center gap-1 text-sm text-primary font-medium"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal scroll carousel */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2 -mx-4 snap-x snap-mandatory">
        <div className="pl-4" /> {/* Left padding spacer */}
        {displayDeals.map((deal) => (
          <div key={deal.id} className="snap-start">
            <DealCardHeritage deal={deal} variant="featured" />
          </div>
        ))}
        <div className="pr-4" /> {/* Right padding spacer */}
      </div>
    </section>
  );
};

export default DealsCarousel;
