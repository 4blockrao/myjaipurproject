import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Ticket, User, Mail, Phone, Minus, Plus, Calendar, MapPin, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  start_date: string;
  venue_name?: string;
  venue_address?: string;
  is_online?: boolean;
  is_free?: boolean;
  ticket_price?: number;
  max_tickets?: number;
  tickets_sold?: number;
}

interface EventRegistrationModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EventRegistrationModal = ({ event, open, onOpenChange }: EventRegistrationModalProps) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [ticketCount, setTicketCount] = useState(1);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        // Pre-fill email
        setFormData((prev) => ({ ...prev, email: user.email || "" }));
        // Fetch profile for name and phone
        supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setFormData((prev) => ({
                ...prev,
                name: data.full_name || "",
                phone: data.phone || "",
              }));
            }
          });
      }
    });
  }, [open]);

  const availableTickets = event?.max_tickets
    ? event.max_tickets - (event.tickets_sold || 0)
    : 100;

  const totalAmount = event?.is_free ? 0 : (event?.ticket_price || 0) * ticketCount;

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!event) throw new Error("No event selected");

      // Validate form
      if (!formData.name.trim()) throw new Error("Please enter your name");
      if (!formData.email.trim()) throw new Error("Please enter your email");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error("Please enter a valid email");
      }

      // Call edge function for secure registration
      const response = await fetch(
        `https://buwhgxyutfwadazjswio.supabase.co/functions/v1/register-for-event`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_id: event.id,
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim() || null,
            ticket_count: ticketCount,
            user_id: user?.id || null,
            ref_page: window.location.pathname,
            device_type: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      return result.registration;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["event", event?.id] });
      toast.success(
        `Registration successful! Your code: ${data.registration_code}`,
        {
          description: event?.is_free
            ? "You're all set! Show this code at the venue."
            : "Complete payment to confirm your registration.",
          duration: 10000,
        }
      );
      onOpenChange(false);
      // Reset form
      setTicketCount(1);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed");
    },
  });

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            {event.is_free ? "Register for Event" : "Get Tickets"}
          </DialogTitle>
          <DialogDescription>{event.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Summary */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{format(new Date(event.start_date), "EEEE, MMMM d, yyyy • h:mm a")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>
                {event.is_online
                  ? "Online Event"
                  : event.venue_name || event.venue_address || "Venue TBA"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={event.is_free ? "secondary" : "default"}>
                {event.is_free ? "Free Entry" : `₹${event.ticket_price} per ticket`}
              </Badge>
              {availableTickets < 50 && (
                <Badge variant="destructive">{availableTickets} spots left</Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Ticket Quantity */}
          <div className="space-y-2">
            <Label>Number of Tickets</Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                disabled={ticketCount <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-2xl font-bold w-12 text-center">{ticketCount}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTicketCount(Math.min(availableTickets, ticketCount + 1))}
                disabled={ticketCount >= Math.min(10, availableTickets)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Maximum 10 tickets per registration</p>
          </div>

          <Separator />

          {/* Contact Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Order Summary */}
          {!event.is_free && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {ticketCount} × ₹{event.ticket_price}
                  </span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{totalAmount}</span>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={() => registerMutation.mutate()}
            disabled={registerMutation.isPending || availableTickets === 0}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : event.is_free ? (
              "Register Now"
            ) : (
              `Pay ₹${totalAmount}`
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By registering, you agree to receive event updates via email
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationModal;
