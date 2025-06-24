
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
  type: string;
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
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout user={user} profile={profile}>
        <Card className="mx-4 mt-4">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">Please Sign In</CardTitle>
            <CardDescription className="text-sm">You need to be logged in to view your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
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
      <div className="space-y-4 p-4 max-w-7xl mx-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {profile?.full_name || 'User'}!</p>
            </div>
            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getRankColor(userStats.rank)} text-white text-sm font-bold flex items-center space-x-1`}>
              {getRankIcon(userStats.rank)}
              <span>{userStats.rank}</span>
            </div>
          </div>
        </div>

        {/* Desktop Welcome Header */}
        <div className="hidden lg:block bg-white rounded-lg p-6 shadow-sm">
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

        {/* Quick Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-3 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 truncate">JaiCoins</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{userStats.totalCoins}</p>
                </div>
                <Coins className="w-5 h-5 lg:w-8 lg:h-8 text-yellow-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-3 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 truncate">Rank</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">#{userStats.rankNumber}</p>
                </div>
                <Trophy className="w-5 h-5 lg:w-8 lg:h-8 text-purple-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-3 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 truncate">Deals</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{userStats.dealsRedeemed}</p>
                </div>
                <Gift className="w-5 h-5 lg:w-8 lg:h-8 text-blue-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-3 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 truncate">Referrals</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{userStats.totalReferrals}</p>
                </div>
                <Users className="w-5 h-5 lg:w-8 lg:h-8 text-green-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs - Mobile Optimized */}
        <Tabs value={activeTabFromUrl} onValueChange={setActiveTab} className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
              <TabsTrigger value="overview" className="text-xs lg:text-sm py-2">Overview</TabsTrigger>
              <TabsTrigger value="wallet" className="text-xs lg:text-sm py-2">Wallet</TabsTrigger>
              <TabsTrigger value="leaderboard" className="text-xs lg:text-sm py-2">Leaderboard</TabsTrigger>
              <TabsTrigger value="gamification" className="text-xs lg:text-sm py-2">JaiCoin Zone</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Level Progress */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
                    <Star className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500" />
                    <span>Level Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Level {userStats.level}</span>
                    <span className="text-xs text-gray-500">
                      {userStats.totalCoins}/{userStats.nextLevelCoins} coins
                    </span>
                  </div>
                  <Progress value={(userStats.totalCoins / userStats.nextLevelCoins) * 100} className="h-2" />
                  <p className="text-xs text-gray-600">
                    {userStats.nextLevelCoins - userStats.totalCoins} more coins to reach Level {userStats.level + 1}
                  </p>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
                    <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button onClick={handleReferFriend} variant="outline" className="w-full justify-start h-auto py-3">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">Refer a Friend</span>
                  </Button>
                  <Button onClick={handleReferMerchant} variant="outline" className="w-full justify-start h-auto py-3">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <span className="text-sm">Refer Merchant</span>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
                  <History className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${transaction.type === 'earned' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{transaction.description}</p>
                            <p className="text-xs text-gray-600">{new Date(transaction.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className={`font-bold text-sm flex-shrink-0 ${transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6 text-sm">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
                  <Wallet className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                  <span>JaiCoin Wallet</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">{userStats.totalCoins}</div>
                  <p className="text-gray-600">Total JaiCoins</p>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-base lg:text-lg">Transaction History</h3>
                  {transactions.length > 0 ? (
                    <div className="space-y-2">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 lg:p-4 border rounded-lg">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm lg:text-base truncate">{transaction.description}</p>
                            <p className="text-xs lg:text-sm text-gray-500">{new Date(transaction.created_at).toLocaleString()}</p>
                          </div>
                          <div className={`font-bold text-base lg:text-lg flex-shrink-0 ml-2 ${transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8 text-sm">No transactions yet</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Spin Wheel */}
              <div className="order-2 lg:order-1">
                <SpinWheel />
              </div>

              {/* Achievements */}
              <Card className="order-1 lg:order-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
                    <Award className="w-4 h-4 lg:w-5 lg:h-5 text-purple-500" />
                    <span>Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <Flame className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm lg:text-base">First Purchase</p>
                        <p className="text-xs lg:text-sm text-gray-600">Make your first deal redemption</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs flex-shrink-0">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm lg:text-base">Social Butterfly</p>
                        <p className="text-xs lg:text-sm text-gray-600">Refer 5 friends</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">In Progress</Badge>
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
