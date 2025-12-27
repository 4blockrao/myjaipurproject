import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Clock, Calendar, Users, Star, ChevronRight, History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EventPastBannerProps {
  event: {
    title: string;
    start_date: string;
    end_date?: string | null;
    venue_name?: string | null;
    locality?: string | null;
    city?: string | null;
    category: string;
    interested_count?: number | null;
    view_count?: number | null;
    organizer_name?: string | null;
  };
}

/**
 * Past Event Banner & Archive Section
 * Converts past events into AUTHORITY PAGES
 * Shows: date completed, crowd estimate, highlights, "updated if returns" note
 */
export const EventPastBanner = ({ event }: EventPastBannerProps) => {
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const city = event.city || 'Jaipur';
  const organizerSlug = event.organizer_name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
  const categorySlug = event.category.toLowerCase().replace(/\s+/g, '-');

  // Estimate crowd based on interest count
  const getCrowdEstimate = () => {
    const interested = event.interested_count || 0;
    if (interested > 500) return '1000+ attendees';
    if (interested > 200) return '500+ attendees';
    if (interested > 100) return '200+ attendees';
    if (interested > 50) return '100+ attendees';
    return 'Good turnout';
  };

  return (
    <Card className="border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
      <CardContent className="p-5 space-y-4">
        {/* Status Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className="bg-amber-600 text-white hover:bg-amber-700">
            <History className="w-3 h-3 mr-1" />
            Event Completed
          </Badge>
          <span className="text-sm text-muted-foreground">
            This event has ended
          </span>
        </div>

        {/* Event Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">
              Held on {format(startDate, 'MMMM d, yyyy')} at {format(startDate, 'h:mm a')}
            </span>
          </div>
          
          {event.venue_name && (
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Star className="w-4 h-4" />
              <span>Venue: {event.venue_name}, {event.locality || city}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Users className="w-4 h-4" />
            <span>Estimated attendance: {getCrowdEstimate()}</span>
          </div>
        </div>

        {/* Experience Recap */}
        <div className="p-3 bg-white/50 dark:bg-background/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <h4 className="font-medium mb-2 text-amber-800 dark:text-amber-200">Event Highlights</h4>
          <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
            <li>• {event.category} experience in {city}</li>
            <li>• {event.interested_count || 0} people showed interest</li>
            <li>• {event.view_count || 0} page views</li>
            {event.organizer_name && <li>• Organized by {event.organizer_name}</li>}
          </ul>
        </div>

        {/* Update Notice */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <Clock className="w-4 h-4 inline mr-1" />
            <strong>Note:</strong> This page will be updated if this event returns in the future. 
            Check back for announcements or follow the organizer.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Link to={`/events/category/${categorySlug}`}>
            <Button variant="outline" size="sm" className="gap-1">
              <ChevronRight className="w-3 h-3" />
              More {event.category} Events
            </Button>
          </Link>
          
          {event.organizer_name && (
            <Link to={`/organizers/${organizerSlug}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                <ChevronRight className="w-3 h-3" />
                Events by {event.organizer_name}
              </Button>
            </Link>
          )}
          
          <Link to="/events/past">
            <Button variant="ghost" size="sm" className="gap-1">
              <History className="w-3 h-3" />
              Past Events Archive
            </Button>
          </Link>
        </div>

        {/* SEO Text */}
        <p className="text-xs text-amber-600 dark:text-amber-400 italic pt-2 border-t border-amber-200 dark:border-amber-800">
          Looking for "{event.title}"? This {event.category.toLowerCase()} event was held at 
          {' '}{event.venue_name || 'a venue'} in {event.locality || city} on {format(startDate, 'MMMM d, yyyy')}. 
          Discover similar upcoming events in {city}.
        </p>
      </CardContent>
    </Card>
  );
};

export default EventPastBanner;
