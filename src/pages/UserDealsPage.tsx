
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Eye, ShoppingCart, CheckCircle, Clock, 
  TrendingUp, Star, Share2, Gift, Calendar,
  Filter, Download, BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SharedDealTracker from "@/components/SharedDealTracker";
import { Link } from "react-router-dom";

interface UserDeal {
  id: string;
  title: string;
  category: string;
  status: 'active' | 'expired' | 'redeemed';
  type: 'purchased' | 'shared' | 'viewed' | 'saved';
  created_at: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  merchant_name: string;
  coupon_code?: string;
  redemption_status?: string;
  analytics?: {
    views: number;
    clicks: number;
    shares: number;
    earnings: number;
  };
}

const UserDealsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [deals, setDeals] = useState<UserDeal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<UserDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  const [stats, setStats] = useState({
    totalPurchased: 0,
    totalSaved: 0,
    totalShared: 0,
    totalEarnings: 0,
    activeDeals: 0,
    redeemedDeals: 0
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    filterDeals();
  }, [deals, searchQuery, filterType, filterStatus]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
        await fetchUserDeals(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserDeals = async (userId: string) => {
    try {
      // Fetch purchased deals (coupons)
      const { data: coupons } = await supabase
        .from('coupons')
        .select(`
          *,
          deals!inner(
            title,
            category,
            original_price,
            discounted_price,
            discount_percentage,
            end_date
          ),
          merchants!inner(
            business_name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Fetch shared deals
      const { data: sharedDeals } = await supabase
        .from('shared_deal_links')
        .select(`
          *,
          deals!inner(
            title,
            category,
            original_price,
            discounted_price,
            discount_percentage,
            end_date,
            merchants!inner(business_name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Combine and format all deals
      const allDeals: UserDeal[] = [];

      // Add purchased deals
      coupons?.forEach(coupon => {
        allDeals.push({
          id: coupon.id,
          title: coupon.deals.title,
          category: coupon.deals.category,
          status: coupon.status === 'redeemed' ? 'redeemed' : 
                  new Date(coupon.expires_at) < new Date() ? 'expired' : 'active',
          type: 'purchased',
          created_at: coupon.created_at,
          original_price: coupon.deals.original_price,
          discounted_price: coupon.deals.discounted_price,
          discount_percentage: coupon.deals.discount_percentage,
          merchant_name: coupon.merchants.business_name,
          coupon_code: coupon.coupon_code,
          redemption_status: coupon.status
        });
      });

      // Add shared deals
      sharedDeals?.forEach(shared => {
        allDeals.push({
          id: shared.id,
          title: shared.deals.title,
          category: shared.deals.category,
          status: new Date(shared.deals.end_date) < new Date() ? 'expired' : 'active',
          type: 'shared',
          created_at: shared.created_at,
          original_price: shared.deals.original_price,
          discounted_price: shared.deals.discounted_price,
          discount_percentage: shared.deals.discount_percentage,
          merchant_name: shared.deals.merchants.business_name,
          analytics: {
            views: shared.link_clicks || 0,
            clicks: shared.link_clicks || 0,
            shares: 1,
            earnings: 20 // Mock calculation
          }
        });
      });

      setDeals(allDeals);

      // Calculate stats
      const purchasedCount = allDeals.filter(d => d.type === 'purchased').length;
      const sharedCount = allDeals.filter(d => d.type === 'shared').length;
      const activeCount = allDeals.filter(d => d.status === 'active').length;
      const redeemedCount = allDeals.filter(d => d.status === 'redeemed').length;
      const totalSavings = allDeals
        .filter(d => d.type === 'purchased')
        .reduce((sum, d) => sum + (d.original_price - d.discounted_price), 0);

      setStats({
        totalPurchased: purchasedCount,
        totalSaved: Math.floor(totalSavings),
        totalShared: sharedCount,
        totalEarnings: sharedCount * 20, // Mock calculation
        activeDeals: activeCount,
        redeemedDeals: redeemedCount
      });

    } catch (error) {
      console.error('Error fetching user deals:', error);
      toast({
        title: "Error",
        description: "Failed to load your deals",
        variant: "destructive"
      });
    }
  };

  const filterDeals = () => {
    let filtered = deals;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(deal => 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.merchant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(deal => deal.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(deal => deal.status === filterStatus);
    }

    setFilteredDeals(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'redeemed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchased': return <ShoppingCart className="w-4 h-4" />;
      case 'shared': return <Share2 className="w-4 h-4" />;
      case 'viewed': return <Eye className="w-4 h-4" />;
      case 'saved': return <Gift className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="My Deals">
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile} pageTitle="My Deals & Analytics">
      <div className="space-y-6 p-4 max-w-7xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 text-center">
              <ShoppingCart className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalPurchased}</div>
              <div className="text-xs text-blue-100">Purchased</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4 text-center">
              <Gift className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">₹{stats.totalSaved}</div>
              <div className="text-xs text-green-100">Saved</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4 text-center">
              <Share2 className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalShared}</div>
              <div className="text-xs text-purple-100">Shared</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalEarnings}</div>
              <div className="text-xs text-yellow-100">JaiCoins</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-pink-500 to-red-500 text-white">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.activeDeals}</div>
              <div className="text-xs text-pink-100">Active</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.redeemedDeals}</div>
              <div className="text-xs text-indigo-100">Redeemed</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="all-deals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all-deals">All Deals</TabsTrigger>
            <TabsTrigger value="purchased">Purchased</TabsTrigger>
            <TabsTrigger value="shared">Shared Analytics</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="all-deals" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search deals, merchants, categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Types</option>
                    <option value="purchased">Purchased</option>
                    <option value="shared">Shared</option>
                  </select>
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="redeemed">Redeemed</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Deals List */}
            <div className="space-y-4">
              {filteredDeals.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No deals found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                  </CardContent>
                </Card>
              ) : (
                filteredDeals.map((deal) => (
                  <Card key={deal.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-orange-100 rounded-lg flex items-center justify-center">
                          {getTypeIcon(deal.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{deal.title}</h3>
                              <p className="text-gray-600">{deal.merchant_name}</p>
                              <p className="text-sm text-gray-500">{deal.category}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(deal.status)}>
                                {deal.status}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(deal.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-sm">
                                <span className="font-bold text-green-600">₹{deal.discounted_price}</span>
                                <span className="text-gray-500 line-through ml-2">₹{deal.original_price}</span>
                                <Badge className="ml-2 bg-red-100 text-red-700">
                                  {deal.discount_percentage}% OFF
                                </Badge>
                              </div>
                              
                              {deal.analytics && (
                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {deal.analytics.clicks}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    ₹{deal.analytics.earnings}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {deal.coupon_code && (
                                <Badge variant="outline" className="font-mono text-xs">
                                  {deal.coupon_code}
                                </Badge>
                              )}
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="purchased">
            <Card>
              <CardHeader>
                <CardTitle>My Purchased Deals</CardTitle>
                <CardDescription>Track your coupon purchases and redemptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDeals.filter(d => d.type === 'purchased').map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{deal.title}</h3>
                        <p className="text-gray-600">{deal.merchant_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(deal.status)}>
                            {deal.status}
                          </Badge>
                          {deal.coupon_code && (
                            <Badge variant="outline" className="font-mono">
                              {deal.coupon_code}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">₹{deal.discounted_price}</div>
                        <div className="text-xs text-gray-500">
                          Saved ₹{deal.original_price - deal.discounted_price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shared">
            <SharedDealTracker />
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Spending Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Spent:</span>
                      <span className="font-bold">₹{filteredDeals.filter(d => d.type === 'purchased').reduce((sum, d) => sum + d.discounted_price, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Saved:</span>
                      <span className="font-bold text-green-600">₹{stats.totalSaved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Favorite Category:</span>
                      <Badge>Food & Dining</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sharing Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>JaiCoins Earned:</span>
                      <span className="font-bold text-yellow-600">{stats.totalEarnings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Best Performing Deal:</span>
                      <span className="text-sm">Royal Rajasthani Thali</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversion Rate:</span>
                      <Badge>12.5%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UserDealsPage;
