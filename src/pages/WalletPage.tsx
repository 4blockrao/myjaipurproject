
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Coins, TrendingUp, TrendingDown, Calendar, 
  Gift, Users, Star, ArrowUpRight, ArrowDownLeft,
  Wallet, CreditCard, History, Award
} from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  source: string;
  description: string;
  created_at: string;
}

const WalletPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalSpent: 0,
    thisWeek: 0,
    referralEarnings: 0
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
          fetchBalance(session.user.id),
          fetchTransactions(session.user.id),
          fetchStats(session.user.id)
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

  const fetchBalance = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_user_balance', {
        user_uuid: userId
      });

      if (error) throw error;
      setBalance(data || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchTransactions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('jaicoin_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchStats = async (userId: string) => {
    try {
      const { data: allTransactions } = await supabase
        .from('jaicoin_transactions')
        .select('*')
        .eq('user_id', userId);

      if (allTransactions) {
        const totalEarned = allTransactions
          .filter(t => t.type === 'earned')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const totalSpent = allTransactions
          .filter(t => t.type === 'spent')
          .reduce((sum, t) => sum + t.amount, 0);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const thisWeek = allTransactions
          .filter(t => new Date(t.created_at) > weekAgo && t.type === 'earned')
          .reduce((sum, t) => sum + t.amount, 0);

        const referralEarnings = allTransactions
          .filter(t => t.source === 'referral' && t.type === 'earned')
          .reduce((sum, t) => sum + t.amount, 0);

        setStats({
          totalEarned,
          totalSpent,
          thisWeek,
          referralEarnings
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'earned') {
      switch (transaction.source) {
        case 'referral': return <Users className="w-4 h-4 text-green-500" />;
        case 'signup': return <Gift className="w-4 h-4 text-blue-500" />;
        case 'daily': return <Star className="w-4 h-4 text-yellow-500" />;
        case 'deal_redemption': return <Award className="w-4 h-4 text-purple-500" />;
        default: return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      }
    } else {
      return <ArrowDownLeft className="w-4 h-4 text-red-500" />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="Wallet" showBackButton>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Loading your wallet...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="Wallet" showBackButton>
        <Card className="mx-4 mt-4">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">Please Sign In</CardTitle>
            <CardDescription className="text-sm">You need to be logged in to view your wallet</CardDescription>
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
    <DashboardLayout user={user} profile={profile} pageTitle="JAICoin Wallet" showBackButton>
      <div className="space-y-4 p-4 max-w-4xl mx-auto">
        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-pink-500 to-orange-400 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Wallet className="w-6 h-6" />
                  <span className="text-pink-100">Current Balance</span>
                </div>
                <div className="text-3xl lg:text-4xl font-bold mb-2">{balance}</div>
                <div className="text-pink-100">JAICoins</div>
              </div>
              <div className="text-right">
                <Coins className="w-12 h-12 lg:w-16 lg:h-16 text-yellow-300 mb-2" />
                <div className="text-sm text-pink-100">≈ ₹{balance}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-3 lg:p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-lg lg:text-xl font-bold text-gray-900">{stats.totalEarned}</div>
              <div className="text-xs lg:text-sm text-gray-600">Total Earned</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
            <CardContent className="p-3 lg:p-4 text-center">
              <TrendingDown className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-lg lg:text-xl font-bold text-gray-900">{stats.totalSpent}</div>
              <div className="text-xs lg:text-sm text-gray-600">Total Spent</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-3 lg:p-4 text-center">
              <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-lg lg:text-xl font-bold text-gray-900">{stats.thisWeek}</div>
              <div className="text-xs lg:text-sm text-gray-600">This Week</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-3 lg:p-4 text-center">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-lg lg:text-xl font-bold text-gray-900">{stats.referralEarnings}</div>
              <div className="text-xs lg:text-sm text-gray-600">From Referrals</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <Button className="h-auto py-4 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500">
            <CreditCard className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-medium">Redeem</div>
              <div className="text-xs opacity-90">Use JAICoins</div>
            </div>
          </Button>
          
          <Button variant="outline" className="h-auto py-4 border-pink-300 text-pink-600 hover:bg-pink-50">
            <Users className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-medium">Refer Friends</div>
              <div className="text-xs opacity-70">Earn 50 JC each</div>
            </div>
          </Button>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-gray-600" />
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
              </div>
              <Badge variant="outline">{transactions.length} transactions</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {getTransactionIcon(transaction)}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{transaction.description}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{transaction.source.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold text-sm flex-shrink-0 ${
                      transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'earned' ? '+' : '-'}{transaction.amount} JC
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Coins className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm mt-1">Start earning JAICoins by referring friends!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WalletPage;
