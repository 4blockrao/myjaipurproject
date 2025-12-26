import { Link } from "react-router-dom";
import { MapPin, Star, BadgePercent, Coins, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

interface DealCardHeritageProps {
  deal: Deal;
  variant?: "compact" | "featured";
}

const DealCardHeritage = ({ deal, variant = "compact" }: DealCardHeritageProps) => {
  const hasDiscount = deal.discount_percentage && deal.discount_percentage > 0;
  const merchantName = deal.merchants?.business_name || "Local Business";
  
  // Calculate days left
  const getDaysLeft = () => {
    if (!deal.end_date) return null;
    const end = new Date(deal.end_date);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return null;
    if (diff === 1) return "1 day left";
    if (diff <= 7) return `${diff} days left`;
    return null;
  };
  
  const daysLeft = getDaysLeft();

  if (variant === "featured") {
    return (
      <Link 
        to={`/deals/${deal.id}`}
        className="block w-[280px] flex-shrink-0 group"
      >
        <div className="card-heritage overflow-hidden">
          {/* Image */}
          <div className="relative h-36 bg-gradient-to-br from-muted to-muted/50">
            {deal.image_url ? (
              <img 
                src={deal.image_url} 
                alt={deal.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BadgePercent className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}
            
            {/* Discount badge */}
            {hasDiscount && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-primary text-primary-foreground font-bold px-2 py-0.5 text-xs">
                  {deal.discount_percentage}% OFF
                </Badge>
              </div>
            )}
            
            {/* Featured badge */}
            {deal.is_featured && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-jaipur-gold text-foreground font-medium px-2 py-0.5 text-xs">
                  ⭐ Featured
                </Badge>
              </div>
            )}
            
            {/* Time left */}
            {daysLeft && (
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="bg-foreground/80 text-background text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {daysLeft}
                </Badge>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {deal.title}
            </h3>
            
            <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{merchantName}</span>
              {deal.merchants?.average_rating && (
                <>
                  <span className="mx-1">•</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{deal.merchants.average_rating.toFixed(1)}</span>
                </>
              )}
            </div>
            
            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                {deal.discounted_price ? (
                  <>
                    <span className="text-lg font-bold text-primary">
                      ₹{deal.discounted_price.toLocaleString()}
                    </span>
                    {deal.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{deal.original_price.toLocaleString()}
                      </span>
                    )}
                  </>
                ) : deal.original_price ? (
                  <span className="text-lg font-bold text-foreground">
                    ₹{deal.original_price.toLocaleString()}
                  </span>
                ) : null}
              </div>
              
              {/* JaiCoin reward */}
              {deal.jaicoin_reward && deal.jaicoin_reward > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <Coins className="w-3 h-3 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    +{deal.jaicoin_reward}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Compact variant (horizontal card)
  return (
    <Link 
      to={`/deals/${deal.id}`}
      className="flex gap-3 p-3 bg-card rounded-2xl border border-border/50 group hover:shadow-md transition-all"
    >
      {/* Image */}
      <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
        {deal.image_url ? (
          <img 
            src={deal.image_url} 
            alt={deal.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BadgePercent className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}
        
        {hasDiscount && (
          <div className="absolute top-1 left-1">
            <Badge className="bg-primary text-primary-foreground font-bold px-1.5 py-0 text-[10px]">
              -{deal.discount_percentage}%
            </Badge>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h3 className="font-medium text-foreground line-clamp-2 text-sm group-hover:text-primary transition-colors">
            {deal.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {merchantName}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            {deal.discounted_price ? (
              <>
                <span className="font-bold text-primary">
                  ₹{deal.discounted_price.toLocaleString()}
                </span>
                {deal.original_price && (
                  <span className="text-xs text-muted-foreground line-through">
                    ₹{deal.original_price.toLocaleString()}
                  </span>
                )}
              </>
            ) : deal.original_price ? (
              <span className="font-bold text-foreground">
                ₹{deal.original_price.toLocaleString()}
              </span>
            ) : null}
          </div>
          
          {deal.jaicoin_reward && deal.jaicoin_reward > 0 && (
            <div className="flex items-center gap-0.5 text-amber-600">
              <Coins className="w-3 h-3" />
              <span className="text-[10px] font-medium">+{deal.jaicoin_reward}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default DealCardHeritage;
