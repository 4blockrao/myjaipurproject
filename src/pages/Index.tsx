
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Gift, Users, Star, TrendingUp, MapPin, Globe, RefreshCw, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/AuthModal";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalDeals: 0,
    totalMerchants: 0,
    totalUsers: 0,
    featuredDeals: []
  });

  useEffect(() => {
    // Set up auth state listener FIRST (security best practice)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Close auth modal when user successfully signs in
      if (session?.user && isAuthModalOpen) {
        setIsAuthModalOpen(false);
        toast({
          title: "Welcome!",
          description: "You've been signed in successfully."
        });
      }
    });

    // THEN check for existing session (security best practice)
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Fetch stats on mount
    fetchStats();

    return () => subscription.unsubscribe();
  }, [isAuthModalOpen, toast]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching dashboard stats...');

      // Get active deals count
      const { count: dealsCount, error: dealsError } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (dealsError) {
        console.error('Error fetching deals count:', dealsError);
      }

      // Get active merchants count
      const { count: merchantsCount, error: merchantsError } = await supabase
        .from('merchants')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (merchantsError) {
        console.error('Error fetching merchants count:', merchantsError);
      }

      // Get users count
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('Error fetching users count:', usersError);
      }

      // Get featured deals with merchant info
      const { data: featuredDeals, error: featuredError } = await supabase
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

      if (featuredError) {
        console.error('Error fetching featured deals:', featuredError);
      }

      console.log('Stats fetched:', {
        deals: dealsCount,
        merchants: merchantsCount,
        users: usersCount,
        featured: featuredDeals?.length || 0
      });

      setStats({
        totalDeals: dealsCount || 0,
        totalMerchants: merchantsCount || 0,
        totalUsers: usersCount || 0,
        featuredDeals: featuredDeals || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b-2 border-pink-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="w-8 h-8 text-pink-600" />
              <span className="text-2xl font-bold text-gray-800">HiJaipur</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/deals" className="text-gray-600 hover:text-pink-600 font-medium">
                Deals
              </Link>
              <Link to="/wallet" className="text-gray-600 hover:text-pink-600 font-medium">
                Wallet
              </Link>
              <Link to="/challenges" className="text-gray-600 hover:text-pink-600 font-medium">
                Challenges
              </Link>
              <Link to="/merchant" className="text-gray-600 hover:text-pink-600 font-medium">
                For Merchants
              </Link>
              <div className="flex items-center space-x-2">
                <Link to="/admin/data" className="text-gray-600 hover:text-pink-600 font-medium text-sm">
                  Admin Data
                </Link>
                <span className="text-gray-400">|</span>
                <Link to="/admin/audit" className="text-gray-600 hover:text-pink-600 font-medium text-sm">
                  System Audit
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={fetchStats}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              {/* Authentication Section */}
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">{user.user_metadata?.full_name || user.email}</span>
                  </div>
                  <Button onClick={handleSignOut} variant="outline" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setIsAuthModalOpen(true)} 
                  className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Welcome to <span className="text-pink-600">HiJaipur</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover amazing deals from local businesses in Jaipur and earn JaiCoins with every purchase. 
            Shop local, save money, and get rewarded!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/deals">
              <Button className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-lg px-8 py-3">
                Explore Deals
              </Button>
            </Link>
            <Link to="/merchant">
              <Button variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50 text-lg px-8 py-3">
                Join as Merchant
              </Button>
            </Link>
          </div>

          {/* Enhanced Empty State Message */}
          {stats.totalDeals === 0 && stats.totalMerchants === 0 && !isLoading && (
            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
              <h3 className="font-semibold text-yellow-800 mb-3">🚀 Ready to Explore HiJaipur?</h3>
              <p className="text-yellow-700 mb-4">
                It looks like the database needs sample data to showcase the platform's features. 
                Click below to populate with realistic Jaipur businesses, deals, and user activity!
              </p>
              <Link to="/admin/data">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                  🎯 Seed Sample Data Now
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center border-2 border-pink-100 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Gift className="w-12 h-12 mx-auto mb-4 text-pink-600" />
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 mx-auto rounded"></div>
                ) : (
                  `${stats.totalDeals}+`
                )}
              </div>
              <div className="text-gray-600">Active Deals</div>
              {stats.totalDeals > 0 && (
                <div className="text-xs text-green-600 mt-1">🔥 Live & Updated</div>
              )}
            </CardContent>
          </Card>
          
          <Card className="text-center border-2 border-yellow-100 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Users className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 mx-auto rounded"></div>
                ) : (
                  `${stats.totalMerchants}+`
                )}
              </div>
              <div className="text-gray-600">Partner Merchants</div>
              {stats.totalMerchants > 0 && (
                <div className="text-xs text-green-600 mt-1">✅ Verified Businesses</div>
              )}
            </CardContent>
          </Card>
          
          <Card className="text-center border-2 border-blue-100 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Star className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 mx-auto rounded"></div>
                ) : (
                  `${stats.totalUsers}+`
                )}
              </div>
              <div className="text-gray-600">Happy Users</div>
              {stats.totalUsers > 0 && (
                <div className="text-xs text-green-600 mt-1">🎯 Active Community</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Featured Deals Section */}
        {stats.featuredDeals.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
              🌟 Featured Deals from Jaipur
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.featuredDeals.map((deal: any) => (
                <Card key={deal.id} className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold">
                        ⭐ FEATURED
                      </div>
                      {deal.merchants?.is_verified && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight">{deal.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span className="font-medium">{deal.merchants?.business_name}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-green-600">₹{deal.discounted_price?.toLocaleString()}</span>
                        {deal.original_price > 0 && (
                          <span className="text-sm line-through text-gray-500">₹{deal.original_price?.toLocaleString()}</span>
                        )}
                      </div>
                      {deal.discount_percentage > 0 && (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                          {deal.discount_percentage}% OFF
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          {deal.location?.toLowerCase().includes('online') ? (
                            <Globe className="w-4 h-4 text-blue-500" />
                          ) : (
                            <MapPin className="w-4 h-4 text-red-500" />
                          )}
                          <span className="font-medium">{deal.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-sm">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-700 font-semibold">Earn +{deal.jaicoin_reward} JaiCoins</span>
                      </div>
                      
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        Category: <span className="font-medium">{deal.category}</span>
                      </div>
                    </div>
                    
                    <Link to="/deals">
                      <Button className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 font-semibold">
                        🛍️ View Deal Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/deals">
                <Button variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50 px-8 py-3">
                  🔍 Explore All {stats.totalDeals} Deals
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">How HiJaipur Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover Deals</h3>
              <p className="text-gray-600">Browse amazing deals from local businesses in Jaipur</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛍️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Redeem & Save</h3>
              <p className="text-gray-600">Use our platform to get exclusive discounts and offers</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn JaiCoins</h3>
              <p className="text-gray-600">Get rewarded with JaiCoins for every purchase and activity</p>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-pink-100 px-4 py-2">
          <div className="flex justify-around">
            <Link to="/deals" className="flex flex-col items-center space-y-1 text-gray-600 hover:text-pink-600">
              <Gift className="w-6 h-6" />
              <span className="text-xs">Deals</span>
            </Link>
            <Link to="/wallet" className="flex flex-col items-center space-y-1 text-gray-600 hover:text-pink-600">
              <Coins className="w-6 h-6" />
              <span className="text-xs">Wallet</span>
            </Link>
            <Link to="/challenges" className="flex flex-col items-center space-y-1 text-gray-600 hover:text-pink-600">
              <TrendingUp className="w-6 h-6" />
              <span className="text-xs">Challenges</span>
            </Link>
            <Link to="/admin/data" className="flex flex-col items-center space-y-1 text-gray-600 hover:text-pink-600">
              <Users className="w-6 h-6" />
              <span className="text-xs">Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Beautiful Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
