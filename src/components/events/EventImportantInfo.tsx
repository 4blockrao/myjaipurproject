import { AlertTriangle, Clock, Car, Baby, Wallet, Shield, Ban, CheckCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface EventImportantInfoProps {
  event: {
    category: string;
    is_free?: boolean | null;
    venue_name?: string | null;
    venue_address?: string | null;
  };
}

/**
 * Important Information Section
 * Includes: Age Limit, Entry Rules, Parking, Refunds
 * Critical for reducing bounce rate and pre-answering user questions
 */
export const EventImportantInfo = ({ event }: EventImportantInfoProps) => {
  // Generate category-specific rules
  const getAgeLimit = () => {
    const ageLimits: Record<string, string> = {
      'music': 'All ages welcome. Children under 12 must be accompanied by an adult.',
      'comedy': '16+ recommended. Content may include adult humor.',
      'workshop': 'Varies by workshop. Check specific requirements.',
      'festival': 'All ages welcome. Family-friendly event.',
      'nightlife': '21+ only. Valid ID required.',
      'kids': 'Designed for children ages 3-14 with parental supervision.',
    };
    return ageLimits[event.category.toLowerCase()] || 'All ages welcome unless otherwise specified.';
  };

  const infoSections = [
    {
      id: 'age',
      icon: <Baby className="w-4 h-4" />,
      title: 'Age Restrictions',
      content: getAgeLimit(),
    },
    {
      id: 'entry',
      icon: <Shield className="w-4 h-4" />,
      title: 'Entry Rules',
      content: (
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span>Carry valid ID proof (Aadhaar, Driving License, Passport)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span>Show e-ticket or registration confirmation at entry</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span>Arrive 30 minutes before event start time</span>
          </li>
          <li className="flex items-start gap-2">
            <Ban className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <span>No outside food or beverages allowed</span>
          </li>
          <li className="flex items-start gap-2">
            <Ban className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <span>Weapons, drugs, and illegal items strictly prohibited</span>
          </li>
        </ul>
      ),
    },
    {
      id: 'parking',
      icon: <Car className="w-4 h-4" />,
      title: 'Parking & Facilities',
      content: (
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Parking:</strong> {event.venue_name ? `Parking available at ${event.venue_name}. ` : ''}Limited parking available. Early arrival recommended.</p>
          <p><strong>Transport:</strong> Accessible by auto, cab (Uber/Ola), and metro (if nearby).</p>
          <p><strong>Facilities:</strong> Washrooms, first aid, and drinking water available at venue.</p>
          <p><strong>Accessibility:</strong> Wheelchair access available. Contact organizer for special requirements.</p>
        </div>
      ),
    },
    {
      id: 'refund',
      icon: <Wallet className="w-4 h-4" />,
      title: 'Refunds & Cancellation',
      content: (
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Refund Policy:</strong> {event.is_free 
            ? 'This is a free event. No payment required.' 
            : 'Tickets are non-refundable once purchased. Transfers may be allowed at organizer discretion.'}</p>
          <p><strong>Event Cancellation:</strong> If the event is cancelled by the organizer, full refund will be processed within 7-10 business days.</p>
          <p><strong>Rescheduling:</strong> Tickets remain valid for rescheduled dates. Check email for updates.</p>
        </div>
      ),
    },
    {
      id: 'bring',
      icon: <CheckCircle className="w-4 h-4" />,
      title: 'What to Bring',
      content: (
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span>Valid ID proof</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span>E-ticket or registration confirmation (screenshot works)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span>Comfortable footwear for standing events</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span>Phone with sufficient charge</span>
          </li>
        </ul>
      ),
    },
  ];

  return (
    <section className="mt-6">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-primary" />
        Important Information
      </h2>
      
      <Accordion type="single" collapsible className="space-y-2">
        {infoSections.map((section) => (
          <AccordionItem 
            key={section.id} 
            value={section.id}
            className="border border-border rounded-lg px-4 bg-card"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-sm font-medium">
                <span className="text-primary">{section.icon}</span>
                {section.title}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm">
              {typeof section.content === 'string' 
                ? <p className="text-muted-foreground">{section.content}</p>
                : section.content
              }
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default EventImportantInfo;
