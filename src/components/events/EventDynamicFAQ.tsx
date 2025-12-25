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
