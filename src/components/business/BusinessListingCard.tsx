import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Navigation,
  MessageCircle,
  CheckCircle2,
  UserCheck,
  Clock,
  Star,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BusinessListingCardProps {
  id: string;
  businessName: string;
  businessType?: string;
  locality?: string;
  nearbyArea?: string;
  address?: string;
  description?: string;
  phone?: string;
  isVerified?: boolean;
  isOwnerClaimed?: boolean;
  isLocalityVerified?: boolean;
  averageRating?: number;
  totalReviews?: number;
  updatedAt?: string;
  logoUrl?: string;
  tags?: string[];
}

/**
 * Business Listing Card v2
 * Trust-focused with locality context, recency signals, action bar
 */
export function BusinessListingCard({
  id,
  businessName,
  businessType,
  locality,
  nearbyArea,
  address,
  description,
  phone,
  isVerified = false,
  isOwnerClaimed = false,
  isLocalityVerified = false,
  averageRating,
  totalReviews,
  updatedAt,
  logoUrl,
  tags,
}: BusinessListingCardProps) {
  // Calculate recency
  const getRecencyLabel = () => {
    if (!updatedAt) return null;
    const date = new Date(updatedAt);
    const daysAgo = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysAgo <= 7) {
      return {
        label: `Updated ${formatDistanceToNow(date, { addSuffix: true })}`,
        isRecent: true,
      };
    }
    return null;
  };

  const recency = getRecencyLabel();

  return (
    <Card className="hover:shadow-md transition-all border-border/50">
      <CardContent className="p-4">
        {/* Header: Business Name + Trust Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Logo */}
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={businessName}
                className="w-12 h-12 rounded-lg object-cover bg-muted shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-lg">
                  {businessName.charAt(0)}
                </span>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <Link
                to={`/merchant/${id}`}
                className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
              >
                {businessName}
              </Link>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {isVerified && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-1.5 py-0 h-5 gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    Verified
                  </Badge>
                )}
                {isOwnerClaimed && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-1.5 py-0 h-5 gap-1"
                  >
                    <UserCheck className="w-3 h-3 text-blue-600" />
                    Claimed
                  </Badge>
                )}
                {isLocalityVerified && (
                  <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0 h-5 gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Locality Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Rating */}
          {averageRating && averageRating > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium text-foreground">
                {averageRating.toFixed(1)}
              </span>
              {totalReviews && (
                <span className="text-xs text-muted-foreground">
                  ({totalReviews})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Context Row: Locality + Type */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
          {(locality || nearbyArea) && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {locality}
              {nearbyArea && (
                <span className="text-muted-foreground/70">
                  • Near {nearbyArea}
                </span>
              )}
            </span>
          )}
          {businessType && (
            <span className="flex items-center gap-1">
              <span className="text-muted-foreground/50">|</span>
              {businessType}
            </span>
          )}
        </div>

        {/* USP / Description Line */}
        {description && (
          <p className="text-sm text-foreground/80 line-clamp-2 mb-3">
            {description}
          </p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-2 py-0.5 bg-muted/30"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Recency Signal */}
        {recency && (
          <div className="flex items-center gap-1.5 mb-3">
            <div
              className={`w-2 h-2 rounded-full ${recency.isRecent ? "bg-green-500" : "bg-muted-foreground"}`}
            />
            <span className="text-xs text-muted-foreground">
              {recency.label}
            </span>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          {phone && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9"
              asChild
            >
              <a href={`tel:${phone}`}>
                <Phone className="w-4 h-4 mr-1.5" />
                Call
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" className="flex-1 h-9" asChild>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(address || businessName)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="w-4 h-4 mr-1.5" />
              Directions
            </a>
          </Button>
          {phone && (
            <Button variant="outline" size="sm" className="flex-1 h-9" asChild>
              <a
                href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4 mr-1.5" />
                WhatsApp
              </a>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-9 px-2" asChild>
            <Link to={`/merchant/${id}`}>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact variant for grid layouts
 */
export function BusinessCardCompact({
  id,
  businessName,
  businessType,
  locality,
  isVerified,
  averageRating,
  logoUrl,
}: Pick<
  BusinessListingCardProps,
  | "id"
  | "businessName"
  | "businessType"
  | "locality"
  | "isVerified"
  | "averageRating"
  | "logoUrl"
>) {
  return (
    <Link to={`/merchant/${id}`}>
      <Card className="hover:shadow-md hover:border-primary/30 transition-all h-full">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={businessName}
                className="w-10 h-10 rounded-lg object-cover bg-muted shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">
                  {businessName.charAt(0)}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-foreground line-clamp-1">
                {businessName}
              </h4>
              {businessType && (
                <p className="text-xs text-muted-foreground">{businessType}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                {isVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                )}
                {averageRating && averageRating > 0 && (
                  <span className="flex items-center gap-0.5 text-xs">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    {averageRating.toFixed(1)}
                  </span>
                )}
                {locality && (
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    {locality}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
