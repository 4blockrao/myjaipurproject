import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ScratchCard from "@/components/gamification/ScratchCard";
import {
  Coins, Trophy, Users, Star, Gift, Target,
  RotateCcw, Dice6, Share2, Heart, Award,
  Flame, ArrowRight, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

interface AccountDashboardProps {
  user: any;
  profile: any;
  balance: number;
  onRefreshBalance: () => void;
}

const AccountDashboard = ({ user, profile, balance, onRefreshBalance }: AccountDashboardProps) => {
  const [dailySpinUsed, setDailySpinUsed] = useState(() => {
    const lastSpin = localStorage.getItem(`lastSpin_${user?.id}`);
    return lastSpin === new Date().toDateString();
  });
  const [scratchCardUsed, setScratchCardUsed] = useState(() => {
    const lastScratch = localStorage.getItem(`lastScratch_${user?.id}`);
    return lastScratch === new Date().toDateString();
  });
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const { toast } = useToast();

  const handleDailySpin = async () => {
    if (dailySpinUsed || !user) return;
    
    setIsSpinning(true);
    
    setTimeout(async () => {
      const rewards = [5, 10, 15, 20, 25, 50];
      const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
      
      try {
        await supabase
          .from('jaicoin_transactions')
          .insert({
            user_id: user.id,
            amount: randomReward,
            type: 'earned',
            source: 'daily_spin',
            description: `Daily spin wheel reward`
          });

        toast({
          title: "🎉 You won!",
          description: `+${randomReward} JAICoins added to your wallet!`,
        });

        setDailySpinUsed(true);
        localStorage.setItem(`lastSpin_${user.id}`, new Date().toDateString());
        onRefreshBalance();
        
      } catch (error) {
        console.error('Error awarding spin reward:', error);
        toast({
          title: "Error",
          description: "Failed to award reward. Please try again.",
          variant: "destructive"
        });
      }
      
      setIsSpinning(false);
    }, 2000);
  };

  const handleScratchCard = () => {
    if (scratchCardUsed || !user) return;
    setShowScratchCard(true);
    setScratchCardUsed(true);
    localStorage.setItem(`lastScratch_${user.id}`, new Date().toDateString());
  };

  const level = Math.floor(balance / 100) + 1;
  const levelProgress = (balance % 100);

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="p-3">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <p className="font-bold text-lg">#{profile?.rank || 1}</p>
            <p className="text-xs text-muted-foreground">City Rank</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <Users className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <p className="font-bold text-lg">{profile?.total_referrals || 0}</p>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
            <p className="font-bold text-lg">3</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Level {level}</span>
            </div>
            <span className="text-sm text-muted-foreground">{levelProgress}/100 to next</span>
          </div>
          <Progress value={levelProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Daily Games */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Daily Rewards</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Spin Wheel */}
          <Card className={`${dailySpinUsed ? 'opacity-60' : ''}`}>
            <CardContent className="p-4 text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center ${isSpinning ? 'animate-spin' : ''}`}>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <h4 className="font-semibold text-sm mb-1">Daily Spin</h4>
              <p className="text-xs text-muted-foreground mb-3">Win 5-50 JAICoins</p>
              <Button
                onClick={handleDailySpin}
                disabled={dailySpinUsed || isSpinning}
                size="sm"
                className="w-full"
              >
                {isSpinning ? 'Spinning...' : dailySpinUsed ? 'Done ✓' : 'Spin Now!'}
              </Button>
            </CardContent>
          </Card>

          {/* Scratch Card */}
          <Card className={`${scratchCardUsed ? 'opacity-60' : ''}`}>
            <CardContent className="p-4 text-center">
              <div className="w-16 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-sm mb-1">Scratch Card</h4>
              <p className="text-xs text-muted-foreground mb-3">Mystery reward!</p>
              <Button
                onClick={handleScratchCard}
                disabled={scratchCardUsed}
                size="sm"
                variant="outline"
                className="w-full"
              >
                {scratchCardUsed ? 'Done ✓' : 'Scratch!'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Quick Actions</h3>
        
        <div className="space-y-2">
          <Link to="/account?tab=referral">
            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Invite Friends</p>
                    <p className="text-sm text-green-100">Earn 50 JAICoins per referral</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/leaderboard">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Leaderboard</p>
                    <p className="text-sm text-muted-foreground">See top earners</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/challenges">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Challenges</p>
                    <p className="text-sm text-muted-foreground">Complete tasks for coins</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <ScratchCard 
        isOpen={showScratchCard}
        onClose={() => {
          setShowScratchCard(false);
          onRefreshBalance();
        }}
        trigger="daily"
      />
    </div>
  );
};

export default AccountDashboard;
