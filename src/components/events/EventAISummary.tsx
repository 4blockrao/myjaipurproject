import { Calendar, MapPin, Ticket, Users, Building } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EventAISummaryProps {
  event: {
    title: string;
    description?: string | null;
    start_date: string;
    end_date?: string | null;
    venue_name?: string | null;
    venue_address?: string | null;
    locality?: string | null;
    city?: string | null;
    is_online?: boolean | null;
    online_url?: string | null;
    is_free?: boolean | null;
    ticket_price?: number | null;
    max_tickets?: number | null;
    tickets_sold?: number | null;
    organizer_name?: string | null;
    category: string;
  };
}

/**
 * AI-Friendly Summary Section
 * Uses neutral, factual language optimized for Google Discover and AI assistants
 * Contains: Who, What, When, Where, Tickets
 */
export const EventAISummary = ({ event }: EventAISummaryProps) => {
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const location = event.is_online 
    ? 'Online Event' 
    : `${event.venue_name || 'Venue TBA'}${event.venue_address ? `, ${event.venue_address}` : ''}${event.locality ? `, ${event.locality}` : ''}${event.city ? `, ${event.city}` : ', Jaipur'}`;
  
  const ticketsAvailable = event.max_tickets 
    ? event.max_tickets - (event.tickets_sold || 0) 
    : null;

  return (
    <Card className="bg-muted/30 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <span className="text-lg">📋</span>
          Event Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* WHO */}
        <div className="flex items-start gap-3">
          <Building className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <span className="font-medium text-muted-foreground">Organizer: </span>
            <span>{event.organizer_name || 'JaipurCircle'}</span>
          </div>
        </div>

        {/* WHAT */}
        <div className="flex items-start gap-3">
          <Users className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <span className="font-medium text-muted-foreground">Event: </span>
            <span>{event.title} ({event.category})</span>
          </div>
        </div>

        {/* WHEN */}
        <div className="flex items-start gap-3">
          <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <span className="font-medium text-muted-foreground">Date & Time: </span>
            <span>
              {format(startDate, 'EEEE, MMMM d, yyyy')} at {format(startDate, 'h:mm a')}
              {endDate && ` - ${format(endDate, 'h:mm a')}`}
            </span>
          </div>
        </div>

        {/* WHERE */}
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <span className="font-medium text-muted-foreground">Location: </span>
            <span>{location}</span>
          </div>
        </div>

        {/* TICKETS */}
        <div className="flex items-start gap-3">
          <Ticket className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <span className="font-medium text-muted-foreground">Tickets: </span>
            <span>
              {event.is_free ? 'Free entry' : `₹${event.ticket_price}`}
              {ticketsAvailable !== null && ticketsAvailable > 0 && (
                <span className="text-muted-foreground"> • {ticketsAvailable} spots remaining</span>
              )}
              {ticketsAvailable !== null && ticketsAvailable <= 0 && (
                <span className="text-destructive"> • Sold out</span>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventAISummary;
