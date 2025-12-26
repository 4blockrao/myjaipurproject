import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Locality, parseConnectivity, getAirportDistance } from "@/hooks/useLocality";

interface LocalityFAQProps {
  locality: Locality;
}

export function LocalityFAQ({ locality }: LocalityFAQProps) {
  if (!locality) return null;

  const connectivity = parseConnectivity(locality.connectivity);
  const airportDistance = getAirportDistance(connectivity);

  const faqs = [
    {
      question: `What is the pin code of ${locality.name}, Jaipur?`,
      answer: locality.pin_codes?.length
        ? `The pin codes for ${locality.name} include ${locality.pin_codes.join(", ")}.`
        : "Pin code details are being verified.",
    },
    {
      question: `Which zone does ${locality.name} fall under?`,
      answer: locality.zone
        ? `${locality.name} is located in the ${locality.zone} zone of Jaipur, Rajasthan.`
        : "Zone details are being verified.",
    },
    {
      question: `What is the ward number of ${locality.name}?`,
      answer: locality.ward_number
        ? `${locality.name} falls under Ward ${locality.ward_number}${
            locality.ward_name ? ` (${locality.ward_name})` : ""
          } of Jaipur Municipal Corporation.`
        : "Ward details are being verified.",
    },
    {
      question: `Which police station serves ${locality.name}?`,
      answer: locality.police_station
        ? `${locality.name} is administratively covered by ${locality.police_station} Police Station.`
        : "Police station details are being verified.",
    },
    {
      question: `Which localities are near ${locality.name}?`,
      answer: locality.nearby_localities?.length
        ? `Nearby localities include ${locality.nearby_localities
            .slice(0, 5)
            .map((l: string) => l.replace(/-/g, " "))
            .join(", ")}.`
        : "Nearby locality details are being verified.",
    },
    {
      question: `How is the connectivity of ${locality.name}, Jaipur?`,
      answer: (() => {
        const parts: string[] = [];
        if (connectivity.nearest_metro) {
          parts.push(
            `The nearest metro station is ${connectivity.nearest_metro}.`
          );
        }
        if (connectivity.nearest_railway_station) {
          parts.push(
            `${connectivity.nearest_railway_station} provides railway connectivity.`
          );
        }
        if (airportDistance) {
          parts.push(
            `Jaipur International Airport is ${airportDistance} away.`
          );
        }
        return parts.length
          ? parts.join(" ")
          : "Connectivity details are being verified.";
      })(),
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
  );
}
