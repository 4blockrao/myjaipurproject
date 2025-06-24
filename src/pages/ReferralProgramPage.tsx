
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Users, Coins, Gift, Star, Trophy, Crown, Share2,
  Target, Flame, Award, TrendingUp, Calendar,
  Copy, MessageCircle, Instagram, Facebook, Twitter,
  Heart, Zap, CheckCircle, Clock, Smartphone
} from "lucide-react";

const ReferralProgramPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarned: 0,
    currentStreak: 0,
    level: 1,
    nextLevelTarget: 10
  });
  const [isLoading, setIsLoading] = useState(true);
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
          fetchReferralStats(session.user.id)
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
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchReferralStats = async (userId: string) => {
    try {
      // Get referral count
      const { data: referrals } = await supabase
        .from('profiles')
        .select('id, created_at')
        .eq('referred_by', userId);

      // Get total earnings from referrals
      const { data: earnings } = await supabase
        .from('jaicoin_transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('source', 'referral')
        .eq('type', 'earned');

      const totalReferrals = referrals?.length || 0;
      const totalEarned = earnings?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const level = Math.floor(totalReferrals / 10) + 1;
      const nextLevelTarget = level * 10;

      setReferralStats({
        totalReferrals,
        activeReferrals: Math.floor(totalReferrals * 0.8), // Mock active percentage
        totalEarned,
        currentStreak: 5, // Mock streak
        level,
        nextLevelTarget
      });
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  const copyReferralLink = async () => {
    if (profile?.referral_code) {
      const referralLink = `${window.location.origin}?ref=${profile.referral_code}`;
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "🎉 Referral Link Copied!",
        description: "Share this with friends to start earning!",
      });
    }
  };

  const levels = [
    { name: "Local Explorer", min: 0, max: 9, icon: Users, color: "text-gray-600", bg: "bg-gray-100" },
    { name: "Jaipur Guide", min: 10, max: 24, icon: Star, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Jaipur Champion", min: 25, max: 49, icon: Trophy, color: "text-green-600", bg: "bg-green-100" },
    { name: "Jaipur Legend", min: 50, max: 99, icon: Award, color: "text-yellow-600", bg: "bg-yellow-100" },
    { name: "Jaipur Maharaja", min: 100, max: Infinity, icon: Crown, color: "text-purple-600", bg: "bg-purple-100" }
  ];

  const rewards = [
    { referrals: 1, reward: "50 JAICoins + Welcome Badge", type: "basic" },
    { referrals: 5, reward: "250 JAICoins + MyJaipur T-shirt", type: "milestone" },
    { referrals: 10, reward: "500 JAICoins + Jaipur Guide Badge", type: "level" },
    { referrals: 25, reward: "1,250 JAICoins + VIP Status", type: "level" },
    { referrals: 50, reward: "2,500 JAICoins + Exclusive Events", type: "level" },
    { referrals: 100, reward: "5,000 JAICoins + Maharaja Crown", type: "level" }
  ];

  const triggerEvents = [
    { event: "Friend signs up", reward: "25 JAICoins", timing: "Instant" },
    { event: "Friend completes profile", reward: "25 JAICoins", timing: "Within 24 hours" },
    { event: "Friend redeems first deal", reward: "50 JAICoins", timing: "Within 7 days" },
    { event: "Friend stays active (30 days)", reward: "100 JAICoins", timing: "After 30 days" },
    { event: "Streak bonus (weekly)", reward: "50 JAICoins", timing: "Every Sunday" },
    { event: "Monthly top referrer", reward: "500 JAICoins", timing: "End of month" }
  ];

  const currentLevel = levels.find(l => 
    referralStats.totalReferrals >= l.min && referralStats.totalReferrals <= l.max
  ) || levels[0];

  const currentLevelProgress = ((referralStats.totalReferrals - currentLevel.min) / (currentLevel.max - currentLevel.min + 1)) * 100;

  if (isLoading) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="Referral Program" showBackButton>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Loading referral program...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="Referral Program" showBackButton>
        <Card className="mx-4 mt-4">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">Join the Referral Program</CardTitle>
            <CardDescription className="text-sm">Sign up to start earning JAICoins by referring friends!</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <Button className="w-full" onClick={() => window.location.href = '/'}>
              Sign Up Now
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile} pageTitle="Referral Program" showBackButton>
      <div className="space-y-6 p-4 max-w-4xl mx-auto">
        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-pink-500 to-orange-400 text-white border-0">
          <CardContent className="p-6">
            <div className="text-center">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">🎯 Build Your Jaipur Empire</h1>
              <p className="text-pink-100 mb-4">
                Invite friends, earn JAICoins, and become the ultimate Jaipur Champion!
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold">{referralStats.totalReferrals}</div>
                  <div className="text-pink-100">Friends Referred</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{referralStats.totalEarned}</div>
                  <div className="text-pink-100">JAICoins Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{referralStats.currentStreak}</div>
                  <div className="text-pink-100">Day Streak</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Level & Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <currentLevel.icon className={`w-6 h-6 ${currentLevel.color}`} />
              <span>Your Referral Level: {currentLevel.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>{referralStats.totalReferrals} referrals</span>
                <span>{currentLevel.max === Infinity ? 'Max Level' : `${currentLevel.max + 1} for next level`}</span>
              </div>
              <Progress value={currentLevelProgress} className="h-3" />
              
              <div className="grid grid-cols-5 gap-2">
                {levels.map((level, index) => {
                  const Icon = level.icon;
                  const isActive = referralStats.totalReferrals >= level.min;
                  return (
                    <div key={index} className={`p-2 rounded-lg text-center ${isActive ? level.bg : 'bg-gray-100'}`}>
                      <Icon className={`w-4 h-4 mx-auto mb-1 ${isActive ? level.color : 'text-gray-400'}`} />
                      <div className="text-xs font-medium">{level.name.split(' ')[1] || level.name}</div>
                      <div className="text-xs text-gray-600">{level.min}+</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Your Link */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Share2 className="w-5 h-5 text-green-600" />
              <span>Share Your Magic Link</span>
            </CardTitle>
            <CardDescription>
              Your unique referral code: <Badge className="ml-2">{profile?.referral_code}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.referral_code && (
              <div className="flex space-x-2">
                <div className="flex-1 p-3 bg-white rounded-lg border text-sm font-mono">
                  {`${window.location.origin}?ref=${profile.referral_code}`}
                </div>
                <Button onClick={copyReferralLink} size="sm" className="px-3">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: "WhatsApp", icon: MessageCircle, color: "bg-green-500" },
                { name: "Instagram", icon: Instagram, color: "bg-pink-500" },
                { name: "Facebook", icon: Facebook, color: "bg-blue-500" },
                { name: "Twitter", icon: Twitter, color: "bg-blue-400" }
              ].map((platform, index) => {
                const Icon = platform.icon;
                return (
                  <Button key={index} variant="outline" size="sm" className="h-auto py-3">
                    <div className="text-center">
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs">{platform.name}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* How to Maximize Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>💡 Pro Tips to Maximize Earnings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { tip: "Share in active WhatsApp groups", reward: "Higher conversion", icon: MessageCircle },
                { tip: "Post on Instagram stories with location tags", reward: "Reach local audience", icon: Instagram },
                { tip: "Target deal lovers and foodies", reward: "Quality referrals", icon: Heart },
                { tip: "Explain the free JAICoins benefit", reward: "Faster signups", icon: Coins },
                { tip: "Share during weekend evenings", reward: "Peak engagement", icon: Clock },
                { tip: "Use our pre-made graphics", reward: "Professional appeal", icon: Smartphone }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{item.tip}</p>
                      <p className="text-xs text-green-600">→ {item.reward}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Reward Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="w-5 h-5 text-purple-600" />
              <span>🎁 Reward Milestones</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rewards.map((reward, index) => {
                const achieved = referralStats.totalReferrals >= reward.referrals;
                return (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg border-2 ${achieved ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="flex items-center space-x-3">
                      {achieved ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-gray-400" />}
                      <div>
                        <p className="font-medium text-sm">{reward.referrals} Referrals</p>
                        <p className="text-xs text-gray-600">{reward.reward}</p>
                      </div>
                    </div>
                    <Badge variant={achieved ? "default" : "secondary"}>
                      {achieved ? "Achieved!" : "Locked"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* JAICoin Earning Triggers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span>⚡ When You Earn JAICoins</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {triggerEvents.map((trigger, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{trigger.event}</p>
                    <p className="text-xs text-gray-600">{trigger.timing}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-yellow-500 text-yellow-900">{trigger.reward}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* About JAICoins */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-yellow-600" />
              <span>💰 What are JAICoins?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                JAICoins are MyJaipur's virtual currency that you can earn and spend across our platform.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-green-700">✅ How to Earn:</h4>
                  <ul className="text-xs space-y-1 text-gray-600">
                    <li>• Refer friends (50 JC each)</li>
                    <li>• Daily check-ins (5-25 JC)</li>
                    <li>• Deal redemptions (5-50 JC)</li>
                    <li>• Social sharing (5-20 JC)</li>
                    <li>• Profile completion (25 JC)</li>
                    <li>• Special events & contests</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-blue-700">🎯 How to Use:</h4>
                  <ul className="text-xs space-y-1 text-gray-600">
                    <li>• Discount on deals (1 JC = ₹1)</li>
                    <li>• Unlock premium features</li>
                    <li>• Exclusive merchant offers</li>
                    <li>• Event tickets & experiences</li>
                    <li>• Merchandise from store</li>
                    <li>• Donate to local causes</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReferralProgramPage;
