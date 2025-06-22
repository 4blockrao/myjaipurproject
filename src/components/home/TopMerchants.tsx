
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Store, Users } from "lucide-react";

const TopMerchants = () => {
  const merchants = [
    {
      id: 1,
      name: "Royal Rajasthani Restaurant",
      category: "Food & Dining",
      rating: 4.8,
      reviews: 1250,
      description: "Authentic Rajasthani cuisine in the heart of Jaipur",
      deals: 12,
      verified: true,
      image: "🍽️"
    },
    {
      id: 2,
      name: "Gems & Jewelry Palace",
      category: "Shopping",
      rating: 4.9,
      reviews: 850,
      description: "Traditional jewelry and precious stones",
      deals: 8,
      verified: true,
      image: "💎"
    },
    {
      id: 3,
      name: "Spa Serenity",
      category: "Beauty & Wellness",
      rating: 4.7,
      reviews: 650,
      description: "Luxury spa treatments and wellness services",
      deals: 15,
      verified: true,
      image: "💆‍♀️"
    },
    {
      id: 4,
      name: "Tech Hub Electronics",
      category: "Electronics",
      rating: 4.6,
      reviews: 920,
      description: "Latest gadgets and electronics",
      deals: 6,
      verified: false,
      image: "📱"
    }
  ];

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <Store className="w-6 h-6 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">Top Merchants Near You</h2>
        </div>
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:bg-blue-50">
          View All
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {merchants.map((merchant) => (
          <Card key={merchant.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white">
            <div className="relative">
              <div className="h-32 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <div className="text-4xl">{merchant.image}</div>
              </div>
              
              <div className="absolute top-2 left-2">
                <Badge className="bg-blue-500 text-white font-bold">
                  {merchant.deals} deals
                </Badge>
              </div>
              
              {merchant.verified && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-500 text-white font-bold">
                    ✓ Verified
                  </Badge>
                </div>
              )}
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                {merchant.name}
              </CardTitle>
              <p className="text-sm text-gray-600">{merchant.category}</p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">{merchant.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{merchant.rating}</span>
                    <span className="text-xs text-gray-500">({merchant.reviews})</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">{merchant.reviews} reviews</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                    View Profile
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50">
                    <MapPin className="w-3 h-3 mr-1" />
                    Map
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default TopMerchants;
