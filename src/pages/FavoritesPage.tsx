
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Clock, MapPin, Star, Share2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface SavedDeal {
  id: string;
  title: string;
  description: string;
  category: string;
  discount_percentage: number;
  original_price: number;
  discounted_price: number;
  location: string;
  end_date: string;
  merchants?: {
    business_name: string;
    average_rating: number;
  };
}

const FavoritesPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSavedDeals();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await fetchUserProfile(session.user.id);
    }
    setIsLoading(false);
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSavedDeals = async () => {
    try {
      // Mock data - in real implementation, fetch from database
      const mockSavedDeals: SavedDeal[] = [
        {
          id: "1",
          title: "50% off at Rajasthani Thali House",
          description: "Traditional Rajasthani cuisine with authentic flavors",
          category: "Food & Dining",
          discount_percentage: 50,
          original_price: 800,
          discounted_price: 400,
          location: "C-Scheme, Jaipur",
          end_date: "2024-07-15",
          merchants: {
            business_name: "Rajasthani Thali House",
            average_rating: 4.5
          }
        },
        {
          id: "2",
          title: "30% off Spa Package",
          description: "Relaxing spa and wellness treatments",
          category: "Beauty & Wellness",
          discount_percentage: 30,
          original_price: 2000,
          discounted_price: 1400,
          location: "Malviya Nagar, Jaipur",
          end_date: "2024-07-20",
          merchants: {
            business_name: "Serenity Spa",
            average_rating: 4.8
          }
        }
      ];
      setSavedDeals(mockSavedDeals);
    } catch (error) {
      console.error('Error fetching saved deals:', error);
    }
  };

  const removeSavedDeal = async (dealId: string) => {
    try {
      setSavedDeals(prev => prev.filter(deal => deal.id !== dealId));
      toast({
        title: "Removed from favorites",
        description: "Deal has been removed from your saved list"
      });
    } catch (error) {
      console.error('Error removing saved deal:', error);
    }
  };

  const shareDeal = (deal: SavedDeal) => {
    if (navigator.share) {
      navigator.share({
        title: deal.title,
        text: `Check out this amazing deal: ${deal.discount_percentage}% off!`,
        url: `${window.location.origin}/deal/${deal.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/deal/${deal.id}`);
      toast({
        title: "Link copied",
        description: "Deal link has been copied to clipboard"
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="Favorites">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="Favorites">
        <Card className="m-4">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your favorites</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile} pageTitle="Favorites" showBackButton>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Heart className="w-6 h-6 text-pink-500" />
            <Badge variant="outline">{savedDeals.length} saved</Badge>
          </div>
          <div className="flex space-x-2">
            <Link to="/deals">
              <Button variant="outline" size="sm">
                Browse More
              </Button>
            </Link>
            <Link to="/coupons">
              <Button variant="outline" size="sm">
                My Coupons
              </Button>
            </Link>
          </div>
        </div>

        {/* Saved Deals Grid */}
        {savedDeals.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No saved deals yet</h3>
            <p className="text-gray-500 mb-6">Start saving deals you love for easy access later</p>
            <Link to="/deals">
              <Button>Browse Deals</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedDeals.map((deal) => (
              <Card key={deal.id} className="group hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {deal.category}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareDeal(deal)}
                        className="h-8 w-8 p-0"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSavedDeal(deal.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{deal.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{deal.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{deal.location}</span>
                    </div>
                    {deal.merchants && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{deal.merchants.business_name}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{deal.merchants.average_rating?.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>Ends {new Date(deal.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-pink-600">₹{deal.discounted_price}</span>
                      <span className="text-sm text-gray-500 line-through">₹{deal.original_price}</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      {deal.discount_percentage}% OFF
                    </Badge>
                  </div>

                  <Link to={`/deal/${deal.id}`}>
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-orange-400">
                      View Deal
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FavoritesPage;
