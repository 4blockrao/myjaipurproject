
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Gift, Users, TrendingUp, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface JaiCoinZoneProps {
  user: any;
}

const JaiCoinZone = ({ user }: JaiCoinZoneProps) => {
  const { toast } = useToast();
  const userRank = 12;
  const userCoins = 280;
  const coinsToNextRank = 10;

  const handleReferFriend = async () => {
    try {
      // Get user's referral code
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      if (profile?.referral_code) {
        const referralLink = `${window.location.origin}?ref=${profile.referral_code}`;
        await navigator.clipboard.writeText(referralLink);
        
        toast({
          title: "📱 Referral Link Copied!",
          description: "Share this link with friends to earn 30 JaiCoins each!",
        });
      }
    } catch (error) {
      console.error('Error copying referral link:', error);
      toast({
        title: "Error",
        description: "Failed to copy referral link",
        variant: "destructive"
      });
    }
  };

  const handleReferMerchant = () => {
    toast({
      title: "🏪 Merchant Referral",
      description: "Contact our team at merchants@myjaipur.com to refer a business and earn 50 JaiCoins!",
    });
  };

  const handleRedeemDeal = () => {
    window.location.href = '/deals';
  };

  const actions = [
    { 
      title: "Refer a Friend", 
      reward: 30, 
      icon: Users, 
      color: "from-blue-400 to-blue-600",
      action: handleReferFriend
    },
    { 
      title: "Refer Merchant", 
      reward: 50, 
      icon: TrendingUp, 
      color: "from-green-400 to-green-600",
      action: handleReferMerchant
    },
    { 
      title: "Redeem Deal", 
      reward: 5, 
      icon: Gift, 
      color: "from-purple-400 to-purple-600",
      action: handleRedeemDeal
    },
  ];

  return (
    <section className="py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Coins className="w-8 h-8 text-yellow-500" />
          <h2 className="text-3xl font-bold text-gray-900">JAICoin Zone</h2>
          <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
        </div>
        <p className="text-gray-600 text-lg">Earn coins, spin the wheel, climb the leaderboard!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Spin Wheel */}
        <Card className="col-span-1 lg:col-span-1 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-center space-x-2">
              <Gift className="w-6 h-6 text-yellow-600" />
              <span>Daily Spin</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="w-full h-full rounded-full bg-gradient-to-r from-pink-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 animate-spin-slow flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                  <Coins className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
              </div>
            </div>
            <Link to="/dashboard?tab=gamification">
              <Button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 font-bold shadow-lg">
                Spin Now!
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* JAICoin Actions */}
        <Card className="col-span-1 lg:col-span-1 bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Earn More Coins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{action.title}</p>
                      <p className="text-xs text-gray-600">Earn +{action.reward} coins</p>
                    </div>
                  </div>
                  <Button 
                    onClick={action.action}
                    size="sm" 
                    variant="outline" 
                    className="text-pink-600 border-pink-300 hover:bg-pink-50"
                  >
                    Start
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Mini Leaderboard */}
        <Card className="col-span-1 lg:col-span-1 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              <span>Your Rank</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-indigo-600 mb-2">#{userRank}</div>
              <p className="text-gray-600">with {userCoins} JAICoins</p>
              <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                {coinsToNextRank} coins to Top 10!
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">🥇 Raj Sharma</span>
                <span className="font-semibold">1,250</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">🥈 Priya Singh</span>
                <span className="font-semibold">1,100</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">🥉 Amit Kumar</span>
                <span className="font-semibold">950</span>
              </div>
            </div>

            <Link to="/dashboard?tab=leaderboard">
              <Button className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600">
                View Full Leaderboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default JaiCoinZone;
