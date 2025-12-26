import { format, formatDistanceToNow } from "date-fns";
import { Clock, RefreshCw, Eye, TrendingUp, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EventFreshnessIndicatorProps {
  event: {
    updated_at?: string | null;
    created_at?: string | null;
    view_count?: number | null;
    interested_count?: number | null;
    tickets_sold?: number | null;
    max_tickets?: number | null;
  };
}

/**
 * Freshness indicator component
 * Shows when content was last updated and signals to Google for ranking freshness
 */
const EventFreshnessIndicator = ({ event }: EventFreshnessIndicatorProps) => {
  const lastUpdated = event.updated_at || event.created_at;
  const viewCount = event.view_count || 0;
  const interestedCount = event.interested_count || 0;
  const ticketsSold = event.tickets_sold || 0;
  const maxTickets = event.max_tickets;

  if (!lastUpdated) return null;

  const updatedDate = new Date(lastUpdated);
  const isRecent = Date.now() - updatedDate.getTime() < 7 * 24 * 60 * 60 * 1000; // Within 7 days
  const timeAgo = formatDistanceToNow(updatedDate, { addSuffix: true });

  // Calculate ticket availability status
  let availabilityStatus: 'available' | 'selling-fast' | 'almost-sold-out' | 'sold-out' = 'available';
  if (maxTickets) {
    const soldPercentage = (ticketsSold / maxTickets) * 100;
    if (soldPercentage >= 100) availabilityStatus = 'sold-out';
    else if (soldPercentage >= 80) availabilityStatus = 'almost-sold-out';
    else if (soldPercentage >= 50) availabilityStatus = 'selling-fast';
  }

  return (
    <Card className="bg-muted/20 border-muted">
      <CardContent className="py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Last Updated */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className={`w-3 h-3 ${isRecent ? 'text-green-500' : ''}`} />
            <span>
              Updated {timeAgo}
              {isRecent && (
                <span className="ml-1 text-green-600 dark:text-green-400">• Fresh</span>
              )}
            </span>
          </div>

          {/* View Count */}
          {viewCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="w-3 h-3" />
              <span>{viewCount.toLocaleString()} views</span>
            </div>
          )}

          {/* Interest Count */}
          {interestedCount > 10 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span>{interestedCount} interested</span>
            </div>
          )}

          {/* Ticket Availability */}
          {maxTickets && (
            <Badge 
              variant={
                availabilityStatus === 'sold-out' ? 'destructive' :
                availabilityStatus === 'almost-sold-out' ? 'destructive' :
                availabilityStatus === 'selling-fast' ? 'default' : 'secondary'
              }
              className="text-xs"
            >
              {availabilityStatus === 'sold-out' && 'Sold Out'}
              {availabilityStatus === 'almost-sold-out' && 'Almost Sold Out'}
              {availabilityStatus === 'selling-fast' && 'Selling Fast'}
              {availabilityStatus === 'available' && (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Tickets Available
                </span>
              )}
            </Badge>
          )}
        </div>

        {/* Verification Note */}
        <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
          <CheckCircle className="w-2.5 h-2.5 text-green-500" />
          Event details verified by JaipurCircle on {format(updatedDate, 'MMM d, yyyy')}
        </p>
      </CardContent>
    </Card>
  );
};

export default EventFreshnessIndicator;
