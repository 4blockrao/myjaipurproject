import { Helmet } from "react-helmet-async";
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
}

const generateFAQs = (locality?: string, eventType?: string): FAQItem[] => {
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
    
    faqs.push({
      question: "How often are free events updated on JaipurCircle?",
      answer: "Our free events listings are updated daily. Event organizers can submit their free events directly through JaipurCircle for immediate visibility."
    });
  }

  if (eventType === "workshops") {
    faqs.push({
      question: "What types of workshops are available in Jaipur?",
      answer: "Jaipur offers diverse workshops including photography, art & craft, cooking classes, music lessons, coding bootcamps, pottery, block printing, language classes and professional skill development programs."
    });
    
    faqs.push({
      question: "Are there weekend workshops in Jaipur?",
      answer: "Yes — many workshops in Jaipur are scheduled on weekends to accommodate working professionals. Filter by date to find Saturday and Sunday sessions near you."
    });
  }

  if (eventType === "today") {
    faqs.push({
      question: "What events are happening in Jaipur today?",
      answer: "JaipurCircle lists all verified events happening today in Jaipur including concerts, workshops, exhibitions, cultural programs and community activities. This page is updated daily at midnight."
    });
    
    faqs.push({
      question: "How do I find last-minute events in Jaipur?",
      answer: "Our 'Events Today' page shows all same-day events with time, venue and ticket availability. Filter by category or locality to find activities that suit your schedule."
    });
    
    faqs.push({
      question: "Are there free things to do in Jaipur today?",
      answer: "Yes — check our free events filter to find no-cost activities, public programs, cultural events and community gatherings happening today across Jaipur localities."
    });
  }

  if (eventType === "this-week") {
    faqs.push({
      question: "What events are happening in Jaipur this week?",
      answer: "JaipurCircle features all upcoming events in Jaipur from Monday through Sunday. Browse concerts, workshops, exhibitions, meetups and cultural programs scheduled for this week."
    });
    
    faqs.push({
      question: "How do I plan my week in Jaipur?",
      answer: "Use our weekly events calendar to see events organized by day. Filter by category, locality or price to plan the perfect week of activities in Jaipur."
    });
    
    faqs.push({
      question: "What are the best things to do in Jaipur this week?",
      answer: "This week's highlights include live music, art exhibitions, skill workshops, food festivals, heritage walks and cultural performances. Check our featured events for top recommendations."
    });
  }

  if (eventType === "this-weekend") {
    faqs.push({
      question: "What are the best events in Jaipur this weekend?",
      answer: "JaipurCircle features verified weekend events including concerts, nightlife, festivals, comedy shows, family activities and outdoor events happening Saturday and Sunday in Jaipur."
    });
    
    faqs.push({
      question: "Are there family-friendly activities this weekend in Jaipur?",
      answer: "Yes — Jaipur hosts many family-friendly weekend events including kids workshops, heritage walks, food festivals, cultural programs and outdoor activities perfect for all ages."
    });
    
    faqs.push({
      question: "What nightlife events are happening in Jaipur this weekend?",
      answer: "Find the best weekend nightlife including DJ nights, live music, rooftop parties, club events and late-night performances at top venues across Jaipur."
    });
    
    faqs.push({
      question: "How do I find weekend events near me in Jaipur?",
      answer: "Use JaipurCircle locality filters to discover weekend events in your area. Each locality page shows upcoming Saturday and Sunday activities with venue details."
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

const EventDynamicFAQ = ({ locality, eventType, customFAQs }: EventDynamicFAQProps) => {
  const faqs = customFAQs || generateFAQs(locality, eventType);

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
          {faqs.map((faq, index) => (
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
