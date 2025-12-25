import { Home } from "lucide-react";

interface LocalityRentalContextProps {
  locality: any;
}

export function LocalityRentalContext({ locality }: LocalityRentalContextProps) {
  if (!locality) return null;

  const nearbyAreas = locality.nearby_localities?.slice(0, 3)
    .map((l: string) => l.replace(/-/g, " "))
    .join(", ");

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Home className="h-6 w-6 text-primary" />
        Rental & PG Living in {locality.name}
      </h2>

      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground leading-relaxed">
          {locality.name} is part of the {locality.zone || "urban"} belt of Jaipur, 
          where rental housing, paying guest (PG) accommodation, and shared living 
          options are commonly sought by working professionals, students, and families.
        </p>
        
        <p className="text-muted-foreground leading-relaxed mt-4">
          The locality features a mix of independent rental units, apartment flats, 
          and neighbourhood-level PG rooms catering to different budget segments. 
          {nearbyAreas && (
            <> Nearby areas such as {nearbyAreas} also offer connected rental 
            housing options with similar accessibility.</>
          )}
        </p>

        <p className="text-muted-foreground leading-relaxed mt-4">
          Rental seekers typically consider factors such as connectivity to workplaces, 
          proximity to daily markets, and access to public transport when evaluating 
          accommodation in {locality.name}.
        </p>

        <p className="text-sm text-muted-foreground/70 mt-4 italic">
          Note: Specific pricing and availability vary. This section provides 
          general locality-level context only.
        </p>
      </div>
    </section>
  );
}
