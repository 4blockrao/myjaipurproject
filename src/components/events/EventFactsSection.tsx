import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface EventFactsSectionProps {
  event: {
    title: string;
    start_date: string;
    end_date?: string | null;
    venue_name?: string | null;
    venue_address?: string | null;
    locality?: string | null;
    city?: string | null;
    is_online?: boolean | null;
    is_free?: boolean | null;
    ticket_price?: number | null;
    category: string;
    organizer_name?: string | null;
    max_tickets?: number | null;
    tickets_sold?: number | null;
  };
}

/**
 * Visible Event Facts Section
 * Displays date, time, venue, city, category in a structured format
 * Optimized for Google Events rich results
 */
export const EventFactsSection = ({ event }: EventFactsSectionProps) => {
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const spotsLeft = event.max_tickets ? event.max_tickets - (event.tickets_sold || 0) : null;

  const facts = [
    {
      label: 'Date',
      value: format(startDate, 'MMMM d, yyyy'),
    },
    {
      label: 'Time',
      value: `${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}`,
    },
    {
      label: 'Venue',
      value: event.is_online ? 'Online Event' : (event.venue_name || 'TBA'),
    },
    {
      label: 'City',
      value: event.city || 'Jaipur',
    },
    {
      label: 'Category',
      value: event.category,
      isCategory: true,
    },
    {
      label: 'Price',
      value: event.is_free ? 'Free' : `₹${event.ticket_price}`,
    },
  ];

  return (
    <section className="bg-muted/50 rounded-xl p-4" aria-label="Event Facts">
      <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
        Event Details
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {facts.map((fact) => (
          <div key={fact.label} className="space-y-1">
            <dt className="text-xs text-muted-foreground">{fact.label}</dt>
            <dd className="font-medium text-sm">
              {fact.isCategory ? (
                <Badge variant="outline" className="capitalize">
                  {fact.value}
                </Badge>
              ) : (
                fact.value
              )}
            </dd>
          </div>
        ))}
      </div>
      
      {/* Availability indicator */}
      {spotsLeft !== null && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Availability</span>
            <span className={`font-medium ${spotsLeft <= 10 ? 'text-destructive' : 'text-green-600'}`}>
              {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Sold Out'}
            </span>
          </div>
          {spotsLeft > 0 && event.max_tickets && (
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((event.tickets_sold || 0) / event.max_tickets) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default EventFactsSection;
