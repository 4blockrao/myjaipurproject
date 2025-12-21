import { Locality } from '@/hooks/useLocality';
import { 
  Train, Bus, Plane, Navigation, 
  ArrowRight, MapPin 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LocalityConnectivityProps {
  locality: Locality;
}

export function LocalityConnectivity({ locality }: LocalityConnectivityProps) {
  // Type assertion for the JSONB data
  const connectivity = locality.connectivity as {
    nearest_metro?: string;
    nearest_bus_stops?: string[];
    nearest_railway_station?: string;
    distance_to_airport?: string;
  } | null;

  if (!connectivity) {
    return null;
  }

  const items = [
    {
      icon: Train,
      label: 'Nearest Metro',
      value: connectivity.nearest_metro,
      color: 'text-blue-500',
    },
    {
      icon: Bus,
      label: 'Bus Stops',
      value: connectivity.nearest_bus_stops?.join(', '),
      color: 'text-green-500',
    },
    {
      icon: Train,
      label: 'Railway Station',
      value: connectivity.nearest_railway_station,
      color: 'text-orange-500',
    },
    {
      icon: Plane,
      label: 'Airport Distance',
      value: connectivity.distance_to_airport,
      color: 'text-purple-500',
    },
  ].filter(item => item.value);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Navigation className="h-6 w-6 text-primary" />
        Connectivity Guide
      </h2>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-start gap-4">
                <div className={`p-3 rounded-full bg-muted ${color}`}>
                  <Icon className="h-5 w-5" />
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
              <strong>Travel Note:</strong> {locality.name} is well-connected via road transport. 
              {connectivity.nearest_metro && ` The nearest metro station is ${connectivity.nearest_metro}.`}
              {connectivity.nearest_railway_station && ` ${connectivity.nearest_railway_station} provides rail connectivity.`}
              {connectivity.distance_to_airport && ` Jaipur International Airport is ${connectivity.distance_to_airport} away.`}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
