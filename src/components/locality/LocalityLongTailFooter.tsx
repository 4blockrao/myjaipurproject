import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Locality } from "@/hooks/useLocality";

interface LocalityLongTailFooterProps {
  locality: Locality;
}

export function LocalityLongTailFooter({ locality }: LocalityLongTailFooterProps) {
  if (!locality) return null;

  const name = locality.name;
  const zone = locality.zone;
  const microLocalities = locality.micro_localities || [];
  const nearbyLocalities = locality.nearby_localities || [];

  // Generate search intent phrases
  const searchPhrases = [
    `flats in ${name}`,
    `pg rooms in ${name}`,
    `houses for rent in ${name}`,
    `schools near ${name}`,
    `hospitals in ${name}`,
    `markets in ${name}`,
    `connectivity to ${name}`,
    `${name} pin code`,
    `${name} ward number`,
    `${name} police station`,
    `living in ${name} Jaipur`,
    `${name} Jaipur map`,
  ];

  // Add zone-specific phrases
  if (zone) {
    searchPhrases.push(
      `${zone} zone localities`,
      `areas near ${name} ${zone}`
    );
  }

  // Add micro-locality phrases
  microLocalities.slice(0, 3).forEach((micro: string) => {
    searchPhrases.push(`${micro} ${name}`);
  });

  return (
    <section className="mb-8 mt-12">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Search className="h-6 w-6 text-primary" />
        People Also Search For
      </h2>

      <div className="bg-muted/30 border border-border rounded-lg p-6">
        {/* Search Intent Phrases */}
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">
            Related Searches for {name}, Jaipur
          </h3>
          <div className="flex flex-wrap gap-2">
            {searchPhrases.map((phrase, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-background border border-border rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {phrase}
              </span>
            ))}
          </div>
        </div>

        {/* Micro Localities */}
        {microLocalities.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">
              Areas & Sectors in {name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {microLocalities.map((micro: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {micro}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Localities Links */}
        {nearbyLocalities.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">
              Explore Nearby Localities
            </h3>
            <div className="flex flex-wrap gap-2">
              {nearbyLocalities.slice(0, 8).map((nearby: string, i: number) => (
                <Link
                  key={i}
                  to={`/jaipur/${nearby}`}
                  className="px-3 py-1.5 bg-background border border-border rounded-full text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  {nearby.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Zone Link */}
        {zone && (
          <div>
            <h3 className="font-semibold text-foreground mb-3">
              Browse by Zone
            </h3>
            <Link
              to={`/jaipur/zones/${zone.toLowerCase().replace(/\s+/g, "-")}`}
              className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors"
            >
              All Localities in {zone} Zone →
            </Link>
          </div>
        )}

        {/* SEO Text Block */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {name} is a locality in Jaipur, Rajasthan, India
            {zone && `, located in the ${zone} zone`}
            {locality.pin_codes?.length && locality.pin_codes.length > 0 && ` with pin code ${locality.pin_codes[0]}`}.
            This page provides comprehensive information about {name} including 
            ward details, nearby areas, connectivity, and local amenities. 
            Whether you're looking for housing, schools, hospitals, or markets 
            in {name}, this guide covers all essential locality information.
          </p>
        </div>
      </div>
    </section>
  );
}
