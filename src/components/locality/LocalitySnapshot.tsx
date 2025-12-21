import { Locality } from '@/hooks/useLocality';
import { 
  MapPin, Building2, Shield, Hash, Users, 
  Landmark, Navigation, Map 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LocalitySnapshotProps {
  locality: Locality;
}

export function LocalitySnapshot({ locality }: LocalitySnapshotProps) {
  const items = [
    { icon: Building2, label: 'Zone', value: locality.zone },
    { icon: Landmark, label: 'Municipality', value: locality.municipality },
    { icon: Hash, label: 'Ward No.', value: locality.ward_number },
    { icon: MapPin, label: 'Ward Name', value: locality.ward_name },
    { icon: Shield, label: 'Police Station', value: locality.police_station },
    { icon: Navigation, label: 'Pin Codes', value: locality.pin_codes?.join(', ') },
    { icon: Landmark, label: 'Assembly Constituency', value: locality.assembly_constituency },
    { icon: Users, label: 'Population Estimate', value: locality.population_estimate?.toLocaleString() },
    { 
      icon: Map, 
      label: 'Coordinates', 
      value: locality.geo_lat && locality.geo_lng 
        ? `${locality.geo_lat.toFixed(4)}°N, ${locality.geo_lng.toFixed(4)}°E` 
        : null 
    },
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl">Locality Snapshot</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground">
                  {value || <span className="text-muted-foreground italic">Details being verified</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
