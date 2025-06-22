
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Store, CreditCard, QrCode, Users, TrendingUp, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Merchant {
  id: string;
  business_name: string;
  business_type: string;
  email: string;
  phone: string;
  address: string;
  approval_status: string;
  listing_tier: string;
  listing_fee_paid: boolean;
  total_deals: number;
  total_reviews: number;
  average_rating: number;
}

interface Coupon {
  id: string;
  coupon_code: string;
  coupon_type: string;
  purchase_amount: number;
  discount_amount: number;
  status: string;
  created_at: string;
  expires_at: string;
  redeemed_at: string | null;
  deals: {
    title: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

const MerchantDashboard = () => {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [redeemCode, setRedeemCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMerchantData();
  }, []);

  const fetchMerchantData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch merchant profile
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (merchantError) {
        console.error('Error fetching merchant:', merchantError);
        return;
      }

      setMerchant(merchantData);

      // Fetch coupons for this merchant
      const { data: couponsData, error: couponsError } = await supabase
        .from('coupons')
        .select(`
          *,
          deals!inner(title),
          profiles!inner(full_name, email)
        `)
        .eq('merchant_id', merchantData.id)
        .order('created_at', { ascending: false });

      if (couponsError) {
        console.error('Error fetching coupons:', couponsError);
      } else {
        setCoupons(couponsData || []);
      }

    } catch (error) {
      console.error('Error fetching merchant data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemCoupon = async () => {
    if (!redeemCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a coupon code",
        variant: "destructive"
      });
      return;
    }

    setIsRedeeming(true);

