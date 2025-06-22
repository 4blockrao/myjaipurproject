
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Gift, TrendingUp, History, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  amount: number;
  type: "earned" | "spent";
  source: string;
  description: string;
  created_at: string;
}

interface Reward {
  id: string;
  name: string;
  cost: number;
  description: string;
  icon: string;
}

const JaiCoinWallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  const rewards: Reward[] = [
    { id: "1", name: "Free Coffee", cost: 100, description: "Get a free coffee from partner cafes", icon: "☕" },
    { id: "2", name: "Movie Ticket", cost: 300, description: "Free movie ticket at selected theaters", icon: "🎬" },
    { id: "3", name: "Shopping Voucher", cost: 500, description: "₹100 shopping voucher", icon: "🛍️" },
    { id: "4", name: "Restaurant Meal", cost: 800, description: "Free meal at partner restaurants", icon: "🍽️" },
    { id: "5", name: "Spa Session", cost: 1200, description: "1-hour relaxation spa session", icon: "💆" }
  ];

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      fetchUserData(user.id);
    } else {
      setIsLoading(false);
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch balance
      const { data: balanceData, error: balanceError } = await supabase
        .rpc('get_user_balance', { user_uuid: userId });

      if (balanceError) {
        console.error('Error fetching balance:', balanceError);
      } else {
        setBalance(balanceData || 0);
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('jaicoin_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
      } else {
        // Transform the data to match our Transaction interface
        const formattedTransactions: Transaction[] = (transactionsData || []).map(transaction => ({
          id: transaction.id,
          amount: transaction.amount,
          type: transaction.type as "earned" | "spent",
          source: transaction.source,
          description: transaction.description || '',
          created_at: transaction.created_at || ''
        }));
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const redeemReward = async (reward: Reward) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to redeem rewards",
        variant: "destructive"
      });
      return;
    }

    if (balance < reward.cost) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${reward.cost} JaiCoins to redeem this reward`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Deduct JaiCoins
      const { error } = await supabase
        .from('jaicoin_transactions')
        .insert({
          user_id: user.id,
          amount: reward.cost,
          type: 'spent',
          source: 'reward_redemption',
          description: `Redeemed: ${reward.name}`
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to redeem reward",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Reward Redeemed!",
        description: `You've successfully redeemed ${reward.name}!`
      });

      // Refresh user data
      fetchUserData(user.id);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to access your JaiCoin wallet</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Your JaiCoin Wallet</h1>
          <p className="text-gray-600 text-lg">Manage your rewards and track your earnings</p>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Coins className="w-16 h-16 text-yellow-600" />
              </div>
              <div className="text-4xl font-bold text-gray-800 mb-2">{balance.toLocaleString()}</div>
              <div className="text-lg text-gray-600">JaiCoins</div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rewards Store */}
          <Card className="border-2 border-pink-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Gift className="w-6 h-6 text-pink-600" />
                <CardTitle>Rewards Store</CardTitle>
              </div>
              <CardDescription>Redeem your JaiCoins for exciting rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rewards.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{reward.icon}</span>
                      <div>
                        <div className="font-medium text-gray-800">{reward.name}</div>
                        <div className="text-sm text-gray-600">{reward.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-gray-800">{reward.cost}</span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => redeemReward(reward)}
                        disabled={balance < reward.cost}
                        className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 disabled:opacity-50"
                      >
                        {balance < reward.cost ? 'Not Enough' : 'Redeem'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <History className="w-6 h-6 text-blue-600" />
                <CardTitle>Transaction History</CardTitle>
              </div>
              <CardDescription>Your recent JaiCoin activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${transaction.type === 'earned' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {transaction.type === 'earned' ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <Zap className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{transaction.description}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className={`font-bold ${transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions yet</p>
                    <p className="text-sm">Start earning JaiCoins by using deals!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JaiCoinWallet;
