
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { 
  Search, MapPin, TrendingUp, Star, 
  Users, Gift, ShoppingBag, Crown,
  Zap, Award, Compass
} from "lucide-react";

const ExplorePage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredDeals, setFeaturedDeals] = useState<any[]>([]);
  const [topMerchants, setTopMerchants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchExploreData();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await fetchUserProfile(session.user.id);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchExploreData = async () => {
    try {
      // Fetch featured deals
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(6);

      if (dealsError) {
        console.error('Error fetching deals:', dealsError);
      } else {
        setFeaturedDeals(deals || []);
      }

      // Fetch top merchants
      const { data: merchants, error: merchantsError } = await supabase
        .from('merchants')
        .select('*')
        .eq('is_active', true)
        .order('average_rating', { ascending: false })
        .limit(8);

      if (merchantsError) {
        console.error('Error fetching merchants:', merchantsError);
      } else {
        setTopMerchants(merchants || []);
      }
    } catch (error) {
      console.error('Error fetching explore data:', error);
      toast({
        title: "Error",
        description: "Failed to load explore data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout 
      title="Explore Jaipur" 
      subtitle="Discover amazing deals" 
      showBackButton={true} 
      backPath="/"
    >
      <div className="bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center mb-6">
              <Compass className="w-12 h-12 mr-3" />
              <h1 className="text-4xl font-bold">Explore Jaipur</h1>
            </div>
            <p className="text-xl opacity-90 mb-8">Discover amazing deals and experiences in the Pink City</p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for deals, restaurants, services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-full border-0 shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <Gift className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">500+</h3>
                <p className="text-muted-foreground">Active Deals</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">200+</h3>
                <p className="text-muted-foreground">Merchants</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Star className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">4.8</h3>
                <p className="text-muted-foreground">Avg Rating</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">50K+</h3>
                <p className="text-muted-foreground">Happy Users</p>
              </CardContent>
            </Card>
          </div>

          {/* Featured Deals */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-foreground">Featured Deals</h2>
              <Link to="/deals">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredDeals.map((deal) => (
                  <Link key={deal.id} to={`/deal/${deal.id}`}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-t-lg flex items-center justify-center relative">
                        <div className="text-6xl">🍽️</div>
                        <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                          {deal.discount_percentage}% OFF
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{deal.title}</h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{deal.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">
                              ₹{deal.discounted_price}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{deal.original_price}
                            </span>
                          </div>
                          <Badge variant="secondary">{deal.category}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Top Merchants */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-foreground">Top Merchants</h2>
              <Link to="/merchants">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topMerchants.map((merchant) => (
                <Card key={merchant.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                      {merchant.business_name.charAt(0)}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{merchant.business_name}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{merchant.business_type}</p>
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{merchant.average_rating}</span>
                      <span className="text-muted-foreground text-sm">({merchant.total_reviews})</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default ExplorePage;
