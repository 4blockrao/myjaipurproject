
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Store, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  DollarSign,
  Calendar,
  MapPin,
  Star,
  QrCode,
  CreditCard,
  BarChart3,
  Crown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Merchant {
  id: string;
  business_name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  average_rating: number;
  total_reviews: number;
  total_deals: number;
  listing_tier: string;
  listing_fee_paid: boolean;
  is_verified: boolean;
  approval_status: string;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  category: string;
  purchase_price: number;
  coupon_type: string;
  max_redemptions: number;
  current_redemptions: number;
  is_active: boolean;
  created_at: string;
}

interface Coupon {
  id: string;
  coupon_code: string;
  status: string;
  purchased_at: string;
  redeemed_at: string | null;
  user_id: string;
  deal_title: string;
}

const MerchantDashboard = () => {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      await fetchMerchantData(user.id);
    }
    setIsLoading(false);
  };

  const fetchMerchantData = async (userId: string) => {
    try {
      console.log('Fetching merchant data for user:', userId);
      
      // Fetch merchant profile
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (merchantError) {
        console.error('Merchant fetch error:', merchantError);
        if (merchantError.code !== 'PGRST116') { // Not found error
          throw merchantError;
        }
      } else {
        console.log('Merchant data found:', merchantData);
        setMerchant(merchantData);

        // Fetch deals for this merchant
        const { data: dealsData, error: dealsError } = await supabase
          .from('deals')
          .select('*')
          .eq('merchant_id', merchantData.id)
          .order('created_at', { ascending: false });

        if (dealsError) {
          console.error('Deals fetch error:', dealsError);
        } else {
          console.log('Deals data:', dealsData);
          setDeals(dealsData || []);
        }

        // Fetch coupons for this merchant's deals
        const { data: couponsData, error: couponsError } = await supabase
          .from('coupons')
          .select(`
            id,
            coupon_code,
            status,
            purchased_at,
            redeemed_at,
            user_id,
            deals!inner(title)
          `)
          .eq('merchant_id', merchantData.id)
          .order('purchased_at', { ascending: false });

        if (couponsError) {
          console.error('Coupons fetch error:', couponsError);
        } else {
          console.log('Coupons data:', couponsData);
          // Transform the data to match our interface
          const transformedCoupons = (couponsData || []).map(coupon => ({
            id: coupon.id,
            coupon_code: coupon.coupon_code,
            status: coupon.status,
            purchased_at: coupon.purchased_at,
            redeemed_at: coupon.redeemed_at,
            user_id: coupon.user_id,
            deal_title: (coupon.deals as any)?.title || 'Unknown Deal'
          }));
          setCoupons(transformedCoupons);
        }
      }

    } catch (error) {
      console.error('Error fetching merchant data:', error);
      toast({
        title: "Error",
        description: "Failed to load merchant data",
        variant: "destructive"
      });
    }
  };

  const validateRedemption = async () => {
    if (!redemptionCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a redemption code",
        variant: "destructive"
      });
      return;
    }

    try {
      // Find coupon by code
      const { data: coupon, error: findError } = await supabase
        .from('coupons')
        .select(`
          *,
          deals!inner(title, jaicoin_reward)
        `)
        .eq('coupon_code', redemptionCode.trim())
        .eq('merchant_id', merchant?.id)
        .single();

      if (findError || !coupon) {
        toast({
          title: "Invalid Code",
          description: "Coupon code not found or not valid for your store",
          variant: "destructive"
        });
        return;
      }

      if (coupon.status === 'redeemed') {
        toast({
          title: "Already Redeemed",
          description: "This coupon has already been redeemed",
          variant: "destructive"
        });
        return;
      }

      // Update coupon status
      const { error: updateError } = await supabase
        .from('coupons')
        .update({
          status: 'redeemed',
          redeemed_at: new Date().toISOString(),
          redeemed_by: merchant?.id
        })
        .eq('id', coupon.id);

      if (updateError) throw updateError;

      // Award JaiCoins for redemption
      const dealData = coupon.deals as any;
      const { error: rewardError } = await supabase
        .from('jaicoin_transactions')
        .insert({
          user_id: coupon.user_id,
          amount: dealData?.jaicoin_reward || 10,
          type: 'earned',
          source: 'redemption',
          description: `Redeemed: ${dealData?.title || 'Deal'}`
        });

      if (rewardError) throw rewardError;

      toast({
        title: "Coupon Redeemed!",
        description: `Successfully redeemed coupon for ${dealData?.title || 'Deal'}`,
      });

      setRedemptionCode('');
      fetchMerchantData(user.id);

    } catch (error) {
      console.error('Error validating redemption:', error);
      toast({
        title: "Error",
        description: "Failed to validate redemption",
        variant: "destructive"
      });
    }
  };

  const payListingFee = async (tier: string) => {
    const feeAmount = tier === 'premium' ? 999 : 1999;
    
    try {
      // Simulate payment processing
      const paymentId = `pay_${Date.now()}`;
      
      const { error } = await supabase
        .from('merchants')
        .update({
          listing_tier: tier,
          listing_fee_paid: true,
          listing_payment_id: paymentId
        })
        .eq('id', merchant?.id);

      if (error) throw error;

      toast({
        title: "Payment Successful!",
        description: `Your ${tier} listing is now active`,
      });

      fetchMerchantData(user.id);

    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Please sign in to access merchant dashboard</p>
        </CardContent>
      </Card>
    );
  }

  if (!merchant) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Merchant profile not found</p>
          <p className="text-sm text-gray-500">Please complete merchant onboarding first</p>
        </CardContent>
      </Card>
    );
  }

  const activeCoupons = coupons.filter(c => c.status === 'active').length;
  const redeemedCoupons = coupons.filter(c => c.status === 'redeemed').length;
  const totalRevenue = coupons
    .filter(c => c.status === 'redeemed')
    .reduce((sum, c) => {
      const deal = deals.find(d => d.id === c.id);
      return sum + (deal?.purchase_price || 0);
    }, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{merchant.business_name}</h1>
          <p className="text-gray-600">{merchant.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={merchant.is_verified ? "default" : "secondary"}>
            {merchant.is_verified ? "Verified" : "Pending"}
          </Badge>
          <Badge variant={merchant.listing_tier === 'enterprise' ? "default" : "outline"}>
            <Crown className="w-3 h-3 mr-1" />
            {merchant.listing_tier}
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deals</p>
                <p className="text-2xl font-bold">{deals.length}</p>
              </div>
              <Store className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Coupons</p>
                <p className="text-2xl font-bold">{activeCoupons}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Redeemed</p>
                <p className="text-2xl font-bold">{redeemedCoupons}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">₹{totalRevenue}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="redemptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="redemptions">Coupon Redemptions</TabsTrigger>
          <TabsTrigger value="deals">My Deals</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade Listing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="redemptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Validate Coupon Redemption
              </CardTitle>
              <CardDescription>
                Enter coupon code to validate and mark as redeemed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code (e.g., JAI12345678)"
                  value={redemptionCode}
                  onChange={(e) => setRedemptionCode(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={validateRedemption}>
                  Validate
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {coupons.slice(0, 10).map((coupon) => (
                  <div key={coupon.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{coupon.coupon_code}</p>
                      <p className="text-sm text-gray-600">{coupon.deal_title}</p>
                      <p className="text-xs text-gray-500">
                        Purchased: {new Date(coupon.purchased_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={coupon.status === 'redeemed' ? 'default' : 'secondary'}>
                      {coupon.status}
                    </Badge>
                  </div>
                ))}
                {coupons.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No coupons found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Deals</CardTitle>
              <CardDescription>Manage your published deals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deals.map((deal) => (
                  <div key={deal.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{deal.title}</h3>
                      <Badge variant={deal.is_active ? 'default' : 'secondary'}>
                        {deal.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{deal.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Price: ₹{deal.purchase_price}</span>
                      <span>Redeemed: {deal.current_redemptions}/{deal.max_redemptions || '∞'}</span>
                      <span>Type: {deal.coupon_type}</span>
                    </div>
                  </div>
                ))}
                {deals.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No deals created yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upgrade" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Upgrade Your Listing
              </CardTitle>
              <CardDescription>
                Choose a plan to enhance your business visibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-xl">Premium Listing</CardTitle>
                    <div className="text-3xl font-bold">₹999</div>
                    <CardDescription>Enhanced visibility and features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Priority in search results</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Featured deal highlights</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Basic analytics</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => payListingFee('premium')}
                      disabled={merchant.listing_tier === 'premium' && merchant.listing_fee_paid}
                    >
                      {merchant.listing_tier === 'premium' && merchant.listing_fee_paid ? 'Current Plan' : 'Upgrade to Premium'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-300">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      Enterprise Listing
                      <Crown className="w-5 h-5 text-yellow-500" />
                    </CardTitle>
                    <div className="text-3xl font-bold">₹1999</div>
                    <CardDescription>Maximum exposure and premium features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Top placement in all searches</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Unlimited featured deals</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Advanced analytics & insights</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Priority customer support</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" 
                      onClick={() => payListingFee('enterprise')}
                      disabled={merchant.listing_tier === 'enterprise' && merchant.listing_fee_paid}
                    >
                      {merchant.listing_tier === 'enterprise' && merchant.listing_fee_paid ? 'Current Plan' : 'Upgrade to Enterprise'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Business Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Deals Created:</span>
                      <span className="font-medium">{deals.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coupons Sold:</span>
                      <span className="font-medium">{coupons.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Redemption Rate:</span>
                      <span className="font-medium">
                        {coupons.length > 0 ? Math.round((redeemedCoupons / coupons.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Rating:</span>
                      <span className="font-medium flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {merchant.average_rating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Revenue Insights</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span className="font-medium">₹{totalRevenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Coupons:</span>
                      <span className="font-medium">{activeCoupons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Listing Tier:</span>
                      <span className="font-medium capitalize">{merchant.listing_tier}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantDashboard;
