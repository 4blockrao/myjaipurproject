
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Coins, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  source: string;
  created_at: string;
}

interface Reward {
  id: number;
  title: string;
  description: string;
  cost: number;
  category: string;
}

const JaiCoinWallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const rewards: Reward[] = [
    {
      id: 1,
      title: "₹25 Off Any Order",
      description: "Get ₹25 discount on your next purchase",
      cost: 250,
      category: "discount"
    },
    {
      id: 2,
      title: "Free Delivery",
      description: "Free delivery on one order",
      cost: 150,
      category: "delivery"
    },
    {
      id: 3,
      title: "Artisan Voucher ₹250",
      description: "₹250 off on handcrafted items",
      cost: 500,
      category: "shopping"
    },
    {
      id: 4,
      title: "Early Flash Sale Access",
      description: "24-hour early access to flash sales",
      cost: 400,
      category: "premium"
    },
    {
      id: 5,
      title: "Festival Voucher ₹500",
      description: "Special festival season discount",
      cost: 1000,
      category: "special"
    }
  ];

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch user balance
      const { data: balanceData, error: balanceError } = await supabase
        .rpc('get_user_balance', { user_uuid: user.id });

      if (balanceError) {
        console.error('Error fetching balance:', balanceError);
      } else {
        setBalance(balanceData || 0);
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('jaicoin_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        toast({
          title: "Error",
          description: "Failed to load transaction history",
          variant: "destructive"
        });
      } else {
        setTransactions(transactionsData || []);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemReward = async (rewardId: number, cost: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to redeem rewards",
          variant: "destructive"
        });
        return;
      }

      if (balance < cost) {
        toast({
          title: "Insufficient Balance",
          description: `You need ${cost - balance} more JaiCoins to redeem this reward`,
          variant: "destructive"
        });
        return;
      }

      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) return;

      // Create transaction for spending JaiCoins
      const { error } = await supabase
        .from('jaicoin_transactions')
        .insert({
          user_id: user.id,
          amount: cost,
          type: 'spent',
          source: 'reward_redemption',
          description: `Redeemed: ${reward.title}`
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
        title: "Reward Redeemed Successfully!",
        description: `You've redeemed ${reward.title} for ${cost} JaiCoins!`
      });

      // Refresh wallet data
      fetchWalletData();
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'discount': return 'bg-green-100 text-green-800';
      case 'delivery': return 'bg-blue-100 text-blue-800';
      case 'shopping': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-yellow-100 text-yellow-800';
      case 'special': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'signup': return '🎉';
      case 'referral': return '👥';
      case 'deal_purchase': return '🛍️';
      case 'review': return '⭐';
      case 'spin': return '🎰';
      case 'challenge_reward': return '🏆';
      case 'reward_redemption': return '🎁';
      default: return '💰';
    }
  };

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
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-pink-600" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">JaiCoin Wallet</h1>
          <p className="text-gray-600 text-lg">Earn, Save, and Redeem your rewards</p>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 border-2 border-pink-200 bg-gradient-to-r from-pink-500 to-yellow-500 text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm opacity-90 mb-2">Your Balance</div>
              <div className="text-5xl font-bold mb-4 flex items-center justify-center">
                <Coins className="w-8 h-8 mr-3" />
                {balance.toLocaleString()} JaiCoins
              </div>
              <div className="text-sm opacity-90">
                ≈ ₹{Math.floor(balance / 10)} in rewards value
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rewards Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Redeem Rewards</h2>
            <div className="space-y-4">
              {rewards.map((reward) => (
                <Card key={reward.id} className="border-2 border-pink-100 hover:border-pink-200 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-gray-800">{reward.title}</CardTitle>
                        <CardDescription className="mt-1">{reward.description}</CardDescription>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(reward.category)}`}>
                        {reward.category}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-gray-800">{reward.cost} JaiCoins</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleRedeemReward(reward.id, reward.cost)}
                        disabled={balance < reward.cost}
                        className={balance >= reward.cost 
                          ? "bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }
                      >
                        {balance >= reward.cost ? 'Redeem' : 'Insufficient Balance'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Transaction History</h2>
            <div className="space-y-3">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <Card key={transaction.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {getSourceIcon(transaction.source)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{transaction.description}</div>
                            <div className="text-sm text-gray-500 mt-1 flex items-center space-x-2">
                              <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="capitalize">{transaction.source.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold flex items-center space-x-1 ${
                            transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'earned' ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <span>
                              {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.type === 'earned' ? 'Earned' : 'Spent'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Coins className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Start earning JaiCoins by redeeming deals!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Earning Guide */}
        <Card className="mt-8 border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">How to Earn JaiCoins</CardTitle>
            <CardDescription>Discover all the ways to earn rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600 mb-2">25</div>
                <div className="text-sm text-gray-700">Sign-up Bonus</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mb-2">50+</div>
                <div className="text-sm text-gray-700">Per Deal Purchase</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">25</div>
                <div className="text-sm text-gray-700">Per Referral</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">25</div>
                <div className="text-sm text-gray-700">Review with Photo</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">10</div>
                <div className="text-sm text-gray-700">Daily Check-in</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-2">5-25</div>
                <div className="text-sm text-gray-700">Spin the Wheel</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JaiCoinWallet;
