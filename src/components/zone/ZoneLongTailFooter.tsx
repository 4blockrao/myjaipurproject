import { Search } from "lucide-react";
import { Link } from "react-router-dom";

interface ZoneLongTailFooterProps {
  zone: {
    name: string;
    slug: string;
    localities: any[];
    allPinCodes: string[];
  };
}

export function ZoneLongTailFooter({ zone }: ZoneLongTailFooterProps) {
  const name = zone.name;
  const localities = zone.localities;

  // Generate search intent phrases
  const searchPhrases = [
    `${name} zone Jaipur localities`,
    `localities in ${name} zone`,
    `${name} zone pin codes`,
    `${name} zone ward numbers`,
    `living in ${name} zone Jaipur`,
    `flats in ${name} zone`,
    `houses for rent ${name} zone`,
    `schools in ${name} zone Jaipur`,
    `hospitals near ${name} zone`,
    `markets in ${name} zone`,
    `${name} zone map Jaipur`,
    `${name} zone connectivity`,
  ];

  // Get unique zones for cross-linking (would need to be passed or fetched)
  const otherZones = ['North', 'South', 'East', 'West', 'Central']
    .filter(z => z !== name);

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
            Related Searches for {name} Zone
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

        {/* Top Localities Quick Links */}
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">
            Popular Localities in {name} Zone
          </h3>
          <div className="flex flex-wrap gap-2">
            {localities.slice(0, 12).map((locality, i) => (
              <Link
                key={i}
                to={`/jaipur/${locality.slug}`}
                className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
              >
                {locality.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Other Zones */}
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">
            Explore Other Zones in Jaipur
          </h3>
          <div className="flex flex-wrap gap-2">
            {otherZones.map((zoneName, i) => (
              <Link
                key={i}
                to={`/jaipur/zones/${zoneName.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1.5 bg-background border border-border rounded-full text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                {zoneName} Zone
              </Link>
            ))}
          </div>
        </div>

        {/* Pin Codes */}
        {zone.allPinCodes.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">
              Pin Codes in {name} Zone
            </h3>
            <div className="flex flex-wrap gap-2">
              {zone.allPinCodes.slice(0, 8).map((pin, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-background border border-border rounded-full text-sm font-mono text-muted-foreground"
                >
                  {pin}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* SEO Text Block */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {name} Zone is an administrative zone in Jaipur, Rajasthan, India 
            comprising {localities.length} localities. This page provides comprehensive 
            information about {name} Zone including all localities, wards, pin codes,
            connectivity, and local amenities. Whether you're looking for housing,
            schools, hospitals, or markets in {name} Zone, this guide covers all
            essential zone-level information.
          </p>
        </div>
      </div>
    </section>
  );
}
