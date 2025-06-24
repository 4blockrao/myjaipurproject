
import { Shield, Award, Users, MapPin, Clock, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TrustIndicators = () => {
  const indicators = [
    {
      icon: Shield,
      title: "Verified by Locals",
      description: "All merchants verified by our local team",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Award,
      title: "Quality Guaranteed",
      description: "Money-back guarantee on all deals",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Users,
      title: "Community Trusted",
      description: "50,000+ happy customers in Jaipur",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Live deal availability and pricing",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const locations = [
    { name: "C-Scheme", count: 245, popular: true },
    { name: "Malviya Nagar", count: 189, popular: false },
    { name: "Vaishali Nagar", count: 156, popular: true },
    { name: "Mansarovar", count: 134, popular: false },
    { name: "Jagatpura", count: 98, popular: false },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Trust Indicators */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Jaipur Trusts Us</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to bringing you authentic, verified deals from the best local merchants in the Pink City.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {indicators.map((indicator, index) => {
            const Icon = indicator.icon;
            return (
              <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
                <CardContent className="pt-6">
                  <div className={`w-16 h-16 ${indicator.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${indicator.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{indicator.title}</h3>
                  <p className="text-sm text-gray-600">{indicator.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Popular Locations */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Popular Areas in Jaipur</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {locations.map((location) => (
              <Badge
                key={location.name}
                variant="outline"
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 cursor-pointer ${
                  location.popular 
                    ? "bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200" 
                    : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                }`}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {location.name}
                <span className="ml-2 text-xs bg-white/70 text-gray-600 px-2 py-0.5 rounded-full">
                  {location.count} deals
                </span>
                {location.popular && (
                  <Star className="w-3 h-3 ml-1 fill-current text-yellow-500" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;
