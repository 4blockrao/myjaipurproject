import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface DynamicBreadcrumbProps {
  /** Override auto-generated segments with custom ones */
  customSegments?: BreadcrumbSegment[];
  /** Additional class names for the nav element */
  className?: string;
  /** Hide the visual breadcrumb but still inject schema */
  schemaOnly?: boolean;
}

const SITE_URL = "https://jaipurcircle.com";

// Route label mappings for common paths
const ROUTE_LABELS: Record<string, string> = {
  "": "Home",
  "jaipur": "Jaipur",
  "zones": "Zones",
  "all": "All Localities",
  "deals": "Deals",
  "news": "News",
  "events": "Events",
  "merchants": "Merchants",
  "categories": "Categories",
  "account": "Account",
  "settings": "Settings",
  "help": "Help",
  "pro": "Pro Membership",
  "leaderboard": "Leaderboard",
  "referral-program": "Referral Program",
  "about": "About",
  "sitemap": "Sitemap",
  "install": "Install App",
  // News categories
  "city": "City News",
  "business": "Business",
  "culture": "Culture",
  "food": "Food",
  "sports": "Sports",
  // Zone slugs
  "north": "North Zone",
  "south": "South Zone",
  "east": "East Zone",
  "west": "West Zone",
  "central": "Central Zone",
};

/**
 * Converts a URL segment to a readable label
 */
function segmentToLabel(segment: string): string {
  // Check predefined labels first
  if (ROUTE_LABELS[segment]) {
    return ROUTE_LABELS[segment];
  }
  
  // Convert slug to title case (e.g., "vaishali-nagar" -> "Vaishali Nagar")
  return segment
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Generates breadcrumb segments from the current pathname
 */
function generateSegments(pathname: string): BreadcrumbSegment[] {
  const segments: BreadcrumbSegment[] = [
    { label: "Home", href: "/" }
  ];
  
  const pathParts = pathname.split("/").filter(Boolean);
  
  if (pathParts.length === 0) {
    return segments;
  }
  
  let currentPath = "";
  
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    currentPath += `/${part}`;
    
    const isLast = i === pathParts.length - 1;
    
    // Skip adding href for the last segment (current page)
    segments.push({
      label: segmentToLabel(part),
      href: isLast ? undefined : currentPath,
    });
  }
  
  return segments;
}

/**
 * Generates BreadcrumbList JSON-LD schema
 */
function generateBreadcrumbSchema(segments: BreadcrumbSegment[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: segments.map((segment, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: segment.label,
      item: segment.href 
        ? `${SITE_URL}${segment.href}`
        : undefined,
    })),
  };
}

/**
 * Dynamic Breadcrumb Component
 * 
 * Automatically generates breadcrumb navigation and JSON-LD schema
 * based on the current route. Can be customized with custom segments.
 */
export function DynamicBreadcrumb({
  customSegments,
  className = "",
  schemaOnly = false,
}: DynamicBreadcrumbProps) {
  const location = useLocation();
  
  // Use custom segments if provided, otherwise generate from pathname
  const segments = customSegments || generateSegments(location.pathname);
  
  // Generate JSON-LD schema
  const breadcrumbSchema = generateBreadcrumbSchema(segments);
  
  // Don't render if only home segment
  if (segments.length <= 1 && !schemaOnly) {
    return (
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
    );
  }
  
  if (schemaOnly) {
    return (
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
    );
  }
  
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      
      <Breadcrumb className={className}>
        <BreadcrumbList>
          {segments.map((segment, index) => {
            const isFirst = index === 0;
            const isLast = index === segments.length - 1;
            
            return (
              <BreadcrumbItem key={index}>
                {index > 0 && <BreadcrumbSeparator />}
                
                {isLast ? (
                  <BreadcrumbPage className="font-medium text-foreground">
                    {segment.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      to={segment.href || "/"} 
                      className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {isFirst && <Home className="h-4 w-4" />}
                      {!isFirst && segment.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}

/**
 * Hook to generate breadcrumb segments for a specific page type
 */
export function useBreadcrumbSegments(
  pageType: "locality" | "zone" | "news" | "event" | "deal" | "merchant",
  data: {
    name?: string;
    slug?: string;
    zone?: string;
    category?: string;
  }
): BreadcrumbSegment[] {
  const segments: BreadcrumbSegment[] = [{ label: "Home", href: "/" }];
  
  switch (pageType) {
    case "locality":
      segments.push({ label: "Jaipur", href: "/jaipur" });
      if (data.zone) {
        segments.push({ 
          label: `${data.zone} Zone`, 
          href: `/jaipur/zones/${data.zone.toLowerCase()}` 
        });
      }
      segments.push({ label: data.name || "Locality" });
      break;
      
    case "zone":
      segments.push({ label: "Jaipur", href: "/jaipur" });
      segments.push({ label: "Zones", href: "/jaipur/zones" });
      segments.push({ label: data.name || "Zone" });
      break;
      
    case "news":
      segments.push({ label: "News", href: "/news" });
      if (data.category) {
        segments.push({ 
          label: segmentToLabel(data.category), 
          href: `/news/${data.category}` 
        });
      }
      segments.push({ label: data.name || "Article" });
      break;
      
    case "event":
      segments.push({ label: "Events", href: "/events" });
      segments.push({ label: data.name || "Event" });
      break;
      
    case "deal":
      segments.push({ label: "Deals", href: "/deals" });
      segments.push({ label: data.name || "Deal" });
      break;
      
    case "merchant":
      segments.push({ label: "Merchants", href: "/merchants" });
      segments.push({ label: data.name || "Merchant" });
      break;
  }
  
  return segments;
}

export default DynamicBreadcrumb;
