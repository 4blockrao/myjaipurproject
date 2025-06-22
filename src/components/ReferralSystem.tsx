
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Users, Gift, TrendingUp, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ReferralSystem = () => {
  const [profile, setProfile] = useState<any>(null);
  const [referrals, setReferrals] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    directReferrals: 0,
    indirectReferrals: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchReferrals();
    fetchEarnings();
    fetchUserBalance();
    fetchReferralStats();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        console.log('Profile data:', data);
        setProfile(data);
      }
    }
  };

  const fetchReferrals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('Fetching referrals for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, created_at, rank, email, total_referrals')
        .eq('referred_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching referrals:', error);
      } else {
        console.log('Referrals data:', data);
        setReferrals(data || []);
      }
    }
  };

  const fetchEarnings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('Fetching earnings for user:', user.id);
      const { data, error } = await supabase
        .from('referral_earnings')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching earnings:', error);
      } else {
        console.log('Earnings data:', data);
        setEarnings(data || []);
      }
    }
  };

  const fetchUserBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('Fetching balance for user:', user.id);
      const { data, error } = await supabase
        .from('jaicoin_transactions')
        .select('amount, type')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching balance:', error);
      } else {
        const balance = data?.reduce((total, transaction) => {
          return total + (transaction.type === 'earned' ? transaction.amount : -transaction.amount);
        }, 0) || 0;
        console.log('Calculated balance:', balance);
        setUserBalance(balance);
      }
    }
  };

  const fetchReferralStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Get direct referrals count
      const { count: directCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', user.id);

      // Get total referral earnings
      const { data: earningsData } = await supabase
        .from('jaicoin_transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('source', 'referral');

      const totalEarnings = earningsData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;

      setReferralStats({
        totalReferrals: directCount || 0,
        totalEarnings,
        directReferrals: directCount || 0,
        indirectReferrals: 0 // Would need more complex query for multi-level
      });
    }
  };

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  const shareReferral = () => {
    if (navigator.share && profile?.referral_code) {
      navigator.share({
        title: 'Join HiJaipur with my referral code!',
        text: `Use my referral code ${profile.referral_code} to earn 25 JaiCoins when you sign up for HiJaipur!`,
        url: window.location.origin
      });
    } else {
      copyReferralCode();
    }
  };

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.earnings, 0);

  if (!profile) {
    return (
      <div className="space-y-6">
        <Card className="border-pink-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Users className="w-12 h-12 mx-auto text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Sign In Required</h3>
                <p className="text-gray-500">Please sign in to access the referral program</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-yellow-50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-pink-600 flex items-center justify-center gap-2">
            <Users className="w-6 h-6" />
            Referral Program
          </CardTitle>
          <CardDescription>
            Invite friends and earn JaiCoins for every referral! Share your code and start earning.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <Label htmlFor="referral-code" className="text-base font-semibold">Your Referral Code</Label>
            <div className="flex gap-2">
              <Input
                id="referral-code"
                value={profile?.referral_code || 'Loading...'}
                readOnly
                className="text-center text-lg font-bold bg-white border-2 border-pink-200"
              />
              <Button onClick={copyReferralCode} size="icon" variant="outline" className="border-pink-200">
                <Copy className="w-4 h-4" />
              </Button>
              <Button onClick={shareReferral} size="icon" className="bg-pink-500 hover:bg-pink-600">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1 p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-pink-600">{referralStats.totalReferrals}</div>
              <div className="text-sm text-gray-600">Total Referrals</div>
            </div>
            <div className="space-y-1 p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-yellow-600">{referralStats.totalEarnings}</div>
              <div className="text-sm text-gray-600">JaiCoins Earned</div>
            </div>
            <div className="space-y-1 p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{userBalance}</div>
              <div className="text-sm text-gray-600">Current Balance</div>
            </div>
            <div className="space-y-1 p-3 bg-white rounded-lg border">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {profile?.rank || 'Bronze'}
              </Badge>
              <div className="text-sm text-gray-600">Current Rank</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-yellow-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-pink-700 mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Referral Rewards Structure
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Direct referral:</span>
                  <span className="font-semibold text-green-600">50 JaiCoins</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Your friend gets:</span>
                  <span className="font-semibold text-blue-600">25 JaiCoins</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>First purchase bonus:</span>
                  <span className="font-semibold text-purple-600">25 JaiCoins</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Milestone rewards:</span>
                  <span className="font-semibold text-orange-600">Up to 200</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Your Referrals ({referrals.length})
            </CardTitle>
            <CardDescription>People who joined using your referral code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.slice(0, 10).map((referral, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{referral.full_name || 'Anonymous User'}</div>
                    <div className="text-sm text-gray-500">
                      Joined {new Date(referral.created_at).toLocaleDateString('en-IN')} • 
                      {referral.total_referrals} referrals made
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {referral.rank}
                    </Badge>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              ))}
              {referrals.length > 10 && (
                <div className="text-center text-sm text-gray-500 mt-4">
                  And {referrals.length - 10} more referrals...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {earnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-500" />
              Referral Earnings History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {earnings.slice(0, 5).map((earning, index) => (
                <div key={index} className="flex justify-between items-center p-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium">Level {earning.level} Referral</div>
                    <div className="text-sm text-gray-500">
                      {new Date(earning.created_at).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">+{earning.earnings} JaiCoins</div>
                    <div className="text-xs text-gray-500 capitalize">{earning.source.replace('_', ' ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReferralSystem;
