
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Coins, TrendingUp, Gift, ArrowUpRight, ArrowDownLeft,
  CreditCard, Smartphone, Users, Star, Calendar,
  Trophy, Target, Zap, History, Plus, Minus,
  ExternalLink, Download, RefreshCw
} from "lucide-react";

interface Transaction {
  id: string;
  type: 'earned' | 'spent' | 'bonus';
  amount: number;
  source: string;
  description: string;
  created_at: string;
  metadata?: any;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
}

const WalletPage = () => {
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(280);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const rewardRates = [
    { activity: "Complete Deal Purchase", coins: 10, icon: "🛒" },
    { activity: "Write Review", coins: 5, icon: "⭐" },
    { activity: "Refer Friend", coins: 50, icon: "👥" },
    { activity: "Daily Check-in", coins: 2, icon: "📅" },
    { activity: "Share Deal", coins: 3, icon: "📤" },
    { activity: "Profile Completion", coins: 25, icon: "👤" }
  ];

  useEffect(() => {
    checkUser();
    fetchWalletData();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const fetchWalletData = async () => {
    try {
      // Mock data - in real implementation, fetch from database
      const mockTransactions: Transaction[] = [
        {
          id: "1",
          type: "earned",
          amount: 10,
          source: "deal_purchase",
          description: "Purchased Royal Rajasthani Thali",
          created_at: "2024-06-20T10:30:00Z"
        },
        {
          id: "2",
          type: "earned",
          amount: 50,
          source: "referral",
          description: "Friend joined using your referral",
          created_at: "2024-06-19T15:45:00Z"
        },
        {
          id: "3",
          type: "spent",
          amount: 25,
          source: "discount_redemption",
          description: "Applied on Beauty Spa Package",
          created_at: "2024-06-18T09:15:00Z"
        },
        {
          id: "4",
          type: "earned",
          amount: 5,
          source: "review",
          description: "Reviewed Cafe Mocha Experience",
          created_at: "2024-06-17T20:10:00Z"
        },
        {
          id: "5",
          type: "bonus",
          amount: 100,
          source: "milestone",
          description: "Completed 10 deals milestone",
          created_at: "2024-06-15T12:00:00Z"
        }
      ];

      const mockMilestones: Milestone[] = [
        {
          id: "1",
          title: "Deal Explorer",
          description: "Purchase 5 deals",
          target: 5,
          current: 3,
          reward: 50,
          completed: false
        },
        {
          id: "2",
          title: "Review Master",
          description: "Write 10 reviews",
          target: 10,
          current: 7,
          reward: 75,
          completed: false
        },
        {
          id: "3",
          title: "Social Butterfly",
          description: "Refer 3 friends",
          target: 3,
          current: 1,
          reward: 150,
          completed: false
        },
        {
          id: "4",
          title: "Loyalty Champion",
          description: "Complete 50 deals",
          target: 50,
          current: 50,
          reward: 500,
          completed: true
        }
      ];

      setTransactions(mockTransactions);
      setMilestones(mockMilestones);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalance = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
    setRefreshing(false);
    toast({
      title: "Balance Updated",
      description: "Your JaiCoin balance has been refreshed"
    });
  };

  const getTotalEarned = () => {
    return transactions
      .filter(t => t.type === 'earned' || t.type === 'bonus')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalSpent = () => {
    return transactions
      .filter(t => t.type === 'spent')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'earned' || transaction.type === 'bonus') {
      return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    }
    return <ArrowDownLeft className="w-4 h-4 text-red-600" />;
  };

  const getTransactionColor = (transaction: Transaction) => {
    if (transaction.type === 'earned' || transaction.type === 'bonus') {
      return "text-green-600";
    }
    return "text-red-600";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your JaiCoin wallet</p>
          <Button onClick={() => window.location.href = '/'}>
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-orange-400 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">JaiCoin Wallet</h1>
              <p className="text-pink-100">Earn, spend, and track your rewards</p>
            </div>
            <Button 
              onClick={refreshBalance}
              disabled={refreshing}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Balance Card */}
          <Card className="mt-8 bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 mb-2">Current Balance</p>
                  <div className="flex items-center gap-3">
                    <Coins className="w-8 h-8 text-yellow-300" />
                    <span className="text-4xl font-bold">{balance.toLocaleString()}</span>
                    <Badge className="bg-yellow-500 text-yellow-900 ml-2">JAI</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4 text-sm text-pink-100">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Earned: {getTotalEarned()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowDownLeft className="w-4 h-4" />
                      <span>Spent: {getTotalSpent()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-pink-200 mt-2">
                    1 JaiCoin = ₹1 discount value
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="earn">Earn Coins</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="redeem">Redeem</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Transaction History
                </CardTitle>
                <CardDescription>
                  View all your JaiCoin earnings and spending
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No transactions yet</p>
                    <p className="text-sm text-gray-500">Start earning JaiCoins by making purchases!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-gray-100">
                            {getTransactionIcon(transaction)}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${getTransactionColor(transaction)}`}>
                            {transaction.type === 'spent' ? '-' : '+'}
                            {transaction.amount}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {transaction.source.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earn Coins Tab */}
          <TabsContent value="earn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Ways to Earn
                  </CardTitle>
                  <CardDescription>
                    Complete activities to earn JaiCoins
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rewardRates.map((rate, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{rate.icon}</span>
                          <span className="font-medium">{rate.activity}</span>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          +{rate.coins} coins
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Daily Bonus
                  </CardTitle>
                  <CardDescription>
                    Log in daily to earn bonus coins
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">🎁</div>
                    <p className="text-lg font-semibold">Daily Check-in Bonus</p>
                    <p className="text-sm text-gray-600">Earn 2-10 coins every day</p>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-orange-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    Claim Today's Bonus
                  </Button>
                  <div className="mt-4 grid grid-cols-7 gap-1">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                      <div key={index} className={`text-center p-2 rounded text-xs ${
                        index < 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {day}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Achievement Milestones
                </CardTitle>
                <CardDescription>
                  Complete challenges to earn bonus JaiCoins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className={`p-4 border rounded-lg ${
                      milestone.completed ? 'bg-green-50 border-green-200' : 'bg-white'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            milestone.completed ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {milestone.completed ? (
                              <Trophy className="w-5 h-5 text-green-600" />
                            ) : (
                              <Target className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{milestone.title}</h3>
                            <p className="text-sm text-gray-600">{milestone.description}</p>
                          </div>
                        </div>
                        <Badge className={milestone.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {milestone.completed ? 'Completed' : `+${milestone.reward} coins`}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{milestone.current}/{milestone.target}</span>
                        </div>
                        <Progress 
                          value={(milestone.current / milestone.target) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Redeem Tab */}
          <TabsContent value="redeem">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Instant Discount</CardTitle>
                  <CardDescription>Use coins for immediate savings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">💰</div>
                    <p className="font-semibold">Apply to any purchase</p>
                    <p className="text-sm text-gray-600">1 JaiCoin = ₹1 discount</p>
                  </div>
                  <Button className="w-full" variant="outline">
                    Use on Next Purchase
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gift Vouchers</CardTitle>
                  <CardDescription>Exchange for popular brands</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>₹100 Amazon Voucher</span>
                      <Badge>120 coins</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>₹200 Flipkart Voucher</span>
                      <Badge>240 coins</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>₹500 Paytm Cash</span>
                      <Badge>550 coins</Badge>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    View All Vouchers
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Premium Benefits</CardTitle>
                  <CardDescription>Unlock exclusive features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">⭐</div>
                    <p className="font-semibold">Pro Membership</p>
                    <p className="text-sm text-gray-600">30 days access</p>
                  </div>
                  <Button className="w-full" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Redeem for 500 coins
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WalletPage;
