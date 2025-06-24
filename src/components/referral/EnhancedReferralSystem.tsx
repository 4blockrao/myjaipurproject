import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Crown, Star, Trophy, Gift, Share2, Target,
  Flame, Medal, Award, Coins, ChevronRight, Shirt
} from "lucide-react";

interface ReferralStats {
  level1Count: number;
  level2Count: number;
  level3Count: number;
  level4Count: number;
  totalEarnings: number;
  currentRank: string;
  nextMilestone: number;
  progress: number;
}

const EnhancedReferralSystem = () => {
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    level1Count: 0,
    level2Count: 0,
    level3Count: 0,
    level4Count: 0,
    totalEarnings: 0,
    currentRank: 'Local Explorer',
    nextMilestone: 3,
    progress: 0
  });
  const [profile, setProfile] = useState<any>(null);
  const [userBalance, setUserBalance] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
    fetchReferralStats();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data);

      // Get user balance
      const { data: balance } = await supabase.rpc('get_user_balance', {
        user_uuid: user.id
      });
      setUserBalance(balance || 0);
    }
  };

  const fetchReferralStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get direct referrals (Level 1)
    const { data: level1Refs } = await supabase
      .from('profiles')
      .select('id, created_at')
      .eq('referred_by', user.id);

    const level1Count = level1Refs?.length || 0;

    // Calculate rank and progress
    const currentRank = calculateRank(level1Count);
    const { nextMilestone, progress } = calculateProgress(level1Count);

    setReferralStats({
      level1Count,
      level2Count: 0, // Would need complex query for multi-level
      level3Count: 0,
      level4Count: 0,
      totalEarnings: userBalance,
      currentRank,
      nextMilestone,
      progress
    });
  };

  const calculateRank = (referralCount: number): string => {
    if (referralCount >= 100) return 'Jaipur Maharaja';
    if (referralCount >= 50) return 'Jaipur Legend';
    if (referralCount >= 25) return 'Jaipur Champion';
    if (referralCount >= 10) return 'Jaipur Star';
    if (referralCount >= 3) return 'Jaipur Explorer';
    return 'Local Explorer';
  };

  const calculateProgress = (referralCount: number) => {
    const milestones = [3, 10, 25, 50, 100];
    const nextMilestone = milestones.find(m => m > referralCount) || 100;
    const prevMilestone = milestones[milestones.indexOf(nextMilestone) - 1] || 0;
    const progress = ((referralCount - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
    
    return { nextMilestone, progress: Math.max(0, progress) };
  };

  const copyReferralCode = async () => {
    if (profile?.referral_code) {
      const referralLink = `${window.location.origin}?ref=${profile.referral_code}`;
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "🎉 Referral Link Copied!",
        description: "Share this with friends to start earning JAICoins!",
      });
    }
  };

  const copyUserIdCode = async () => {
    if (profile?.user_id_code) {
      await navigator.clipboard.writeText(profile.user_id_code);
      toast({
        title: "🎉 User ID Copied!",
        description: "Share this ID for friends to find you!",
      });
    }
  };

  const milestoneRewards = [
    { count: 3, reward: 100, badge: "Jaipur Explorer", icon: Star, description: "Beta access" },
    { count: 10, reward: 300, badge: "Jaipur Star", icon: Award, description: "2 spins daily + 10% bonus" },
    { count: 25, reward: 1000, badge: "Jaipur Champion", icon: Shirt, description: "Jaipur T-shirt + digital badge" },
    { count: 50, reward: 2500, badge: "Jaipur Legend", icon: Trophy, description: "VIP event invite" },
    { count: 100, reward: 10000, badge: "Jaipur Maharaja", icon: Crown, description: "Ambassador status + grand prize" }
  ];

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Jaipur Maharaja': return <Crown className="w-6 h-6 text-purple-500" />;
      case 'Jaipur Legend': return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 'Jaipur Champion': return <Shirt className="w-6 h-6 text-pink-500" />;
      case 'Jaipur Star': return <Star className="w-6 h-6 text-blue-500" />;
      case 'Jaipur Explorer': return <Award className="w-6 h-6 text-green-500" />;
      default: return <Target className="w-6 h-6 text-gray-500" />;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Jaipur Maharaja': return 'from-purple-500 to-pink-500';
      case 'Jaipur Legend': return 'from-yellow-400 to-orange-500';
      case 'Jaipur Champion': return 'from-pink-400 to-rose-500';
      case 'Jaipur Star': return 'from-blue-400 to-indigo-500';
      case 'Jaipur Explorer': return 'from-green-400 to-emerald-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const claimPhysicalReward = async () => {
    if (referralStats.level1Count >= 25) {
      toast({
        title: "🎽 T-shirt Claim",
        description: "Contact support to claim your Jaipur Champion T-shirt!",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Current Status */}
      <Card className="bg-gradient-to-br from-pink-50 to-orange-50 border-pink-200">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            {getRankIcon(referralStats.currentRank)}
            <h2 className="text-2xl font-bold text-gray-900">{referralStats.currentRank}</h2>
          </div>
          <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${getRankColor(referralStats.currentRank)} text-white font-bold`}>
            <Coins className="w-5 h-5 mr-2" />
            {userBalance} JAICoins
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress to Next Milestone */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Progress to {referralStats.nextMilestone} referrals
                </span>
                <span className="text-sm text-gray-500">
                  {referralStats.level1Count}/{referralStats.nextMilestone}
                </span>
              </div>
              <Progress value={referralStats.progress} className="h-3" />
            </div>

            {/* User ID Code */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Your User ID:</label>
              <div className="flex space-x-2">
                <div className="flex-1 p-3 bg-white rounded-lg border-2 border-blue-200 text-center">
                  <span className="font-mono font-bold text-lg text-blue-600">{profile?.user_id_code}</span>
                </div>
                <Button onClick={copyUserIdCode} className="bg-blue-500 hover:bg-blue-600">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Friends can use this 6-digit code to find you</p>
            </div>

            {/* Referral Code */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Your Referral Code:</label>
              <div className="flex space-x-2">
                <div className="flex-1 p-3 bg-white rounded-lg border-2 border-pink-200 text-center">
                  <span className="font-mono font-bold text-lg">{profile?.referral_code}</span>
                </div>
                <Button onClick={copyReferralCode} className="bg-pink-500 hover:bg-pink-600">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Share this to earn JAICoins when friends sign up</p>
            </div>

            {/* Physical Reward Claim for Jaipur Champion */}
            {referralStats.level1Count >= 25 && referralStats.currentRank === 'Jaipur Champion' && (
              <Button 
                onClick={claimPhysicalReward}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                <Shirt className="w-4 h-4 mr-2" />
                Claim Your Jaipur Champion T-shirt!
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="tree">Referral Tree</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Multi-Level Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>Your Jaipur Empire</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Level 1 (Direct)</span>
                    <Badge variant="secondary">{referralStats.level1Count}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Level 2</span>
                    <Badge variant="outline">{referralStats.level2Count}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Level 3</span>
                    <Badge variant="outline">{referralStats.level3Count}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Level 4</span>
                    <Badge variant="outline">{referralStats.level4Count}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Reward Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-green-500" />
                  <span>Enhanced Reward Structure</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Level 1 Referral:</span>
                    <span className="font-bold text-green-600">50 JC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level 1 Redemption:</span>
                    <span className="font-bold text-green-600">25 JC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level 2 Redemption:</span>
                    <span className="font-bold text-blue-600">15 JC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level 3 Redemption:</span>
                    <span className="font-bold text-purple-600">10 JC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level 4 Redemption:</span>
                    <span className="font-bold text-orange-600">5 JC</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones">
          <div className="space-y-4">
            {milestoneRewards.map((milestone, index) => {
              const Icon = milestone.icon;
              const isCompleted = referralStats.level1Count >= milestone.count;
              const isCurrent = referralStats.level1Count < milestone.count && 
                (index === 0 || referralStats.level1Count >= milestoneRewards[index - 1].count);

              return (
                <Card key={milestone.count} className={`${
                  isCompleted ? 'bg-green-50 border-green-200' : 
                  isCurrent ? 'bg-blue-50 border-blue-200' : 
                  'bg-gray-50 border-gray-200'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500' : 
                          isCurrent ? 'bg-blue-500' : 
                          'bg-gray-400'
                        }`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold">{milestone.badge}</h3>
                          <p className="text-sm text-gray-600">{milestone.count} referrals</p>
                          <p className="text-xs text-gray-500">{milestone.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{milestone.reward} JC</p>
                        {isCompleted && (
                          <Badge className="bg-green-500">Completed</Badge>
                        )}
                        {isCurrent && (
                          <Badge className="bg-blue-500">Current Goal</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="tree">
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Network</CardTitle>
              <CardDescription>
                Visual representation of your growing Jaipur community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Referral tree visualization coming soon!</p>
                <p className="text-sm text-gray-500 mt-2">
                  Track your network growth and see how your referrals are building their own communities.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span>Earnings History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Welcome Bonus</p>
                    <p className="text-sm text-gray-600">Account creation</p>
                  </div>
                  <span className="font-bold text-green-600">+30 JC</span>
                </div>
                
                {referralStats.level1Count > 0 && (
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Direct Referral Rewards</p>
                      <p className="text-sm text-gray-600">{referralStats.level1Count} successful referrals</p>
                    </div>
                    <span className="font-bold text-blue-600">+{referralStats.level1Count * 50} JC</span>
                  </div>
                )}

                {referralStats.level1Count >= 25 && (
                  <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                    <div>
                      <p className="font-medium">Jaipur Champion Milestone</p>
                      <p className="text-sm text-gray-600">25 referrals achievement</p>
                    </div>
                    <span className="font-bold text-pink-600">+1000 JC + T-shirt</span>
                  </div>
                )}

                <div className="text-center py-4">
                  <ChevronRight className="w-6 h-6 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">More earnings coming as you grow your network!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedReferralSystem;
