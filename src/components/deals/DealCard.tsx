import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Heart, MapPin, Star, BadgeCheck, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProductPlaceholder } from "@/utils/placeholderImages";
import CountdownTimer from "./CountdownTimer";
import SocialProofCounter from "./SocialProofCounter";
import ProgressBar from "./ProgressBar";

export interface DealCardData {
  id: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  category?: string | null;
  location?: string | null;
  image_url?: string | null;
  discount_percentage?: number | null;
  original_price?: number | null;
  discounted_price?: number | null;
  end_date?: string | null;
  is_featured?: boolean | null;
  inventory_count?: number | null;
  max_redemptions?: number | null;
  current_redemptions?: number | null;
  merchants?: {
    business_name?: string | null;
    is_verified?: boolean | null;
    average_rating?: number | null;
  } | null;
}

interface DealCardProps {
  deal: DealCardData;
  variant?: "grid" | "carousel";
  onSave?: (id: string) => void;
  className?: string;
}

export const DealCard = ({ deal, variant = "grid", onSave, className }: DealCardProps) => {
  const href = deal.slug ? `/deals/${deal.slug}` : `/deal/${deal.id}`;
  const image = deal.image_url || getProductPlaceholder(deal.category || undefined);

  const discount =
    deal.discount_percentage ||
    (deal.original_price && deal.discounted_price
      ? Math.round((1 - deal.discounted_price / deal.original_price) * 100)
      : 0);

  const savings =
    deal.original_price && deal.discounted_price
      ? deal.original_price - deal.discounted_price
      : 0;

  // Stock + remaining
  const total = deal.max_redemptions || deal.inventory_count || 0;
  const sold = deal.current_redemptions || 0;
  const remaining = total > 0 ? Math.max(0, total - sold) : null;
  const lowStock = remaining !== null && remaining < 20 && remaining > 0;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5",
        variant === "carousel" ? "w-[280px] flex-shrink-0" : "w-full",
        className
      )}
    >
      <Link to={href} className="block">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={image}
            alt={deal.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getProductPlaceholder(deal.category || undefined);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Discount ribbon */}
          {discount > 0 && (
            <div className="absolute left-0 top-3 rounded-r-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-lg">
              {discount}% OFF
            </div>
          )}

          {/* Featured */}
          {deal.is_featured && (
            <Badge className="absolute right-3 top-3 gap-1 border-0 bg-amber-500 text-white shadow">
              <Flame className="h-3 w-3" />
              Hot
            </Badge>
          )}

          {/* Save heart */}
          {onSave && (
            <button
              type="button"
              aria-label="Save deal"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSave(deal.id);
              }}
              className="absolute bottom-3 right-3 rounded-full bg-background/95 p-2 shadow-md backdrop-blur transition hover:scale-110"
            >
              <Heart className="h-4 w-4 text-foreground" />
            </button>
          )}

          {/* Countdown overlay (only when urgent) */}
          {deal.end_date && (
            <div className="absolute bottom-3 left-3">
              <CountdownTimer endDate={deal.end_date} variant="compact" urgentOnly />
            </div>
          )}

          {/* Location chip */}
          {deal.location && (
            <div className="absolute left-3 top-12 inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
              <MapPin className="h-3 w-3" />
              <span className="max-w-[120px] truncate">{deal.location}</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="space-y-2 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {deal.title}
          </h3>

          {deal.merchants?.business_name && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="truncate">{deal.merchants.business_name}</span>
              {deal.merchants.is_verified && (
                <BadgeCheck className="h-3 w-3 flex-shrink-0 text-primary" />
              )}
              {deal.merchants.average_rating ? (
                <span className="ml-auto inline-flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">
                    {deal.merchants.average_rating.toFixed(1)}
                  </span>
                </span>
              ) : null}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            {deal.discounted_price != null && (
              <span className="text-lg font-bold text-primary">
                ₹{deal.discounted_price.toLocaleString("en-IN")}
              </span>
            )}
            {deal.original_price != null &&
              deal.discounted_price != null &&
              deal.original_price > deal.discounted_price && (
                <span className="text-xs text-muted-foreground line-through">
                  ₹{deal.original_price.toLocaleString("en-IN")}
                </span>
              )}
            {savings > 0 && (
              <span className="ml-auto text-[11px] font-semibold text-green-600">
                Save ₹{savings.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Stock */}
          {total > 0 && remaining !== null && (
            <ProgressBar sold={sold} total={total} hideLabel={!lowStock} />
          )}
          {lowStock && (
            <p className="text-[11px] font-semibold text-destructive">
              ⚡ Only {remaining} left!
            </p>
          )}

          {/* Social proof */}
          <SocialProofCounter dealId={deal.id} variant="inline" />
        </div>
      </Link>
    </Card>
  );
};

export default DealCard;