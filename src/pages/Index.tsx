import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Gift, Users, Star, TrendingUp, MapPin, Globe, RefreshCw, User, LogOut, Search, Heart, Bell, Menu, X, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/AuthModal";
import LocalityPrompt from "@/components/LocalityPrompt";
import LocalityDealFilter from "@/components/LocalityDealFilter";
import CategoryGrid from "@/components/CategoryGrid";
import ProductShowcase from "@/components/ProductShowcase";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [userLocality, setUserLocality] = useState<string>("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLocalityPromptOpen, setIsLocalityPromptOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocality, setSelectedLocality] = useState("all");
  const { toast } = useToast();
  
  const [stats, setStats] = useState({
    totalDeals: 0,
    totalMerchants: 0,
    totalUsers: 0,
    featuredDeals: [],
    nearbyDeals: [],
    categoryDeals: {},
    dealCounts: {},
    totalTransactions: 0,
    totalJaiCoinsInCirculation: 0
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && isAuthModalOpen) {
        setIsAuthModalOpen(false);
        toast({
          title: "Welcome!",
          description: "You've been signed in successfully."
        });
      }
      
      // Check user locality after auth
      if (session?.user) {
        await checkUserLocality(session.user.id);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserLocality(session.user.id);
      } else {
        // Check localStorage for non-authenticated users
        const savedLocality = localStorage.getItem('userLocality');
        if (savedLocality) {
          setUserLocality(savedLocality);
          setSelectedLocality(savedLocality);
        } else {
          setIsLocalityPromptOpen(true);
        }
      }
    });

    fetchStats();

    return () => subscription.unsubscribe();
  }, [isAuthModalOpen, toast]);

  const checkUserLocality = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('locality')
        .eq('id', userId)
        .single();
        
      if (profile?.locality) {
        setUserLocality(profile.locality);
        setSelectedLocality(profile.locality);
      } else {
        setIsLocalityPromptOpen(true);
      }
    } catch (error) {
      console.error('Error fetching user locality:', error);
      setIsLocalityPromptOpen(true);
    }
  };

  const fetchStats = async () => {
    try {
      // Get deals count
      const { count: dealsCount } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get merchants count
      const { count: merchantsCount } = await supabase
        .from('merchants')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get featured deals
      const { data: featuredDeals } = await supabase
        .from('deals')
        .select(`
          *,
          merchants!inner(
            business_name,
            is_verified
          )
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(6);

      // Get deals by category for counts
      const { data: allDeals } = await supabase
        .from('deals')
        .select('category, primary_locality')
        .eq('is_active', true);

      // Calculate category counts and locality counts
      const categoryDeals = {};
      const dealCounts = {};
      
      allDeals?.forEach(deal => {
        // Category counts
        if (deal.category) {
          categoryDeals[deal.category] = (categoryDeals[deal.category] || 0) + 1;
        }
        // Locality counts
        if (deal.primary_locality) {
          dealCounts[deal.primary_locality] = (dealCounts[deal.primary_locality] || 0) + 1;
        }
      });

      setStats({
        totalDeals: dealsCount || 0,
        totalMerchants: merchantsCount || 0,
        totalUsers: usersCount || 0,
        featuredDeals: featuredDeals || [],
        nearbyDeals: [],
        categoryDeals,
        dealCounts,
        totalTransactions: 0,
        totalJaiCoinsInCirculation: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been signed out successfully."
      });
    }
  };

  const handleLocalitySelected = (locality: string) => {
    setUserLocality(locality);
    setSelectedLocality(locality);
    fetchStats(); // Refresh stats with new locality
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // Navigate to deals page with category filter
    window.location.href = `/deals?category=${encodeURIComponent(category)}`;
  };

  const handleLocalityChange = (locality: string) => {
    setSelectedLocality(locality);
    // Navigate to deals page with locality filter
    window.location.href = `/deals?locality=${encodeURIComponent(locality)}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50 backdrop-blur-md bg-white/90">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-400 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
                  HiJaipur
                </span>
                <div className="text-xs text-gray-500 -mt-1">Premium Deals</div>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link to="/deals" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
                Deals
              </Link>
              <Link to="/categories" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
                Categories
              </Link>
              <Link to="/wallet" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
                Wallet
              </Link>
              <Link to="/merchant" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
                For Business
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Search className="w-4 h-4" />
              </Button>

              {user ? (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm">
                    <Bell className="w-4 h-4" />
                  </Button>
                  <Link to="/favorites">
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="hidden md:block text-sm font-medium text-gray-700">
                        {user.user_metadata?.full_name?.split(' ')[0] || 'Profile'}
                      </span>
                    </div>
                  </Link>
                </div>
              ) : (
                <Button 
                  onClick={() => setIsAuthModalOpen(true)} 
                  className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-medium px-6"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t py-4 space-y-4">
              <Link to="/deals" className="block text-gray-700 hover:text-pink-600 font-medium">
                Deals
              </Link>
              <Link to="/categories" className="block text-gray-700 hover:text-pink-600 font-medium">
                Categories
              </Link>
              <Link to="/wallet" className="block text-gray-700 hover:text-pink-600 font-medium">
                Wallet
              </Link>
              <Link to="/merchant" className="block text-gray-700 hover:text-pink-600 font-medium">
                For Business
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 shadow-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">India's Premier Local Deals Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Discover Amazing
              <span className="block bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                {userLocality ? `Deals in ${userLocality}` : 'Deals in Jaipur'}
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Shop local, save money, and earn JaiCoins with every purchase. Join thousands discovering 
              exclusive offers from premium businesses across the Pink City.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/deals">
                <Button size="lg" className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all">
                  Explore Premium Deals
                </Button>
              </Link>
              <Link to="/merchant">
                <Button variant="outline" size="lg" className="border-2 border-gray-300 hover:border-pink-300 text-gray-700 hover:text-pink-600 font-semibold px-8 py-4 text-lg bg-white/80 backdrop-blur-sm">
                  Partner with Us
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalDeals}+</div>
                <div className="text-sm text-gray-600">Active Deals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalMerchants}+</div>
                <div className="text-sm text-gray-600">Partners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalUsers}+</div>
                <div className="text-sm text-gray-600">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">25K+</div>
                <div className="text-sm text-gray-600">JaiCoins</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Locality Filter */}
        {userLocality && (
          <section className="mb-12">
            <LocalityDealFilter
              selectedLocality={selectedLocality}
              onLocalityChange={handleLocalityChange}
              dealCounts={stats.dealCounts}
            />
          </section>
        )}

        {/* Categories Grid */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-lg text-gray-600">Find exactly what you're looking for</p>
          </div>
          <CategoryGrid 
            dealCounts={stats.categoryDeals}
            onCategorySelect={handleCategorySelect}
          />
        </section>

        {/* Product Showcase */}
        <ProductShowcase />

        {/* Featured Deals */}
        {stats.featuredDeals.length > 0 && (
          <section className="py-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Deals</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Handpicked premium offers from Jaipur's finest businesses
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {stats.featuredDeals.slice(0, 6).map((deal: any) => (
                <Card key={deal.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl mb-2">{deal.category === 'Food & Dining' ? '🍽️' : 
                                                     deal.category === 'Beauty & Wellness' ? '💆‍♀️' : 
                                                     deal.category === 'Shopping' ? '🛍️' : '✨'}</div>
                        <div className="text-sm font-medium text-gray-600">{deal.subcategory}</div>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold">
                        FEATURED
                      </span>
                    </div>
                    {deal.discount_percentage > 0 && (
                      <div className="absolute top-4 right-4">
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
                    <CardDescription className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{deal.merchants?.business_name}</span>
                      {deal.merchants?.is_verified && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          ✓ Verified
                        </span>
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
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-gray-600">
                          {deal.location?.toLowerCase().includes('online') ? (
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
            
            <div className="text-center">
              <Link to="/deals">
                <Button variant="outline" size="lg" className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50 px-8 py-3 font-medium">
                  View All {stats.totalDeals} Deals
                </Button>
              </Link>
            </div>
          </section>
        )}
      </div>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How HiJaipur Works</h2>
            <p className="text-lg text-gray-600">Simple steps to start saving and earning</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Search className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Discover Premium Deals</h3>
              <p className="text-gray-600 leading-relaxed">Browse curated offers from Jaipur's best restaurants, spas, shops, and services</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Redeem & Enjoy</h3>
              <p className="text-gray-600 leading-relaxed">Show your digital coupon at the store or order online for instant savings</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Coins className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Earn JaiCoins</h3>
              <p className="text-gray-600 leading-relaxed">Get rewarded with JaiCoins for every purchase and unlock exclusive benefits</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Saving?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of smart shoppers who save money and earn rewards with HiJaipur
          </p>
          {!user && (
            <Button 
              size="lg" 
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-white text-pink-600 hover:bg-gray-50 font-bold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Get Started Free
            </Button>
          )}
        </div>
      </section>

      {/* Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <LocalityPrompt 
        isOpen={isLocalityPromptOpen} 
        onClose={() => setIsLocalityPromptOpen(false)}
        onLocalitySelected={handleLocalitySelected}
      />
    </div>
  );
};

export default Index;