    try {
      const { data: coupon, error: fetchError } = await supabase
        .from('coupons')
        .select('*')
        .eq('coupon_code', redeemCode.toUpperCase())
        .eq('merchant_id', merchant?.id)
        .eq('status', 'active')
        .single();

      if (fetchError || !coupon) {
        toast({
          title: "Invalid Coupon",
          description: "Coupon not found or already redeemed",
          variant: "destructive"
        });
        return;
      }

      // Check if coupon is expired
      if (new Date(coupon.expires_at) < new Date()) {
        toast({
          title: "Expired Coupon",
          description: "This coupon has expired",
          variant: "destructive"
        });
        return;
      }

      // Mark coupon as redeemed
      const { error: updateError } = await supabase
        .from('coupons')
        .update({
          status: 'redeemed',
          redeemed_at: new Date().toISOString()
        })
        .eq('id', coupon.id);

      if (updateError) throw updateError;

      // Award referral reward to the merchant referrer (if applicable)
      // This would be implemented based on the merchant's referrer_id

      toast({
        title: "Coupon Redeemed!",
        description: `Coupon ${redeemCode} has been successfully redeemed`,
      });

      setRedeemCode('');
      fetchMerchantData(); // Refresh data

    } catch (error) {
      console.error('Error redeeming coupon:', error);
      toast({
        title: "Redemption Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handlePayListingFee = async (tier: string) => {
    // Simulate payment gateway integration
    const fees = { basic: 99, featured: 499, exclusive: 1499 };
    const fee = fees[tier as keyof typeof fees];
    
    // In real implementation, integrate with Razorpay/Stripe here
    const paymentId = 'payment_' + Math.random().toString(36).substr(2, 9);
    
    try {
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

      fetchMerchantData();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 p-4 flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>No Merchant Profile</CardTitle>
            <CardDescription>You don't have a merchant profile yet. Please apply for merchant onboarding.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Store className="w-12 h-12 text-pink-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Merchant Dashboard</h1>
          <p className="text-gray-600 text-lg">{merchant.business_name}</p>
        </div>

        {/* Status and Payment Section */}
        {merchant.approval_status === 'approved' && !merchant.listing_fee_paid && (
          <Card className="mb-8 border-2 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Payment Required</CardTitle>
              <CardDescription>Your merchant application has been approved! Please pay the listing fee to activate your deals.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="text-center p-4">
                  <h3 className="font-bold mb-2">Basic Listing</h3>
                  <div className="text-2xl font-bold text-green-600 mb-2">₹99</div>
                  <p className="text-sm text-gray-600 mb-4">Standard listing in search results</p>
                  <Button onClick={() => handlePayListingFee('basic')} className="w-full">
                    Pay ₹99
                  </Button>
                </Card>
                <Card className="text-center p-4 border-2 border-yellow-300">
                  <h3 className="font-bold mb-2">Featured Listing</h3>
                  <div className="text-2xl font-bold text-yellow-600 mb-2">₹499</div>
                  <p className="text-sm text-gray-600 mb-4">Featured placement + highlighted</p>
                  <Button onClick={() => handlePayListingFee('featured')} className="w-full bg-yellow-500 hover:bg-yellow-600">
                    Pay ₹499
                  </Button>
                </Card>
                <Card className="text-center p-4 border-2 border-pink-300">
                  <h3 className="font-bold mb-2">Exclusive Listing</h3>
                  <div className="text-2xl font-bold text-pink-600 mb-2">₹1,499</div>
                  <p className="text-sm text-gray-600 mb-4">Top placement + newsletter push</p>
                  <Button onClick={() => handlePayListingFee('exclusive')} className="w-full bg-pink-500 hover:bg-pink-600">
                    Pay ₹1,499
                  </Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="redeem">Redeem</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Store className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold">{getStatusBadge(merchant.approval_status)}</div>
                      <div className="text-sm text-gray-600">Status</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-8 h-8 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">{merchant.total_deals}</div>
                      <div className="text-sm text-gray-600">Total Deals</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Users className="w-8 h-8 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold">{merchant.total_reviews}</div>
                      <div className="text-sm text-gray-600">Reviews</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-8 h-8 text-yellow-600" />
                    <div>
                      <div className="text-2xl font-bold">{merchant.average_rating.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Avg Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="coupons">
            <Card>
              <CardHeader>
                <CardTitle>Coupon Management</CardTitle>
                <CardDescription>View and manage all coupons for your deals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{coupon.deals?.title}</h4>
                          <p className="text-sm text-gray-600">Code: {coupon.coupon_code}</p>
                        </div>
                        <Badge className={coupon.status === 'redeemed' ? 'bg-green-100 text-green-800' : 
                                       coupon.status === 'expired' ? 'bg-red-100 text-red-800' : 
                                       'bg-blue-100 text-blue-800'}>
                          {coupon.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>Customer: {coupon.profiles?.full_name}</div>
                        <div>Value: ₹{coupon.discount_amount}</div>
                        <div>Expires: {new Date(coupon.expires_at).toLocaleDateString()}</div>
                        <div>
                          {coupon.redeemed_at ? 
                            `Redeemed: ${new Date(coupon.redeemed_at).toLocaleDateString()}` :
                            'Not redeemed'
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                  {coupons.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No coupons yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redeem">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="w-6 h-6" />
                  <span>Redeem Coupon</span>
                </CardTitle>
                <CardDescription>Enter coupon code to validate and redeem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleRedeemCoupon} disabled={isRedeeming}>
                      {isRedeeming ? 'Processing...' : 'Redeem'}
                    </Button>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                      Redemption Process
                    </h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Customer shows coupon code or QR code</li>
                      <li>Enter the code in the field above</li>
                      <li>Click "Redeem" to validate and mark as used</li>
                      <li>Coupon becomes invalid after redemption</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Redemption Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Coupons Issued:</span>
                      <span className="font-bold">{coupons.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Redeemed:</span>
                      <span className="font-bold text-green-600">
                        {coupons.filter(c => c.status === 'redeemed').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active:</span>
                      <span className="font-bold text-blue-600">
                        {coupons.filter(c => c.status === 'active').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Redemption Rate:</span>
                      <span className="font-bold">
                        {coupons.length > 0 ? 
                          Math.round((coupons.filter(c => c.status === 'redeemed').length / coupons.length) * 100) + '%' :
                          '0%'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Coupon Sales:</span>
                      <span className="font-bold">
                        ₹{coupons.reduce((sum, c) => sum + (c.purchase_amount || 0), 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Discount Value:</span>
                      <span className="font-bold text-green-600">
                        ₹{coupons.filter(c => c.status === 'redeemed').reduce((sum, c) => sum + c.discount_amount, 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MerchantDashboard;
