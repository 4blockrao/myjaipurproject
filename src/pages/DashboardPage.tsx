
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  User, Coins, Trophy, TrendingUp, Gift, Users, Zap,
  Star, Crown, Medal, Award, ArrowRight, Activity,
  Calendar, Target, Flame, Share2, Eye, ShoppingBag
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

const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  
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
          fetchUserStats(session.user.id),
          fetchTransactions(session.user.id)
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
      const { data: balance } = await supabase.rpc('get_user_balance', {
        user_uuid: userId
      });

      const { data: redemptions } = await supabase
        .from('deal_redemptions')
        .select('id')
        .eq('user_id', userId);

      const rank = calculateRank(balance || 0);
      const rankNumber = await calculateRankPosition(userId);
      const level = Math.floor((balance || 0) / 100) + 1;
      const nextLevelCoins = level * 100;

      setUserStats({
        totalCoins: balance || 0,
        rank: rank,
        rankNumber: rankNumber,
        totalReferrals: profile?.total_referrals || 0,
        dealsRedeemed: redemptions?.length || 0,
        streakDays: 3,
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
    return 1; // Simplified for now
  };

  const fetchTransactions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('jaicoin_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleReferFriend = () => {
    const referralLink = `${window.location.origin}?ref=${profile?.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "🎉 Referral Link Copied!",
      description: "Share this link to earn 50 JAICoins per friend!",
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

  const dashboardTiles = [
    {
      title: "Wallet",
      description: "Manage JAICoins & History",
      icon: Coins,
      value: `${userStats.totalCoins} JC`,
      change: "+25 today",
      path: "/wallet",
      color: "from-yellow-400 to-orange-500"
    },
    {
      title: "Referrals",
      description: "Invite & Earn Program",
      icon: Users,
      value: userStats.totalReferrals.toString(),
      change: "Earn 50 JC each",
      path: "/referral-program",
      color: "from-green-400 to-emerald-500"
    },
    {
      title: "Leaderboard",
      description: "City & Locality Rankings",
      icon: Trophy,
      value: `#${userStats.rankNumber}`,
      change: userStats.rank,
      path: "/dashboard?tab=leaderboard",
      color: "from-purple-400 to-pink-500"
    },
    {
      title: "JaiCoin Zone",
      description: "Games & Daily Rewards",
      icon: Star,
      value: "Play Now",
      change: "Daily spins available",
      path: "/dashboard?tab=gamification",
      color: "from-blue-400 to-indigo-500"
    },
    {
      title: "Favorites",
      description: "Saved Deals & Products",
      icon: ShoppingBag,
      value: "View All",
      change: "Quick access",
      path: "/favorites",
      color: "from-pink-400 to-rose-500"
    },
    {
      title: "Profile",
      description: "Settings & Preferences",
      icon: User,
      value: "Manage",
      change: "Update details",
      path: "/profile",
      color: "from-indigo-400 to-purple-500"
    }
  ];

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

  if (tab) {
    // Handle specific tabs - simplified for now
    return (
      <DashboardLayout user={user} profile={profile} pageTitle={tab === 'leaderboard' ? 'Leaderboard' : 'JaiCoin Zone'} showBackButton>
        <div className="p-4">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">
                {tab === 'leaderboard' ? 'Leaderboard Coming Soon' : 'JaiCoin Zone Coming Soon'}
              </h3>
              <p className="text-gray-600 mb-4">This feature is under development</p>
              <Link to="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-4 p-4 max-w-6xl mx-auto">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-pink-500 to-orange-400 text-white border-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-xl lg:text-2xl font-bold mb-1">
                  Welcome back, {profile?.full_name || 'User'}! 👋
                </h1>
                <p className="text-pink-100 text-sm lg:text-base mb-3">
                  You're a {userStats.rank} member with {userStats.totalCoins} JAICoins
                </p>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-white/20 text-white border-0">
                    <Flame className="w-3 h-3 mr-1" />
                    {userStats.streakDays} day streak
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0">
                    {getRankIcon(userStats.rank)}
                    <span className="ml-1">{userStats.rank}</span>
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl lg:text-4xl font-bold mb-1">{userStats.totalCoins}</div>
                <div className="text-sm text-pink-100">JAICoins</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-3 lg:p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-yellow-500 rounded-full mx-auto mb-2">
                <Coins className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div className="text-lg lg:text-2xl font-bold text-gray-900">{userStats.totalCoins}</div>
              <div className="text-xs lg:text-sm text-gray-600">JAICoins</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-3 lg:p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-purple-500 rounded-full mx-auto mb-2">
                <Trophy className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div className="text-lg lg:text-2xl font-bold text-gray-900">#{userStats.rankNumber}</div>
              <div className="text-xs lg:text-sm text-gray-600">City Rank</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-3 lg:p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-green-500 rounded-full mx-auto mb-2">
                <Users className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div className="text-lg lg:text-2xl font-bold text-gray-900">{userStats.totalReferrals}</div>
              <div className="text-xs lg:text-sm text-gray-600">Referrals</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-3 lg:p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-blue-500 rounded-full mx-auto mb-2">
                <Gift className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div className="text-lg lg:text-2xl font-bold text-gray-900">{userStats.dealsRedeemed}</div>
              <div className="text-xs lg:text-sm text-gray-600">Deals</div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900">Level Progress</h3>
              </div>
              <span className="text-sm text-gray-600">Level {userStats.level}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{userStats.totalCoins} JAICoins</span>
                <span>{userStats.nextLevelCoins} JAICoins</span>
              </div>
              <Progress value={(userStats.totalCoins / userStats.nextLevelCoins) * 100} className="h-2" />
              <p className="text-xs text-gray-600">
                {userStats.nextLevelCoins - userStats.totalCoins} more JAICoins to reach Level {userStats.level + 1}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Action - Refer Friends */}
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">Invite Friends & Earn!</h3>
                <p className="text-green-100 text-sm mb-3">
                  Get 50 JAICoins for each friend who joins. No limits!
                </p>
                <Button 
                  onClick={handleReferFriend}
                  variant="secondary" 
                  size="sm"
                  className="bg-white text-green-600 hover:bg-green-50"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Referral Link
                </Button>
              </div>
              <div className="text-4xl">🎁</div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Tiles */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 px-1">Quick Access</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {dashboardTiles.map((tile, index) => {
              const Icon = tile.icon;
              return (
                <Link key={index} to={tile.path}>
                  <Card className="hover:shadow-md transition-all duration-200 h-full">
                    <CardContent className="p-3 lg:p-4">
                      <div className={`w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r ${tile.color} rounded-lg flex items-center justify-center mb-3`}>
                        <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm lg:text-base mb-1">{tile.title}</h3>
                      <p className="text-xs lg:text-sm text-gray-600 mb-2">{tile.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-sm lg:text-base text-gray-900">{tile.value}</div>
                          <div className="text-xs text-gray-500">{tile.change}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        {transactions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-base lg:text-lg">Recent Activity</CardTitle>
                </div>
                <Link to="/wallet">
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 3).map((transaction) => (
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
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
