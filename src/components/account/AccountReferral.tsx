import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Users, Share2, Copy, Gift, Trophy, 
  Check, ChevronRight, Sparkles
} from "lucide-react";

interface AccountReferralProps {
  user: any;
  profile: any;
}

const AccountReferral = ({ user, profile }: AccountReferralProps) => {
  const [referralCode, setReferralCode] = useState(profile?.referral_code || '');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: profile?.total_referrals || 0,
    pendingRewards: 0,
    totalEarned: 0
  });
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchReferralStats();
    }
  }, [user]);

  const fetchReferralStats = async () => {
    try {
      // Fetch referral earnings
      const { data: earnings } = await supabase
        .from('referral_earnings')
        .select('earnings')
        .eq('referrer_id', user.id);

      const totalEarned = earnings?.reduce((sum, e) => sum + e.earnings, 0) || 0;

      setReferralStats(prev => ({
        ...prev,
        totalReferrals: profile?.total_referrals || 0,
        totalEarned
      }));
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  const handleCopyLink = () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Share it with friends to earn JAICoins",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    const shareText = `Join JaipurCircle and get 50 JAICoins! Use my referral link: ${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join JaipurCircle',
          text: shareText,
          url: referralLink,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      handleCopyLink();
    }
  };

  const milestones = [
    { count: 5, reward: 100, label: '5 Friends', achieved: referralStats.totalReferrals >= 5 },
    { count: 10, reward: 250, label: '10 Friends', achieved: referralStats.totalReferrals >= 10 },
    { count: 25, reward: 500, label: '25 Friends', achieved: referralStats.totalReferrals >= 25 },
    { count: 50, reward: 1000, label: '50 Friends', achieved: referralStats.totalReferrals >= 50 },
  ];

  return (
    <div className="space-y-4">
      {/* Hero Card */}
      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 overflow-hidden">
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 opacity-10">
            <Gift className="w-32 h-32 -mt-8 -mr-8" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Refer & Earn</h2>
            <p className="text-green-100 mb-4">
              Invite friends to JaipurCircle and earn 50 JAICoins for each friend who joins!
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
                <p className="text-xs text-green-100">Friends Joined</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{referralStats.totalEarned}</p>
                <p className="text-xs text-green-100">Total Earned</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Link */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" />
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={`${window.location.origin}?ref=${referralCode}`}
              readOnly
              className="text-sm"
            />
            <Button 
              onClick={handleCopyLink}
              variant={copied ? "default" : "outline"}
              size="icon"
              className="shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          
          <Button onClick={handleShare} className="w-full" size="lg">
            <Share2 className="w-4 h-4 mr-2" />
            Share with Friends
          </Button>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="font-bold text-primary">1</span>
            </div>
            <div>
              <p className="font-medium">Share your link</p>
              <p className="text-sm text-muted-foreground">Send your referral link to friends</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="font-bold text-primary">2</span>
            </div>
            <div>
              <p className="font-medium">Friend signs up</p>
              <p className="text-sm text-muted-foreground">They create an account using your link</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
              <span className="font-bold text-green-600">3</span>
            </div>
            <div>
              <p className="font-medium">Both earn rewards!</p>
              <p className="text-sm text-muted-foreground">You get 50 JAICoins, they get 50 too!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Bonus Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  milestone.achieved ? 'bg-green-50 border border-green-200' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    milestone.achieved ? 'bg-green-500 text-white' : 'bg-muted'
                  }`}>
                    {milestone.achieved ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Users className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{milestone.label}</p>
                    <p className="text-sm text-muted-foreground">{referralStats.totalReferrals}/{milestone.count} friends</p>
                  </div>
                </div>
                <Badge variant={milestone.achieved ? "default" : "secondary"}>
                  +{milestone.reward} JC
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountReferral;
