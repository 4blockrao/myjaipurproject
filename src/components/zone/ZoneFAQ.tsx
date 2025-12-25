import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Helmet } from 'react-helmet-async';

interface ZoneFAQProps {
  zone: {
    name: string;
    totalLocalities: number;
    uniqueWards: string[];
    allPinCodes: string[];
    localities: any[];
  };
}

export function ZoneFAQ({ zone }: ZoneFAQProps) {
  const topLocalities = zone.localities.slice(0, 5).map(l => l.name).join(', ');

  const faqs = [
    {
      question: `How many localities are in ${zone.name} Zone, Jaipur?`,
      answer: `${zone.name} Zone comprises ${zone.totalLocalities} localities, spread across ${zone.uniqueWards.length} municipal wards.`,
    },
    {
      question: `What are the pin codes for ${zone.name} Zone?`,
      answer: zone.allPinCodes.length > 0
        ? `Pin codes in ${zone.name} Zone include ${zone.allPinCodes.slice(0, 5).join(', ')}${zone.allPinCodes.length > 5 ? ` and ${zone.allPinCodes.length - 5} others` : ''}.`
        : 'Pin code details are being verified.',
    },
    {
      question: `Which are the main localities in ${zone.name} Zone?`,
      answer: topLocalities
        ? `Some of the main localities in ${zone.name} Zone include ${topLocalities}. Each locality has its own characteristics and civic infrastructure.`
        : 'Locality details are being verified.',
    },
    {
      question: `Is ${zone.name} Zone good for living?`,
      answer: `${zone.name} Zone offers diverse residential options across its ${zone.totalLocalities} localities. The zone includes established neighbourhoods and developing areas with varying access to schools, markets, and healthcare. Suitability depends on individual preferences and specific locality characteristics.`,
    },
    {
      question: `How is the connectivity in ${zone.name} Zone?`,
      answer: `${zone.name} Zone is connected to other parts of Jaipur through road networks and public transport. Specific localities may have access to metro stations, bus stops, and main roads. Connectivity varies by location within the zone.`,
    },
    {
      question: `Are rental homes available in ${zone.name} Zone?`,
      answer: `Rental housing options including flats, independent houses, and PG accommodation are available across localities in ${zone.name} Zone. Availability and pricing vary by specific locality and current market conditions.`,
    },
    {
      question: `Which ward numbers fall under ${zone.name} Zone?`,
      answer: zone.uniqueWards.length > 0
        ? `${zone.name} Zone includes wards ${zone.uniqueWards.slice(0, 10).join(', ')}${zone.uniqueWards.length > 10 ? ` and ${zone.uniqueWards.length - 10} others` : ''}.`
        : 'Ward details are being verified.',
    },
    {
      question: `What facilities are available in ${zone.name} Zone?`,
      answer: `${zone.name} Zone has access to schools, hospitals, markets, and other civic facilities distributed across its localities. Specific facilities vary by neighbourhood. Residents typically access larger infrastructure from multiple localities within and outside the zone.`,
    },
  ];

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          Frequently Asked Questions about {zone.name} Zone
        </h2>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
