
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Star, Coins, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Deal {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  original_price: number;
  discounted_price: number;
  location: string;
  category: string;
  image_url: string;
  is_featured: boolean;
  merchant_id: string;
  end_date: string;
  jaicoin_reward: number;
  created_at: string;
}

interface TodaysTopDealsProps {
  deals: Deal[];
  isLoading?: boolean;
}

const ImprovedTodaysTopDeals = ({ deals, isLoading = false }: TodaysTopDealsProps) => {
  const navigate = useNavigate();

  const handleDealClick = (dealId: string) => {
    navigate(`/deal/${dealId}`);
  };

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours <= 0) return "Expired";
    if (diffHours < 24) return `${diffHours}h left`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d left`;
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Today's Top Deals</h2>
            <p className="text-gray-600">Loading amazing offers...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Today's Top Deals</h2>
            <p className="text-gray-600">No deals available at the moment. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Today's Top Deals</h2>
            <p className="text-gray-600">Limited time offers you can't miss</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/deals')}
            className="hidden md:flex items-center gap-2"
          >
            View All Deals
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <Card 
              key={deal.id} 
              className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => handleDealClick(deal.id)}
            >
              <div className="relative">
                <img 
                  src={deal.image_url || "/placeholder.svg"} 
                  alt={deal.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {deal.is_featured && (
                    <Badge className="bg-yellow-500 text-white">
                      ⭐ Featured
                    </Badge>
                  )}
                  <Badge className="bg-red-500 text-white">
                    {deal.discount_percentage}% OFF
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-white/90 text-orange-600 border-orange-200">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeRemaining(deal.end_date)}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-pink-600 transition-colors">
                      {deal.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {deal.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{deal.location}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-pink-600">
                      ₹{deal.discounted_price}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{deal.original_price}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Coins className="w-4 h-4" />
                    <span className="text-sm font-medium">+{deal.jaicoin_reward}</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDealClick(deal.id);
                  }}
                >
                  Grab This Deal
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Button 
            variant="outline" 
            onClick={() => navigate('/deals')}
            className="flex items-center gap-2 mx-auto"
          >
            View All Deals
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ImprovedTodaysTopDeals;
