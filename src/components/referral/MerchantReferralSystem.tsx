
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Store, Users, Coins, TrendingUp, Share2, Building2,
  Calendar, MapPin, Phone, Mail, CheckCircle, Clock,
  Gift, Award, Target, DollarSign
} from "lucide-react";

interface MerchantReferralStats {
  totalReferred: number;
  pendingApplications: number;
  approvedMerchants: number;
  totalEarnings: number;
  recentRewards: Array<{
    id: string;
    reward_type: string;
    amount: number;
    merchant_name: string;
    awarded_at: string;
  }>;
}

const MerchantReferralSystem = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState<MerchantReferralStats>({
    totalReferred: 0,
    pendingApplications: 0,
    approvedMerchants: 0,
    totalEarnings: 0,
    recentRewards: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [referredMerchants, setReferredMerchants] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await Promise.all([
          fetchUserProfile(session.user.id),
          fetchReferralStats(session.user.id),
          fetchReferredMerchants(session.user.id)
        ]);
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

      if (error) throw error;
      setProfile(data);
      setReferralCode(data.referral_code || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchReferralStats = async (userId: string) => {
    try {
      // Get merchant referral rewards
      const { data: rewards, error: rewardsError } = await supabase
        .from('merchant_referral_rewards')
        .select(`
          *,
          merchants!inner(business_name)
        `)
        .eq('referrer_id', userId)
        .order('awarded_at', { ascending: false });

      if (rewardsError) throw rewardsError;

      // Calculate stats
      const totalEarnings = rewards?.reduce((sum, reward) => sum + reward.amount, 0) || 0;
      const totalReferred = new Set(rewards?.map(r => r.merchant_id)).size;

      // Get pending applications
      const { data: applications, error: appError } = await supabase
        .from('merchant_applications')
        .select('*')
        .eq('status', 'pending');

      if (appError) throw appError;

      // Get approved merchants
      const { data: merchants, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('referred_by', userId)
        .eq('approval_status', 'approved');

      if (merchantError) throw merchantError;

      setStats({
        totalReferred: totalReferred,
        pendingApplications: applications?.length || 0,
        approvedMerchants: merchants?.length || 0,
        totalEarnings,
        recentRewards: rewards?.slice(0, 5).map(reward => ({
          id: reward.id,
          reward_type: reward.reward_type,
          amount: reward.amount,
          merchant_name: reward.merchants.business_name,
          awarded_at: reward.awarded_at
        })) || []
      });
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  const fetchReferredMerchants = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select(`
          *,
          deals:deals(count)
        `)
        .eq('referred_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferredMerchants(data || []);
    } catch (error) {
      console.error('Error fetching referred merchants:', error);
    }
  };

  const copyReferralLink = async () => {
    if (referralCode) {
      const referralLink = `${window.location.origin}/merchant-onboarding?ref=${referralCode}`;
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "🎉 Referral Link Copied!",
        description: "Share this with potential merchants to start earning rewards!",
      });
    }
  };

  const generateReferralMessage = () => {
    const message = `🚀 Join JaipurCircle's Merchant Network!

I'm inviting you to list your business on JaipurCircle - the fastest growing deals platform in Jaipur!

✅ FREE merchant listing
✅ Reach thousands of customers
✅ Easy deal management
✅ Real-time analytics
✅ Verified customer base

Join using my referral link: ${window.location.origin}/merchant-onboarding?ref=${referralCode}

Start growing your business today! 💪`;

    navigator.clipboard.writeText(message);
    toast({
      title: "Message Copied!",
      description: "Share this message with potential merchants",
    });
  };

  const getRewardTypeLabel = (type: string) => {
    switch (type) {
      case 'onboarding': return 'Merchant Signup';
      case 'deal_submission': return 'Deal Listed';
      case 'redemption': return 'Deal Redeemed';
      case 'milestone': return 'Milestone Bonus';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Please Sign In</CardTitle>
          <CardDescription>You need to be signed in to access merchant referrals</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Referred</p>
                <p className="text-2xl font-bold">{stats.totalReferred}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingApplications}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Approved</p>
                <p className="text-2xl font-bold">{stats.approvedMerchants}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Earned</p>
                <p className="text-2xl font-bold">{stats.totalEarnings}</p>
              </div>
              <Coins className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="refer">Refer Merchant</TabsTrigger>
          <TabsTrigger value="merchants">My Merchants</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Referral Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Conversion Rate</span>
                    <span className="font-bold text-green-600">
                      {stats.totalReferred > 0 ? Math.round((stats.approvedMerchants / stats.totalReferred) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Earnings per Merchant</span>
                    <span className="font-bold">
                      {stats.approvedMerchants > 0 ? Math.round(stats.totalEarnings / stats.approvedMerchants) : 0} JC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Month's Referrals</span>
                    <span className="font-bold">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Reward Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm">Merchant Signup</span>
                    <Badge>200 JC</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">First Deal Listed</span>
                    <Badge>100 JC</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                    <span className="text-sm">Per Deal Redemption</span>
                    <Badge>10 JC</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                    <span className="text-sm">10 Redemptions Bonus</span>
                    <Badge>500 JC</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="refer">
          <Card>
            <CardHeader>
              <CardTitle>Refer a Merchant</CardTitle>
              <CardDescription>
                Share your referral link with potential merchants and earn rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="referralCode">Your Referral Code</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="referralCode"
                    value={referralCode}
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={copyReferralLink} className="bg-pink-500 hover:bg-pink-600">
                    <Share2 className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={generateReferralMessage} variant="outline" className="flex-1">
                  Generate Message
                </Button>
                <Button 
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Join JaipurCircle's Merchant Network! ${window.location.origin}/merchant-onboarding?ref=${referralCode}`)}`)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Share on WhatsApp
                </Button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">💡 Best Practices for Referrals</h4>
                <ul className="text-sm space-y-1">
                  <li>• Target local businesses in Jaipur</li>
                  <li>• Focus on restaurants, retail stores, and service providers</li>
                  <li>• Explain the benefits: free listing, customer reach, easy management</li>
                  <li>• Follow up with referred merchants to ensure completion</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="merchants">
          <Card>
            <CardHeader>
              <CardTitle>Referred Merchants</CardTitle>
              <CardDescription>Track the merchants you've referred to the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {referredMerchants.length === 0 ? (
                <div className="text-center py-8">
                  <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No merchants referred yet</p>
                  <p className="text-sm text-gray-500">Start referring merchants to see them here!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {referredMerchants.map((merchant) => (
                    <div key={merchant.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{merchant.business_name}</h3>
                            <Badge 
                              className={
                                merchant.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                                merchant.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }
                            >
                              {merchant.approval_status}
                            </Badge>
                            {merchant.is_verified && (
                              <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {merchant.business_type}
                            </p>
                            <p className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Joined {new Date(merchant.created_at).toLocaleDateString()}
                            </p>
                            {merchant.deals && (
                              <p className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                {merchant.deals.length} deals listed
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            Avg Rating: {merchant.average_rating?.toFixed(1) || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {merchant.total_reviews} reviews
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Recent Rewards</CardTitle>
              <CardDescription>Your latest merchant referral earnings</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentRewards.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No rewards yet</p>
                  <p className="text-sm text-gray-500">Start referring merchants to earn rewards!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentRewards.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Coins className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{getRewardTypeLabel(reward.reward_type)}</p>
                          <p className="text-xs text-gray-600">{reward.merchant_name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(reward.awarded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">+{reward.amount}</p>
                        <p className="text-xs text-gray-500">JaiCoins</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantReferralSystem;
