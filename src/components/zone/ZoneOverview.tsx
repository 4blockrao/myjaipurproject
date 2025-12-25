import { Info, MapPin, Users, Building } from "lucide-react";

interface ZoneOverviewProps {
  zone: {
    name: string;
    totalLocalities: number;
    totalPopulation: number;
    uniqueWards: string[];
    allPinCodes: string[];
    allTags: string[];
    localities: any[];
  };
}

export function ZoneOverview({ zone }: ZoneOverviewProps) {
  // Derive characteristics from tags
  const hasResidential = zone.allTags.some(t => t.toLowerCase().includes('residential'));
  const hasIndustrial = zone.allTags.some(t => t.toLowerCase().includes('industrial'));
  const hasCommercial = zone.allTags.some(t => t.toLowerCase().includes('commercial'));

  const characteristics = [
    hasResidential && 'residential',
    hasCommercial && 'commercial',
    hasIndustrial && 'industrial',
  ].filter(Boolean);

  return (
    <section className="mb-8">
      {/* AI Summary Box */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="font-semibold text-foreground mb-2">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              {zone.name} Zone is an administrative zone in Jaipur, Rajasthan, 
              comprising {zone.totalLocalities} localities across {zone.uniqueWards.length} wards. 
              {characteristics.length > 0 && (
                <> The zone features a mix of {characteristics.join(', ')} areas.</>
              )}
              {zone.allPinCodes.length > 0 && (
                <> Pin codes in this zone include {zone.allPinCodes.slice(0, 3).join(', ')}
                {zone.allPinCodes.length > 3 && ' and others'}.</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{zone.totalLocalities}</div>
          <div className="text-sm text-muted-foreground">Localities</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Building className="h-6 w-6 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{zone.uniqueWards.length}</div>
          <div className="text-sm text-muted-foreground">Wards</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Users className="h-6 w-6 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">
            {zone.totalPopulation > 0 
              ? `${(zone.totalPopulation / 1000).toFixed(0)}K+` 
              : '—'}
          </div>
          <div className="text-sm text-muted-foreground">Est. Population</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{zone.allPinCodes.length}</div>
          <div className="text-sm text-muted-foreground">Pin Codes</div>
        </div>
      </div>

      {/* About Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-foreground mb-3">
          About {zone.name} Zone, Jaipur
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {zone.name} Zone is one of the administrative divisions of Jaipur city, 
          managed under the Jaipur Municipal Corporation. The zone encompasses 
          {zone.totalLocalities} localities that range from established residential 
          neighbourhoods to developing urban areas.
        </p>
        <p className="text-muted-foreground leading-relaxed mt-3">
          Residents of {zone.name} Zone access civic amenities, public services, 
          and infrastructure maintained by the local municipal administration. 
          The zone is connected to other parts of Jaipur through road networks, 
          public transport, and in some areas, metro connectivity.
        </p>
      </div>
    </section>
  );
}
