
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Globe, Coins, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For now, we'll show sample favorites since we don't have a favorites table
      // In a real app, you'd fetch from a user_favorites table
      const sampleFavorites = [
        {
          id: '1',
          title: 'Premium Spa Package - 60% Off',
          business_name: 'Serenity Spa & Wellness',
          original_price: 5000,
          discounted_price: 2000,
          discount_percentage: 60,
          location: 'C-Scheme',
          jaicoin_reward: 50,
          category: 'Beauty & Wellness',
          is_online: false
        },
        {
          id: '2',
          title: 'Fine Dining Experience',
          business_name: 'Royal Heritage Restaurant',
          original_price: 3000,
          discounted_price: 2100,
          discount_percentage: 30,
          location: 'City Palace Road',
          jaicoin_reward: 75,
          category: 'Food & Dining',
          is_online: false
        }
      ];

      setFavorites(sampleFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = (dealId: string) => {
    setFavorites(favorites.filter(fav => fav.id !== dealId));
    toast({
      title: "Removed from Favorites",
      description: "Deal has been removed from your favorites."
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
              <p className="text-gray-600">Deals you've saved for later</p>
            </div>
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Favorites Yet</h2>
            <p className="text-gray-600 mb-8">Start exploring deals and save your favorites here</p>
            <Link to="/deals">
              <Button className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500">
                Browse Deals
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((deal) => (
              <Card key={deal.id} className="group hover:shadow-lg transition-shadow border-0 shadow-md">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {deal.category === 'Food & Dining' ? '🍽️' : 
                         deal.category === 'Beauty & Wellness' ? '💆‍♀️' : 
                         deal.category === 'Shopping' ? '🛍️' : '✨'}
                      </div>
                      <div className="text-sm font-medium text-gray-600">{deal.category}</div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/90 hover:bg-red-50 border-red-200 text-red-600"
                      onClick={() => removeFavorite(deal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {deal.discount_percentage > 0 && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {deal.discount_percentage}% OFF
                      </span>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg group-hover:text-pink-600 transition-colors line-clamp-2">
                    {deal.title}
                  </CardTitle>
                  <CardDescription className="font-medium text-gray-900">
                    {deal.business_name}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">₹{deal.discounted_price?.toLocaleString()}</span>
                        {deal.original_price > 0 && (
                          <span className="text-sm line-through text-gray-500">₹{deal.original_price?.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        {deal.is_online ? (
                          <Globe className="w-4 h-4 text-blue-500" />
                        ) : (
                          <MapPin className="w-4 h-4 text-red-500" />
                        )}
                        <span>{deal.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-700 font-medium">+{deal.jaicoin_reward}</span>
                      </div>
                    </div>
                    
                    <Link to="/deals">
                      <Button className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-medium">
                        View Deal
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
