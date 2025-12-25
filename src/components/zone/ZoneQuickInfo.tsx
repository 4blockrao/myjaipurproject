import { MapPin, Users, Landmark, Building2 } from "lucide-react";

interface ZoneQuickInfoProps {
  zone: {
    name: string;
    totalLocalities: number;
    uniqueWards: string[];
    uniqueMunicipalities: string[];
    allPinCodes: string[];
    allTags: string[];
  };
}

export function ZoneQuickInfo({ zone }: ZoneQuickInfoProps) {
  return (
    <section className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
      <h2 className="font-semibold text-foreground mb-3">Quick Zone Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="flex gap-2 items-start">
          <Users className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <p className="text-muted-foreground">
            <strong className="text-foreground">Zone Type:</strong>{" "}
            {zone.allTags?.length ? zone.allTags.slice(0, 3).join(", ") : "Urban administrative zone"}
          </p>
        </div>

        <div className="flex gap-2 items-start">
          <Landmark className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <p className="text-muted-foreground">
            <strong className="text-foreground">Governance:</strong>{" "}
            {zone.uniqueMunicipalities?.[0] || "Jaipur Municipal Corporation"}
            {zone.uniqueWards?.length > 0 && ` • ${zone.uniqueWards.length} wards`}
          </p>
        </div>

        <div className="flex gap-2 items-start">
          <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <p className="text-muted-foreground">
            <strong className="text-foreground">Coverage:</strong>{" "}
            {zone.totalLocalities} localities
            {zone.allPinCodes?.[0] && ` • PIN ${zone.allPinCodes.slice(0, 2).join(", ")}`}
          </p>
        </div>

        <div className="flex gap-2 items-start">
          <Building2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <p className="text-muted-foreground">
            <strong className="text-foreground">Region:</strong>{" "}
            {zone.name} Zone, Jaipur, Rajasthan
          </p>
        </div>
      </div>
    </section>
  );
}
