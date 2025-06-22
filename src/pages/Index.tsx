import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Search, Star, Filter, Menu, Bell, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CategoryGrid from "@/components/CategoryGrid";
import LocalityPrompt from "@/components/LocalityPrompt";
import AuthModal from "@/components/AuthModal";
import JaiCoinWallet from "@/components/JaiCoinWallet";
import ProductShowcase from "@/components/ProductShowcase";
import DealsNearMe from "@/components/home/DealsNearMe";
import TopSellingDeals from "@/components/home/TopSellingDeals";
import TodaysTopDeals from "@/components/home/TodaysTopDeals";
import TopProducts from "@/components/home/TopProducts";
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
        .limit(20);

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

  // Calculate deal counts by category for CategoryGrid
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Location */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
                HiJaipur
              </h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
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
                  placeholder="Search deals, restaurants, services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  <JaiCoinWallet />
                  <Button variant="ghost" size="sm">
                    <Bell className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Link to="/profile">
                    <Button variant="outline" size="sm">
                      Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Amazing Deals in Jaipur
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Save money, earn rewards, and explore the best local businesses
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-lg">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏪</span>
              <span>1000+ Local Businesses</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <span>Up to 70% Off</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🪙</span>
              <span>Earn JaiCoins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <Tabs defaultValue="home" className="w-full">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-5 mb-8 mt-8">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-8">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-gradient-to-r from-pink-500 to-orange-400" : ""}
                >
                  {category === "all" ? "All" : category}
                </Button>
              ))}
            </div>

            {/* Deals Near Me Section */}
            <DealsNearMe deals={filteredDeals} userLocality={profile?.locality} />

            {/* Today's Top Deals Section */}
            <TodaysTopDeals deals={filteredDeals} />

            {/* Top Selling Deals Section */}
            <TopSellingDeals deals={filteredDeals} />

            {/* Top Products Section */}
            <TopProducts deals={filteredDeals} />

            {/* All Deals Grid */}
            <section className="py-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">All Deals</h2>
                <Button variant="outline" size="sm">View More</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDeals.slice(0, 9).map((deal) => (
                  <Card key={deal.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
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
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold">
                            ⭐ FEATURED
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
                              <span className="text-xs">🪙</span>
                              <span className="font-medium">+{deal.jaicoin_reward}</span>
                            </div>
                          )}
                        </div>

                        {deal.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{deal.description}</p>
                        )}

                        <Link to={`/deal/${deal.id}`}>
                          <Button className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 font-medium">
                            View Deal
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredDeals.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No deals found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search or location filters</p>
                  <Button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    variant="outline"
                    className="border-pink-300 text-pink-600 hover:bg-pink-50"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </section>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <CategoryGrid 
              dealCounts={dealCounts}
              onCategorySelect={handleCategorySelect}
            />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="space-y-8">
              <TopProducts deals={deals} />
              <ProductShowcase />
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Deals</h2>
              <p className="text-gray-600 mb-8">Discover amazing service deals in your area</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.filter(deal => !deal.is_product_sale).map((deal) => (
                <Card key={deal.id} className="group hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-pink-600 transition-colors">
                      {deal.title}
                    </CardTitle>
                    <CardDescription>{deal.merchants?.business_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">₹{deal.discounted_price?.toLocaleString()}</span>
                        {deal.discount_percentage > 0 && (
                          <Badge className="bg-red-500 text-white">{deal.discount_percentage}% OFF</Badge>
                        )}
                      </div>
                      <Link to={`/deal/${deal.id}`}>
                        <Button className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Trending Deals</h2>
              <p className="text-gray-600 mb-8">Most popular deals right now</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.filter(deal => deal.is_featured || deal.current_redemptions > 10).map((deal) => (
                <Card key={deal.id} className="group hover:shadow-xl transition-all duration-300 border-yellow-200">
                  <div className="relative">
                    <div className="h-32 bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                      <div className="text-2xl">🔥</div>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                      Trending
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{deal.title}</CardTitle>
                    <CardDescription>{deal.merchants?.business_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold">₹{deal.discounted_price?.toLocaleString()}</span>
                        <span className="text-sm text-gray-600">{deal.current_redemptions} bought</span>
                      </div>
                      <Link to={`/deal/${deal.id}`}>
                        <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                          Get Deal
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

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
