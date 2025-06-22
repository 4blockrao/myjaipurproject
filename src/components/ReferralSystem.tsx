
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Users, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ReferralSystem = () => {
  const [profile, setProfile] = useState<any>(null);
  const [referrals, setReferrals] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchReferrals();
    fetchEarnings();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data);
    }
  };

  const fetchReferrals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, created_at, rank')
        .eq('referred_by', user.id);
      setReferrals(data || []);
    }
  };

  const fetchEarnings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('referral_earnings')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });
      setEarnings(data || []);
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
        text: `Use my referral code ${profile.referral_code} to earn 25 JaiCoins when you sign up!`,
        url: window.location.origin
      });
    } else {
      copyReferralCode();
    }
  };

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.earnings, 0);

  return (
    <div className="space-y-6">
      <Card className="border-pink-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-pink-600 flex items-center justify-center gap-2">
            <Users className="w-6 h-6" />
            Referral Program
          </CardTitle>
          <CardDescription>
            Invite friends and earn JaiCoins for every referral!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <Label htmlFor="referral-code">Your Referral Code</Label>
            <div className="flex gap-2">
              <Input
                id="referral-code"
                value={profile?.referral_code || ''}
                readOnly
                className="text-center text-lg font-bold"
              />
              <Button onClick={copyReferralCode} size="icon" variant="outline">
                <Copy className="w-4 h-4" />
              </Button>
              <Button onClick={shareReferral} size="icon" className="bg-pink-500 hover:bg-pink-600">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-pink-600">{referrals.length}</div>
              <div className="text-sm text-gray-600">Total Referrals</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-yellow-600">{totalEarnings}</div>
              <div className="text-sm text-gray-600">JaiCoins Earned</div>
            </div>
            <div className="space-y-1">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {profile?.rank || 'Bronze'}
              </Badge>
              <div className="text-sm text-gray-600">Current Rank</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-pink-700 mb-2 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Referral Rewards
            </h4>
            <ul className="text-sm space-y-1">
              <li>• Direct referral: <span className="font-semibold">10 JaiCoins</span></li>
              <li>• 2nd level referral: <span className="font-semibold">5 JaiCoins</span></li>
              <li>• Your friend gets: <span className="font-semibold">25 JaiCoins</span></li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {referrals.map((referral, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{referral.full_name || 'Anonymous User'}</div>
                    <div className="text-sm text-gray-500">
                      Joined {new Date(referral.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="outline">{referral.rank}</Badge>
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
