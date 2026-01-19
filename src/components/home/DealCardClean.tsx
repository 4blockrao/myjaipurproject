import { Heart, Star, Diamond, Clock, MapPin, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { getPlaceholderImage } from "@/utils/placeholderImages";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface DealCardCleanProps {
  deal: {
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
  };
  variant?: 'default' | 'compact';
}

const DealCardClean = ({ deal, variant = 'default' }: DealCardCleanProps) => {
  const navigate = useNavigate();
  
  // Use category-based placeholder if no image
  const imageUrl = deal.image_url || getPlaceholderImage(deal.category);
  
  const discountPercent = deal.discount_percentage || 
    (deal.original_price && deal.discounted_price 
      ? Math.round((1 - deal.discounted_price / deal.original_price) * 100) 
      : 0);

  const handleClick = () => {
    const dealPath = deal.slug ? `/deals/${deal.slug}` : `/deal/${deal.id}`;
    navigate(dealPath);
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!deal.end_date) return null;
    const endDate = new Date(deal.end_date);
    const now = new Date();
    if (endDate <= now) return 'Expired';
    return formatDistanceToNow(endDate, { addSuffix: false }) + ' left';
  };

  const timeRemaining = getTimeRemaining();

  return (
    <article 
      className={cn(
        "flex-shrink-0 group cursor-pointer transition-all duration-300",
        variant === 'default' ? "w-[280px]" : "w-[220px]"
      )}
      onClick={handleClick}
    >
      {/* Image container with premium styling */}
      <div className="relative rounded-2xl overflow-hidden bg-muted">
        <div className={cn(
          "relative overflow-hidden",
          variant === 'default' ? "h-40" : "h-32"
        )}>
          <img 
            src={imageUrl} 
            alt={deal.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
          
          {/* Top Badges Row */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            {/* Discount badge */}
            {discountPercent > 0 && (
              <Badge className="bg-primary text-primary-foreground font-bold text-sm px-3 py-1.5 rounded-xl shadow-lg border-0">
                {discountPercent}% OFF
              </Badge>
            )}
            
            {/* Featured badge */}
            {deal.is_featured && (
              <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 font-semibold text-xs px-2.5 py-1.5 rounded-xl shadow-lg border-0 ml-auto">
                <Diamond className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
          
          {/* Bottom info overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            {/* Location */}
            {deal.location && (
              <div className="flex items-center gap-1 text-white/90 text-xs bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{deal.location}</span>
              </div>
            )}
            
            {/* Wishlist heart */}
            <button 
              className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Add to wishlist
              }}
              aria-label="Add to wishlist"
            >
              <Heart className="w-4 h-4 text-gray-600 hover:text-rose-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 bg-card rounded-b-2xl border border-t-0 border-border/50 -mt-2 pt-5 relative">
        {/* Title */}
        <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
          {deal.title}
        </h3>
        
        {/* Merchant and rating */}
        {deal.merchants && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <span className="truncate font-medium">{deal.merchants.business_name}</span>
            {deal.merchants.average_rating && (
              <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-md">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-medium text-amber-700 dark:text-amber-400">
                  {deal.merchants.average_rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Price row */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              {deal.discounted_price ? (
                <span className="text-xl font-bold text-foreground">
                  ₹{deal.discounted_price.toLocaleString()}
                </span>
              ) : null}
              {deal.original_price && deal.discounted_price && deal.original_price > deal.discounted_price && (
                <span className="text-xs text-muted-foreground line-through">
                  ₹{deal.original_price.toLocaleString()}
                </span>
              )}
            </div>
            {/* Time remaining */}
            {timeRemaining && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="w-3 h-3" />
                <span>{timeRemaining}</span>
              </div>
            )}
          </div>
          
          {/* JaiCoin reward */}
          {deal.jaicoin_reward && deal.jaicoin_reward > 0 && (
            <Badge 
              variant="secondary" 
              className="text-xs bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              +{deal.jaicoin_reward}
            </Badge>
          )}
        </div>
      </div>
    </article>
  );
};

export default DealCardClean;
