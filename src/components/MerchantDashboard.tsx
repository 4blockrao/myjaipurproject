
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  QrCode, 
  Search, 
  Eye, 
  TrendingUp, 
  Users, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Coupon {
  id: string;
  coupon_code: string;
  coupon_type: string;
  discount_amount: number;
  purchase_amount: number;
  status: string;
  expires_at: string;
  created_at: string;
  min_order_value: number;
  usage_terms: string;
  redeemed_at?: string;
  deals: {
    title: string;
    description: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

interface MerchantStats {
  totalCoupons: number;
  redeemedCoupons: number;
  activeCoupons: number;
  totalRevenue: number;
}

const MerchantDashboard = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<MerchantStats>({
    totalCoupons: 0,
    redeemedCoupons: 0,
    activeCoupons: 0,
    totalRevenue: 0
  });
  const [searchCode, setSearchCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
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
  };

  const fetchMerchantData = async (userId: string) => {
    try {
      // Get merchant info
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (merchantError) throw merchantError;
      setMerchant(merchantData);

      // Fetch coupons for this merchant
      const { data: couponsData, error: couponsError } = await supabase
        .from('coupons')
        .select(`
          *,
          deals!inner(title, description),
          profiles!inner(full_name, email)
        `)
        .eq('merchant_id', merchantData.id)
        .order('created_at', { ascending: false });

      if (couponsError) throw couponsError;

      const formattedCoupons: Coupon[] = couponsData?.map(coupon => ({
        id: coupon.id,
        coupon_code: coupon.coupon_code,
        coupon_type: coupon.coupon_type,
        discount_amount: coupon.discount_amount,
        purchase_amount: coupon.purchase_amount,
        status: coupon.status,
        expires_at: coupon.expires_at,
        created_at: coupon.created_at,
        min_order_value: coupon.min_order_value,
        usage_terms: coupon.usage_terms,
        redeemed_at: coupon.redeemed_at,
        deals: {
          title: coupon.deals?.title || 'Unknown Deal',
          description: coupon.deals?.description || ''
        },
        profiles: {
          full_name: coupon.profiles?.full_name || 'Unknown User',
          email: coupon.profiles?.email || ''
        }
      })) || [];

      setCoupons(formattedCoupons);

      // Calculate stats
      const totalCoupons = formattedCoupons.length;
      const redeemedCoupons = formattedCoupons.filter(c => c.status === 'redeemed').length;
      const activeCoupons = formattedCoupons.filter(c => c.status === 'active').length;
      const totalRevenue = formattedCoupons.reduce((sum, c) => sum + (c.purchase_amount || 0), 0);

      setStats({
        totalCoupons,
        redeemedCoupons,
        activeCoupons,
        totalRevenue
      });

    } catch (error) {
      console.error('Error fetching merchant data:', error);
      toast({
        title: "Error",
        description: "Failed to load merchant data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemCoupon = async (couponId: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ 
          status: 'redeemed',
          redeemed_at: new Date().toISOString(),
          redeemed_by: user.id
        })
        .eq('id', couponId);

      if (error) throw error;

      toast({
        title: "Coupon Redeemed",
        description: "Coupon has been successfully redeemed",
      });

      // Refresh data
      if (user) await fetchMerchantData(user.id);

    } catch (error) {
      console.error('Error redeeming coupon:', error);
      toast({
        title: "Error",
        description: "Failed to redeem coupon",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'redeemed':
        return <Badge className="bg-blue-100 text-blue-800">Redeemed</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.coupon_code.toLowerCase().includes(searchCode.toLowerCase()) ||
    coupon.profiles.full_name.toLowerCase().includes(searchCode.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Merchant Profile Found</CardTitle>
            <CardDescription>
              You need to complete merchant onboarding first.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {merchant.business_name} Dashboard
          </h1>
          <p className="text-gray-600">Manage your coupons and track performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCoupons}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Redeemed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.redeemedCoupons}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCoupons}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="coupons" className="space-y-6">
          <TabsList>
            <TabsTrigger value="coupons">Coupon Management</TabsTrigger>
            <TabsTrigger value="validator">QR Validator</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="coupons" className="space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle>Search Coupons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by coupon code or customer name..."
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Coupons List */}
            <div className="grid gap-4">
              {filteredCoupons.map((coupon) => (
                <Card key={coupon.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{coupon.deals.title}</h3>
                        <p className="text-gray-600">{coupon.profiles.full_name}</p>
                      </div>
                      {getStatusBadge(coupon.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Coupon Code</p>
                        <p className="font-mono font-medium">{coupon.coupon_code}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Discount</p>
                        <p className="font-semibold">₹{coupon.discount_amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Purchased For</p>
                        <p className="font-semibold">₹{coupon.purchase_amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expires</p>
                        <p className="text-sm">{new Date(coupon.expires_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {coupon.status === 'active' && (
                      <div className="flex justify-end">
                        <Button 
                          onClick={() => handleRedeemCoupon(coupon.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Mark as Redeemed
                        </Button>
                      </div>
                    )}

                    {coupon.redeemed_at && (
                      <div className="mt-2 text-sm text-gray-500">
                        Redeemed on: {new Date(coupon.redeemed_at).toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCoupons.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Coupons Found</h3>
                  <p className="text-gray-500">
                    {searchCode ? 'No coupons match your search criteria.' : 'No coupons have been generated yet.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="validator">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Validator</CardTitle>
                <CardDescription>
                  Scan QR codes or enter coupon codes to validate and redeem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">QR Scanner integration coming soon</p>
                  <p className="text-sm text-gray-500 mt-2">
                    For now, use the coupon management tab to manually redeem coupons
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Track your coupon performance and customer insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Detailed analytics coming soon</p>
                  <p className="text-sm text-gray-500 mt-2">
                    View redemption trends, customer behavior, and revenue insights
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MerchantDashboard;
