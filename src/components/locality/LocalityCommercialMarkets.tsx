import { ShoppingBag } from "lucide-react";

interface LocalityCommercialMarketsProps {
  locality: any;
}

export function LocalityCommercialMarkets({ locality }: LocalityCommercialMarketsProps) {
  if (!locality) return null;

  const landmarks = locality.major_landmarks || [];
  const marketLandmarks = landmarks.filter((l: any) => 
    l.type?.toLowerCase().includes('market') || 
    l.type?.toLowerCase().includes('shop') ||
    l.type?.toLowerCase().includes('mall') ||
    l.type?.toLowerCase().includes('commercial')
  );

  const hasCommercialTags = locality.tags?.some((t: string) => 
    t.toLowerCase().includes('commercial') || 
    t.toLowerCase().includes('market') ||
    t.toLowerCase().includes('industrial')
  );

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <ShoppingBag className="h-6 w-6 text-primary" />
        Commercial Markets & Shopping Areas
      </h2>

      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground leading-relaxed">
          {locality.name} and its surrounding areas feature a network of local 
          commercial establishments serving daily shopping and service needs of residents.
        </p>

        {marketLandmarks.length > 0 ? (
          <div className="mt-4">
            <h3 className="font-semibold text-foreground mb-2">Notable Commercial Points</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              {marketLandmarks.map((landmark: any, i: number) => (
                <li key={i}>
                  {landmark.name}
                  {landmark.type && <span className="text-sm"> ({landmark.type})</span>}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-muted-foreground leading-relaxed mt-4">
            The locality includes neighbourhood-level shops, grocery stores, and 
            small commercial clusters that cater to everyday requirements. Larger 
            shopping complexes and organised retail are typically accessed from 
            nearby commercial corridors within the {locality.zone || "surrounding"} zone.
          </p>
        )}

        {hasCommercialTags && (
          <p className="text-muted-foreground leading-relaxed mt-4">
            Parts of {locality.name} are characterised by commercial or light 
            industrial activity, contributing to the local economic environment.
          </p>
        )}

        <p className="text-sm text-muted-foreground/70 mt-4 italic">
          Specific business listings are being verified and will be updated as 
          structured data becomes available.
        </p>
      </div>
    </section>
  );
}
