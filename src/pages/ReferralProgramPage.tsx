import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FloatingHeader from "@/components/layout/FloatingHeader";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import {
  Users, Share2, Copy, Gift, Trophy, Check, 
  ChevronRight, Sparkles, Crown, Coins, Star,
  UserPlus, Smartphone, QrCode
} from "lucide-react";

interface ReferredUser {
  id: string;
  full_name: string;
  created_at: string;
}

const ReferralProgramPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [referralCode, setReferralCode] = useState('');
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarned: 0
  });
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
        await fetchReferredUsers(session.user.id);
        await fetchReferralStats(session.user.id);
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
      setReferralCode(data?.user_id_code || data?.referral_code || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchReferredUsers = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, created_at')
        .eq('referred_by', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setReferredUsers(data || []);
    } catch (error) {
      console.error('Error fetching referred users:', error);
    }
  };

  const fetchReferralStats = async (userId: string) => {
    try {
      const { data: earnings } = await supabase
        .from('referral_earnings')
        .select('earnings')
        .eq('referrer_id', userId);

      const totalEarned = earnings?.reduce((sum, e) => sum + e.earnings, 0) || 0;

      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', userId);

      setReferralStats({
        totalReferrals: count || 0,
        totalEarned
      });
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  const getReferralLink = () => {
    const code = profile?.user_id_code || referralCode;
    return `${window.location.origin}?ref=${code}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getReferralLink());
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Share it with friends to earn JAICoins",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const referralLink = getReferralLink();
    const shareText = `🎁 Join JaipurCircle and get 50 JAICoins! Use my code: ${profile?.user_id_code || referralCode}\n\n${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join JaipurCircle - Earn Rewards!',
          text: shareText,
          url: referralLink,
        });
      } catch (error) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const referralLink = getReferralLink();
    const text = `🎁 Join JaipurCircle and get 50 JAICoins! Use my referral code: ${profile?.user_id_code || referralCode}\n\n${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const milestones = [
    { count: 5, reward: 100, label: '5 Friends' },
    { count: 10, reward: 250, label: '10 Friends' },
    { count: 25, reward: 500, label: '25 Friends' },
    { count: 50, reward: 1000, label: '50 Friends' },
    { count: 100, reward: 2500, label: '100 Friends' },
  ];

  // Guest view
  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <FloatingHeader title="Referral Program" showBackButton backPath="/" />
        
        <main className="pt-16 px-4 max-w-lg mx-auto">
          {/* Hero */}
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <Gift className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Earn Unlimited JAICoins</h1>
            <p className="text-muted-foreground">
              Join our referral program and earn 50 JAICoins for every friend who signs up!
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
              <CardContent className="p-4 flex items-center gap-3">
                <Coins className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-semibold">50 JAICoins per referral</p>
                  <p className="text-sm text-muted-foreground">No limit on earnings!</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
              <CardContent className="p-4 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-semibold">Bonus milestones</p>
                  <p className="text-sm text-muted-foreground">Extra rewards at 5, 10, 25+ referrals</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
              <CardContent className="p-4 flex items-center gap-3">
                <Crown className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="font-semibold">Leaderboard rewards</p>
                  <p className="text-sm text-muted-foreground">Top referrers win monthly prizes!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button 
            onClick={() => navigate('/auth?tab=signup')} 
            size="lg" 
            className="w-full h-14 text-lg rounded-xl"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Join & Get Your Referral Code
          </Button>
        </main>

        <NativeBottomNav />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <FloatingHeader title="Referral Program" showBackButton backPath="/" />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
        <NativeBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <FloatingHeader title="Referral Program" showBackButton backPath="/account" />
      
      <main className="pt-16 px-4 max-w-lg mx-auto space-y-4 py-4">
        {/* Hero Stats */}
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 opacity-10">
              <Gift className="w-32 h-32 -mt-8 -mr-8" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">Refer & Earn</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold">{referralStats.totalReferrals}</p>
                  <p className="text-sm text-green-100">Friends Joined</p>
                </div>
                <div className="bg-white/20 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold">{referralStats.totalEarned}</p>
                  <p className="text-sm text-green-100">JAICoins Earned</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Code */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <QrCode className="w-4 h-4 text-primary" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-mono font-bold tracking-wider text-primary">
                {profile?.user_id_code || referralCode}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Share this code with friends</p>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={getReferralLink()}
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
            
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleShare} className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </Button>
              <Button onClick={handleWhatsAppShare} variant="outline" className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                <Smartphone className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { step: 1, title: "Share your code", desc: "Send your code or link to friends", color: "bg-primary" },
              { step: 2, title: "Friend signs up", desc: "They create an account using your code", color: "bg-blue-500" },
              { step: 3, title: "Both earn rewards!", desc: "You get 50 JAICoins, they get 50 too!", color: "bg-green-500" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center shrink-0`}>
                  <span className="font-bold text-white text-sm">{item.step}</span>
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Referred Friends */}
        {referredUsers.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Your Referrals
                </span>
                <Badge variant="secondary">{referredUsers.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {referredUsers.map((referral) => (
                <div key={referral.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {referral.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{referral.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">Joined {formatDate(referral.created_at)}</p>
                  </div>
                  <Badge className="bg-green-500 shrink-0">+50 JC</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Milestones */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Bonus Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {milestones.map((milestone, index) => {
              const achieved = referralStats.totalReferrals >= milestone.count;
              return (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    achieved ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achieved ? 'bg-green-500 text-white' : 'bg-muted'
                    }`}>
                      {achieved ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Users className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{milestone.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {referralStats.totalReferrals}/{milestone.count}
                      </p>
                    </div>
                  </div>
                  <Badge variant={achieved ? "default" : "secondary"} className={achieved ? 'bg-green-500' : ''}>
                    +{milestone.reward} JC
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>

      <NativeBottomNav />
    </div>
  );
};

export default ReferralProgramPage;
