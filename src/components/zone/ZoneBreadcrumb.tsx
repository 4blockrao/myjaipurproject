import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ZoneBreadcrumbProps {
  zoneName: string;
  zoneSlug?: string;
}

const SITE_URL = "https://jaipurcircle.com";

export function ZoneBreadcrumb({ zoneName, zoneSlug }: ZoneBreadcrumbProps) {
  // Build breadcrumb segments
  const segments = [
    { label: "Home", href: "/" },
    { label: "Jaipur", href: "/jaipur" },
    { label: "Zones", href: "/jaipur/zones" },
    { label: `${zoneName} Zone` }
  ];

  // Generate BreadcrumbList JSON-LD schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: segments.map((segment, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: segment.label,
      item: segment.href ? `${SITE_URL}${segment.href}` : undefined,
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          {/* Home */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link 
                to="/" 
                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {/* Jaipur */}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link 
                to="/jaipur" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Jaipur
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {/* Zones Index */}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link 
                to="/jaipur/zones"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Zones
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {/* Current Zone */}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-foreground">
              {zoneName} Zone
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
