import { Locality } from '@/hooks/useLocality';
import { Landmark, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LocalityLandmarksProps {
  locality: Locality;
}

export function LocalityLandmarks({ locality }: LocalityLandmarksProps) {
  // Type assertion for the JSONB data
  const landmarks = locality.major_landmarks as {
    name: string;
    type: string;
    lat?: number;
    lng?: number;
  }[] | null;

  if (!landmarks?.length) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Landmark className="h-6 w-6 text-primary" />
        Major Landmarks
      </h2>
      <p className="text-muted-foreground mb-4">
        Notable places and landmarks in {locality.name}:
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {landmarks.map((landmark, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{landmark.name}</h3>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {landmark.type}
                  </Badge>
                </div>
                {landmark.lat && landmark.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${landmark.lat},${landmark.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    aria-label={`View ${landmark.name} on map`}
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </a>
                )}
              </div>
              {landmark.lat && landmark.lng && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {landmark.lat.toFixed(4)}°N, {landmark.lng.toFixed(4)}°E
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
