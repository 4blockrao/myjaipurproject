import { Heart, Star, Diamond } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface DealCardCleanProps {
  deal: {
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
  };
}

const DealCardClean = ({ deal }: DealCardCleanProps) => {
  const navigate = useNavigate();
  
  // Placeholder image if none provided
  const imageUrl = deal.image_url || 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400&q=80';
  
  const discountPercent = deal.discount_percentage || 
    (deal.original_price && deal.discounted_price 
      ? Math.round((1 - deal.discounted_price / deal.original_price) * 100) 
      : 0);

  return (
    <article 
      className="w-[280px] flex-shrink-0 group cursor-pointer"
      onClick={() => navigate(`/deal/${deal.id}`)}
    >
      {/* Image container */}
      <div className="relative h-36 rounded-t-2xl overflow-hidden">
        <img 
          src={imageUrl} 
          alt={deal.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Discount badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-primary-foreground font-bold text-sm px-3 py-1 rounded-lg shadow-lg">
              {discountPercent}% OFF
            </Badge>
          </div>
        )}
        
        {/* Featured badge */}
        {deal.is_featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 font-semibold text-xs px-2.5 py-1 rounded-lg shadow-lg border-0">
              <Diamond className="w-3 h-3 mr-1 inline" />
              Featured
            </Badge>
          </div>
        )}
        
        {/* Wishlist heart */}
        <button 
          className="absolute bottom-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Add to wishlist
          }}
          aria-label="Add to wishlist"
        >
          <Heart className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 bg-card rounded-b-2xl border border-t-0 border-border/50">
        {/* Title and likes */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight flex-1">
            {deal.title}
          </h3>
          <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
            <Heart className="w-3.5 h-3.5" />
            <span className="text-xs">0</span>
          </div>
        </div>
        
        {/* Merchant and rating */}
        {deal.merchants && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span className="truncate">{deal.merchants.business_name}</span>
            {deal.merchants.average_rating && (
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{deal.merchants.average_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Price and JaiCoins */}
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            {deal.discounted_price && (
              <span className="text-lg font-bold text-foreground">
                ₹{deal.discounted_price.toLocaleString()}
              </span>
            )}
            {deal.original_price && deal.discounted_price && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{deal.original_price.toLocaleString()}
              </span>
            )}
          </div>
          
          {deal.jaicoin_reward && deal.jaicoin_reward > 0 && (
            <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
              +{deal.jaicoin_reward} 🪙
            </Badge>
          )}
        </div>
      </div>
    </article>
  );
};

export default DealCardClean;
