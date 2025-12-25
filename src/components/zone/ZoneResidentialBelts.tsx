import { Home } from "lucide-react";
import { Link } from "react-router-dom";

interface ZoneResidentialBeltsProps {
  zone: {
    name: string;
    localities: any[];
  };
}

export function ZoneResidentialBelts({ zone }: ZoneResidentialBeltsProps) {
  // Filter localities with residential tags or those that seem residential
  const residentialLocalities = zone.localities.filter(l => 
    l.tags?.some((t: string) => 
      t.toLowerCase().includes('residential') || 
      t.toLowerCase().includes('colony') ||
      t.toLowerCase().includes('nagar')
    ) ||
    l.name.toLowerCase().includes('nagar') ||
    l.name.toLowerCase().includes('colony') ||
    l.name.toLowerCase().includes('vihar')
  );

  // If no specific residential localities found, show first 6 as general residential
  const displayLocalities = residentialLocalities.length > 0 
    ? residentialLocalities.slice(0, 12) 
    : zone.localities.slice(0, 8);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Home className="h-6 w-6 text-primary" />
        Key Residential Belts
      </h2>

      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground leading-relaxed mb-4">
          {zone.name} Zone comprises several established residential neighbourhoods 
          and developing housing areas. These localities cater to diverse demographics 
          including families, working professionals, and students.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayLocalities.map((locality, i) => (
            <Link
              key={i}
              to={`/jaipur/${locality.slug}`}
              className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
            >
              <div className="font-medium text-foreground text-sm">{locality.name}</div>
              {locality.ward_number && (
                <div className="text-xs text-muted-foreground mt-1">
                  Ward {locality.ward_number}
                </div>
              )}
            </Link>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Residential areas in {zone.name} Zone typically offer a mix of 
          independent houses, plotted developments, and apartment complexes. 
          Housing availability and character vary by locality.
        </p>
      </div>
    </section>
  );
}
