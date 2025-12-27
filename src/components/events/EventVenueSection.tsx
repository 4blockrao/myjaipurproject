import { Link } from 'react-router-dom';
import { 
  MapPin, Building2, Navigation, Car, Train, Bus, 
  Plane, ParkingCircle, Wifi, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EventVenueSectionProps {
  event: {
    venue_name?: string | null;
    venue_address?: string | null;
    locality?: string | null;
    city?: string | null;
    is_online?: boolean | null;
    online_url?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
}

/**
 * Venue & Location Intelligence Block
 * Includes: venue full name, locality, landmark, transport, parking
 * Critical for local SEO and attendee experience
 */
export const EventVenueSection = ({ event }: EventVenueSectionProps) => {
  const city = event.city || 'Jaipur';
  const locality = event.locality || city;
  const localitySlug = locality.toLowerCase().replace(/\s+/g, '-');
  const venueSlug = event.venue_name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';

  // If online event
  if (event.is_online) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Wifi className="w-5 h-5 text-blue-600" />
            Online Event
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This is an online event. You can attend from anywhere with an internet connection.
          </p>
          
          {event.online_url && (
            <a 
              href={event.online_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Join Event Online
            </a>
          )}

          <div className="p-3 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">What You'll Need:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Stable internet connection</li>
              <li>• Desktop/laptop/mobile device</li>
              <li>• Working speakers or headphones</li>
              <li>• Quiet environment (recommended)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get venue description based on name
  const getVenueDescription = () => {
    const name = event.venue_name?.toLowerCase() || '';
    if (name.includes('jecc') || name.includes('convention')) {
      return 'This venue is known for hosting large-scale events, exhibitions, and conferences with excellent infrastructure and high seating capacity.';
    }
    if (name.includes('hotel') || name.includes('resort')) {
      return 'This venue offers a premium event experience with modern amenities, comfortable seating, and hospitality services.';
    }
    if (name.includes('stadium') || name.includes('ground')) {
      return 'This outdoor venue can accommodate large crowds and is suitable for concerts, festivals, and sports events.';
    }
    if (name.includes('club') || name.includes('lounge')) {
      return 'This venue is popular for nightlife and entertainment events with state-of-the-art sound and lighting systems.';
    }
    return 'This venue provides a comfortable setting for events with good facilities and accessibility.';
  };

  // Generate transport info based on locality
  const getTransportInfo = () => {
    const info: { icon: React.ReactNode; label: string; value: string }[] = [];
    
    // These would ideally come from the locality data
    info.push({
      icon: <Train className="w-4 h-4 text-primary" />,
      label: 'Nearest Metro',
      value: 'Jaipur Metro (Check nearest station)'
    });
    
    info.push({
      icon: <Train className="w-4 h-4 text-primary" />,
      label: 'Railway',
      value: 'Jaipur Junction (~15-25 mins)'
    });
    
    info.push({
      icon: <Bus className="w-4 h-4 text-primary" />,
      label: 'Bus',
      value: 'Multiple bus routes available'
    });
    
    info.push({
      icon: <Car className="w-4 h-4 text-primary" />,
      label: 'Cab/Auto',
      value: 'Uber, Ola, local autos available'
    });
    
    info.push({
      icon: <Plane className="w-4 h-4 text-primary" />,
      label: 'Airport',
      value: 'Jaipur International (~20-40 mins)'
    });
    
    info.push({
      icon: <ParkingCircle className="w-4 h-4 text-primary" />,
      label: 'Parking',
      value: 'On-site/nearby parking available'
    });
    
    return info;
  };

  const transportInfo = getTransportInfo();

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Venue & Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Venue Info */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-lg">{event.venue_name || 'Venue TBA'}</h3>
              {event.venue_address && (
                <p className="text-sm text-muted-foreground">{event.venue_address}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {locality}, {city}, Rajasthan
              </p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            The event will take place at <strong>{event.venue_name || 'the venue'}</strong> in {' '}
            <Link to={`/jaipur/${localitySlug}`} className="text-primary hover:underline font-medium">
              {locality}
            </Link>
            , {city}. {getVenueDescription()}
          </p>
        </div>

        {/* Map Placeholder / Link */}
        <div className="rounded-lg overflow-hidden border border-border bg-muted/30">
          <div className="aspect-[16/9] bg-muted flex items-center justify-center">
            <div className="text-center p-4">
              <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                {event.venue_name}, {locality}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${event.venue_name || ''} ${event.venue_address || ''} ${locality} ${city}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <Navigation className="w-4 h-4" />
                  Open in Google Maps
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* How to Reach */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            How to Reach
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {transportInfo.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-2 p-2.5 bg-background/50 rounded-lg border border-border/50"
              >
                <span className="mt-0.5 shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
            💡 Arrival Tips
          </h4>
          <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
            <li>• Arrive 30 minutes before event start time</li>
            <li>• Book cabs in advance for peak hours</li>
            <li>• Check parking availability beforehand</li>
            <li>• Keep venue contact saved for emergencies</li>
          </ul>
        </div>

        {/* Internal Links */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          {event.venue_name && (
            <Link to={`/venues/${venueSlug}`}>
              <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                Events at {event.venue_name}
              </Badge>
            </Link>
          )}
          <Link to={`/events/in/${localitySlug}`}>
            <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
              Events in {locality}
            </Badge>
          </Link>
          <Link to={`/jaipur/${localitySlug}`}>
            <Badge variant="outline" className="hover:bg-secondary/80 cursor-pointer">
              About {locality}
            </Badge>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventVenueSection;
