import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SpinWheel from "@/components/SpinWheel";
import LiveLeaderboard from "@/components/gamification/LiveLeaderboard";
import {
  User, Coins, Trophy, TrendingUp, Gift, Users, Zap,
  Calendar, Target, Star, Award, Crown, Medal,
  Wallet, History, Settings, ChevronRight, Flame
} from "lucide-react";

interface UserStats {
  totalCoins: number;
  rank: string;
  rankNumber: number;
  totalReferrals: number;
  dealsRedeemed: number;
  streakDays: number;
  level: number;
  nextLevelCoins: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: string; // Changed from union type to string to match database
  source: string;
  description: string;
  created_at: string;
}

interface LeaderboardEntry {
  id: string;
  full_name: string;
  rank: string;
  balance: number;
  position: number;
}

const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const activeTabFromUrl = searchParams.get('tab') || 'overview';
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    totalCoins: 0,
    rank: 'Bronze',
    rankNumber: 0,
    totalReferrals: 0,
    dealsRedeemed: 0,
    streakDays: 0,
    level: 1,
    nextLevelCoins: 100
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
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
          fetchUserStats(session.user.id),
          fetchTransactions(session.user.id),
          fetchLeaderboard()
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

  const fetchUserStats = async (userId: string) => {
    try {
      // Get JaiCoin balance
      const { data: balance } = await supabase.rpc('get_user_balance', {
        user_uuid: userId
      });

      // Get transaction stats
      const { data: transactions } = await supabase
        .from('jaicoin_transactions')
        .select('*')
        .eq('user_id', userId);

      // Get redemption count
      const { data: redemptions } = await supabase
        .from('deal_redemptions')
        .select('id')
        .eq('user_id', userId);

      // Calculate rank based on balance
      const rank = calculateRank(balance || 0);
      const rankNumber = await calculateRankPosition(userId);

      // Calculate level and streak (mock data for now)
      const level = Math.floor((balance || 0) / 100) + 1;
      const nextLevelCoins = level * 100;

      setUserStats({
        totalCoins: balance || 0,
        rank: rank,
        rankNumber: rankNumber,
        totalReferrals: profile?.total_referrals || 0,
        dealsRedeemed: redemptions?.length || 0,
        streakDays: 3, // Mock data
        level: level,
        nextLevelCoins: nextLevelCoins
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const calculateRank = (balance: number): string => {
    if (balance >= 2000) return 'Diamond';
    if (balance >= 1000) return 'Gold';
    if (balance >= 500) return 'Silver';
    return 'Bronze';
  };

  const calculateRankPosition = async (userId: string): Promise<number> => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id');

      if (!profiles) return 0;

      const balances = await Promise.all(
        profiles.map(async (profile) => {
          const { data: balance } = await supabase.rpc('get_user_balance', {
            user_uuid: profile.id
          });
          return { id: profile.id, balance: balance || 0 };
        })
      );

      balances.sort((a, b) => b.balance - a.balance);
      const position = balances.findIndex(item => item.id === userId) + 1;
      return position;
    } catch (error) {
      console.error('Error calculating rank position:', error);
      return 0;
    }
  };

  const fetchTransactions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('jaicoin_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, rank')
        .limit(20);

      if (profiles) {
        const leaderboardData = await Promise.all(
          profiles.map(async (profile, index) => {
            const { data: balance } = await supabase.rpc('get_user_balance', {
              user_uuid: profile.id
            });
            return {
              ...profile,
              balance: balance || 0,
              position: index + 1
            };
          })
        );

        leaderboardData.sort((a, b) => b.balance - a.balance);
        leaderboardData.forEach((item, index) => {
          item.position = index + 1;
        });

        setLeaderboard(leaderboardData);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleReferFriend = () => {
    const referralLink = `${window.location.origin}?ref=${profile?.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Referral Link Copied!",
      description: "Share this link with your friends to earn rewards",
    });
  };

  const handleReferMerchant = () => {
    toast({
      title: "Merchant Referral",
      description: "Contact our team to refer a merchant and earn 50 JaiCoins!",
    });
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Diamond': return <Crown className="w-5 h-5 text-purple-500" />;
      case 'Gold': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'Silver': return <Medal className="w-5 h-5 text-gray-400" />;
      default: return <Award className="w-5 h-5 text-orange-500" />;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Diamond': return 'from-purple-500 to-pink-500';
      case 'Gold': return 'from-yellow-400 to-orange-500';
      case 'Silver': return 'from-gray-300 to-gray-500';
      default: return 'from-orange-400 to-red-500';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout user={user} profile={profile}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout user={user} profile={profile}>
        <Card className="max-w-md mx-auto mt-8">
          <CardHeader className="text-center">
            <CardTitle>Please Sign In</CardTitle>
            <CardDescription>You need to be logged in to view your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-6">
        {/* Welcome Header - Desktop Only */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {profile?.full_name || 'User'}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getRankColor(userStats.rank)} text-white font-bold flex items-center space-x-2`}>
                {getRankIcon(userStats.rank)}
                <span>{userStats.rank}</span>
              </div>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">JaiCoins</p>
                  <p className="text-xl lg:text-3xl font-bold text-gray-900">{userStats.totalCoins}</p>
                </div>
                <Coins className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Rank</p>
                  <p className="text-xl lg:text-3xl font-bold text-gray-900">#{userStats.rankNumber}</p>
                </div>
                <Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Deals</p>
                  <p className="text-xl lg:text-3xl font-bold text-gray-900">{userStats.dealsRedeemed}</p>
                </div>
                <Gift className="w-6 h-6 lg:w-8 lg:h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Referrals</p>
                  <p className="text-xl lg:text-3xl font-bold text-gray-900">{userStats.totalReferrals}</p>
                </div>
                <Users className="w-6 h-6 lg:w-8 lg:h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTabFromUrl} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview" className="text-xs lg:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="wallet" className="text-xs lg:text-sm">Wallet</TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-xs lg:text-sm">Leaderboard</TabsTrigger>
            <TabsTrigger value="gamification" className="text-xs lg:text-sm">JaiCoin Zone</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Level Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span>Level Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Level {userStats.level}</span>
                      <span className="text-sm text-gray-500">
                        {userStats.totalCoins}/{userStats.nextLevelCoins} coins
                      </span>
                    </div>
                    <Progress value={(userStats.totalCoins / userStats.nextLevelCoins) * 100} />
                    <p className="text-xs text-gray-600">
                      {userStats.nextLevelCoins - userStats.totalCoins} more coins to reach Level {userStats.level + 1}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button onClick={handleReferFriend} variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Refer a Friend
                    </Button>
                    <Button onClick={handleReferMerchant} variant="outline" className="w-full justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Refer Merchant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <History className="w-5 h-5 text-blue-500" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${transaction.type === 'earned' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="font-medium text-sm">{transaction.description}</p>
                            <p className="text-xs text-gray-600">{new Date(transaction.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className={`font-bold ${transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-green-500" />
                  <span>JaiCoin Wallet</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-green-600 mb-2">{userStats.totalCoins}</div>
                  <p className="text-gray-600">Total JaiCoins</p>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Transaction History</h3>
                  {transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-500">{new Date(transaction.created_at).toLocaleString()}</p>
                          </div>
                          <div className={`font-bold text-lg ${transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No transactions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <LiveLeaderboard />
          </TabsContent>

          {/* Gamification Tab */}
          <TabsContent value="gamification">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spin Wheel */}
              <SpinWheel />

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Award className="w-5 h-5 text-purple-500" />
                    <span>Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Flame className="w-6 h-6 text-orange-500" />
                        <div>
                          <p className="font-medium">First Purchase</p>
                          <p className="text-sm text-gray-600">Make your first deal redemption</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="w-6 h-6 text-blue-500" />
                        <div>
                          <p className="font-medium">Social Butterfly</p>
                          <p className="text-sm text-gray-600">Refer 5 friends</p>
                        </div>
                      </div>
                      <Badge variant="outline">In Progress</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
