
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface Deal {
  id: string;
  title: string;
  description?: string;
  discounted_price: number;
  original_price: number;
  discount_percentage: number;
  location: string;
  category: string;
  subcategory?: string;
  is_featured: boolean;
  jaicoin_reward: number;
  merchants?: {
    business_name: string;
    is_verified: boolean;
    average_rating: number;
  };
}

interface DealsNearMeProps {
  deals: Deal[];
  userLocality?: string;
}

const DealsNearMe = ({ deals, userLocality }: DealsNearMeProps) => {
  const nearbyDeals = deals.filter(deal => 
    userLocality && deal.location?.toLowerCase().includes(userLocality.toLowerCase())
  ).slice(0, 6);

  if (nearbyDeals.length === 0) {
    return (
      <section className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Deals Near You</h2>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-4xl mb-4">📍</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No deals found in your area</h3>
          <p className="text-gray-500">Try updating your location or browse all deals</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deals Near You</h2>
          <p className="text-gray-600">in {userLocality}</p>
        </div>
        <Button variant="outline" size="sm">View All</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nearbyDeals.map((deal) => (
          <Card key={deal.id} className="group hover:shadow-lg transition-all duration-300">
            <div className="relative">
              <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {deal.category === 'Food & Dining' ? '🍽️' : 
                     deal.category === 'Beauty & Wellness' ? '💆‍♀️' : 
                     deal.category === 'Shopping' ? '🛍️' : 
                     deal.category === 'Electronics' ? '📱' : 
                     deal.category === 'Health & Fitness' ? '💪' : '✨'}
                  </div>
                </div>
              </div>
              
              {deal.discount_percentage > 0 && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-red-500 text-white font-bold">
                    {deal.discount_percentage}% OFF
                  </Badge>
                </div>
              )}
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                {deal.title}
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{deal.merchants?.business_name}</span>
                {deal.merchants?.is_verified && (
                  <Badge variant="outline" className="text-green-700 border-green-200">
                    ✓ Verified
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">₹{deal.discounted_price?.toLocaleString()}</span>
                    {deal.original_price > 0 && (
                      <span className="text-sm line-through text-gray-500">₹{deal.original_price?.toLocaleString()}</span>
                    )}
                  </div>
                  {deal.merchants?.average_rating > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{deal.merchants.average_rating}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{deal.location}</span>
                  </div>
                  {deal.jaicoin_reward > 0 && (
                    <div className="flex items-center space-x-1 text-yellow-700">
                      <span className="text-xs">🪙</span>
                      <span className="font-medium">+{deal.jaicoin_reward}</span>
                    </div>
                  )}
                </div>

                <Link to={`/deal/${deal.id}`}>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    View Deal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default DealsNearMe;
