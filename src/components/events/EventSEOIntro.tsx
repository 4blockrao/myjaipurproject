import { format } from 'date-fns';

interface EventSEOIntroProps {
  event: {
    title: string;
    category: string;
    start_date: string;
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
  const city = event.city || 'Jaipur';
  const venue = event.venue_name || 'venue';
  const locality = event.locality || '';
  const organizer = event.organizer_name || 'JaipurCircle';
  const category = event.category.toLowerCase();
  const priceText = event.is_free ? 'free entry' : `tickets starting from ₹${event.ticket_price}`;

  // Generate SEO-optimized intro paragraph
  const introText = `${event.title} is a ${category} event happening in ${city} on ${format(startDate, 'MMMM d, yyyy')}. ${venue !== 'venue' ? `The event will be held at ${venue}${locality ? ` in ${locality}` : ''}.` : ''} Organized by ${organizer}, this ${category} experience offers ${priceText}. Book your tickets now for ${event.title} in ${city} and secure your spot at this upcoming ${category} event. ${event.is_free ? 'Registration is free and open to all.' : 'Limited tickets available — early booking recommended.'}`;

  return (
    <section className="py-4" aria-label="Event Overview">
      <h2 className="sr-only">Event Overview</h2>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
        {introText}
      </p>
    </section>
  );
};

export default EventSEOIntro;
