import { MapPin, Clock, Coins, Star, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

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

interface NativeDealCardProps {
  deal: Deal;
  variant?: 'horizontal' | 'vertical' | 'compact';
}

const NativeDealCard = ({ deal, variant = 'horizontal' }: NativeDealCardProps) => {
  const navigate = useNavigate();

  const formatTimeRemaining = (endDate?: string) => {
    if (!endDate) return null;
    
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours <= 0) return "Expired";
    if (diffHours < 24) return `${diffHours}h left`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d left`;
  };

  const getCategoryEmoji = (category?: string) => {
    const emojis: Record<string, string> = {
      'Food & Dining': '🍽️',
      'Beauty & Wellness': '💆‍♀️',
      'Shopping': '🛍️',
      'Electronics': '📱',
      'Health & Fitness': '💪',
      'Automotive': '🚗',
      'Services': '📷',
      'Travel': '✈️',
      'Education': '🎓',
    };
    return emojis[category || ''] || '✨';
  };

  const timeRemaining = formatTimeRemaining(deal.end_date);

  if (variant === 'compact') {
    return (
      <button
        onClick={() => navigate(`/deal/${deal.id}`)}
        className="flex items-center gap-3 p-3 bg-card rounded-xl hover:bg-accent transition-all active:scale-[0.98] w-full text-left"
      >
        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          {deal.image_url ? (
            <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{getCategoryEmoji(deal.category)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm line-clamp-1">{deal.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {deal.merchants?.business_name || deal.location || 'Jaipur'}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-primary text-sm">₹{deal.discounted_price?.toLocaleString()}</p>
          {deal.discount_percentage && deal.discount_percentage > 0 && (
            <span className="text-[10px] text-green-600 font-medium">{deal.discount_percentage}% OFF</span>
          )}
        </div>
      </button>
    );
  }

  if (variant === 'vertical') {
    return (
      <button
        onClick={() => navigate(`/deal/${deal.id}`)}
        className="flex flex-col bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.98] w-44 flex-shrink-0"
      >
        <div className="relative h-28 bg-muted">
          {deal.image_url ? (
            <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-3xl">{getCategoryEmoji(deal.category)}</span>
            </div>
          )}
          
          {deal.discount_percentage && deal.discount_percentage > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5">
              {deal.discount_percentage}% OFF
            </Badge>
          )}
          
          {deal.is_featured && (
            <Badge className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5">
              ⭐
            </Badge>
          )}
        </div>
        
        <div className="p-3 text-left">
          <p className="font-semibold text-foreground text-sm line-clamp-2 leading-tight mb-1">
            {deal.title}
          </p>
          
          <div className="flex items-center gap-1 text-muted-foreground mb-2">
            <MapPin className="w-3 h-3" />
            <span className="text-[11px] truncate">{deal.location || 'Jaipur'}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-primary text-base">
                ₹{deal.discounted_price?.toLocaleString()}
              </span>
              {deal.original_price && deal.original_price > (deal.discounted_price || 0) && (
                <span className="text-xs text-muted-foreground line-through ml-1">
                  ₹{deal.original_price?.toLocaleString()}
                </span>
              )}
            </div>
            {deal.jaicoin_reward && deal.jaicoin_reward > 0 && (
              <div className="flex items-center gap-0.5 text-yellow-600">
                <Coins className="w-3 h-3" />
                <span className="text-[10px] font-medium">+{deal.jaicoin_reward}</span>
              </div>
            )}
          </div>
        </div>
      </button>
    );
  }

  // Horizontal (default)
  return (
    <button
      onClick={() => navigate(`/deal/${deal.id}`)}
      className="flex gap-3 p-3 bg-card rounded-2xl hover:bg-accent transition-all active:scale-[0.98] w-full text-left shadow-sm"
    >
      <div className="relative w-24 h-24 rounded-xl bg-muted flex-shrink-0 overflow-hidden">
        {deal.image_url ? (
          <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-3xl">{getCategoryEmoji(deal.category)}</span>
          </div>
        )}
        
        {deal.discount_percentage && deal.discount_percentage > 0 && (
          <Badge className="absolute top-1 left-1 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5">
            {deal.discount_percentage}%
          </Badge>
        )}
      </div>
      
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-foreground text-sm line-clamp-2 leading-tight">
            {deal.title}
          </p>
          {deal.is_featured && (
            <Badge className="bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 flex-shrink-0">
              ⭐
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1.5 text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="text-xs truncate">{deal.location || 'Jaipur'}</span>
          </div>
          {timeRemaining && (
            <div className="flex items-center gap-1 text-orange-600">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{timeRemaining}</span>
            </div>
          )}
        </div>
        
        {deal.merchants?.business_name && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-muted-foreground">{deal.merchants.business_name}</span>
            {deal.merchants.is_verified && (
              <span className="text-[10px] text-blue-600">✓</span>
            )}
            {deal.merchants.average_rating && (
              <div className="flex items-center gap-0.5 ml-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs">{deal.merchants.average_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-primary text-lg">
              ₹{deal.discounted_price?.toLocaleString()}
            </span>
            {deal.original_price && deal.original_price > (deal.discounted_price || 0) && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{deal.original_price?.toLocaleString()}
              </span>
            )}
          </div>
          {deal.jaicoin_reward && deal.jaicoin_reward > 0 && (
            <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
              <Coins className="w-3 h-3" />
              <span className="text-[11px] font-medium">+{deal.jaicoin_reward}</span>
            </div>
          )}
        </div>
      </div>
      
      <ChevronRight className="w-5 h-5 text-muted-foreground self-center flex-shrink-0" />
    </button>
  );
};

export default NativeDealCard;
