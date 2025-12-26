import { format } from 'date-fns';

interface EventSEOIntroProps {
  event: {
    title: string;
    category: string;
    start_date: string;
    end_date?: string | null;
    venue_name?: string | null;
    locality?: string | null;
    city?: string | null;
    organizer_name?: string | null;
    is_free?: boolean | null;
    ticket_price?: number | null;
  };
}

/**
 * Event SEO Intro Block (100-150 words)
 * Purpose: Establish relevance & entity context
 * Must include: Event name, City, Venue, Performer/Category keywords
 * Factual, scan-friendly, no storytelling
 */
export const EventSEOIntro = ({ event }: EventSEOIntroProps) => {
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const city = event.city || 'Jaipur';
  const venue = event.venue_name || 'venue';
  const locality = event.locality || '';
  const organizer = event.organizer_name || 'JaipurCircle';
  const category = event.category.toLowerCase();
  const priceText = event.is_free ? 'free entry' : `tickets from ₹${event.ticket_price} onwards`;
  const isPastEvent = startDate < new Date();
  
  // Calculate duration
  const getDuration = () => {
    if (!endDate) return null;
    const diffMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${hours} hours`;
    return `${hours} hours ${minutes} minutes`;
  };
  const duration = getDuration();

  // Format time properly (e.g., "6:30 PM")
  const timeText = format(startDate, 'h:mm a');
  
  // Generate SEO-optimized intro paragraph
  const futureIntro = `${event.title} is a ${category} event in ${city} on ${format(startDate, 'MMMM d, yyyy')} at ${timeText}. ${venue !== 'venue' ? `The ${duration ? `${duration} ` : ''}show will be held at ${venue}${locality ? ` in ${locality}` : ''}.` : ''} Organized by ${organizer}, this ${category} experience offers ${priceText}. Book your tickets now for ${event.title} in ${city} and secure your spot. ${event.is_free ? 'Registration is free and open to all.' : 'Limited tickets available — early booking recommended.'}`;
  
  const pastIntro = `${event.title} was a ${category} event that took place in ${city} on ${format(startDate, 'MMMM d, yyyy')}. ${venue !== 'venue' ? `The event was held at ${venue}${locality ? ` in ${locality}` : ''}.` : ''} Organized by ${organizer}, this ${category} experience ${event.is_free ? 'offered free entry' : `had tickets starting from ₹${event.ticket_price}`}. Explore similar upcoming ${category} events in ${city} below.`;

  return (
    <section className="py-4" aria-label="Event Overview">
      <h2 className="sr-only">Event Overview</h2>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
        {isPastEvent ? pastIntro : futureIntro}
      </p>
    </section>
  );
};

export default EventSEOIntro;
