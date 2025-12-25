import { MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ZoneLocalitiesProps {
  zone: {
    name: string;
    localities: any[];
    totalLocalities: number;
  };
}

export function ZoneLocalities({ zone }: ZoneLocalitiesProps) {
  const [showAll, setShowAll] = useState(false);
  
  const displayLocalities = showAll 
    ? zone.localities 
    : zone.localities.slice(0, 20);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <MapPin className="h-6 w-6 text-primary" />
        All Localities in {zone.name} Zone ({zone.totalLocalities})
      </h2>

      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground leading-relaxed mb-6">
          Browse all {zone.totalLocalities} localities that fall under {zone.name} Zone 
          of Jaipur. Click on any locality to view detailed information including 
          wards, pin codes, connectivity, and more.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayLocalities.map((locality, i) => (
            <Link
              key={i}
              to={`/jaipur/${locality.slug}`}
              className="group p-3 bg-muted/50 rounded-lg hover:bg-primary/10 hover:border-primary transition-colors border border-transparent"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                    {locality.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {locality.ward_number && `Ward ${locality.ward_number}`}
                    {locality.ward_number && locality.pin_codes?.[0] && ' • '}
                    {locality.pin_codes?.[0]}
                  </div>
                </div>
                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>

        {zone.localities.length > 20 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll 
                ? 'Show Less' 
                : `Show All ${zone.totalLocalities} Localities`}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
