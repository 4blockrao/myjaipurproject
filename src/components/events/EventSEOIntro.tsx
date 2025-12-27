import { format } from 'date-fns';

interface EventSEOIntroProps {
  event: {
    title: string;
    category: string;
    start_date: string;
    end_date?: string | null;
    venue_name?: string | null;
    venue_address?: string | null;
    locality?: string | null;
    city?: string | null;
    organizer_name?: string | null;
    is_free?: boolean | null;
    ticket_price?: number | null;
  };
}

/**
 * Event SEO Intro Block (Intent Optimized)
 * First 3 lines ALWAYS answer: what, where, when, tickets
 * Template: {Event/Artist} is performing live in Jaipur at {Venue}, located in {Locality}. 
 * Here are the complete event details including date, venue, ticket price categories, 
 * timings, seating zones, entry rules and booking information for Jaipur audiences.
 */
export const EventSEOIntro = ({ event }: EventSEOIntroProps) => {
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const city = event.city || 'Jaipur';
  const venue = event.venue_name || 'the venue';
  const locality = event.locality || city;
  const organizer = event.organizer_name || 'the organizer';
  const category = event.category.toLowerCase();
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

  // Format time properly
  const timeText = format(startDate, 'h:mm a');
  const dateText = format(startDate, 'MMMM d, yyyy');
  
  // Price text
  const priceText = event.is_free 
    ? 'free entry (registration required)' 
    : `tickets starting from ₹${event.ticket_price}`;

  // Intent-optimized intro for upcoming events
  const futureIntro = (
    <>
      <strong>{event.title}</strong> is {category.includes('music') || category.includes('concert') ? 'performing live' : 'happening'} in {city} at <strong>{venue}</strong>
      {locality !== city && <>, located in <strong>{locality}</strong></>}. 
      Here are the complete event details including date, venue, ticket price categories, timings, 
      {category.includes('music') || category.includes('concert') ? ' seating zones,' : ''} entry rules and booking information for {city} audiences.
      <br /><br />
      <span className="text-foreground">
        <strong>Date:</strong> {dateText} | <strong>Time:</strong> {timeText}
        {duration && <> | <strong>Duration:</strong> {duration}</>} | <strong>Tickets:</strong> {priceText}
      </span>
      <br /><br />
      Organized by {organizer}, this {category} event offers a {event.is_free ? 'free, open-to-all experience' : 'premium entertainment experience'}. 
      {event.is_free 
        ? ' Register now to secure your spot — walk-ins may be allowed based on availability.' 
        : ' Book early for best seats — limited tickets available.'}
    </>
  );
  
  // Past event intro with archive context
  const pastIntro = (
    <>
      <strong>{event.title}</strong> was a {category} event that took place in {city} at <strong>{venue}</strong>
      {locality !== city && <> in <strong>{locality}</strong></>} on {dateText}. 
      Organized by {organizer}, this event {event.is_free ? 'offered free entry' : `had tickets from ₹${event.ticket_price} onwards`}.
      <br /><br />
      <span className="text-muted-foreground italic">
        This event has ended. The page is preserved for historical reference and will be updated 
        if {event.title} returns to {city}. Explore similar upcoming {category} events below.
      </span>
    </>
  );

  return (
    <section className="py-4 space-y-2" aria-label="Event Overview">
      <h2 className="sr-only">Event Overview</h2>
      <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
        {isPastEvent ? pastIntro : futureIntro}
      </p>
    </section>
  );
};

export default EventSEOIntro;
