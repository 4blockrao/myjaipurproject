import { Helmet } from "react-helmet-async";
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface EventDynamicFAQProps {
  locality?: string;
  eventType?: string;
  customFAQs?: FAQItem[];
  // New: event-specific data for better FAQs
  event?: {
    title: string;
    start_date: string;
    venue_name?: string | null;
    locality?: string | null;
    city?: string | null;
    is_free?: boolean | null;
    ticket_price?: number | null;
    organizer_name?: string | null;
    category?: string;
  };
}

const generateEventSpecificFAQs = (event: NonNullable<EventDynamicFAQProps['event']>): FAQItem[] => {
  const city = event.city || 'Jaipur';
  const venue = event.venue_name || 'the venue';
  const locality = event.locality || city;
  const category = event.category?.toLowerCase() || 'event';
  const startDate = new Date(event.start_date);
  const dateText = format(startDate, 'MMMM d, yyyy');
  const timeText = format(startDate, 'h:mm a');
  const year = format(startDate, 'yyyy');

  const faqs: FAQItem[] = [
    {
      question: `Is ${event.title} confirmed in ${city}?`,
      answer: `Yes, ${event.title} is confirmed to take place on ${dateText} at ${venue} in ${locality}, ${city}. The event status is "scheduled" and tickets ${event.is_free ? 'registration' : 'are available'} through JaipurCircle.`
    },
    {
      question: `Where will ${event.title} happen?`,
      answer: `${event.title} will be held at ${venue}${locality !== city ? ` in ${locality}` : ''}, ${city}, Rajasthan. The venue is accessible by metro, bus, cab, and private vehicle. Parking is available nearby.`
    },
    {
      question: `What are the ticket price categories for ${event.title}?`,
      answer: event.is_free 
        ? `${event.title} is a FREE event. No ticket purchase is required, but registration is mandatory to secure your spot. Walk-ins may be allowed based on availability.`
        : `Ticket prices for ${event.title} start from ₹${event.ticket_price}. Categories typically include General Admission and VIP/Premium passes (if available). Early booking is recommended as prices may increase.`
    },
    {
      question: `Will VIP passes be available for ${event.title}?`,
      answer: event.is_free
        ? `Since ${event.title} is a free event, VIP passes are not applicable. All registered attendees will have equal access to the event.`
        : `VIP/Premium passes may be available for ${event.title} depending on the organizer. These typically include priority entry, better seating/viewing, and sometimes meet & greet opportunities. Check the booking page for available categories.`
    },
    {
      question: `Is ${event.title} seating or standing?`,
      answer: category.includes('concert') || category.includes('music')
        ? `${event.title} typically features both standing and seating areas. The pit/front area is usually standing, while rear sections may have seating. Check your ticket category for specific arrangements.`
        : category.includes('comedy') || category.includes('theatre')
        ? `${event.title} is a seated event. Seating is usually assigned based on ticket category. Arrive early for better seat selection in general admission areas.`
        : `Seating arrangements for ${event.title} depend on the venue setup. Please check the venue map or contact the organizer for specific details.`
    },
    {
      question: `Is re-entry allowed at ${event.title}?`,
      answer: `Re-entry policies vary by venue, but typically NO re-entry is allowed once you exit the venue during ${event.title}. Please plan accordingly and enter only when you're ready to stay for the full event.`
    },
    {
      question: `What time should I arrive for ${event.title}?`,
      answer: `${event.title} starts at ${timeText} on ${dateText}. We recommend arriving 30-45 minutes early for check-in, security screening, and finding your spot. Gates typically open 30 minutes before the show.`
    },
    {
      question: `Can I get a refund for ${event.title} tickets?`,
      answer: event.is_free
        ? `Since ${event.title} is a free event, there's no refund process. If you can't attend, simply update your registration or skip — your spot will be available to others.`
        : `Tickets for ${event.title} are generally non-refundable once purchased. However, if the event is cancelled or rescheduled by the organizer, full refunds will be processed automatically within 7-10 business days.`
    },
    {
      question: `What should I bring to ${event.title}?`,
      answer: `For ${event.title}, bring: Valid ID proof (Aadhaar/DL/Passport), your e-ticket or registration confirmation (screenshot works), and your phone with sufficient charge. Avoid bringing large bags, outside food/drinks, or professional cameras.`
    },
    {
      question: `Is ${event.title} suitable for children?`,
      answer: category.includes('nightlife') || category.includes('club')
        ? `No, ${event.title} is strictly for adults aged 21 and above. Valid ID proof is mandatory for entry.`
        : category.includes('comedy')
        ? `${event.title} is recommended for ages 16 and above as content may include adult humor. Parental discretion is advised.`
        : `${event.title} is generally suitable for all ages unless specified otherwise. Children under 12 should be accompanied by an adult. Check with the organizer for specific age restrictions.`
    },
  ];

  return faqs;
};

const generateGenericFAQs = (locality?: string, eventType?: string): FAQItem[] => {
  const location = locality ? `${locality}, Jaipur` : "Jaipur";
  const faqs: FAQItem[] = [];

  if (locality) {
    faqs.push({
      question: `What are the best events happening in ${locality} Jaipur?`,
      answer: `JaipurCircle features verified events, concerts, workshops, exhibitions and community activities happening in ${locality}, Jaipur. Browse upcoming events with details on venue, timing and tickets.`
    });
    
    faqs.push({
      question: `Are there free events in ${locality}?`,
      answer: `Yes — many free and community events take place across ${locality}. Visit our Free Events section for updated listings of no-cost activities, cultural programs and public gatherings.`
    });
  }

  if (eventType === "free") {
    faqs.push({
      question: "What types of free events are available in Jaipur?",
      answer: "Free events in Jaipur include cultural festivals, art exhibitions, community gatherings, public concerts, heritage walks, book readings, open mic nights and government-sponsored programs."
    });
  }

  if (eventType === "this-weekend") {
    faqs.push({
      question: "What are the best events in Jaipur this weekend?",
      answer: "JaipurCircle features verified weekend events including concerts, nightlife, festivals, comedy shows, family activities and outdoor events happening Saturday and Sunday in Jaipur."
    });
  }

  // Common FAQs
  faqs.push({
    question: `How do I find events near me in ${location}?`,
    answer: `Use JaipurCircle locality pages to explore events happening near you. Filter by area, category, date or price to find activities that match your interests.`
  });

  faqs.push({
    question: "Can I list my event on JaipurCircle?",
    answer: "Yes — event organizers can submit events through our Create Event page. Listings are reviewed and published within 24 hours. Both free and paid events are welcome."
  });

  return faqs;
};

const EventDynamicFAQ = ({ locality, eventType, customFAQs, event }: EventDynamicFAQProps) => {
  // Prioritize event-specific FAQs if event data is provided
  let faqs: FAQItem[] = [];
  
  if (event) {
    faqs = generateEventSpecificFAQs(event);
  } else {
    faqs = customFAQs || generateGenericFAQs(locality, eventType);
  }

  // Add custom FAQs if both event and custom are provided
  if (event && customFAQs) {
    faqs = [...faqs, ...customFAQs];
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <section className="mt-8 pt-6 border-t border-border">
        <h2 className="text-lg font-bold mb-4">Frequently Asked Questions</h2>
        
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.slice(0, 10).map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`faq-${index}`}
              className="border border-border rounded-lg px-4"
            >
              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
};

export default EventDynamicFAQ;
