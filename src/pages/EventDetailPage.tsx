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
// New SEO-first components
import EventQuickSummary from "@/components/events/EventQuickSummary";
import EventVenueSection from "@/components/events/EventVenueSection";
import EventScheduleSection from "@/components/events/EventScheduleSection";
import EventEntryRules from "@/components/events/EventEntryRules";
import EventPastBanner from "@/components/events/EventPastBanner";

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
  
  // Check if event is in the past
  const isPastEvent = startDate < new Date();
  
  // Calculate duration in hours and minutes
  const getDuration = () => {
    if (!endDate) return null;
    const diffMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} hr`;
    return `${hours} hr ${minutes} min`;
  };
  const duration = getDuration();

  // SEO-Optimized H1: {Event Name} Jaipur {Year} — Date, Venue, Ticket Price, Timing & Booking Info
  const h1Title = `${event.title} Jaipur ${eventYear} — Date, Venue, Ticket Price, Timing & Booking Info`;

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
        {/* HERO BLOCK - Cover Image with Essential Above-the-Fold Elements */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9]">
          <img
            src={event.cover_image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop"}
            alt={`${event.title} - ${event.category} event in ${city} ${eventYear}`}
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
              {isPastEvent && (
                <Badge variant="secondary" className="bg-muted-foreground/50">Past Event</Badge>
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

        {/* Content - SEO-First Block Order */}
        <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <EventBreadcrumb event={event} />

          {/* H1 Title - SEO-Optimized Long Format */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
              {h1Title}
            </h1>
            
            {/* Trending Signals */}
            <div className="mt-3">
              <EventTrendingSignals event={event} />
            </div>
          </div>

          {/* BLOCK 1: Event Quick Summary (Above Fold - Mandatory) */}
          <EventQuickSummary event={event} />

          {/* Past Event Banner - Show prominently for completed events */}
          {isPastEvent && <EventPastBanner event={event} />}

          {/* BLOCK 2: SEO Intro Block (Intent Optimized) */}
          <EventSEOIntro event={event} />

          {/* BLOCK 3: Ticket Price & Categories */}
          <EventTicketPricing 
            event={event} 
            onGetTickets={() => setShowRegistration(true)} 
          />

          {/* Sticky CTA for Desktop - Only show for future events */}
          {!isPastEvent && (
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
          )}

          {/* BLOCK 4: Venue & Location Intelligence */}
          <EventVenueSection event={event} />

          {/* BLOCK 5: Event Timing & Schedule */}
          <EventScheduleSection event={event} />

          {/* BLOCK 6: Entry Rules & Restrictions */}
          <EventEntryRules event={event} />

          {/* BLOCK 7: Performer / Organizer Section */}
          <EventPerformerSection event={event} />

          {/* BLOCK 8: Event Highlights & Experience */}
          <EventHighlights event={event} />

          {/* Description / About - Full Event Details */}
          {event.description && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold">About {event.title}</h2>
              <div className="prose prose-sm text-muted-foreground whitespace-pre-wrap max-w-none">
                {event.description}
              </div>
            </section>
          )}

          {/* AI-Friendly Summary Section */}
          <EventAISummary event={event} />

          {/* Event Facts Section */}
          <EventFactsSection event={event} />

          {/* Important Information */}
          <EventImportantInfo event={event} />

          {/* Freshness Indicator */}
          <EventFreshnessIndicator event={event} />

          {/* BLOCK 9: Dynamic FAQ Section (Mandatory 6-10 FAQs) */}
          <EventDynamicFAQ 
            locality={event.locality || undefined}
            eventType={event.category.toLowerCase()}
            customFAQs={[
              {
                question: `Is ${event.title} confirmed in Jaipur ${eventYear}?`,
                answer: isPastEvent 
                  ? `Yes, ${event.title} took place in Jaipur on ${format(startDate, 'MMMM d, yyyy')}. The event has been completed.`
                  : `Yes, ${event.title} is confirmed for Jaipur. The event is scheduled for ${format(startDate, 'MMMM d, yyyy')} at ${event.venue_name || 'the venue'}.`
              },
              {
                question: `What are the ticket prices for ${event.title}?`,
                answer: event.is_free 
                  ? `${event.title} is a free event. Registration is required but no ticket purchase is necessary.`
                  : `Tickets for ${event.title} start from ₹${event.ticket_price}. Multiple ticket categories may be available including general admission, VIP, and premium passes.`
              },
              {
                question: `Where is ${event.title} happening in Jaipur?`,
                answer: event.is_online 
                  ? `${event.title} is an online/virtual event. You will receive the joining link after registration.`
                  : `${event.title} is happening at ${event.venue_name || 'the venue'}${event.locality ? ` in ${event.locality}` : ''}, Jaipur.${event.venue_address ? ` Full address: ${event.venue_address}.` : ''}`
              },
              {
                question: `What time does ${event.title} start?`,
                answer: `${event.title} starts on ${format(startDate, 'MMMM d, yyyy')} at ${format(startDate, 'h:mm a')}. Gates/Entry typically opens 30-60 minutes before the scheduled start time.`
              },
              {
                question: `Will VIP passes be available for ${event.title}?`,
                answer: `VIP and premium ticket categories are typically available for major events like ${event.title}. Check the ticket booking section for available categories and pricing.`
              },
              {
                question: `Is seating or standing at ${event.title}?`,
                answer: `The seating arrangement for ${event.title} depends on the venue and ticket category. Check your ticket type for specific seating or standing zone allocation.`
              },
              {
                question: `Is re-entry allowed at ${event.title}?`,
                answer: `Re-entry policies vary by event. Generally, once you exit the venue, re-entry may not be allowed. Check with venue staff for ${event.title} specific policies.`
              },
              {
                question: `Can I get a refund for ${event.title} tickets?`,
                answer: event.is_free 
                  ? `Since ${event.title} is a free event, there is no refund process. Simply update your registration if your plans change.`
                  : `Tickets for ${event.title} are generally non-refundable. If the event is cancelled or rescheduled, refunds will be processed as per the organizer's policy.`
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

          {/* BLOCK 10: Internal Links for SEO (Entity Graph) */}
          <EventInternalLinks event={event} />
        </div>

        {/* Fixed bottom CTA - Mobile - Only show for future events */}
        {!isPastEvent && (
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
        )}

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
