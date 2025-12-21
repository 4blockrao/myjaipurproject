import { Locality } from '@/hooks/useLocality';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface LocalityFAQProps {
  locality: Locality;
}

export function LocalityFAQ({ locality }: LocalityFAQProps) {
  const faqs = [
    {
      question: `What is the pin code of ${locality.name}, Jaipur?`,
      answer: locality.pin_codes?.length 
        ? `The pin codes for ${locality.name} are ${locality.pin_codes.join(', ')}.`
        : "Pin code details are being verified."
    },
    {
      question: `Which zone is ${locality.name} located in?`,
      answer: locality.zone 
        ? `${locality.name} is located in ${locality.zone} zone of Jaipur, Rajasthan.`
        : "Zone details are being verified."
    },
    {
      question: `What is the ward number of ${locality.name}?`,
      answer: locality.ward_number 
        ? `${locality.name} falls under Ward ${locality.ward_number}${locality.ward_name ? ` (${locality.ward_name})` : ''} of Jaipur Municipal Corporation.`
        : "Ward details are being verified."
    },
    {
      question: `Which police station covers ${locality.name}?`,
      answer: locality.police_station 
        ? `${locality.name} area is covered by ${locality.police_station} Police Station for law and order.`
        : "Police station details are being verified."
    },
    {
      question: `What are the nearby localities to ${locality.name}?`,
      answer: locality.nearby_localities?.length 
        ? `The areas near ${locality.name} include ${locality.nearby_localities.slice(0, 5).join(', ')}. These localities share connectivity and amenities.`
        : "Nearby locality information is being verified."
    },
    {
      question: `How to reach ${locality.name}, Jaipur?`,
      answer: locality.connectivity 
        ? `${locality.name} is accessible via road transport. ${
            (locality.connectivity as any).nearest_metro 
              ? `The nearest metro station is ${(locality.connectivity as any).nearest_metro}.` 
              : ''
          } ${
            (locality.connectivity as any).distance_to_airport 
              ? `Jaipur International Airport is ${(locality.connectivity as any).distance_to_airport} away.` 
              : ''
          }`
        : `${locality.name} is well-connected by road to major parts of Jaipur. Local buses and auto-rickshaws are available for commute.`
    },
  ];

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <HelpCircle className="h-6 w-6 text-primary" />
        Frequently Asked Questions
      </h2>
      
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
