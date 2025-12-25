import { Link } from "react-router-dom";
import { Locality } from "@/hooks/useLocality";
import { ExternalLink, MapPin, Building, Home } from "lucide-react";

interface LocalityInternalLinksProps {
  locality: Locality;
}

export function LocalityInternalLinks({ locality }: LocalityInternalLinksProps) {
  // Core site links - forms geographical hierarchy graph
  const coreLinks = [
    { href: "/jaipur", label: "All Jaipur Localities", icon: MapPin },
    { href: "/jaipur/zones", label: "Jaipur Zones", icon: Building },
    { href: "/news", label: "Jaipur News" },
    { href: "/events", label: "Events in Jaipur" },
    { href: "/deals", label: "Deals in Jaipur" },
  ];

  // Zone-specific link with proper slug format
  const zoneSlug = locality.zone?.toLowerCase().replace(/\s+/g, "-");

  return (
    <footer className="mt-12 pt-8 border-t border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Explore More on JaipurCircle
      </h3>
      
      {/* Core Navigation Links */}
      <div className="flex flex-wrap gap-3 mb-6">
        {coreLinks.map((link, index) => (
          <span key={link.href} className="flex items-center gap-3">
            <Link
              to={link.href}
              className="text-sm text-primary hover:underline transition-colors inline-flex items-center gap-1"
            >
              {link.icon && <link.icon className="h-3 w-3" />}
              {link.label}
            </Link>
            {index < coreLinks.length - 1 && (
              <span className="text-muted-foreground">•</span>
            )}
          </span>
        ))}
      </div>

      {/* Zone Link - Critical for geographic hierarchy */}
      {locality.zone && zoneSlug && (
        <div className="mb-4 p-3 bg-muted/30 rounded-lg border">
          <p className="text-xs text-muted-foreground mb-2">Part of:</p>
          <Link
            to={`/jaipur/zones/${zoneSlug}`}
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            <Building className="h-4 w-4" />
            {locality.zone} Zone, Jaipur
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Micro Localities */}
      {locality.micro_localities && locality.micro_localities.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
            <Home className="h-4 w-4" />
            Micro-localities in {locality.name}:
          </p>
          <div className="flex flex-wrap gap-2">
            {locality.micro_localities.slice(0, 10).map((area, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded capitalize"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Localities - Geographic hierarchy links */}
      {locality.nearby_localities && locality.nearby_localities.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-foreground mb-2">Nearby Localities:</p>
          <div className="flex flex-wrap gap-2">
            {locality.nearby_localities.slice(0, 8).map((slug) => (
              <Link
                key={slug}
                to={`/jaipur/${slug}`}
                className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded transition-colors capitalize"
              >
                {slug.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Adjacent Localities Quick Links */}
      {locality.adjacent_localities && locality.adjacent_localities.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Adjacent Areas:</p>
          <div className="flex flex-wrap gap-2">
            {locality.adjacent_localities.map((slug) => (
              <Link
                key={slug}
                to={`/jaipur/${slug}`}
                className="text-xs px-2 py-1 bg-muted text-muted-foreground hover:text-primary hover:bg-muted/80 rounded transition-colors capitalize"
              >
                {slug.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Context note */}
      <p className="mt-6 text-xs text-muted-foreground">
        This page is part of JaipurCircle's locality guide for{" "}
        {locality.zone && (
          <Link to={`/jaipur/zones/${zoneSlug}`} className="text-primary hover:underline">
            {locality.zone}
          </Link>
        )}
        {locality.zone && " zone of "}
        Jaipur, Rajasthan, India.
      </p>
    </footer>
  );
}