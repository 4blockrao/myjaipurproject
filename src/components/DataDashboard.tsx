import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Store, Users, Tag, CreditCard, TrendingUp, Database, AlertTriangle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import DataSeeder from './DataSeeder';
import { useToast } from '@/hooks/use-toast';

interface MerchantData {
  id: string;
  business_name: string;
  business_type: string;
  email: string;
  phone: string;
  is_verified: boolean;
  listing_tier: string;
  approval_status: string;
  average_rating: number;
  total_reviews: number;
}

interface DealData {
  id: string;
  title: string;
  category: string;
  original_price: number;
  discounted_price: number;
  purchase_price: number;
  coupon_type: string;
  is_active: boolean;
  max_redemptions: number;
  current_redemptions: number;
  merchants: { business_name: string };
}

interface CouponData {
  id: string;
  coupon_code: string;
  status: string;
  discount_amount: number;
  purchase_amount: number;
  coupon_type: string;
  purchased_at: string;
  redeemed_at: string | null;
  deals: { title: string };
  merchants: { business_name: string };
}

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  rank: string;
  is_pro: boolean;
  total_referrals: number;
  referral_code: string;
}

const DataDashboard = () => {
  const [merchants, setMerchants] = useState<MerchantData[]>([]);
  const [deals, setDeals] = useState<DealData[]>([]);
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMerchants: 0,
    activeMerchants: 0,
    totalDeals: 0,
    activeDeals: 0,
    totalCoupons: 0,
    activeCoupons: 0,
    redeemedCoupons: 0,
    totalProfiles: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching all data...');

      // Test database connectivity first
      const { error: connectivityError } = await supabase.from('merchants').select('id').limit(1);
      if (connectivityError) {
        console.error('Database connectivity error:', connectivityError);
        toast({
          title: "Database Connection Error",
          description: "Unable to connect to the database. Please check your connection.",
          variant: "destructive"
        });
        return;
      }

      // Fetch merchants with better error handling
      const { data: merchantsData, error: merchantsError } = await supabase
        .from('merchants')
        .select('*')
        .order('created_at', { ascending: false });

      if (merchantsError) {
        console.error('Merchants error:', merchantsError);
        toast({
          title: "Error fetching merchants",
          description: merchantsError.message,
          variant: "destructive"
        });
      } else {
        console.log('Merchants data:', merchantsData);
        setMerchants(merchantsData || []);
      }

      // Fetch deals with merchant info
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select(`
          *,
          merchants!inner(business_name)
        `)
        .order('created_at', { ascending: false });

      if (dealsError) {
        console.error('Deals error:', dealsError);
        toast({
          title: "Error fetching deals",
          description: dealsError.message,
          variant: "destructive"
        });
      } else {
        console.log('Deals data:', dealsData);
        setDeals(dealsData || []);
      }

      // Fetch coupons with deal and merchant info
      const { data: couponsData, error: couponsError } = await supabase
        .from('coupons')
        .select(`
          *,
          deals!inner(title),
          merchants!inner(business_name)
        `)
        .order('purchased_at', { ascending: false });

      if (couponsError) {
        console.error('Coupons error:', couponsError);
        toast({
          title: "Error fetching coupons",
          description: couponsError.message,
          variant: "destructive"
        });
      } else {
        console.log('Coupons data:', couponsData);
        setCoupons(couponsData || []);
      }

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Profiles error:', profilesError);
        toast({
          title: "Error fetching profiles",
          description: profilesError.message,
          variant: "destructive"
        });
      } else {
        console.log('Profiles data:', profilesData);
        setProfiles(profilesData || []);
      }

      // Calculate stats
      const merchantStats = merchantsData || [];
      const dealStats = dealsData || [];
      const couponStats = couponsData || [];
      const profileStats = profilesData || [];

      setStats({
        totalMerchants: merchantStats.length,
        activeMerchants: merchantStats.filter(m => m.is_active).length,
        totalDeals: dealStats.length,
        activeDeals: dealStats.filter(d => d.is_active).length,
        totalCoupons: couponStats.length,
        activeCoupons: couponStats.filter(c => c.status === 'active').length,
        redeemedCoupons: couponStats.filter(c => c.status === 'redeemed').length,
        totalProfiles: profileStats.length
      });

      if (merchantStats.length === 0 && dealStats.length === 0) {
        toast({
          title: "No Data Found",
          description: "Database appears empty. Use the seeder to create sample data.",
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while fetching data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p>Loading system data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Data Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/admin/audit">
            <Button variant="outline" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              System Audit
            </Button>
          </Link>
          <Button 
            onClick={fetchAllData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Overview - Enhanced */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={stats.totalMerchants === 0 ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Merchants</p>
                <p className="text-2xl font-bold">{stats.totalMerchants}</p>
                <p className="text-xs text-green-600">{stats.activeMerchants} active</p>
              </div>
              <Store className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.totalDeals === 0 ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Deals</p>
                <p className="text-2xl font-bold">{stats.totalDeals}</p>
                <p className="text-xs text-green-600">{stats.activeDeals} active</p>
              </div>
              <Tag className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.totalCoupons === 0 ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coupons</p>
                <p className="text-2xl font-bold">{stats.totalCoupons}</p>
                <p className="text-xs text-orange-600">{stats.redeemedCoupons} redeemed</p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.totalProfiles === 0 ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Users</p>
                <p className="text-2xl font-bold">{stats.totalProfiles}</p>
                <p className="text-xs text-blue-600">profiles</p>
              </div>
              <Users className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Status Alert */}
      {stats.totalMerchants === 0 && stats.totalDeals === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">No Data Detected</span>
            </div>
            <p className="text-yellow-700 mt-2">
              The database appears to be empty. Use the data seeder below to create sample data for testing.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Data Seeder */}
      <DataSeeder />

      {/* Data Tables */}
      <Tabs defaultValue="merchants" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="merchants">Merchants ({merchants.length})</TabsTrigger>
          <TabsTrigger value="deals">Deals ({deals.length})</TabsTrigger>
          <TabsTrigger value="coupons">Coupons ({coupons.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({profiles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="merchants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Merchants ({merchants.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {merchants.map((merchant) => (
                  <div key={merchant.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{merchant.business_name}</h3>
                      <div className="flex gap-2">
                        <Badge variant={merchant.is_verified ? "default" : "secondary"}>
                          {merchant.is_verified ? "Verified" : "Pending"}
                        </Badge>
                        <Badge variant="outline">{merchant.listing_tier}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <span>Type: {merchant.business_type}</span>
                      <span>Status: {merchant.approval_status}</span>
                      <span>Rating: {merchant.average_rating}/5</span>
                      <span>Reviews: {merchant.total_reviews}</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span>📧 {merchant.email}</span>
                      <span className="ml-4">📞 {merchant.phone}</span>
                    </div>
                  </div>
                ))}
                {merchants.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No merchants found. Use the seeder to create sample data.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deals ({deals.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deals.map((deal) => (
                  <div key={deal.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{deal.title}</h3>
                      <div className="flex gap-2">
                        <Badge variant={deal.is_active ? "default" : "secondary"}>
                          {deal.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{deal.coupon_type}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <span>Merchant: {(deal.merchants as any)?.business_name}</span>
                      <span>Category: {deal.category}</span>
                      <span>Original: ₹{deal.original_price}</span>
                      <span>Discounted: ₹{deal.discounted_price}</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span>Purchase Price: ₹{deal.purchase_price}</span>
                      <span className="ml-4">Redeemed: {deal.current_redemptions}/{deal.max_redemptions || '∞'}</span>
                    </div>
                  </div>
                ))}
                {deals.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No deals found. Use the seeder to create sample data.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coupons ({coupons.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{coupon.coupon_code}</h3>
                      <div className="flex gap-2">
                        <Badge variant={coupon.status === 'redeemed' ? "default" : "secondary"}>
                          {coupon.status}
                        </Badge>
                        <Badge variant="outline">{coupon.coupon_type}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <span>Deal: {(coupon.deals as any)?.title}</span>
                      <span>Merchant: {(coupon.merchants as any)?.business_name}</span>
                      <span>Discount: ₹{coupon.discount_amount}</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span>Purchased: {new Date(coupon.purchased_at).toLocaleDateString()}</span>
                      {coupon.redeemed_at && (
                        <span className="ml-4">Redeemed: {new Date(coupon.redeemed_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
                {coupons.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No coupons found. Use the seeder to create sample data.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Profiles ({profiles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profiles.map((profile) => (
                  <div key={profile.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{profile.full_name}</h3>
                      <div className="flex gap-2">
                        <Badge variant={profile.is_pro ? "default" : "secondary"}>
                          {profile.is_pro ? "Pro" : "Basic"}
                        </Badge>
                        <Badge variant="outline">{profile.rank}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <span>📧 {profile.email}</span>
                      <span>📞 {profile.phone}</span>
                      <span>Referrals: {profile.total_referrals}</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span>Referral Code: {profile.referral_code}</span>
                    </div>
                  </div>
                ))}
                {profiles.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No user profiles found. Use the profile sync to create sample data.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataDashboard;
