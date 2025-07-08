
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Store, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TopMerchants = () => {
  const navigate = useNavigate();

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
      image: "🍽️",
      location: "City Palace Area"
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
      image: "💎",
      location: "Johari Bazaar"
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
      image: "💆‍♀️",
      location: "Bani Park"
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
      image: "📱",
      location: "MI Road"
    }
  ];

  const handleViewProfile = (merchantId: number) => {
    navigate(`/merchant/${merchantId}`);
  };

  const handleViewLocation = (merchantId: number) => {
    // For now, just show an alert - can be implemented with maps later
    alert("Map functionality coming soon!");
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-3">
            <Store className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Top Merchants Near You</h2>
              <p className="text-gray-600 mt-2">Verified partners offering the best deals</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
            onClick={() => navigate('/merchants')}
          >
            View All Merchants
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {merchants.map((merchant) => (
            <Card key={merchant.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white">
              <div className="relative">
                <div className="h-40 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <div className="text-5xl">{merchant.image}</div>
                </div>
                
                <div className="absolute top-3 left-3">
                  <Badge className="bg-blue-500 text-white font-bold text-xs">
                    {merchant.deals} deals
                  </Badge>
                </div>
                
                {merchant.verified && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-green-500 text-white font-bold text-xs">
                      ✓ Verified
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                  {merchant.name}
                </CardTitle>
                <p className="text-sm text-blue-600 font-medium">{merchant.category}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  {merchant.location}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{merchant.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-900">{merchant.rating}</span>
                      <span className="text-xs text-gray-500">({merchant.reviews})</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">{merchant.reviews} reviews</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                      onClick={() => handleViewProfile(merchant.id)}
                    >
                      View Profile
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                      onClick={() => handleViewLocation(merchant.id)}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Location
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopMerchants;
