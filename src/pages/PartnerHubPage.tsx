import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Building2, Calendar, ArrowRight, CheckCircle } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const partnerTypes = [
  {
    id: 'merchant',
    title: "Merchant / Business",
    description: "List your business, offer deals, and reach customers across Jaipur",
    icon: Store,
    color: "from-blue-500 to-purple-600",
    benefits: [
      "Create and manage deals",
      "Reach thousands of customers",
      "Analytics dashboard",
      "JaiCoin reward system"
    ],
    cta: "Register as Merchant"
  },
  {
    id: 'real_estate_broker',
    title: "Real Estate Broker",
    description: "List properties for sale or rent and connect with potential buyers",
    icon: Building2,
    color: "from-green-500 to-teal-600",
    benefits: [
      "List unlimited properties",
      "Lead generation",
      "Property analytics",
      "Verified broker badge"
    ],
    cta: "Register as Broker"
  },
  {
    id: 'event_organizer',
    title: "Event Organizer",
    description: "Create and promote events, workshops, and experiences in Jaipur",
    icon: Calendar,
    color: "from-orange-500 to-red-600",
    benefits: [
      "Create & manage events",
      "Ticket sales & registration",
      "Attendee management",
      "Promotion to local audience"
    ],
    cta: "Register as Organizer"
  }
];

const PartnerHubPage = () => {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Partner with MyJaipur</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our platform and grow your business by reaching thousands of customers in Jaipur. 
            Choose your partner type to get started.
          </p>
        </div>

        {/* Partner Types */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {partnerTypes.map((partner) => {
            const IconComponent = partner.icon;
            return (
              <Card key={partner.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${partner.color}`} />
                <CardHeader className="pt-6">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${partner.color} flex items-center justify-center mb-4`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle>{partner.title}</CardTitle>
                  <CardDescription>{partner.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {partner.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Link to={`/register/vendor?type=${partner.id}`}>
                    <Button className={`w-full bg-gradient-to-r ${partner.color}`}>
                      {partner.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Why Partner Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Why Partner With Us?</h2>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Localities</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">0%</div>
                <div className="text-sm text-muted-foreground">Listing Fee*</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">*Free tier available. Premium features may have charges.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PartnerHubPage;
