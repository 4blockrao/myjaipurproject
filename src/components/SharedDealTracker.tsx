
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart, CheckCircle, Coins, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SharedDeal {
  id: string;
  token: string;
  created_at: string;
  link_clicks: number;
  deals: {
    title: string;
    coupon_type: string;
    purchase_price: number;
  };
  purchase_count: number;
  redemption_count: number;
  total_rewards_earned: number;
}

const SharedDealTracker = () => {
  const [sharedDeals, setSharedDeals] = useState<SharedDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      await fetchSharedDeals(user.id);
    }
    setIsLoading(false);
  };

  const fetchSharedDeals = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('shared_deal_links')
        .select(`
          *,
          deals!inner(
            title,
            coupon_type,
            purchase_price
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate stats for each shared deal
      const enrichedData = await Promise.all(
        data.map(async (link) => {
          // Count purchases/redemptions via this link
          const { data: referralData } = await supabase
            .from('referral_tracking')
            .select('*')
            .eq('share_token', link.token);

          const purchaseCount = referralData?.filter(r => r.coupon_purchased).length || 0;
          const redemptionCount = referralData?.filter(r => r.coupon_redeemed).length || 0;
          
          // Calculate total rewards earned (20 JaiCoins per trigger)
          const totalRewardsEarned = (link.deals.coupon_type === 'free' ? redemptionCount : purchaseCount) * 20;

          return {
            ...link,
            purchase_count: purchaseCount,
            redemption_count: redemptionCount,
            total_rewards_earned: totalRewardsEarned
          };
        })
      );

      setSharedDeals(enrichedData);
    } catch (error) {
      console.error('Error fetching shared deals:', error);
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
          <p className="text-gray-600">Please sign in to view your shared deals</p>
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
          <p className="text-gray-600 mb-2">No shared deals yet</p>
          <p className="text-sm text-gray-500">Start sharing deals to earn JaiCoins!</p>
        </CardContent>
      </Card>
    );
  }

  const totalRewardsEarned = sharedDeals.reduce((sum, deal) => sum + deal.total_rewards_earned, 0);
  const totalClicks = sharedDeals.reduce((sum, deal) => sum + (deal.link_clicks || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold">{totalClicks}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Deals Shared</p>
                <p className="text-2xl font-bold">{sharedDeals.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">JaiCoins Earned</p>
                <p className="text-2xl font-bold">{totalRewardsEarned}</p>
              </div>
              <Coins className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shared Deals List */}
      <Card>
        <CardHeader>
          <CardTitle>My Shared Deals</CardTitle>
          <CardDescription>Track performance of your shared deals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sharedDeals.map((deal) => (
              <div key={deal.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{deal.deals.title}</h3>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Coins className="w-3 h-3 mr-1" />
                    {deal.total_rewards_earned} earned
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span>{deal.link_clicks || 0} clicks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-gray-500" />
                    <span>{deal.purchase_count} purchases</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-500" />
                    <span>{deal.redemption_count} redemptions</span>
                  </div>
                  <div className="text-gray-500">
                    Shared {new Date(deal.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Reward triggers on: {deal.deals.coupon_type === 'free' ? 'Redemption' : 'Purchase'} 
                  {deal.deals.coupon_type !== 'free' && ` (₹${deal.deals.purchase_price})`}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SharedDealTracker;
