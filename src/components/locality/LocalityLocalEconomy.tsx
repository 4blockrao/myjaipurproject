import { Briefcase } from "lucide-react";

interface LocalityLocalEconomyProps {
  locality: any;
}

export function LocalityLocalEconomy({ locality }: LocalityLocalEconomyProps) {
  if (!locality) return null;

  const hasIndustrial = locality.tags?.some((t: string) => 
    t.toLowerCase().includes('industrial') || 
    t.toLowerCase().includes('industrial area')
  );

  const hasCommercial = locality.tags?.some((t: string) => 
    t.toLowerCase().includes('commercial') || 
    t.toLowerCase().includes('business')
  );

  const nearbyAreas = locality.nearby_localities?.slice(0, 4)
    .map((l: string) => l.replace(/-/g, " "))
    .join(", ");

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Briefcase className="h-6 w-6 text-primary" />
        Local Economy & Nearby Employment Zones
      </h2>

      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground leading-relaxed">
          {locality.name} is situated within the {locality.zone || "urban"} economic 
          corridor of Jaipur, with residents typically accessing employment opportunities 
          across the wider metropolitan area.
        </p>

        {hasIndustrial && (
          <p className="text-muted-foreground leading-relaxed mt-4">
            The locality includes or is adjacent to industrial zones that provide 
            employment in manufacturing, warehousing, and related sectors. This 
            contributes to a working-class residential profile in parts of the area.
          </p>
        )}

        {hasCommercial && (
          <p className="text-muted-foreground leading-relaxed mt-4">
            Commercial activity within {locality.name} supports local businesses, 
            shops, and service establishments that form part of the neighbourhood economy.
          </p>
        )}

        <p className="text-muted-foreground leading-relaxed mt-4">
          {nearbyAreas ? (
            <>
              Nearby localities such as {nearbyAreas} are part of the connected 
              employment and commuting belt, with workers often travelling between 
              these areas for work, services, and commerce.
            </>
          ) : (
            <>
              The locality connects to broader Jaipur employment hubs through 
              road networks and public transport corridors.
            </>
          )}
        </p>

        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">Common Employment Sectors</h3>
          <ul className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
            <li>• Retail & Local Commerce</li>
            <li>• Services & Trades</li>
            <li>• Government & Public Sector</li>
            <li>• Education & Healthcare</li>
            {hasIndustrial && <li>• Manufacturing & Industrial</li>}
            {hasCommercial && <li>• Business & Professional Services</li>}
          </ul>
        </div>

        <p className="text-sm text-muted-foreground/70 mt-4 italic">
          Employment data is indicative and based on locality characteristics. 
          Specific employers and job listings are not included.
        </p>
      </div>
    </section>
  );
}
