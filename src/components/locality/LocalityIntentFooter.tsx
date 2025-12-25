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
  AlertTriangle 
} from "lucide-react";

interface LocalityIntentFooterProps {
  locality: {
    name: string;
    slug: string;
    zone?: string | null;
  };
}

export function LocalityIntentFooter({ locality }: LocalityIntentFooterProps) {
  if (!locality) return null;

  const L = locality.name;

  const categories = [
    {
      icon: HeartPulse,
      title: `Healthcare & Medical in ${L}`,
      sections: [
        {
          heading: "Hospitals",
          items: [
            `Multispeciality Hospitals in ${L}`,
            `Private Hospitals in ${L}`,
            `Government Hospitals in ${L}`,
            `Super-Speciality Hospitals in ${L}`,
            `Children's & Maternity Hospitals in ${L}`,
            `Emergency & Trauma Care Hospitals in ${L}`,
            `Nursing Homes in ${L}`,
          ],
        },
        {
          heading: "Specialty Hospitals",
          items: [
            `Eye Hospitals in ${L}`,
            `Orthopedic Hospitals in ${L}`,
            `ENT Hospitals in ${L}`,
            `Cancer Hospitals in ${L}`,
            `Cardiac / Heart Hospitals in ${L}`,
            `IVF & Fertility Clinics in ${L}`,
            `Skin & Dermatology Clinics in ${L}`,
            `Neurology & Kidney Care Hospitals in ${L}`,
          ],
        },
        {
          heading: "Clinics & Doctors",
          items: [
            `General Physician Clinics in ${L}`,
            `Pediatric Clinics in ${L}`,
            `Gynecology Clinics in ${L}`,
            `Orthopedic Clinics in ${L}`,
            `Dental Clinics in ${L}`,
            `Ayurveda & Homeopathy Clinics in ${L}`,
          ],
        },
        {
          heading: "Diagnostics & Lab Testing",
          items: [
            `Pathology Labs in ${L}`,
            `Blood Test Labs in ${L}`,
            `Diagnostic Centres in ${L}`,
            `MRI / CT Scan Centres in ${L}`,
            `X-Ray Centres in ${L}`,
            `Sonography / Ultrasound Centres in ${L}`,
          ],
        },
        {
          heading: "Critical & Care Support",
          items: [
            `Ambulance Services in ${L}`,
            `Blood Banks near ${L}`,
            `Dialysis Centres in ${L}`,
            `Physiotherapy Centres in ${L}`,
            `Home Nursing & Caretaker Services in ${L}`,
          ],
        },
        {
          heading: "Medical Stores",
          items: [
            `24×7 Medical Stores in ${L}`,
            `Generic Medicine Stores in ${L}`,
            `Surgical & Health Equipment Shops in ${L}`,
          ],
        },
      ],
    },
    {
      icon: GraduationCap,
      title: `Education & Learning in ${L}`,
      sections: [
        {
          heading: "Schools",
          items: [
            `Play Schools in ${L}`,
            `Primary & Secondary Schools in ${L}`,
            `CBSE Schools in ${L}`,
            `ICSE Schools in ${L}`,
            `International Schools near ${L}`,
            `Boarding Schools near ${L}`,
          ],
        },
        {
          heading: "Coaching & Tuition",
          items: [
            `IIT-JEE Coaching in ${L}`,
            `NEET Coaching in ${L}`,
            `UPSC / IAS / RAS Coaching in ${L}`,
            `SSC & Banking Coaching in ${L}`,
            `Defence / NDA Coaching in ${L}`,
            `Tuition Classes in ${L}`,
            `Home Tutors in ${L}`,
          ],
        },
        {
          heading: "Language & Skill Training",
          items: [
            `Spoken English Classes in ${L}`,
            `IELTS / TOEFL / PTE Coaching in ${L}`,
            `Personality Development Classes in ${L}`,
            `Public Speaking Training in ${L}`,
          ],
        },
        {
          heading: "Colleges & Institutes",
          items: [
            `Engineering Colleges near ${L}`,
            `Management & MBA Colleges near ${L}`,
            `Law & Commerce Colleges near ${L}`,
            `Polytechnic & Distance Education Institutes`,
          ],
        },
        {
          heading: "Study & Reading Spaces",
          items: [
            `Libraries near ${L}`,
            `Reading Halls & Study Rooms in ${L}`,
          ],
        },
      ],
    },
    {
      icon: Church,
      title: `Temples & Places of Worship in ${L}`,
      sections: [
        {
          heading: "Religious Places",
          items: [
            `Hindu Temples in ${L}`,
            `Jain Temples in ${L}`,
            `Gurudwaras in ${L}`,
            `Churches near ${L}`,
            `Mosques near ${L}`,
          ],
        },
        {
          heading: "Devotional Search",
          items: [
            `Temple Timings in ${L}`,
            `Aarti & Darshan Schedules`,
            `Festival Events & Pooja Updates`,
          ],
        },
      ],
    },
    {
      icon: Home,
      title: `Real Estate & Housing in ${L}`,
      sections: [
        {
          heading: "Residential Properties",
          items: [
            `Flats in ${L}`,
            `Apartments in ${L}`,
            `Independent Houses in ${L}`,
            `Residential Plots in ${L}`,
            `Villas & Bungalows in ${L}`,
          ],
        },
        {
          heading: "Rentals & PG",
          items: [
            `Flats for Rent in ${L}`,
            `PG for Students in ${L}`,
            `PG for Working Professionals in ${L}`,
            `Hostels near ${L}`,
            `Service Apartments in ${L}`,
          ],
        },
        {
          heading: "Real Estate Services",
          items: [
            `Property Dealers in ${L}`,
            `Real Estate Agents in ${L}`,
            `Home Loan Agents near ${L}`,
            `Property Lawyers in ${L}`,
            `Vastu Consultants in ${L}`,
          ],
        },
        {
          heading: "Home Interiors & Renovation",
          items: [
            `Interior Designers in ${L}`,
            `Modular Kitchen Designers`,
            `Furniture Dealers in ${L}`,
            `Renovation Contractors`,
          ],
        },
      ],
    },
    {
      icon: UtensilsCrossed,
      title: `Food & Dining in ${L}`,
      sections: [
        {
          heading: "Restaurants & Eateries",
          items: [
            `Restaurants in ${L}`,
            `Family Restaurants in ${L}`,
            `Veg Restaurants in ${L}`,
            `Non-Veg Restaurants in ${L}`,
            `Cafes in ${L}`,
            `Street Food in ${L}`,
            `Sweets & Mithai Shops in ${L}`,
            `Bakeries & Cake Shops in ${L}`,
            `Ice-Cream & Dessert Shops in ${L}`,
          ],
        },
      ],
    },
    {
      icon: ShoppingBag,
      title: `Shopping & Retail in ${L}`,
      sections: [
        {
          heading: "Daily Needs",
          items: [
            `Kirana & General Stores in ${L}`,
            `Supermarkets in ${L}`,
            `Departmental Stores in ${L}`,
            `Hypermarkets near ${L}`,
          ],
        },
        {
          heading: "Fashion & Jewellery",
          items: [
            `Clothing Stores in ${L}`,
            `Footwear Shops in ${L}`,
            `Jewellery Shops in ${L}`,
            `Tailor Shops & Boutiques in ${L}`,
          ],
        },
        {
          heading: "Electronics & Appliances",
          items: [
            `Mobile Shops in ${L}`,
            `Laptop & Computer Dealers in ${L}`,
            `TV & Home Appliances Dealers in ${L}`,
            `Repair & Service Centres in ${L}`,
          ],
        },
      ],
    },
    {
      icon: Sparkles,
      title: `Beauty & Personal Care in ${L}`,
      sections: [
        {
          heading: "Beauty Services",
          items: [
            `Beauty Parlours in ${L}`,
            `Salons in ${L}`,
            `Men's Grooming Studios in ${L}`,
            `Spas & Wellness Centres in ${L}`,
            `Bridal Makeup Artists in ${L}`,
          ],
        },
      ],
    },
    {
      icon: Dumbbell,
      title: `Fitness & Sports in ${L}`,
      sections: [
        {
          heading: "Fitness Facilities",
          items: [
            `Gyms in ${L}`,
            `Fitness Centres in ${L}`,
            `Yoga Classes in ${L}`,
            `Dance & Zumba Classes in ${L}`,
            `Martial Arts & Karate Training in ${L}`,
            `Sports Coaching Academies in ${L}`,
          ],
        },
      ],
    },
    {
      icon: Baby,
      title: `Kids & Activity Centres in ${L}`,
      sections: [
        {
          heading: "Kids Activities",
          items: [
            `Play Zones in ${L}`,
            `Hobby Classes in ${L}`,
            `Art & Craft Classes in ${L}`,
            `Dance & Music Training in ${L}`,
          ],
        },
      ],
    },
    {
      icon: Briefcase,
      title: `Professional & Business Services in ${L}`,
      sections: [
        {
          heading: "Professional Services",
          items: [
            `Chartered Accountants in ${L}`,
            `Tax Consultants in ${L}`,
            `Company Registration Services in ${L}`,
            `Digital Marketing Agencies in ${L}`,
            `Website Developers in ${L}`,
            `Advertising & Branding Agencies in ${L}`,
            `Printing & Offset Press in ${L}`,
          ],
        },
      ],
    },
    {
      icon: Car,
      title: `Automobile & Transport in ${L}`,
      sections: [
        {
          heading: "Vehicle Sales",
          items: [
            `Car Showrooms in ${L}`,
            `Used Car Dealers in ${L}`,
            `Bike Showrooms in ${L}`,
            `EV Scooter Dealers in ${L}`,
          ],
        },
        {
          heading: "Auto Services",
          items: [
            `Car Service Centres in ${L}`,
            `Two-Wheeler Repair Shops in ${L}`,
            `Tyre Dealers in ${L}`,
            `Battery Dealers in ${L}`,
            `Car Accessories Shops in ${L}`,
          ],
        },
        {
          heading: "Travel & Mobility",
          items: [
            `Taxi Services in ${L}`,
            `Cab Operators in ${L}`,
            `Bike Rentals in ${L}`,
            `Car Rentals in ${L}`,
            `Travel Agencies in ${L}`,
          ],
        },
      ],
    },
    {
      icon: Plane,
      title: `Travel & Stays in ${L}`,
      sections: [
        {
          heading: "Accommodation",
          items: [
            `Hotels in ${L}`,
            `Guest Houses in ${L}`,
            `Hostels & Dorms in ${L}`,
            `Homestays & Airbnb-style Stays in ${L}`,
            `Heritage Hotels near ${L}`,
            `Tour Operators in ${L}`,
          ],
        },
      ],
    },
    {
      icon: Wrench,
      title: `Home Services & Repairs in ${L}`,
      sections: [
        {
          heading: "Repair & Maintenance",
          items: [
            `Electricians in ${L}`,
            `Plumbers in ${L}`,
            `AC Repair Services in ${L}`,
            `RO & Water Purifier Repair in ${L}`,
            `Washing Machine Repair in ${L}`,
            `Refrigerator Repair in ${L}`,
            `Inverter & Battery Repair in ${L}`,
            `CCTV Installation in ${L}`,
            `Pest Control in ${L}`,
            `Painting Contractors in ${L}`,
          ],
        },
      ],
    },
    {
      icon: Heart,
      title: `Elderly Care in ${L}`,
      sections: [
        {
          heading: "Senior Services",
          items: [
            `Old Age Homes near ${L}`,
            `Home Caretaker Services in ${L}`,
            `Physiotherapy at Home in ${L}`,
          ],
        },
      ],
    },
    {
      icon: PawPrint,
      title: `Pet Care in ${L}`,
      sections: [
        {
          heading: "Pet Services",
          items: [
            `Pet Clinics in ${L}`,
            `Pet Grooming Services in ${L}`,
            `Pet Shops in ${L}`,
            `Pet Boarding in ${L}`,
          ],
        },
      ],
    },
    {
      icon: Building2,
      title: `Government & Civic Services in ${L}`,
      sections: [
        {
          heading: "Civic Offices",
          items: [
            `Police Stations near ${L}`,
            `Fire Stations near ${L}`,
            `Municipal Offices in ${L}`,
            `Electricity Offices in ${L}`,
            `Water Supply Offices in ${L}`,
            `Gas Supply Offices in ${L}`,
            `Public Transport Offices in ${L}`,
            `Court & Legal Offices near ${L}`,
          ],
        },
      ],
    },
    {
      icon: AlertTriangle,
      title: `Emergency & Important Contacts in ${L}`,
      sections: [
        {
          heading: "Emergency Services",
          items: [
            `Emergency Hospitals near ${L}`,
            `24×7 Medical Stores in ${L}`,
            `Ambulance Services in ${L}`,
            `Fire Emergency Services near ${L}`,
            `Disaster / Relief Helplines`,
          ],
        },
      ],
    },
  ];

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <div className="bg-muted/30 rounded-xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          🧭 Locality Search Index — Categories & Services in {L}, Jaipur
        </h2>
        <p className="text-muted-foreground text-sm mb-8">
          This section highlights commonly searched categories, services, facilities and 
          locality-level themes associated with <strong>{L}, Jaipur</strong>. 
          These are informational search categories, not listings.
        </p>

        <div className="space-y-10">
          {categories.map((category, catIdx) => {
            const IconComponent = category.icon;
            return (
              <div key={catIdx} className="border-b border-border/50 pb-8 last:border-0 last:pb-0">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                  <IconComponent className="h-5 w-5 text-primary" />
                  {category.title}
                </h3>
                
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
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground/70 text-center">
            This is an informational search index based on common user queries. 
            JaipurCircle does not imply availability, quality, or endorsement of any service. 
            <Link 
              to="/jaipur" 
              className="text-primary hover:underline ml-1"
            >
              Explore all Jaipur localities
            </Link>
            {locality.zone && (
              <>
                {" • "}
                <Link 
                  to={`/jaipur/zones/${locality.zone.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-primary hover:underline"
                >
                  Browse {locality.zone} Zone
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
