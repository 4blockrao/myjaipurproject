import { ShoppingBag, Store } from "lucide-react";
import { Link } from "react-router-dom";

interface ZoneCommercialClustersProps {
  zone: {
    name: string;
    localities: any[];
    allTags: string[];
  };
}

export function ZoneCommercialClusters({ zone }: ZoneCommercialClustersProps) {
  // Filter localities with commercial/industrial/market tags
  const commercialLocalities = zone.localities.filter(l => 
    l.tags?.some((t: string) => 
      t.toLowerCase().includes('commercial') || 
      t.toLowerCase().includes('industrial') ||
      t.toLowerCase().includes('market') ||
      t.toLowerCase().includes('business')
    )
  );

  // Extract market landmarks from all localities
  const marketLandmarks = zone.localities.flatMap(l => 
    (l.major_landmarks || []).filter((lm: any) => 
      lm.type?.toLowerCase().includes('market') ||
      lm.type?.toLowerCase().includes('mall') ||
      lm.type?.toLowerCase().includes('shop')
    ).map((lm: any) => ({ ...lm, locality: l.name }))
  ).slice(0, 8);

  const hasIndustrial = zone.allTags.some(t => t.toLowerCase().includes('industrial'));

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <ShoppingBag className="h-6 w-6 text-primary" />
        Commercial & Market Clusters
      </h2>

      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground leading-relaxed mb-4">
          {zone.name} Zone includes various commercial establishments, local markets, 
          and shopping areas that serve the daily needs of residents across the zone.
        </p>

        {commercialLocalities.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">Commercial Localities</h3>
            <div className="flex flex-wrap gap-2">
              {commercialLocalities.slice(0, 8).map((locality, i) => (
                <Link
                  key={i}
                  to={`/jaipur/${locality.slug}`}
                  className="px-3 py-1.5 bg-muted rounded-full text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {locality.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {marketLandmarks.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Store className="h-4 w-4" />
              Notable Markets & Shopping Areas
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {marketLandmarks.map((lm, i) => (
                <div key={i} className="p-3 bg-muted/50 rounded-lg">
                  <div className="font-medium text-foreground text-sm">{lm.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {lm.type} • {lm.locality}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasIndustrial && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Industrial Activity</h3>
            <p className="text-sm text-muted-foreground">
              Parts of {zone.name} Zone include industrial areas and work zones 
              that contribute to the local economy. These areas provide employment 
              opportunities in manufacturing, warehousing, and related sectors.
            </p>
          </div>
        )}

        {!commercialLocalities.length && !marketLandmarks.length && (
          <p className="text-muted-foreground">
            {zone.name} Zone features neighbourhood-level commercial establishments 
            including local shops, grocery stores, and service providers. 
            Specific market listings are being verified.
          </p>
        )}
      </div>
    </section>
  );
}
