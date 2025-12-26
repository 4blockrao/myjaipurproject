import { Link } from "react-router-dom";
import { MapPin, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface NearbyLocality {
  name: string;
  slug: string;
  description?: string;
}

interface NearbyLocalityBlockProps {
  localities: NearbyLocality[];
  variant?: "compact" | "expanded";
  title?: string;
  subtitle?: string;
  basePath?: string; // e.g., "/jaipur" or "/jaipur/vaishali-nagar"
  categorySlug?: string; // If provided, links to category within locality
  isLoading?: boolean;
  maxItems?: number;
}

/**
 * Reusable Nearby Locality Block
 * - Compact: Badge chips for quick navigation
 * - Expanded: Cards with optional descriptions
 */
export function NearbyLocalityBlock({
  localities,
  variant = "compact",
  title = "Nearby Areas",
  subtitle,
  basePath = "/jaipur",
  categorySlug,
  isLoading = false,
  maxItems = 5,
}: NearbyLocalityBlockProps) {
  if (isLoading) {
    return (
      <section className="mb-6">
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </section>
    );
  }

  if (!localities.length) return null;

  const displayLocalities = localities.slice(0, maxItems);

  // Build URL based on whether we're linking to category or locality
  const getUrl = (slug: string) => {
    if (categorySlug) {
      return `${basePath}/${slug}/${categorySlug}`;
    }
    return `${basePath}/${slug}`;
  };

  // Compact variant: Badge chips
  if (variant === "compact") {
    return (
      <section className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {displayLocalities.map((loc) => (
            <Link key={loc.slug} to={getUrl(loc.slug)}>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-primary/5 hover:border-primary/30 px-3 py-1.5 transition-colors"
              >
                {loc.name}
              </Badge>
            </Link>
          ))}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
        )}
      </section>
    );
  }

  // Expanded variant: Cards with descriptions
  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
      )}
      <div className="space-y-2">
        {displayLocalities.map((loc) => (
          <Link key={loc.slug} to={getUrl(loc.slug)} className="block group">
            <Card className="hover:shadow-sm hover:border-primary/30 transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {loc.name}
                  </h4>
                  {loc.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {loc.description}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * Nearby Locality Switch for Category Pages
 * Shows "Also explore in nearby areas" with category context
 */
interface NearbyLocalitySwitchProps {
  localities: NearbyLocality[];
  categorySlug: string;
  categoryName: string;
  isLoading?: boolean;
}

export function NearbyLocalitySwitch({
  localities,
  categorySlug,
  categoryName,
  isLoading = false,
}: NearbyLocalitySwitchProps) {
  if (isLoading) {
    return (
      <div className="bg-muted/30 rounded-lg p-4">
        <Skeleton className="h-4 w-48 mb-3" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!localities.length) return null;

  return (
    <div className="bg-muted/30 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-medium text-foreground mb-3">
        Explore {categoryName} in nearby areas
      </h3>
      <div className="flex flex-wrap gap-2">
        {localities.slice(0, 5).map((loc) => (
          <Link key={loc.slug} to={`/jaipur/${loc.slug}/${categorySlug}`}>
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80 px-3 py-1.5 transition-colors"
            >
              {loc.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
