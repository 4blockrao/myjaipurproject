import { Building2, Shield, FileText } from "lucide-react";

interface ZoneGovernanceProps {
  zone: {
    name: string;
    uniqueWards: string[];
    uniqueMunicipalities: string[];
    uniquePoliceStations: string[];
    allPinCodes: string[];
    localities: any[];
  };
}

export function ZoneGovernance({ zone }: ZoneGovernanceProps) {
  // Get assembly constituencies from localities
  const constituencies = [...new Set(
    zone.localities.map(l => l.assembly_constituency).filter(Boolean)
  )];

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Building2 className="h-6 w-6 text-primary" />
        Governance & Administration
      </h2>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Wards */}
          <div>
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Municipal Wards
            </h3>
            {zone.uniqueWards.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {zone.uniqueWards.slice(0, 15).map((ward, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                  >
                    Ward {ward}
                  </span>
                ))}
                {zone.uniqueWards.length > 15 && (
                  <span className="px-3 py-1 text-muted-foreground text-sm">
                    +{zone.uniqueWards.length - 15} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Ward details being verified</p>
            )}
          </div>

          {/* Police Stations */}
          <div>
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Police Stations
            </h3>
            {zone.uniquePoliceStations.length > 0 ? (
              <ul className="text-sm text-muted-foreground space-y-1">
                {zone.uniquePoliceStations.map((station, i) => (
                  <li key={i}>• {station}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Details being verified</p>
            )}
          </div>

          {/* Municipalities */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Municipalities</h3>
            {zone.uniqueMunicipalities.length > 0 ? (
              <ul className="text-sm text-muted-foreground space-y-1">
                {zone.uniqueMunicipalities.map((muni, i) => (
                  <li key={i}>• {muni}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Details being verified</p>
            )}
          </div>

          {/* Constituencies */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Assembly Constituencies</h3>
            {constituencies.length > 0 ? (
              <ul className="text-sm text-muted-foreground space-y-1">
                {constituencies.map((const_, i) => (
                  <li key={i}>• {const_}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Details being verified</p>
            )}
          </div>
        </div>

        {/* Pin Codes */}
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="font-semibold text-foreground mb-2">Pin Codes in {zone.name} Zone</h3>
          {zone.allPinCodes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {zone.allPinCodes.map((pin, i) => (
                <span 
                  key={i}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-mono"
                >
                  {pin}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Pin code details being verified</p>
          )}
        </div>
      </div>
    </section>
  );
}
