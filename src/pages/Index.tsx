
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Search, Star, Filter, Menu, Bell, Heart, Mic, ShoppingCart, Coins, TrendingUp, Users, Gift, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CategoryGrid from "@/components/CategoryGrid";
import LocalityPrompt from "@/components/LocalityPrompt";
import AuthModal from "@/components/AuthModal";
import JaiCoinWallet from "@/components/JaiCoinWallet";
import DealsNearMe from "@/components/home/DealsNearMe";
import TopSellingDeals from "@/components/home/TopSellingDeals";
import TodaysTopDeals from "@/components/home/TodaysTopDeals";
import TopProducts from "@/components/home/TopProducts";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryShortcuts from "@/components/home/CategoryShortcuts";
import JaiCoinZone from "@/components/home/JaiCoinZone";
import TopMerchants from "@/components/home/TopMerchants";
import Leaderboard from "@/components/home/Leaderboard";
import LocalityGrid from "@/components/home/LocalityGrid";
import StickyBottomNav from "@/components/home/StickyBottomNav";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import AllProducts from "@/components/home/AllProducts";
import { Link } from "react-router-dom";

interface UserProfile {
  id: string;
  full_name: string;
  locality?: string;
}

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLocalityPrompt, setShowLocalityPrompt] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deals, setDeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchDeals();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      setUser(session.user);
      const userProfile = await fetchUserProfile(session.user.id);
      if (userProfile && !userProfile.locality) {
        setShowLocalityPrompt(true);
      }
    }
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
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const handleLocalitySelected = async (locality: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ locality })
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, locality } : null);
      setShowLocalityPrompt(false);
      
      toast({
        title: "Location Updated",
        description: `Your locality has been set to ${locality}`,
      });
    } catch (error) {
      console.error('Error updating locality:', error);
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive"
      });
    }
  };

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          merchants(
            business_name,
            is_verified,
            average_rating
          )
        `)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = !searchQuery || 
      deal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.merchants?.business_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || deal.category === selectedCategory;
    
    const matchesLocation = !profile?.locality || 
      deal.location?.toLowerCase().includes(profile.locality.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const categories = [
    "all", "Food & Dining", "Beauty & Wellness", "Shopping", 
    "Electronics", "Services", "Health & Fitness"
  ];

  const dealCounts = categories.reduce((acc, category) => {
    if (category === "all") {
      acc[category] = deals.length;
    } else {
      acc[category] = deals.filter(deal => deal.category === category).length;
    }
    return acc;
  }, {} as Record<string, number>);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">MyJaipur</h2>
          <p className="text-gray-600">Discovering amazing deals near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 shadow-lg backdrop-blur-lg bg-opacity-95">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Location */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">
                MyJaipur
              </h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-white/90 bg-white/20 px-3 py-1 rounded-full">
                <MapPin className="w-4 h-4" />
                <span>{profile?.locality || 'Select Location'}</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search for biryani, jewelry, spa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 bg-white/90 border-white/30 focus:bg-white text-gray-800 placeholder-gray-500"
                />
                <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  <JaiCoinWallet />
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 relative">
                    <Bell className="w-4 h-4" />
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center">
                      3
                    </Badge>
                  </Button>
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </div>
                    </Button>
                  </Link>
                </>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} className="bg-white text-pink-600 hover:bg-gray-100 font-semibold">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <HeroBanner user={user} profile={profile} />

      {/* Category Shortcuts */}
      <CategoryShortcuts 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        dealCounts={dealCounts}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 space-y-12">
        
        {/* Featured Products */}
        <FeaturedProducts />

        {/* Today's Hot Deals Near You */}
        <TodaysTopDeals deals={filteredDeals} />

        {/* All Products */}
        <AllProducts />

        {/* Products You Can Buy Today */}
        <TopProducts deals={filteredDeals} />

        {/* JAICoin Gamification Zone - Only show if user is logged in */}
        {user && <JaiCoinZone user={user} />}

        {/* Top Selling Deals */}
        <TopSellingDeals deals={filteredDeals} />

        {/* Deals Near Me */}
        <DealsNearMe deals={filteredDeals} userLocality={profile?.locality} />

        {/* Top Merchants */}
        <TopMerchants />

        {/* Leaderboard - Only show if user is logged in */}
        {user && <Leaderboard />}

        {/* Browse by Locality */}
        <LocalityGrid />

        {/* Personalized Feed */}
        <section className="py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Picked Just for You</h2>
            <p className="text-gray-600">Based on your preferences and activity</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.slice(0, 6).map((deal) => (
              <Card key={deal.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {deal.category === 'Food & Dining' ? '🍽️' : 
                         deal.category === 'Beauty & Wellness' ? '💆‍♀️' : 
                         deal.category === 'Shopping' ? '🛍️' : 
                         deal.category === 'Electronics' ? '📱' : 
                         deal.category === 'Health & Fitness' ? '💪' : '✨'}
                      </div>
                      <div className="text-sm font-medium text-gray-600">{deal.subcategory}</div>
                    </div>
                  </div>
                  
                  {deal.is_featured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold animate-pulse">
                        ⭐ RECOMMENDED
                      </Badge>
                    </div>
                  )}
                  
                  {deal.discount_percentage > 0 && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-red-500 text-white font-bold">
                        {deal.discount_percentage}% OFF
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg group-hover:text-pink-600 transition-colors line-clamp-2">
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">₹{deal.discounted_price?.toLocaleString()}</span>
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
                          <Coins className="w-4 h-4" />
                          <span className="font-medium">+{deal.jaicoin_reward}</span>
                        </div>
                      )}
                    </div>

                    <Link to={`/deal/${deal.id}`}>
                      <Button className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 font-semibold">
                        Get Deal
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Bottom Navigation (Mobile) */}
      <StickyBottomNav />

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <LocalityPrompt
        isOpen={showLocalityPrompt}
        onClose={() => setShowLocalityPrompt(false)}
        onLocalitySelected={handleLocalitySelected}
      />
    </div>
  );
};

export default Index;
