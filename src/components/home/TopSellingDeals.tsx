
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, TrendingUp } from "lucide-react";
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
  current_redemptions: number;
  merchants?: {
    business_name: string;
    is_verified: boolean;
    average_rating: number;
  };
}

interface TopSellingDealsProps {
  deals: Deal[];
}

const TopSellingDeals = ({ deals }: TopSellingDealsProps) => {
  const topSellingDeals = deals
    .filter(deal => deal.current_redemptions > 0)
    .sort((a, b) => b.current_redemptions - a.current_redemptions)
    .slice(0, 6);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Top Selling Deals</h2>
        </div>
        <Button variant="outline" size="sm">View All</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topSellingDeals.map((deal, index) => (
          <Card key={deal.id} className="group hover:shadow-lg transition-all duration-300 border-orange-200">
            <div className="relative">
              <div className="h-32 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
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
                <Badge className="bg-orange-500 text-white font-bold">
                  #{index + 1} Best Seller
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
              <CardTitle className="text-lg group-hover:text-orange-600 transition-colors line-clamp-2">
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

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{deal.location}</span>
                  </div>
                  <div className="text-orange-600 font-medium">
                    {deal.current_redemptions} sold
                  </div>
                </div>

                <Link to={`/deal/${deal.id}`}>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    Get Deal
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

export default TopSellingDeals;
