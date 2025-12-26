import { MapPin, Train, Bus, Plane, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Locality, parseConnectivity, getBusStops, getAirportDistance } from "@/hooks/useLocality";

interface LocalityConnectivityProps {
  locality: Locality;
}

export function LocalityConnectivity({ locality }: LocalityConnectivityProps) {
  const connectivity = parseConnectivity(locality.connectivity);
  const busStops = getBusStops(connectivity);
  const airportDistance = getAirportDistance(connectivity);

  const items = [
    {
      icon: MapPin,
      label: "Nearest Metro",
      value: connectivity.nearest_metro || null,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      icon: Bus,
      label: "Nearest Bus Stops",
      value: busStops.length ? busStops.join(", ") : null,
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-500/10",
    },
    {
      icon: Train,
      label: "Nearest Railway Station",
      value: connectivity.nearest_railway_station || null,
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-500/10",
    },
    {
      icon: Plane,
      label: "Distance to Airport",
      value: airportDistance,
      colorClass: "text-rose-600 dark:text-rose-400",
      bgClass: "bg-rose-500/10",
    },
  ].filter((item) => item.value);

  if (items.length === 0) return null;

  const travelNoteParts: string[] = [];
  if (connectivity.nearest_metro) {
    travelNoteParts.push(
      `The nearest metro station is ${connectivity.nearest_metro}.`
    );
  }
  if (connectivity.nearest_railway_station) {
    travelNoteParts.push(
      `${connectivity.nearest_railway_station} provides railway connectivity.`
    );
  }
  if (airportDistance) {
    travelNoteParts.push(
      `Jaipur International Airport is ${airportDistance} away.`
    );
  }

  const travelNote =
    travelNoteParts.length > 0
      ? travelNoteParts.join(" ")
      : `${locality.name} is well-connected via road transport.`;

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Navigation className="h-6 w-6 text-primary" />
        Connectivity Guide
      </h2>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map(({ icon: Icon, label, value, colorClass, bgClass }) => (
              <div key={label} className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${bgClass}`}>
                  <Icon className={`h-5 w-5 ${colorClass}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="font-medium text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Travel Note:</strong> {travelNote}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
