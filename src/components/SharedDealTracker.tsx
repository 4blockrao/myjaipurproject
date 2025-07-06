
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, ShoppingCart, CheckCircle, Coins, TrendingUp, Users, Share2, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface SharedDeal {
  id: string;
  token: string;
  created_at: string;
  link_clicks: number;
  deals: {
    id: string;
    title: string;
    category: string;
    coupon_type: string;
    original_price: number;
    discounted_price: number;
    discount_percentage: number;
    image_url?: string;
    merchants: {
      business_name: string;
      is_verified: boolean;
    };
  };
  analytics: {
    total_clicks: number;
    unique_visitors: number;
    conversions: number;
    total_earnings: number;
    commission_earned: number;
    click_locations: string[];
    referral_sources: string[];
  };
}

const SharedDealTracker = () => {
  const [sharedDeals, setSharedDeals] = useState<SharedDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [totalStats, setTotalStats] = useState({
    totalShares: 0,
    totalClicks: 0,
    totalEarnings: 0,
    totalCommission: 0,
    conversionRate: 0
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      await fetchSharedDealsAnalytics(user.id);
    }
    setIsLoading(false);
  };

  const fetchSharedDealsAnalytics = async (userId: string) => {
    try {
      // Fetch shared deals with comprehensive data
      const { data: sharedLinks, error } = await supabase
        .from('shared_deal_links')
        .select(`
          *,
          deals!inner(
            id,
            title,
            category,
            coupon_type,
            original_price,
            discounted_price,
            discount_percentage,
            image_url,
            merchants!inner(
              business_name,
              is_verified
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch analytics for each shared deal
      const enrichedDeals = await Promise.all(
        (sharedLinks || []).map(async (link) => {
          // Get referral tracking data
          const { data: referralData } = await supabase
            .from('referral_tracking')
            .select('*')
            .eq('share_token', link.token);

          // Get transaction data for earnings
          const { data: transactionData } = await supabase
            .from('jaicoin_transactions')
            .select('amount, source, description, metadata')
            .eq('user_id', userId)
            .like('description', `%${link.deals.title}%`);

          const totalClicks = referralData?.length || 0;
          const conversions = referralData?.filter(r => r.coupon_purchased || r.coupon_redeemed).length || 0;
          const totalEarnings = transactionData?.reduce((sum, t) => sum + t.amount, 0) || 0;

          return {
            ...link,
            analytics: {
              total_clicks: totalClicks,
              unique_visitors: new Set(referralData?.map(r => r.user_id).filter(Boolean)).size,
              conversions: conversions,
              total_earnings: totalEarnings,
              commission_earned: Math.floor(totalEarnings * 0.08), // 8% commission
              click_locations: ['Jaipur', 'Delhi', 'Mumbai'], // Mock data - would be from IP geolocation
              referral_sources: ['WhatsApp', 'Facebook', 'Direct Link'] // Mock data
            }
          };
        })
      );

      setSharedDeals(enrichedDeals);

      // Calculate total stats
      const stats = enrichedDeals.reduce((acc, deal) => ({
        totalShares: acc.totalShares + 1,
        totalClicks: acc.totalClicks + deal.analytics.total_clicks,
        totalEarnings: acc.totalEarnings + deal.analytics.total_earnings,
        totalCommission: acc.totalCommission + deal.analytics.commission_earned,
        conversionRate: 0 // Will calculate after
      }), { totalShares: 0, totalClicks: 0, totalEarnings: 0, totalCommission: 0, conversionRate: 0 });

      stats.conversionRate = stats.totalClicks > 0 ? 
        (enrichedDeals.reduce((sum, d) => sum + d.analytics.conversions, 0) / stats.totalClicks * 100) : 0;

      setTotalStats(stats);

    } catch (error) {
      console.error('Error fetching shared deals analytics:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Please sign in to view your shared deals analytics</p>
        </CardContent>
      </Card>
    );
  }

  if (sharedDeals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Shared Deals</CardTitle>
          <CardDescription>Track your deal sharing performance and rewards</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No shared deals yet</p>
          <p className="text-sm text-gray-500 mb-6">Start sharing deals to earn JaiCoins and build your network!</p>
          <Button className="bg-gradient-to-r from-pink-500 to-orange-400">
            <Share2 className="w-4 h-4 mr-2" />
            Share Your First Deal
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Shares</p>
                <p className="text-2xl font-bold">{totalStats.totalShares}</p>
              </div>
              <Share2 className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Clicks</p>
                <p className="text-2xl font-bold">{totalStats.totalClicks}</p>
              </div>
              <Eye className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">JaiCoins Earned</p>
                <p className="text-2xl font-bold">{totalStats.totalEarnings}</p>
              </div>
              <Coins className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Commission</p>
                <p className="text-2xl font-bold">₹{totalStats.totalCommission}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-pink-500 to-red-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100">Conversion</p>
                <p className="text-2xl font-bold">{totalStats.conversionRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-pink-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>My Shared Deals</CardTitle>
              <CardDescription>Comprehensive view of all your shared deals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sharedDeals.map((deal) => (
                  <Card key={deal.id} className="border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-orange-100 rounded-lg flex items-center justify-center text-2xl">
                          🎯
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{deal.deals.title}</h3>
                              <p className="text-gray-600 flex items-center gap-2">
                                {deal.deals.merchants.business_name}
                                {deal.deals.merchants.is_verified && (
                                  <Badge className="bg-green-100 text-green-700 text-xs">Verified</Badge>
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-yellow-100 text-yellow-800 mb-1">
                                <Coins className="w-3 h-3 mr-1" />
                                {deal.analytics.total_earnings} earned
                              </Badge>
                              <p className="text-xs text-gray-500">
                                Shared {new Date(deal.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <Eye className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                              <div className="text-sm font-bold text-blue-700">{deal.analytics.total_clicks}</div>
                              <div className="text-xs text-blue-600">Clicks</div>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded">
                              <Users className="w-4 h-4 mx-auto mb-1 text-green-600" />
                              <div className="text-sm font-bold text-green-700">{deal.analytics.unique_visitors}</div>
                              <div className="text-xs text-green-600">Visitors</div>
                            </div>
                            <div className="text-center p-2 bg-purple-50 rounded">
                              <ShoppingCart className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                              <div className="text-sm font-bold text-purple-700">{deal.analytics.conversions}</div>
                              <div className="text-xs text-purple-600">Purchases</div>
                            </div>
                            <div className="text-center p-2 bg-orange-50 rounded">
                              <TrendingUp className="w-4 h-4 mx-auto mb-1 text-orange-600" />
                              <div className="text-sm font-bold text-orange-700">₹{deal.analytics.commission_earned}</div>
                              <div className="text-xs text-orange-600">Commission</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {deal.analytics.click_locations.slice(0, 2).join(', ')}
                              </span>
                              <span>
                                Sources: {deal.analytics.referral_sources.slice(0, 2).join(', ')}
                              </span>
                            </div>
                            <Link to={`/deal/${deal.deals.id}`}>
                              <Button size="sm" variant="outline" className="text-xs">
                                View Deal
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Deep dive into your sharing performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Performing Deals */}
                  <div>
                    <h3 className="font-semibold mb-3">🏆 Top Performing Deals</h3>
                    <div className="space-y-2">
                      {sharedDeals
                        .sort((a, b) => b.analytics.total_clicks - a.analytics.total_clicks)
                        .slice(0, 3)
                        .map((deal, index) => (
                          <div key={deal.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">#{index + 1} {deal.deals.title.substring(0, 30)}...</span>
                            <Badge>{deal.analytics.total_clicks} clicks</Badge>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Conversion Insights */}
                  <div>
                    <h3 className="font-semibold mb-3">📊 Conversion Insights</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Best Converting Category:</span>
                        <Badge>Food & Dining</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Peak Sharing Time:</span>
                        <Badge>6-8 PM</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Best Platform:</span>
                        <Badge>WhatsApp</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Breakdown</CardTitle>
              <CardDescription>Track your JaiCoins and commission earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Earnings Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-lg">
                    <Coins className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-800">{totalStats.totalEarnings}</div>
                    <div className="text-green-600">Total JaiCoins</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-800">₹{totalStats.totalCommission}</div>
                    <div className="text-blue-600">Commission Earned</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-800">₹{Math.floor(totalStats.totalCommission / 30)}</div>
                    <div className="text-purple-600">Daily Average</div>
                  </div>
                </div>

                {/* Earning Trends */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">💡 Earning Tips</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Share high-value deals for better commission rates</li>
                    <li>• Focus on verified merchants for higher conversion</li>
                    <li>• Share during peak hours (6-8 PM) for maximum visibility</li>
                    <li>• Use WhatsApp for better engagement rates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SharedDealTracker;
