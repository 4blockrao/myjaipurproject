
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

interface Transaction {
  id: number;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  date: string;
}

interface Reward {
  id: number;
  title: string;
  description: string;
  cost: number;
  category: string;
}

const JaiCoinWallet = () => {
  const [balance] = useState(1250); // Example balance
  
  const transactions: Transaction[] = [
    { id: 1, type: 'earned', amount: 50, description: 'Deal purchase at Chokhi Dhani', date: '2024-01-20' },
    { id: 2, type: 'earned', amount: 25, description: 'Friend referral signup', date: '2024-01-19' },
    { id: 3, type: 'spent', amount: 250, description: 'Redeemed ₹25 off coupon', date: '2024-01-18' },
    { id: 4, type: 'earned', amount: 25, description: 'Posted review with photo', date: '2024-01-17' },
    { id: 5, type: 'earned', amount: 100, description: '3-day redemption streak bonus', date: '2024-01-16' },
    { id: 6, type: 'earned', amount: 10, description: 'Daily spin reward', date: '2024-01-15' },
  ];

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

  const handleRedeemReward = (rewardId: number, cost: number) => {
    if (balance >= cost) {
      // TODO: Implement reward redemption logic
      console.log('Redeeming reward:', rewardId);
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
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full mr-3"></div>
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
                        <div className="w-4 h-4 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full"></div>
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
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{transaction.description}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.type === 'earned' ? 'Earned' : 'Spent'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                <div className="text-2xl font-bold text-yellow-600 mb-2">50</div>
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
