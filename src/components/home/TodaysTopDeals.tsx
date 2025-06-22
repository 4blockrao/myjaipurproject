
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock } from "lucide-react";
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
  created_at: string;
  merchants?: {
    business_name: string;
    is_verified: boolean;
    average_rating: number;
  };
}

interface TodaysTopDealsProps {
  deals: Deal[];
}

const TodaysTopDeals = ({ deals }: TodaysTopDealsProps) => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  const todaysDeals = deals
    .filter(deal => {
      const dealDate = new Date(deal.created_at).toISOString().split('T')[0];
      return dealDate === todayString || deal.is_featured;
    })
    .slice(0, 6);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Today's Top Deals</h2>
        </div>
        <Button variant="outline" size="sm">View All</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {todaysDeals.map((deal) => (
          <Card key={deal.id} className="group hover:shadow-lg transition-all duration-300 border-purple-200">
            <div className="relative">
              <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
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
              
              <div className="absolute top-2 left-2">
                <Badge className="bg-purple-500 text-white font-bold">
                  Today's Pick
                </Badge>
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
              <CardTitle className="text-lg group-hover:text-purple-600 transition-colors line-clamp-2">
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
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Grab Deal
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

export default TodaysTopDeals;
