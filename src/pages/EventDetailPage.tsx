import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Globe,
  Heart,
  Share2,
  Ticket,
  Users,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { EventSEO } from "@/components/events/EventSEO";
import EventRegistrationModal from "@/components/events/EventRegistrationModal";
import { EventAISummary } from "@/components/events/EventAISummary";
import { EventFactsSection } from "@/components/events/EventFactsSection";
import { EventInternalLinks } from "@/components/events/EventInternalLinks";

const EventDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [isInterested, setIsInterested] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;

      // Increment view count
      supabase.rpc("increment_event_views", { event_id: data.id });

      return data;
    },
    enabled: !!slug,
  });

  // Check if user is interested
  useQuery({
    queryKey: ["event-interest", event?.id, user?.id],
    queryFn: async () => {
      if (!user || !event) return null;
      const { data } = await supabase
        .from("event_interests")
        .select("id")
        .eq("event_id", event.id)
        .eq("user_id", user.id)
        .single();
      setIsInterested(!!data);
      return data;
    },
    enabled: !!user && !!event,
  });

  const toggleInterest = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast.error("Please sign in to mark interest");
        return;
      }
      if (isInterested) {
        await supabase
          .from("event_interests")
          .delete()
          .eq("event_id", event!.id)
          .eq("user_id", user.id);
      } else {
        await supabase.from("event_interests").insert({
          event_id: event!.id,
          user_id: user.id,
        });
      }
    },
    onSuccess: () => {
      setIsInterested(!isInterested);
      queryClient.invalidateQueries({ queryKey: ["event", slug] });
      toast.success(isInterested ? "Removed from interested" : "Marked as interested!");
    },
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.short_description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Skeleton className="aspect-[16/9] w-full" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Event not found</h1>
          <Link to="/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;

  return (
    <>
      <EventSEO event={event} />

      <div className="min-h-screen bg-background pb-32">
        {/* Cover Image */}
        <div className="relative aspect-[16/9]">
          <img
            src={event.cover_image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop"}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Back button */}
          <Link to="/events" className="absolute top-4 left-4">
            <Button variant="secondary" size="icon" className="rounded-full bg-background/80 backdrop-blur-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          {/* Share button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5" />
          </Button>

          {/* Date badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 text-center min-w-[60px]">
              <span className="text-2xl font-bold text-primary block">{format(startDate, "d")}</span>
              <span className="text-xs text-muted-foreground">{format(startDate, "MMM")}</span>
            </div>
            {event.is_featured && (
              <Badge className="bg-primary text-primary-foreground">Featured</Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Title & Category */}
          <div>
            <Badge variant="outline" className="mb-2 capitalize">
              {event.category}
            </Badge>
            <h1 className="text-2xl font-bold">{event.title}</h1>
          </div>

          {/* Quick Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">{format(startDate, "EEEE, MMMM d, yyyy")}</p>
                <p className="text-sm text-muted-foreground">
                  {format(startDate, "h:mm a")}
                  {endDate && ` - ${format(endDate, "h:mm a")}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              {event.is_online ? (
                <>
                  <Globe className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Online Event</p>
                    {event.online_url && (
                      <a
                        href={event.online_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary flex items-center gap-1"
                      >
                        Join Event <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{event.venue_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.venue_address}
                      {event.locality && `, ${event.locality}`}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Ticket className="w-5 h-5 text-primary" />
              <p className="font-medium">
                {event.is_free ? "Free Entry" : `₹${event.ticket_price}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                {event.interested_count} interested
                {event.max_tickets && ` • ${event.max_tickets - (event.tickets_sold || 0)} spots left`}
              </p>
            </div>
          </div>

          {/* AI-Friendly Summary Section */}
          <EventAISummary event={event} />

          {/* Event Facts Section */}
          <EventFactsSection event={event} />

          {/* Description */}
          {event.description && (
            <div>
              <h2 className="font-semibold mb-2">About this event</h2>
              <div className="prose prose-sm text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </div>
            </div>
          )}

          {/* Organizer */}
          {event.organizer_name && (
            <div className="p-4 bg-muted/50 rounded-xl">
              <h3 className="font-semibold mb-1">Organized by</h3>
              <p className="text-sm">{event.organizer_name}</p>
              {event.organizer_email && (
                <p className="text-sm text-muted-foreground">{event.organizer_email}</p>
              )}
            </div>
          )}

          {/* Internal Links for SEO */}
          <EventInternalLinks event={event} />
        </div>

        {/* Fixed bottom CTA */}
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border">
          <div className="flex gap-3 max-w-lg mx-auto">
            <Button
              variant={isInterested ? "default" : "outline"}
              size="lg"
              className="gap-2"
              onClick={() => toggleInterest.mutate()}
            >
              <Heart className={`w-5 h-5 ${isInterested ? "fill-current" : ""}`} />
              {isInterested ? "Interested" : "Interest"}
            </Button>
            <Button size="lg" className="flex-1 gap-2" onClick={() => setShowRegistration(true)}>
              <Ticket className="w-5 h-5" />
              {event.is_free ? "Register Free" : `Get Tickets • ₹${event.ticket_price}`}
            </Button>
          </div>
        </div>

        <EventRegistrationModal
          event={event}
          open={showRegistration}
          onOpenChange={setShowRegistration}
        />

        <NativeBottomNav />
      </div>
    </>
  );
};

export default EventDetailPage;
