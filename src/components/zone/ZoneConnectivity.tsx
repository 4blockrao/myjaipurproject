import { Train, Bus, Plane, MapPin } from "lucide-react";

interface ZoneConnectivityProps {
  zone: {
    name: string;
    localities: any[];
  };
}

export function ZoneConnectivity({ zone }: ZoneConnectivityProps) {
  // Aggregate connectivity info from all localities
  const allConnectivity = zone.localities.map(l => l.connectivity || {});
  
  const metroStations = [...new Set(
    allConnectivity.map(c => c.nearest_metro).filter(Boolean)
  )];
  
  const busStops = [...new Set(
    allConnectivity.flatMap(c => c.nearest_bus_stops || []).filter(Boolean)
  )];
  
  const railwayStations = [...new Set(
    allConnectivity.map(c => c.nearest_railway_station).filter(Boolean)
  )];

  // Get average airport distance
  const airportDistances = allConnectivity
    .map(c => c.distance_to_airport_km)
    .filter(d => typeof d === 'number');
  
  const avgAirportDistance = airportDistances.length > 0
    ? Math.round(airportDistances.reduce((a, b) => a + b, 0) / airportDistances.length)
    : null;

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Train className="h-6 w-6 text-primary" />
        Connectivity & Transport
      </h2>

      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground leading-relaxed mb-6">
          {zone.name} Zone is connected to other parts of Jaipur through various 
          transport options including roads, public buses, and in some areas, metro rail.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Metro */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Train className="h-4 w-4 text-primary" />
              Metro Connectivity
            </h3>
            {metroStations.length > 0 ? (
              <ul className="text-sm text-muted-foreground space-y-1">
                {metroStations.slice(0, 5).map((station, i) => (
                  <li key={i}>• {station}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Metro stations near this zone are being verified. Residents typically 
                access metro from nearby connected stations.
              </p>
            )}
          </div>

          {/* Bus */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Bus className="h-4 w-4 text-primary" />
              Bus Connectivity
            </h3>
            {busStops.length > 0 ? (
              <ul className="text-sm text-muted-foreground space-y-1">
                {busStops.slice(0, 5).map((stop, i) => (
                  <li key={i}>• {stop}</li>
                ))}
                {busStops.length > 5 && (
                  <li className="text-muted-foreground/70">
                    +{busStops.length - 5} more stops
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                City bus services operate through various stops in the zone.
              </p>
            )}
          </div>

          {/* Railway */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Railway Stations
            </h3>
            {railwayStations.length > 0 ? (
              <ul className="text-sm text-muted-foreground space-y-1">
                {railwayStations.map((station, i) => (
                  <li key={i}>• {station}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Railway connectivity details are being verified.
              </p>
            )}
          </div>

          {/* Airport */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Plane className="h-4 w-4 text-primary" />
              Airport Access
            </h3>
            <p className="text-sm text-muted-foreground">
              {avgAirportDistance ? (
                <>
                  Jaipur International Airport is approximately {avgAirportDistance} km 
                  from localities in {zone.name} Zone.
                </>
              ) : (
                <>
                  Jaipur International Airport serves the zone. Distance varies by locality.
                </>
              )}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Road connectivity within {zone.name} Zone includes major roads, 
          internal lanes, and connecting corridors to other zones. 
          Many residents use personal vehicles, auto-rickshaws, and 
          ride-sharing services for daily commute.
        </p>
      </div>
    </section>
  );
}
