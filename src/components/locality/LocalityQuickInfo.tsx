import { MapPin, Users, Landmark, Navigation } from "lucide-react";
import { Locality } from "@/hooks/useLocality";

interface LocalityQuickInfoProps {
  locality: Locality;
}

export function LocalityQuickInfo({ locality }: LocalityQuickInfoProps) {
  const nearby = locality?.nearby_localities?.slice(0, 3)?.map(
    l => l.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
  ) || [];

  return (
    <section className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
      <h2 className="font-semibold text-foreground mb-3">Quick Locality Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="flex gap-2 items-start">
          <Users className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <p className="text-muted-foreground">
            <strong className="text-foreground">Locality Type:</strong>{" "}
            {locality?.tags?.length ? locality.tags.slice(0, 3).join(", ") : "Urban residential area"}
          </p>
        </div>

        <div className="flex gap-2 items-start">
          <Landmark className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <p className="text-muted-foreground">
            <strong className="text-foreground">Governance:</strong>{" "}
            {locality.municipality || "Details being verified"}
            {locality.ward_number && ` • Ward ${locality.ward_number}`}
          </p>
        </div>

        <div className="flex gap-2 items-start">
          <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <p className="text-muted-foreground">
            <strong className="text-foreground">Zone:</strong>{" "}
            {locality.zone || "Jaipur"}
            {locality.pin_codes?.[0] && ` • PIN ${locality.pin_codes[0]}`}
          </p>
        </div>

        <div className="flex gap-2 items-start">
          <Navigation className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <p className="text-muted-foreground">
            <strong className="text-foreground">Nearby Areas:</strong>{" "}
            {nearby.length ? nearby.join(", ") : "Details being verified"}
          </p>
        </div>
      </div>
    </section>
  );
}
