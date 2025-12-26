import { TrendingUp, Users, Eye, Flame, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface EventTrendingSignalsProps {
  event: {
    title: string;
    interested_count?: number | null;
    view_count?: number | null;
    tickets_sold?: number | null;
    max_tickets?: number | null;
    locality?: string | null;
    start_date: string;
    created_at?: string | null;
  };
}

/**
 * Event Activity & Trending Signals
 * Displays social proof indicators that increase trust and engagement
 * Signals: interest count, views, trending status, urgency
 */
export const EventTrendingSignals = ({ event }: EventTrendingSignalsProps) => {
  const interestedCount = event.interested_count || 0;
  const viewCount = event.view_count || 0;
  const ticketsSold = event.tickets_sold || 0;
  const maxTickets = event.max_tickets;
  const locality = event.locality || 'Jaipur';
  
  // Calculate trending status
  const isTrending = interestedCount > 20 || viewCount > 100;
  const isHot = interestedCount > 50 || viewCount > 500;
  const isSellingFast = maxTickets && ticketsSold / maxTickets > 0.7;
  
  // Time until event
  const startDate = new Date(event.start_date);
  const timeUntilEvent = formatDistanceToNow(startDate, { addSuffix: true });
  const isUpcoming = startDate > new Date();

  const signals = [
    ...(isHot ? [{
      icon: Flame,
      label: 'Hot Event',
      value: `${interestedCount}+ interested`,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
    }] : []),
    ...(isTrending && !isHot ? [{
      icon: TrendingUp,
      label: 'Trending',
      value: `Popular in ${locality}`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    }] : []),
    ...(isSellingFast ? [{
      icon: Clock,
      label: 'Selling Fast',
      value: `${maxTickets! - ticketsSold} spots left`,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
    }] : []),
  ];

  if (signals.length === 0 && interestedCount < 5) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Trending badges */}
      {signals.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {signals.map((signal, index) => (
            <Badge 
              key={index}
              variant="secondary"
              className={`${signal.bgColor} ${signal.color} border-0 gap-1.5`}
            >
              <signal.icon className="w-3.5 h-3.5" />
              {signal.value}
            </Badge>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {interestedCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{interestedCount} interested</span>
          </div>
        )}
        {viewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>{viewCount} views</span>
          </div>
        )}
        {isUpcoming && (
          <div className="flex items-center gap-1.5 text-primary">
            <Clock className="w-4 h-4" />
            <span>{timeUntilEvent}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Compact Trending Badge for Cards
 */
export const EventTrendingBadge = ({ 
  interestedCount = 0, 
  viewCount = 0 
}: { 
  interestedCount?: number; 
  viewCount?: number;
}) => {
  const isTrending = interestedCount > 20 || viewCount > 100;
  const isHot = interestedCount > 50 || viewCount > 500;

  if (!isTrending && !isHot) return null;

  if (isHot) {
    return (
      <Badge className="bg-orange-500 text-white gap-1">
        <Flame className="w-3 h-3" />
        Hot
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-primary/10 text-primary gap-1">
      <TrendingUp className="w-3 h-3" />
      Trending
    </Badge>
  );
};

export default EventTrendingSignals;
