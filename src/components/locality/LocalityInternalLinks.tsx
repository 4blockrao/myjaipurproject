import { Link } from "react-router-dom";
import { Locality } from "@/hooks/useLocality";
import { ExternalLink } from "lucide-react";

interface LocalityInternalLinksProps {
  locality: Locality;
}

export function LocalityInternalLinks({ locality }: LocalityInternalLinksProps) {
  // Core site links
  const coreLinks = [
    { href: "/jaipur", label: "All Jaipur Localities" },
    { href: "/news", label: "Jaipur News" },
    { href: "/events", label: "Events in Jaipur" },
    { href: "/deals", label: "Deals in Jaipur" },
    { href: "/merchants", label: "Merchants Directory" },
  ];

  // Zone-specific link
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
              className="text-sm text-primary hover:underline transition-colors"
            >
              {link.label}
            </Link>
            {index < coreLinks.length - 1 && (
              <span className="text-muted-foreground">•</span>
            )}
          </span>
        ))}
      </div>

      {/* Zone & Municipality Links */}
      {(locality.zone || locality.municipality) && (
        <div className="flex flex-wrap gap-4 text-sm mb-4">
          {locality.zone && (
            <Link
              to={`/jaipur?zone=${encodeURIComponent(locality.zone)}`}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              {locality.zone} Zone
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
          {locality.municipality && (
            <Link
              to={`/jaipur?municipality=${encodeURIComponent(locality.municipality)}`}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              {locality.municipality} Municipality
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}

      {/* Adjacent Localities Quick Links */}
      {locality.adjacent_localities?.length > 0 && (
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
        {locality.zone && <strong className="text-foreground">{locality.zone}</strong>}
        {locality.zone && " zone of "}
        Jaipur, Rajasthan, India.
      </p>
    </footer>
  );
}