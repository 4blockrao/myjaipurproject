
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp } from "lucide-react";

const LocalityGrid = () => {
  const localities = [
    { name: "C-Scheme", deals: 145, trending: true, image: "🏢" },
    { name: "Malviya Nagar", deals: 128, trending: false, image: "🏘️" },
    { name: "Mansarovar", deals: 95, trending: true, image: "🏡" },
    { name: "Vaishali Nagar", deals: 87, trending: false, image: "🌆" },
    { name: "Bani Park", deals: 76, trending: false, image: "🌳" },
    { name: "Tonk Road", deals: 64, trending: true, image: "🛣️" },
    { name: "Sodala", deals: 52, trending: false, image: "🏪" },
    { name: "Jhotwara", deals: 43, trending: false, image: "🏭" }
  ];

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <MapPin className="w-6 h-6 text-red-600" />
          <h2 className="text-3xl font-bold text-gray-900">Browse by Locality</h2>
        </div>
        <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
          View All Areas
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {localities.map((locality, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm overflow-hidden bg-white hover:scale-105">
            <CardContent className="p-4 text-center">
              <div className="relative mb-3">
                <div className="text-4xl mb-2">{locality.image}</div>
                {locality.trending && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 animate-pulse">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Hot
                  </Badge>
                )}
              </div>
              
              <h3 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-red-600 transition-colors">
                {locality.name}
              </h3>
              
              <div className="flex items-center justify-center space-x-1 text-gray-600 text-xs mb-3">
                <MapPin className="w-3 h-3" />
                <span>{locality.deals} deals</span>
              </div>

              <Button size="sm" variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50 group-hover:bg-red-600 group-hover:text-white transition-colors">
                Explore
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 font-semibold px-8">
          <MapPin className="w-4 h-4 mr-2" />
          Find Deals Near Me
        </Button>
      </div>
    </section>
  );
};

export default LocalityGrid;
