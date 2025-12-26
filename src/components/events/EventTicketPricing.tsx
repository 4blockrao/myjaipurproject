import { Ticket, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EventTicketPricingProps {
  event: {
    is_free?: boolean | null;
    ticket_price?: number | null;
    max_tickets?: number | null;
    tickets_sold?: number | null;
    registration_url?: string | null;
  };
  onGetTickets?: () => void;
}

/**
 * Ticket Pricing Block
 * Required for SERP trust and commercial intent validation
 * Shows price range, booking source, pass categories, refund policy
 */
export const EventTicketPricing = ({ event, onGetTickets }: EventTicketPricingProps) => {
  const spotsLeft = event.max_tickets 
    ? event.max_tickets - (event.tickets_sold || 0) 
    : null;
  const isSoldOut = spotsLeft !== null && spotsLeft <= 0;
  const isLowAvailability = spotsLeft !== null && spotsLeft <= 20 && spotsLeft > 0;

  // Generate ticket categories based on price
  const ticketCategories = event.is_free
    ? [{ name: 'Free Entry', price: 0, available: true }]
    : [
        { name: 'General Admission', price: event.ticket_price || 0, available: !isSoldOut },
        { name: 'VIP / Premium', price: (event.ticket_price || 0) * 2, available: !isSoldOut, note: 'If available' },
      ];

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" />
          Ticket Information & Pricing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Range */}
        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
          <span className="text-sm text-muted-foreground">Price Range</span>
          <span className="font-bold text-lg">
            {event.is_free ? (
              <Badge className="bg-green-600 text-white">Free Entry</Badge>
            ) : (
              `₹${event.ticket_price} onwards`
            )}
          </span>
        </div>

        {/* Ticket Categories */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Pass Categories</h4>
          {ticketCategories.map((cat, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-background/30"
            >
              <div className="flex items-center gap-2">
                {cat.available ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
                <span className="text-sm font-medium">{cat.name}</span>
                {cat.note && (
                  <span className="text-xs text-muted-foreground">({cat.note})</span>
                )}
              </div>
              <span className="font-semibold">
                {cat.price === 0 ? 'Free' : `₹${cat.price}`}
              </span>
            </div>
          ))}
        </div>

        {/* Availability Status */}
        {spotsLeft !== null && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            isSoldOut 
              ? 'bg-destructive/10 text-destructive' 
              : isLowAvailability 
                ? 'bg-orange-500/10 text-orange-600' 
                : 'bg-green-600/10 text-green-600'
          }`}>
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isSoldOut 
                ? 'Sold Out' 
                : isLowAvailability 
                  ? `Only ${spotsLeft} spots remaining!` 
                  : `${spotsLeft} spots available`}
            </span>
          </div>
        )}

        {/* Booking Info */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Booking Source</span>
            <span className="font-medium">JaipurCircle</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Refund Policy</span>
            <span className="font-medium">Non-refundable</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ticket Type</span>
            <span className="font-medium">E-Ticket</span>
          </div>
        </div>

        {/* CTA Button */}
        {!isSoldOut && (
          <Button 
            size="lg" 
            className="w-full gap-2 mt-2"
            onClick={onGetTickets}
          >
            <Ticket className="w-5 h-5" />
            {event.is_free ? 'Register Now — Free' : `Book Tickets — ₹${event.ticket_price}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EventTicketPricing;
