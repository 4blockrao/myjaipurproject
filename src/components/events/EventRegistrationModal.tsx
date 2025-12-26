import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
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
import { Ticket, User as UserIcon, Mail, Phone, Minus, Plus, Calendar, MapPin, Loader2, LogIn } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

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
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [ticketCount, setTicketCount] = useState(1);

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setFormData((prev) => ({ ...prev, email: user.email || "" }));
        // Fetch profile for name and phone
        const { data } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .single();
        if (data) {
          setFormData((prev) => ({
            ...prev,
            name: data.full_name || "",
            phone: data.phone || "",
          }));
        }
      }
      setIsCheckingAuth(false);
    };

    if (open) {
      checkAuth();
    }
  }, [open]);

  const availableTickets = event?.max_tickets
    ? event.max_tickets - (event.tickets_sold || 0)
    : 100;

  const totalAmount = event?.is_free ? 0 : (event?.ticket_price || 0) * ticketCount;

  const [existingRegistration, setExistingRegistration] = useState<{
    registration_code: string;
    ticket_count: number;
    status: string;
  } | null>(null);

  // Check for existing registration when modal opens, reset when closes
  useEffect(() => {
    const checkExistingRegistration = async () => {
      if (!user || !event) return;
      
      const { data } = await supabase
        .from("event_registrations")
        .select("registration_code, ticket_count, status")
        .eq("event_id", event.id)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data) {
        setExistingRegistration(data);
      }
    };
    
    if (open && user && event) {
      checkExistingRegistration();
    } else if (!open) {
      setExistingRegistration(null);
    }
  }, [open, user, event]);

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!event) throw new Error("No event selected");
      if (!user) throw new Error("Please sign in to register");

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
            user_id: user.id,
            ref_page: window.location.pathname,
            device_type: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Check if it's a duplicate registration error
        if (result.error?.includes("already registered")) {
          // Refresh existing registration data
          const { data } = await supabase
            .from("event_registrations")
            .select("registration_code, ticket_count, status")
            .eq("event_id", event.id)
            .eq("user_id", user.id)
            .maybeSingle();
          
          if (data) {
            setExistingRegistration(data);
          }
          throw new Error("ALREADY_REGISTERED");
        }
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
      setTicketCount(1);
    },
    onError: (error: Error) => {
      if (error.message === "ALREADY_REGISTERED") {
        // Don't show error toast, the UI will show existing registration
        return;
      }
      toast.error(error.message || "Registration failed");
    },
  });

  if (!event) return null;

  // Show login prompt if user is not authenticated
  if (!isCheckingAuth && !user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-primary" />
              Sign In Required
            </DialogTitle>
            <DialogDescription>
              Please sign in to register for this event
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Event Summary */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h3 className="font-semibold">{event.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(event.start_date), "EEEE, MMMM d, yyyy • h:mm a")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {event.is_online
                    ? "Online Event"
                    : event.venue_name || event.venue_address || "Venue TBA"}
                </span>
              </div>
              <Badge variant={event.is_free ? "secondary" : "default"}>
                {event.is_free ? "Free Entry" : `₹${event.ticket_price} per ticket`}
              </Badge>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Create an account or sign in to register for events, save your favorites, and get personalized recommendations.
              </p>
              
              <div className="flex flex-col gap-2">
                <Link to={`/auth?redirect=${encodeURIComponent(window.location.pathname)}`} onClick={() => onOpenChange(false)}>
                  <Button className="w-full" size="lg">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In / Create Account
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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

        {isCheckingAuth ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : existingRegistration ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Ticket className="w-5 h-5" />
                <span className="font-semibold">You're already registered!</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration Code:</span>
                  <span className="font-mono font-bold">{existingRegistration.registration_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tickets:</span>
                  <span>{existingRegistration.ticket_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={existingRegistration.status === 'confirmed' ? 'default' : 'secondary'}>
                    {existingRegistration.status}
                  </Badge>
                </div>
              </div>
            </div>

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
            </div>

            <Button className="w-full" variant="outline" onClick={() => onOpenChange(false)}>
              Got it, thanks!
            </Button>
          </div>
        ) : (
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
                  <UserIcon className="w-4 h-4" />
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
                  disabled={!!user?.email}
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationModal;
