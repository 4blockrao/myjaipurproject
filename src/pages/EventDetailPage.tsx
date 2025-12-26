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
  MessageCircle,
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
import { EventSchema } from "@/components/seo/SchemaInjector";
import { EventBreadcrumb } from "@/components/events/EventBreadcrumb";
import { EventTrendingSignals } from "@/components/events/EventTrendingSignals";
import EventDynamicFAQ from "@/components/events/EventDynamicFAQ";
import EventSimilarEvents from "@/components/events/EventSimilarEvents";
import EventAlternatives from "@/components/events/EventAlternatives";
import EventLocalityInsights from "@/components/events/EventLocalityInsights";
import EventFreshnessIndicator from "@/components/events/EventFreshnessIndicator";
import EventTicketPricing from "@/components/events/EventTicketPricing";
import EventPerformerSection from "@/components/events/EventPerformerSection";
import EventHighlights from "@/components/events/EventHighlights";
import EventImportantInfo from "@/components/events/EventImportantInfo";
import EventSEOIntro from "@/components/events/EventSEOIntro";

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
  const city = event.city || 'Jaipur';
  const eventYear = format(startDate, 'yyyy');
  const eventMonth = format(startDate, 'MMMM');

  // Transactional H1: {Event Name} — {City} Tickets ({Date / Year})
  const h1Title = `${event.title} — ${city} Tickets (${eventMonth} ${eventYear})`;

  return (
    <>
      <EventSEO event={event} />
      <EventSchema
        title={event.title}
        description={event.description || event.short_description || undefined}
        image={event.cover_image || undefined}
        startDate={event.start_date}
        endDate={event.end_date || undefined}
        venue={event.venue_name || undefined}
        address={event.venue_address || undefined}
        ticketUrl={event.registration_url || undefined}
        price={event.ticket_price || undefined}
        url={`https://www.jaipurcircle.com/events/${event.slug}`}
      />

      <div className="min-h-screen bg-background pb-32">
        {/* Cover Image with Above-the-Fold Elements */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9]">
          <img
            src={event.cover_image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop"}
            alt={`${event.title} - ${event.category} event in ${city}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
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

          {/* Above-the-Fold Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            {/* Category Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary" className="capitalize bg-primary text-primary-foreground">
                {event.category}
              </Badge>
              {event.is_featured && (
                <Badge className="bg-yellow-500 text-black">Featured</Badge>
              )}
              {event.is_free && (
                <Badge className="bg-green-600 text-white">Free Entry</Badge>
              )}
            </div>
            
            {/* Date Badge */}
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center min-w-[50px] sm:min-w-[60px]">
                <span className="text-xl sm:text-2xl font-bold text-primary block">{format(startDate, "d")}</span>
                <span className="text-xs text-muted-foreground">{format(startDate, "MMM")}</span>
              </div>
              <div className="text-white">
                <p className="text-sm sm:text-base font-medium">{format(startDate, "EEEE")}</p>
                <p className="text-xs sm:text-sm text-white/80">{format(startDate, "h:mm a")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <EventBreadcrumb event={event} />

          {/* H1 Title - Transactional Format */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
              {h1Title}
            </h1>
            
            {/* Trending Signals */}
            <div className="mt-3">
              <EventTrendingSignals event={event} />
            </div>
          </div>

          {/* SEO Intro Block */}
          <EventSEOIntro event={event} />

          {/* Quick Info Grid - Above Fold Essential Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date & Time */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
              <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Date & Time</p>
                <p className="font-medium">{format(startDate, "MMMM d, yyyy")}</p>
                <p className="text-sm text-muted-foreground">
                  {format(startDate, "h:mm a")}
                  {endDate && ` - ${format(endDate, "h:mm a")}`}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
              {event.is_online ? (
                <>
                  <Globe className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Venue</p>
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
                  <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Venue</p>
                    <p className="font-medium">{event.venue_name || 'TBA'}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.venue_address}
                      {event.locality && `, ${event.locality}`}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Price */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
              <Ticket className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Tickets</p>
                <p className="font-bold text-lg">
                  {event.is_free ? "Free Entry" : `₹${event.ticket_price} onwards`}
                </p>
              </div>
            </div>

            {/* Interest Count */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
              <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Interest</p>
                <p className="font-medium">
                  {event.interested_count || 0} interested
                </p>
                {event.max_tickets && (
                  <p className="text-sm text-muted-foreground">
                    {event.max_tickets - (event.tickets_sold || 0)} spots left
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sticky CTA for Desktop */}
          <div className="hidden sm:block sticky top-4 z-10">
            <Button 
              size="lg" 
              className="w-full gap-2 shadow-lg"
              onClick={() => setShowRegistration(true)}
            >
              <Ticket className="w-5 h-5" />
              {event.is_free ? 'Register Now — Free' : `Book Tickets — ₹${event.ticket_price}`}
            </Button>
          </div>

          {/* Ticket Pricing Block */}
          <EventTicketPricing 
            event={event} 
            onGetTickets={() => setShowRegistration(true)} 
          />

          {/* AI-Friendly Summary Section */}
          <EventAISummary event={event} />

          {/* Event Facts Section */}
          <EventFactsSection event={event} />

          {/* Description / About */}
          {event.description && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold">About This Event</h2>
              <div className="prose prose-sm text-muted-foreground whitespace-pre-wrap max-w-none">
                {event.description}
              </div>
            </section>
          )}

          {/* Event Highlights & Experience */}
          <EventHighlights event={event} />

          {/* Performer / Organizer Section */}
          <EventPerformerSection event={event} />

          {/* Important Information */}
          <EventImportantInfo event={event} />

          {/* Freshness Indicator */}
          <EventFreshnessIndicator event={event} />

          {/* Dynamic FAQ Section */}
          <EventDynamicFAQ 
            locality={event.locality || undefined}
            eventType={event.category.toLowerCase()}
            customFAQs={[
              {
                question: `How much are ${event.title} tickets?`,
                answer: event.is_free 
                  ? `${event.title} is a free event. Registration is required but no ticket purchase is necessary.`
                  : `Tickets for ${event.title} start from ₹${event.ticket_price}. Premium/VIP passes may be available at higher prices.`
              },
              {
                question: `Where is ${event.title} happening?`,
                answer: event.is_online 
                  ? `${event.title} is an online event. You will receive the joining link after registration.`
                  : `${event.title} is happening at ${event.venue_name || 'the venue'}${event.locality ? ` in ${event.locality}` : ''}, ${city}.${event.venue_address ? ` Address: ${event.venue_address}.` : ''}`
              },
              {
                question: `What time does ${event.title} start?`,
                answer: `${event.title} starts on ${format(startDate, 'MMMM d, yyyy')} at ${format(startDate, 'h:mm a')}. Gates/Entry opens 30 minutes before the scheduled start time.`
              },
              {
                question: `Can I get a refund for ${event.title} tickets?`,
                answer: event.is_free 
                  ? `Since ${event.title} is a free event, there is no refund process. Simply update your registration if your plans change.`
                  : `Tickets for ${event.title} are generally non-refundable. If the event is cancelled or rescheduled, refunds will be processed automatically.`
              },
            ]}
          />

          {/* Similar Events & Past Editions */}
          <EventSimilarEvents 
            currentEventId={event.id}
            venueName={event.venue_name}
            category={event.category}
            locality={event.locality}
          />

          {/* Alternative Events (Intent Rescue) */}
          <EventAlternatives
            currentEventId={event.id}
            eventDate={event.start_date}
            category={event.category}
            locality={event.locality}
            ticketPrice={event.ticket_price}
            isFree={event.is_free}
          />

          {/* Locality Insights for Attendees */}
          <EventLocalityInsights 
            locality={event.locality}
            venueName={event.venue_name}
          />

          {/* Internal Links for SEO */}
          <EventInternalLinks event={event} />
        </div>

        {/* Fixed bottom CTA - Mobile */}
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border sm:hidden">
          <div className="flex gap-2 max-w-lg mx-auto">
            <Button
              variant={isInterested ? "default" : "outline"}
              size="lg"
              className="gap-2 px-3"
              onClick={() => toggleInterest.mutate()}
            >
              <Heart className={`w-5 h-5 ${isInterested ? "fill-current" : ""}`} />
            </Button>
            
            {/* WhatsApp Help Button */}
            <a
              href={`https://wa.me/919999188103?text=${encodeURIComponent(`Hi JaipurCircle Team, I need help with "${event.title}" event.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            
            <Button size="lg" className="flex-1 gap-2" onClick={() => setShowRegistration(true)}>
              <Ticket className="w-5 h-5" />
              {event.is_free ? "Register" : `₹${event.ticket_price}`}
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
