import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Helmet } from 'react-helmet-async';

interface LocalityExtendedFAQProps {
  locality: any;
}

export function LocalityExtendedFAQ({ locality }: LocalityExtendedFAQProps) {
  if (!locality) return null;

  const connectivity = locality.connectivity || {};
  const name = locality.name;
  const zone = locality.zone;

  const faqs = [
    // Basic locality info
    {
      question: `What is the pin code of ${name}, Jaipur?`,
      answer: locality.pin_codes?.length
        ? `The pin codes for ${name} include ${locality.pin_codes.join(", ")}.`
        : "Pin code details are being verified.",
    },
    {
      question: `Which zone does ${name} fall under?`,
      answer: zone
        ? `${name} is located in the ${zone} zone of Jaipur, Rajasthan.`
        : "Zone details are being verified.",
    },
    {
      question: `What is the ward number of ${name}?`,
      answer: locality.ward_number
        ? `${name} falls under Ward ${locality.ward_number}${
            locality.ward_name ? ` (${locality.ward_name})` : ""
          } of Jaipur Municipal Corporation.`
        : "Ward details are being verified.",
    },
    // Safety
    {
      question: `Is ${name} a safe locality to live in?`,
      answer: `${name} is a residential locality in Jaipur with standard civic infrastructure. ${
        locality.police_station
          ? `The area is served by ${locality.police_station} Police Station.`
          : ""
      } Like any urban area, residents are advised to follow general safety practices. Specific crime statistics are not available on this platform.`,
    },
    // Living experience
    {
      question: `What is it like to live in ${name}, Jaipur?`,
      answer: `${name} is a ${
        locality.tags?.length ? locality.tags.slice(0, 2).join(", ") : "residential"
      } locality in ${zone || "Jaipur"}. It offers a typical urban neighbourhood environment with access to local markets, schools, and healthcare facilities. ${
        locality.nearby_localities?.length
          ? `Nearby areas include ${locality.nearby_localities
              .slice(0, 3)
              .map((l: string) => l.replace(/-/g, " "))
              .join(", ")}.`
          : ""
      }`,
    },
    // Connectivity
    {
      question: `How is the connectivity of ${name}, Jaipur?`,
      answer: (() => {
        const parts: string[] = [];
        if (connectivity.nearest_metro) {
          parts.push(`The nearest metro station is ${connectivity.nearest_metro}.`);
        }
        if (connectivity.nearest_railway_station) {
          parts.push(`${connectivity.nearest_railway_station} provides railway connectivity.`);
        }
        if (connectivity.nearest_bus_stops?.length) {
          parts.push(`Bus connectivity is available via ${connectivity.nearest_bus_stops.slice(0, 2).join(", ")}.`);
        }
        if (typeof connectivity.distance_to_airport_km === "number") {
          parts.push(`Jaipur International Airport is approximately ${connectivity.distance_to_airport_km} km away.`);
        } else if (connectivity.distance_to_airport) {
          parts.push(`Jaipur International Airport is ${connectivity.distance_to_airport} away.`);
        }
        return parts.length ? parts.join(" ") : "Connectivity details are being verified.";
      })(),
    },
    // Nearby localities
    {
      question: `Which localities are near ${name}?`,
      answer: locality.nearby_localities?.length
        ? `Nearby localities include ${locality.nearby_localities
            .slice(0, 6)
            .map((l: string) => l.replace(/-/g, " "))
            .join(", ")}. These areas share urban connectivity and similar civic infrastructure.`
        : "Nearby locality details are being verified.",
    },
    // Families
    {
      question: `Is ${name} suitable for families?`,
      answer: `${name} is a residential area suitable for families seeking neighbourhood-level living in Jaipur. The locality provides access to schools, healthcare facilities, and daily markets. Specific amenities vary by neighbourhood pocket within ${name}.`,
    },
    // Rental & PG
    {
      question: `Are rental flats and PG rooms available in ${name}?`,
      answer: `${name} and surrounding areas typically offer a range of rental housing options including flats, independent houses, and PG accommodation. Availability and pricing vary based on location within the locality and market conditions. Prospective renters should verify current listings directly.`,
    },
    // Daily commute
    {
      question: `How is the daily commute from ${name}?`,
      answer: `Daily commute from ${name} depends on the destination and mode of transport. ${
        connectivity.nearest_metro
          ? `Metro connectivity is available via ${connectivity.nearest_metro}.`
          : "The locality is connected by road networks."
      } ${
        connectivity.nearest_bus_stops?.length
          ? `City buses operate from nearby stops.`
          : ""
      } Many residents use personal vehicles or ride-sharing services for commuting.`,
    },
  ];

  // FAQ Schema for SEO
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
          Frequently Asked Questions about {name}
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
