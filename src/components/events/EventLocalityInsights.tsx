import { Link } from "react-router-dom";
import { MapPin, Coffee, Landmark, Car, Train, Navigation } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { parseLandmarks, parseConnectivity } from "@/hooks/useLocality";

interface EventLocalityInsightsProps {
  locality?: string | null;
  venueName?: string | null;
}

/**
 * Locality insights section for event attendees
 * Shows nearby landmarks, transport, and area info
 */
const EventLocalityInsights = ({ locality, venueName }: EventLocalityInsightsProps) => {
  const { data: localityData, isLoading } = useQuery({
    queryKey: ['locality-insights', locality],
    queryFn: async () => {
      if (!locality) return null;
      
      const { data, error } = await supabase
        .from('localities')
        .select('name, slug, zone, connectivity, major_landmarks, nearby_localities, tags')
        .ilike('name', locality)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!locality
  });

  if (!locality) return null;

  if (isLoading) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!localityData) return null;

  const landmarks = parseLandmarks(localityData.major_landmarks);
  const connectivity = parseConnectivity(localityData.connectivity);
  const nearbyLocalities = localityData.nearby_localities || [];
  const tags = localityData.tags || [];

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary" />
          About {locality} — For Event Attendees
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Area Description */}
        <p className="text-sm text-muted-foreground">
          {venueName ? `${venueName} is located in ` : 'This event is in '}
          <Link to={`/jaipur/${localityData.slug}`} className="text-primary hover:underline font-medium">
            {locality}
          </Link>
          {localityData.zone && (
            <>, part of Jaipur's {localityData.zone} zone</>
          )}
          . Here's what you need to know about the area.
        </p>

        {/* Locality Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 5).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Transport & Connectivity */}
        {connectivity && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-primary" />
              Getting There
            </h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {connectivity.nearest_metro && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Train className="w-3 h-3 text-primary" />
                  <span>Nearest Metro: {connectivity.nearest_metro}</span>
                </div>
              )}
              {connectivity.major_roads && connectivity.major_roads.length > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Car className="w-3 h-3" />
                  <span>Via: {connectivity.major_roads.slice(0, 2).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nearby Landmarks */}
        {landmarks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-primary" />
              Nearby Landmarks
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {landmarks.slice(0, 4).map((landmark: { name: string }) => (
                <Badge key={landmark.name} variant="outline" className="text-xs">
                  {landmark.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Areas */}
        {nearbyLocalities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Nearby Areas
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {nearbyLocalities.slice(0, 4).map((nearby: string) => (
                <Link key={nearby} to={`/jaipur/${nearby.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Badge variant="secondary" className="text-xs hover:bg-secondary/80">
                    {nearby}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA to Locality Page */}
        <div className="pt-2">
          <Link 
            to={`/jaipur/${localityData.slug}`}
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            Explore more about {locality} →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventLocalityInsights;
