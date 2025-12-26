import { Link } from "react-router-dom";
import { 
  MapPin, Coffee, Landmark, Car, Train, Navigation, 
  Clock, Shield, Utensils, ParkingCircle, Users, Lightbulb
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { parseLandmarks, parseConnectivity, parseMeta } from "@/hooks/useLocality";

interface EventLocalityInsightsProps {
  locality?: string | null;
  venueName?: string | null;
  eventTime?: string | null; // ISO date string for time-based tips
}

// Attendee-focused area context
interface AttendeeContext {
  safetyLevel: 'high' | 'moderate' | 'standard';
  lightingQuality: 'well-lit' | 'moderate' | 'limited';
  parkingAvailability: 'easy' | 'moderate' | 'limited';
  crowdDensity: 'busy' | 'moderate' | 'quiet';
  foodOptions: string[];
  peakHours: string;
  tips: string[];
}

// Generate attendee context based on locality data and tags
const generateAttendeeContext = (
  tags: string[], 
  zone: string | null, 
  eventTime?: string | null
): AttendeeContext => {
  const isCommercialArea = tags.some(t => 
    ['commercial', 'market', 'shopping', 'business'].includes(t.toLowerCase())
  );
  const isResidential = tags.some(t => 
    ['residential', 'colony', 'society'].includes(t.toLowerCase())
  );
  const isPosh = tags.some(t => 
    ['posh', 'upscale', 'premium', 'affluent'].includes(t.toLowerCase())
  );
  const isOldCity = zone?.toLowerCase().includes('walled') || 
    tags.some(t => ['heritage', 'old city', 'historic'].includes(t.toLowerCase()));
  
  // Determine event timing
  const eventHour = eventTime ? new Date(eventTime).getHours() : 19;
  const isEvening = eventHour >= 17 && eventHour <= 22;
  const isNight = eventHour > 22 || eventHour < 6;
  
  // Generate context
  const context: AttendeeContext = {
    safetyLevel: isPosh || isResidential ? 'high' : isCommercialArea ? 'moderate' : 'standard',
    lightingQuality: isPosh || isCommercialArea ? 'well-lit' : isOldCity ? 'moderate' : 'moderate',
    parkingAvailability: isOldCity ? 'limited' : isCommercialArea ? 'moderate' : 'easy',
    crowdDensity: isCommercialArea ? 'busy' : isResidential ? 'quiet' : 'moderate',
    foodOptions: [],
    peakHours: isCommercialArea ? '10 AM - 9 PM' : '6 PM - 10 PM',
    tips: []
  };
  
  // Food options based on area type
  if (isCommercialArea || isPosh) {
    context.foodOptions = ['Cafes', 'Restaurants', 'Quick Bites', 'Street Food'];
  } else if (isOldCity) {
    context.foodOptions = ['Local Eateries', 'Street Food', 'Traditional Cuisine'];
  } else {
    context.foodOptions = ['Local Restaurants', 'Cafes'];
  }
  
  // Generate tips
  if (isEvening || isNight) {
    context.tips.push('Arrive 15-20 minutes early for parking');
  }
  if (isOldCity) {
    context.tips.push('Consider auto-rickshaw for last-mile connectivity');
    context.tips.push('Cash recommended for local vendors');
  }
  if (isCommercialArea) {
    context.tips.push('Paid parking available in commercial complexes');
  }
  if (context.parkingAvailability === 'limited') {
    context.tips.push('Book cab or use metro for hassle-free travel');
  }
  
  return context;
};

/**
 * Enhanced Locality insights section for event attendees
 * Shows safety, transport, food, parking, and area context
 */
const EventLocalityInsights = ({ locality, venueName, eventTime }: EventLocalityInsightsProps) => {
  const { data: localityData, isLoading } = useQuery({
    queryKey: ['locality-insights', locality],
    queryFn: async () => {
      if (!locality) return null;
      
      const { data, error } = await supabase
        .from('localities')
        .select('name, slug, zone, connectivity, major_landmarks, nearby_localities, tags, meta')
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
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!localityData) return null;

  const landmarks = parseLandmarks(localityData.major_landmarks);
  const connectivity = parseConnectivity(localityData.connectivity);
  const nearbyLocalities = localityData.nearby_localities || [];
  const tags = localityData.tags || [];
  
  // Generate attendee-focused context
  const attendeeContext = generateAttendeeContext(tags, localityData.zone, eventTime);

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary" />
          Attendee Guide: {locality}
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
          . Here's everything you need to know before attending.
        </p>

        {/* Quick Status Indicators */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
            <Shield className={`w-4 h-4 ${
              attendeeContext.safetyLevel === 'high' ? 'text-green-500' : 
              attendeeContext.safetyLevel === 'moderate' ? 'text-yellow-500' : 'text-muted-foreground'
            }`} />
            <div>
              <p className="text-xs font-medium">Safety</p>
              <p className="text-xs text-muted-foreground capitalize">{attendeeContext.safetyLevel}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
            <Lightbulb className={`w-4 h-4 ${
              attendeeContext.lightingQuality === 'well-lit' ? 'text-yellow-400' : 'text-muted-foreground'
            }`} />
            <div>
              <p className="text-xs font-medium">Lighting</p>
              <p className="text-xs text-muted-foreground capitalize">{attendeeContext.lightingQuality}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
            <ParkingCircle className={`w-4 h-4 ${
              attendeeContext.parkingAvailability === 'easy' ? 'text-green-500' : 
              attendeeContext.parkingAvailability === 'limited' ? 'text-red-500' : 'text-yellow-500'
            }`} />
            <div>
              <p className="text-xs font-medium">Parking</p>
              <p className="text-xs text-muted-foreground capitalize">{attendeeContext.parkingAvailability}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
            <Users className={`w-4 h-4 ${
              attendeeContext.crowdDensity === 'busy' ? 'text-orange-500' : 'text-muted-foreground'
            }`} />
            <div>
              <p className="text-xs font-medium">Area Crowd</p>
              <p className="text-xs text-muted-foreground capitalize">{attendeeContext.crowdDensity}</p>
            </div>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Peak hours: <span className="font-medium text-foreground">{attendeeContext.peakHours}</span></span>
        </div>

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
                  <span>Nearest Metro: <span className="font-medium text-foreground">{connectivity.nearest_metro}</span></span>
                </div>
              )}
              {connectivity.nearest_railway_station && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Train className="w-3 h-3" />
                  <span>Railway: <span className="font-medium text-foreground">{connectivity.nearest_railway_station}</span></span>
                </div>
              )}
              {connectivity.nearest_bus_stops && connectivity.nearest_bus_stops.length > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Car className="w-3 h-3" />
                  <span>Bus Stops: {connectivity.nearest_bus_stops.slice(0, 2).join(', ')}</span>
                </div>
              )}
              {connectivity.distance_to_airport && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Navigation className="w-3 h-3" />
                  <span>Airport: {connectivity.distance_to_airport}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Food Options Nearby */}
        {attendeeContext.foodOptions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-primary" />
              Food Nearby
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {attendeeContext.foodOptions.map((food) => (
                <Badge key={food} variant="outline" className="text-xs">
                  {food}
                </Badge>
              ))}
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
                <Badge key={landmark.name} variant="secondary" className="text-xs">
                  {landmark.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Attendee Tips */}
        {attendeeContext.tips.length > 0 && (
          <div className="space-y-2 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="text-sm font-medium flex items-center gap-1.5 text-amber-800 dark:text-amber-200">
              <Lightbulb className="w-3.5 h-3.5" />
              Tips for Attendees
            </h4>
            <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
              {attendeeContext.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

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
                  <Badge variant="outline" className="text-xs hover:bg-secondary/80">
                    {nearby}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA to Locality Page */}
        <div className="pt-2 flex items-center justify-between">
          <Link 
            to={`/jaipur/${localityData.slug}`}
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            Full {locality} Guide →
          </Link>
          <Link 
            to={`/events/in/${localityData.slug}`}
            className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
          >
            More events here →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventLocalityInsights;
