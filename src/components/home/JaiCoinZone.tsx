import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Gift, Users, TrendingUp, Zap, Star, Crown, Store, MessageSquare, Heart, Share2, Trophy, Target, Sparkles, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useState } from "react";
import ScratchCard from "../gamification/ScratchCard";

interface JaiCoinZoneProps {
  user: any;
}

const JaiCoinZone = ({ user }: JaiCoinZoneProps) => {
  const { toast } = useToast();
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [scratchCardTrigger, setScratchCardTrigger] = useState<'welcome' | 'referral' | 'daily' | 'achievement'>('daily');
  
  const userRank = 12;
  const userCoins = 280;
  const coinsToNextRank = 10;

  const handleReferFriend = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code, user_id_code')
        .eq('id', user.id)
        .single();

      if (profile?.user_id_code || profile?.referral_code) {
        const code = profile.user_id_code || profile.referral_code;
        const referralLink = `${window.location.origin}?ref=${code}`;
        await navigator.clipboard.writeText(referralLink);
        
        toast({
          title: "📱 Referral Link Copied!",
          description: "Share this link with friends to earn 50 JaiCoins each!",
        });

        setScratchCardTrigger('referral');
        setShowScratchCard(true);
      }
    } catch (error) {
      console.error('Error copying referral link:', error);
      toast({
        title: "Error",
        description: "Failed to copy referral link",
        variant: "destructive"
      });
    }
  };

  const handleDailyScratch = () => {
    setScratchCardTrigger('daily');
    setShowScratchCard(true);
  };

  // Complete list of all earning triggers
  const earningTriggers = [
    { 
      title: "Sign Up Bonus", 
      reward: 30, 
      icon: Sparkles, 
      color: "from-green-400 to-emerald-500",
      description: "Welcome bonus for new users",
      oneTime: true
    },
    { 
      title: "Refer a Friend", 
      reward: 50, 
      icon: Users, 
      color: "from-blue-400 to-blue-600",
      description: "When friend signs up using your code",
      oneTime: false
    },
    { 
      title: "Friend's First Redemption", 
      reward: 25, 
      icon: Gift, 
      color: "from-purple-400 to-purple-600",
      description: "Bonus when referral redeems first deal",
      oneTime: false
    },
    { 
      title: "Refer a Merchant", 
      reward: 100, 
      icon: Store, 
      color: "from-amber-400 to-orange-500",
      description: "When merchant joins via your referral",
      oneTime: false
    },
    { 
      title: "Daily Scratch Card", 
      reward: "5-100", 
      icon: Star, 
      color: "from-yellow-400 to-orange-600",
      description: "Daily surprise rewards!",
      oneTime: false
    },
    { 
      title: "Daily Spin Wheel", 
      reward: "1-50", 
      icon: Target, 
      color: "from-pink-400 to-rose-500",
      description: "Spin once daily for coins",
      oneTime: false
    },
    { 
      title: "Redeem a Deal", 
      reward: 5, 
      icon: Gift, 
      color: "from-teal-400 to-cyan-500",
      description: "Earn on every deal redemption",
      oneTime: false
    },
    { 
      title: "Write a Review", 
      reward: 10, 
      icon: MessageSquare, 
      color: "from-indigo-400 to-violet-500",
      description: "Review deals you've used",
      oneTime: false
    },
    { 
      title: "Add Review Photo", 
      reward: 5, 
      icon: Heart, 
      color: "from-rose-400 to-pink-500",
      description: "Extra for photo reviews",
      oneTime: false
    },
    { 
      title: "Share a Deal", 
      reward: 2, 
      icon: Share2, 
      color: "from-sky-400 to-blue-500",
      description: "Per deal shared on social",
      oneTime: false
    },
    { 
      title: "Complete Profile", 
      reward: 20, 
      icon: Crown, 
      color: "from-violet-400 to-purple-500",
      description: "Fill all profile details",
      oneTime: true
    },
    { 
      title: "First Purchase", 
      reward: 15, 
      icon: Trophy, 
      color: "from-emerald-400 to-green-500",
      description: "Complete your first order",
      oneTime: true
    },
  ];

  const milestones = [
    { referrals: 5, bonus: 100, label: "5 Referrals" },
    { referrals: 10, bonus: 250, label: "10 Referrals" },
    { referrals: 25, bonus: 500, label: "25 Referrals" },
    { referrals: 50, bonus: 1000, label: "50 Referrals" },
    { referrals: 100, bonus: 2500, label: "100 Referrals" },
  ];

  const culturalRanks = [
    { rank: 'Local Explorer', icon: '🚶', minCoins: 0 },
    { rank: 'Jaipur Star', icon: '⭐', minCoins: 100 },
    { rank: 'Jaipur Legend', icon: '🏆', minCoins: 500 },
    { rank: 'Jaipur Maharaja', icon: '👑', minCoins: 1000 },
  ];

  return (
    <section className="py-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Coins className="w-7 h-7 text-yellow-500" />
          <h2 className="text-2xl font-bold text-foreground">JAICoin Zone</h2>
          <Zap className="w-7 h-7 text-yellow-500 animate-pulse" />
        </div>
        <p className="text-muted-foreground">Earn coins, climb ranks, win rewards!</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-0 cursor-pointer hover:scale-[1.02] transition-transform">
          <CardContent className="p-4 text-center" onClick={handleDailyScratch}>
            <Star className="w-8 h-8 mx-auto mb-2" />
            <p className="font-bold">Daily Scratch</p>
            <p className="text-xs opacity-90">Win 5-100 coins</p>
          </CardContent>
        </Card>
        
        <Link to="/dashboard?tab=gamification">
          <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white border-0 hover:scale-[1.02] transition-transform">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2" />
              <p className="font-bold">Spin Wheel</p>
              <p className="text-xs opacity-90">Daily spins</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* All Earning Methods */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              All Ways to Earn
            </span>
            <Link to="/referral-program">
              <Button variant="ghost" size="sm" className="text-primary">
                View Program <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {earningTriggers.map((trigger, index) => {
            const Icon = trigger.icon;
            return (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${trigger.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{trigger.title}</p>
                    <p className="text-xs text-muted-foreground">{trigger.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    +{trigger.reward} JC
                  </Badge>
                  {trigger.oneTime && (
                    <p className="text-[10px] text-muted-foreground mt-1">One-time</p>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Referral Milestones */}
      <Card className="mb-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Referral Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Earn bonus JAICoins when you reach these referral milestones!
          </p>
          <div className="grid grid-cols-5 gap-2">
            {milestones.map((milestone, index) => (
              <div key={index} className="text-center p-2 bg-white dark:bg-background rounded-lg">
                <p className="text-lg font-bold text-primary">{milestone.referrals}</p>
                <p className="text-[10px] text-muted-foreground">friends</p>
                <Badge variant="outline" className="mt-1 text-[10px]">
                  +{milestone.bonus}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ranking System */}
      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="w-5 h-5 text-indigo-600" />
            Your Jaipur Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-xl font-bold text-indigo-600 mb-1">Jaipur Star</div>
            <p className="text-sm text-muted-foreground">Rank #{userRank} • {userCoins} JAICoins</p>
            <Badge className="mt-2 bg-yellow-100 text-yellow-800">
              {coinsToNextRank} coins to Jaipur Legend!
            </Badge>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {culturalRanks.map((rankInfo, index) => (
              <div key={index} className="text-center p-2 bg-white dark:bg-background rounded-lg">
                <span className="text-2xl">{rankInfo.icon}</span>
                <p className="text-[10px] font-medium mt-1">{rankInfo.rank}</p>
                <p className="text-[10px] text-muted-foreground">{rankInfo.minCoins}+ JC</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link to="/leaderboard">
              <Button variant="outline" className="w-full">
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>
            </Link>
            <Button onClick={handleReferFriend} className="w-full bg-gradient-to-r from-indigo-500 to-blue-500">
              <Users className="w-4 h-4 mr-2" />
              Invite Friends
            </Button>
          </div>
        </CardContent>
      </Card>

      <ScratchCard 
        isOpen={showScratchCard}
        onClose={() => setShowScratchCard(false)}
        trigger={scratchCardTrigger}
      />
    </section>
  );
};

export default JaiCoinZone;
