import { format } from 'date-fns';
import { 
  Calendar, Clock, MapPin, Ticket, User, Tag, 
  Building2, Users, Armchair, CreditCard, Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EventQuickSummaryProps {
  event: {
    title: string;
    category: string;
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
    organizer_email?: string | null;
    status?: string | null;
    registration_url?: string | null;
    tags?: string[] | null;
  };
}

/**
 * Event Quick Summary - Above Fold Essential Info
 * This appears BEFORE body content for maximum SEO impact
 * Displays: Event Name, Performer, Type, Status, City, Venue, Locality, 
 * Date, Time, Price Range, Categories, Booking Platform, Seating Type, Suitable For
 */
export const EventQuickSummary = ({ event }: EventQuickSummaryProps) => {
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const isPastEvent = startDate < new Date();
  const city = event.city || 'Jaipur';
  
  // Determine event status
  const getEventStatus = () => {
    if (isPastEvent) return { label: 'Completed', color: 'bg-muted text-muted-foreground' };
    if (event.status === 'cancelled') return { label: 'Cancelled', color: 'bg-destructive text-destructive-foreground' };
    if (event.status === 'postponed') return { label: 'Postponed', color: 'bg-orange-500 text-white' };
    return { label: 'Upcoming', color: 'bg-green-600 text-white' };
  };

  // Determine seating type based on category
  const getSeatingType = () => {
    const category = event.category.toLowerCase();
    if (category.includes('concert') || category.includes('music')) return 'Standing + Seating';
    if (category.includes('comedy') || category.includes('theatre')) return 'Seated';
    if (category.includes('festival') || category.includes('nightlife')) return 'Standing';
    if (category.includes('workshop')) return 'Limited Seating';
    return 'General';
  };

  // Determine audience type
  const getAudienceType = () => {
    const category = event.category.toLowerCase();
    if (category.includes('kids') || category.includes('family')) return 'All Ages, Family Friendly';
    if (category.includes('nightlife') || category.includes('club')) return '21+ Only';
    if (category.includes('comedy')) return '16+ Recommended';
    if (category.includes('workshop')) return 'Adults, Enthusiasts';
    return 'All Ages Welcome';
  };

  // Get ticket categories
  const getTicketCategories = () => {
    if (event.is_free) return ['Free Entry'];
    const categories = ['General Admission'];
    if ((event.ticket_price || 0) > 500) categories.push('VIP/Premium');
    return categories;
  };

  const eventStatus = getEventStatus();

  const summaryFields = [
    {
      icon: <Tag className="w-4 h-4 text-primary" />,
      label: 'Event Name',
      value: event.title,
    },
    {
      icon: <User className="w-4 h-4 text-primary" />,
      label: 'Performer / Headliner',
      value: event.organizer_name || 'Various Artists',
    },
    {
      icon: <Tag className="w-4 h-4 text-primary" />,
      label: 'Event Type',
      value: event.category,
      isBadge: true,
    },
    {
      icon: <Clock className="w-4 h-4 text-primary" />,
      label: 'Status',
      value: eventStatus.label,
      badgeClass: eventStatus.color,
      isBadge: true,
    },
    {
      icon: <Globe className="w-4 h-4 text-primary" />,
      label: 'City',
      value: city,
    },
    {
      icon: <Building2 className="w-4 h-4 text-primary" />,
      label: 'Venue',
      value: event.is_online ? 'Online Event' : (event.venue_name || 'TBA — To Be Announced'),
    },
    {
      icon: <MapPin className="w-4 h-4 text-primary" />,
      label: 'Locality',
      value: event.locality || 'TBA — To Be Announced',
    },
    {
      icon: <Calendar className="w-4 h-4 text-primary" />,
      label: 'Date',
      value: format(startDate, 'EEEE, MMMM d, yyyy'),
    },
    {
      icon: <Clock className="w-4 h-4 text-primary" />,
      label: 'Time',
      value: `${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}`,
    },
    {
      icon: <Ticket className="w-4 h-4 text-primary" />,
      label: 'Ticket Price Range',
      value: event.is_free ? 'Free Entry' : `₹${event.ticket_price} onwards`,
      highlight: true,
    },
    {
      icon: <CreditCard className="w-4 h-4 text-primary" />,
      label: 'Categories',
      value: getTicketCategories().join(', '),
    },
    {
      icon: <Globe className="w-4 h-4 text-primary" />,
      label: 'Booking Platform',
      value: 'JaipurCircle',
    },
    {
      icon: <Armchair className="w-4 h-4 text-primary" />,
      label: 'Seating Type',
      value: getSeatingType(),
    },
    {
      icon: <Users className="w-4 h-4 text-primary" />,
      label: 'Suitable For',
      value: getAudienceType(),
    },
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          Event Quick Info
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {summaryFields.map((field, idx) => (
            <div 
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-lg ${
                field.highlight 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'bg-background/50 border border-border/50'
              }`}
            >
              <span className="mt-0.5 shrink-0">{field.icon}</span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                  {field.label}
                </p>
                {field.isBadge ? (
                  <Badge 
                    variant={field.badgeClass ? undefined : "secondary"} 
                    className={`capitalize ${field.badgeClass || ''}`}
                  >
                    {field.value}
                  </Badge>
                ) : (
                  <p className={`font-medium text-sm ${field.highlight ? 'text-primary' : ''}`}>
                    {field.value}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Related Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {event.tags.slice(0, 8).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventQuickSummary;
