import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  HeartPulse, 
  GraduationCap, 
  Church, 
  Home, 
  UtensilsCrossed, 
  ShoppingBag, 
  Sparkles, 
  Dumbbell, 
  Baby, 
  Briefcase, 
  Car, 
  Plane, 
  Wrench, 
  Heart, 
  PawPrint, 
  Building2, 
  AlertTriangle,
  ChevronDown,
  LucideIcon
} from "lucide-react";

interface FooterAccordionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FooterAccordion({ title, icon: Icon, children, defaultOpen = false }: FooterAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </span>
        <ChevronDown 
          className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} 
        />
      </button>

      {open && (
        <div className="pb-6 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

interface ZoneIntentFooterProps {
  zone: {
    name: string;
    slug: string;
    localities: Array<{ name: string; slug: string }>;
  };
}

export function ZoneIntentFooter({ zone }: ZoneIntentFooterProps) {
  if (!zone) return null;

  const Z = zone.name;

  const categories = [
    {
      icon: HeartPulse,
      title: `Healthcare & Medical in ${Z} Zone`,
      sections: [
        {
          heading: "Hospitals",
          items: [
            `Multispeciality Hospitals in ${Z} Zone`,
            `Private Hospitals in ${Z} Zone`,
            `Government Hospitals in ${Z} Zone`,
            `Emergency Hospitals in ${Z} Zone`,
          ],
        },
        {
          heading: "Clinics & Diagnostics",
          items: [
            `Clinics in ${Z} Zone`,
            `Pathology Labs in ${Z} Zone`,
            `Diagnostic Centres in ${Z} Zone`,
          ],
        },
      ],
    },
    {
      icon: GraduationCap,
      title: `Education & Learning in ${Z} Zone`,
      sections: [
        {
          heading: "Schools",
          items: [
            `CBSE Schools in ${Z} Zone`,
            `ICSE Schools in ${Z} Zone`,
            `Play Schools in ${Z} Zone`,
          ],
        },
        {
          heading: "Coaching & Colleges",
          items: [
            `IIT-JEE Coaching in ${Z} Zone`,
            `NEET Coaching in ${Z} Zone`,
            `Engineering Colleges near ${Z} Zone`,
          ],
        },
      ],
    },
    {
      icon: Home,
      title: `Real Estate & Housing in ${Z} Zone`,
      sections: [
        {
          heading: "Properties",
          items: [
            `Flats in ${Z} Zone`,
            `Apartments in ${Z} Zone`,
            `Plots in ${Z} Zone`,
            `Villas in ${Z} Zone`,
          ],
        },
        {
          heading: "Rentals",
          items: [
            `Flats for Rent in ${Z} Zone`,
            `PG in ${Z} Zone`,
            `Hostels in ${Z} Zone`,
          ],
        },
      ],
    },
    {
      icon: UtensilsCrossed,
      title: `Food & Dining in ${Z} Zone`,
      sections: [
        {
          heading: "Restaurants",
          items: [
            `Restaurants in ${Z} Zone`,
            `Cafes in ${Z} Zone`,
            `Street Food in ${Z} Zone`,
          ],
        },
      ],
    },
    {
      icon: ShoppingBag,
      title: `Shopping & Retail in ${Z} Zone`,
      sections: [
        {
          heading: "Markets",
          items: [
            `Shopping Markets in ${Z} Zone`,
            `Malls in ${Z} Zone`,
            `Supermarkets in ${Z} Zone`,
          ],
        },
      ],
    },
    {
      icon: Car,
      title: `Transport & Automobile in ${Z} Zone`,
      sections: [
        {
          heading: "Transport",
          items: [
            `Bus Routes in ${Z} Zone`,
            `Metro Stations near ${Z} Zone`,
            `Auto & Taxi in ${Z} Zone`,
          ],
        },
      ],
    },
    {
      icon: Building2,
      title: `Government & Civic in ${Z} Zone`,
      sections: [
        {
          heading: "Offices",
          items: [
            `Police Stations in ${Z} Zone`,
            `Municipal Offices in ${Z} Zone`,
            `Post Offices in ${Z} Zone`,
          ],
        },
      ],
    },
  ];

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <div className="bg-muted/30 rounded-xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          🧭 Zone Search Index — Categories & Services in {Z} Zone, Jaipur
        </h2>
        <p className="text-muted-foreground text-sm mb-8">
          This section highlights commonly searched categories, services, and facilities 
          in <strong>{Z} Zone, Jaipur</strong>. These are informational search categories, not listings.
        </p>

        <div className="divide-y divide-border/30">
          {categories.map((category, catIdx) => (
            <FooterAccordion 
              key={catIdx} 
              title={category.title} 
              icon={category.icon}
              defaultOpen={catIdx < 2}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.sections.map((section, secIdx) => (
                  <div key={secIdx}>
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      {section.heading}
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="leading-relaxed">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </FooterAccordion>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground/70 text-center">
            This is an informational search index based on common user queries. 
            JaipurCircle does not imply availability, quality, or endorsement of any service.
            <Link 
              to="/jaipur/zones" 
              className="text-primary hover:underline ml-1"
            >
              Browse all Jaipur Zones
            </Link>
            {" • "}
            <Link 
              to="/jaipur" 
              className="text-primary hover:underline"
            >
              Explore Jaipur
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
