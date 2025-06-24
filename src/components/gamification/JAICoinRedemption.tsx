
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Coins, Gift, Coffee, Ticket, Smartphone, Heart,
  Crown, Star, Shirt, Trophy, MapPin, CreditCard
} from "lucide-react";

interface RedemptionOption {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'digital' | 'physical' | 'experience' | 'charity' | 'cash';
  icon: any;
  availability: 'pre-launch' | 'post-launch' | 'always';
  isAvailable: boolean;
  estimatedDelivery?: string;
}

const JAICoinRedemption = () => {
  const [userBalance, setUserBalance] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('pre-launch');
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchUserBalance();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const fetchUserBalance = async () => {
    if (!user?.id) return;
    
    const { data: balance } = await supabase.rpc('get_user_balance', {
      user_uuid: user.id
    });
    setUserBalance(balance || 0);
  };

  const redemptionOptions: RedemptionOption[] = [
    // Pre-launch rewards
    {
      id: 'digital-badge',
      title: 'Digital Profile Badge',
      description: 'Exclusive "Hawa Mahal Hero" badge for your profile',
      cost: 100,
      category: 'digital',
      icon: Star,
      availability: 'pre-launch',
      isAvailable: true
    },
    {
      id: 'beta-access',
      title: 'VIP Beta Access',
      description: 'Early access to MyJaipur platform with exclusive deals',
      cost: 200,
      category: 'digital',
      icon: Crown,
      availability: 'pre-launch',
      isAvailable: true
    },
    {
      id: 'early-adopter',
      title: 'Early Adopter Status',
      description: 'Special recognition and perks for early supporters',
      cost: 500,
      category: 'digital',
      icon: Trophy,
      availability: 'pre-launch',
      isAvailable: true
    },
    {
      id: 'jaipur-nft',
      title: 'Jaipur Heritage NFT',
      description: 'Limited edition digital collectible on Polygon',
      cost: 1000,
      category: 'digital',
      icon: Smartphone,
      availability: 'pre-launch',
      isAvailable: false, // Coming soon
      estimatedDelivery: 'Q2 2024'
    },

    // Post-launch rewards
    {
      id: 'deal-voucher-50',
      title: '₹50 Deal Voucher',
      description: 'Get ₹50 off on any deal or product',
      cost: 50,
      category: 'experience',
      icon: Gift,
      availability: 'post-launch',
      isAvailable: false
    },
    {
      id: 'coffee-voucher',
      title: 'Free Coffee/Dessert',
      description: 'Enjoy a free coffee or dessert at local café partners',
      cost: 100,
      category: 'experience',
      icon: Coffee,
      availability: 'post-launch',
      isAvailable: false
    },
    {
      id: 'movie-ticket',
      title: 'Movie Tickets',
      description: 'Movie tickets or Chokhi Dhani experience voucher',
      cost: 200,
      category: 'experience',
      icon: Ticket,
      availability: 'post-launch',
      isAvailable: false
    },
    {
      id: 'upi-cash-500',
      title: '₹500 UPI Transfer',
      description: 'Direct cash transfer to your UPI account',
      cost: 500,
      category: 'cash',
      icon: CreditCard,
      availability: 'post-launch',
      isAvailable: false
    },

    // Physical rewards
    {
      id: 'jaipur-tshirt',
      title: 'Jaipur Champion T-shirt',
      description: 'Exclusive Rajasthani-designed t-shirt with free shipping',
      cost: 250,
      category: 'physical',
      icon: Shirt,
      availability: 'always',
      isAvailable: true,
      estimatedDelivery: '7-10 business days'
    },

    // Charity options
    {
      id: 'heritage-donation',
      title: 'Jaipur Heritage Preservation',
      description: 'Donate to preserve Jaipur\'s historical monuments',
      cost: 100,
      category: 'charity',
      icon: Heart,
      availability: 'always',
      isAvailable: true
    },
    {
      id: 'education-donation',
      title: 'Local Education Support',
      description: 'Support education initiatives in Jaipur communities',
      cost: 200,
      category: 'charity',
      icon: Heart,
      availability: 'always',
      isAvailable: true
    }
  ];

  const redeemItem = async (option: RedemptionOption) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to redeem rewards",
        variant: "destructive"
      });
      return;
    }

    if (userBalance < option.cost) {
      toast({
        title: "Insufficient JAICoins",
        description: `You need ${option.cost - userBalance} more JAICoins to redeem this item`,
        variant: "destructive"
      });
      return;
    }

    if (!option.isAvailable) {
      toast({
        title: "Not Available",
        description: "This reward is not currently available",
        variant: "destructive"
      });
      return;
    }

    try {
      // Deduct JAICoins
      const { error } = await supabase
        .from('jaicoin_transactions')
        .insert({
          user_id: user.id,
          amount: option.cost,
          type: 'spent',
          source: 'redemption',
          description: `Redeemed: ${option.title}`
        });

      if (error) throw error;

      // Update local balance
      setUserBalance(prev => prev - option.cost);

      // Handle different redemption types
      if (option.category === 'physical') {
        toast({
          title: "🎽 Physical Reward Claimed!",
          description: `Your ${option.title} will be shipped soon. Check your profile for tracking.`,
        });
      } else if (option.category === 'charity') {
        toast({
          title: "❤️ Donation Successful!",
          description: `Thank you for contributing to ${option.title}. You're making Jaipur better!`,
        });
      } else {
        toast({
          title: "🎉 Reward Redeemed!",
          description: `You've successfully redeemed ${option.title}!`,
        });
      }

    } catch (error) {
      console.error('Error redeeming item:', error);
      toast({
        title: "Error",
        description: "Failed to redeem item. Please try again.",
        variant: "destructive"
      });
    }
  };

  const RedemptionCard = ({ option }: { option: RedemptionOption }) => {
    const Icon = option.icon;
    const canAfford = userBalance >= option.cost;

    return (
      <Card className={`${!option.isAvailable ? 'opacity-60' : ''} ${option.category === 'charity' ? 'border-red-200 bg-red-50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                option.category === 'charity' ? 'bg-red-100' :
                option.category === 'digital' ? 'bg-blue-100' :
                option.category === 'physical' ? 'bg-green-100' :
                option.category === 'experience' ? 'bg-purple-100' :
                'bg-yellow-100'
              }`}>
                <Icon className={`w-6 h-6 ${
                  option.category === 'charity' ? 'text-red-600' :
                  option.category === 'digital' ? 'text-blue-600' :
                  option.category === 'physical' ? 'text-green-600' :
                  option.category === 'experience' ? 'text-purple-600' :
                  'text-yellow-600'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{option.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                {option.estimatedDelivery && (
                  <p className="text-xs text-gray-500">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    Delivery: {option.estimatedDelivery}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="font-bold">{option.cost} JC</span>
              </div>
              <Button
                size="sm"
                onClick={() => redeemItem(option)}
                disabled={!canAfford || !option.isAvailable}
                className={`${
                  option.category === 'charity' ? 'bg-red-500 hover:bg-red-600' :
                  'bg-pink-500 hover:bg-pink-600'
                } ${!canAfford ? 'opacity-50' : ''}`}
              >
                {!option.isAvailable ? 'Coming Soon' : 
                 !canAfford ? 'Need More JC' : 'Redeem'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const prelaunchRewards = redemptionOptions.filter(r => r.availability === 'pre-launch' || r.availability === 'always');
  const postlaunchRewards = redemptionOptions.filter(r => r.availability === 'post-launch');
  const charityOptions = redemptionOptions.filter(r => r.category === 'charity');

  return (
    <div className="space-y-6">
      {/* Balance Header */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Coins className="w-6 h-6 text-yellow-500" />
            <span>Your JAICoin Balance</span>
          </CardTitle>
          <div className="text-4xl font-bold text-yellow-600">{userBalance} JC</div>
          <CardDescription>
            Redeem your JAICoins for exclusive rewards and experiences
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Redemption Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pre-launch">🎁 Available Now</TabsTrigger>
          <TabsTrigger value="post-launch">🚀 Post-Launch</TabsTrigger>
          <TabsTrigger value="charity">❤️ Support Jaipur</TabsTrigger>
        </TabsList>

        <TabsContent value="pre-launch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Launch Exclusive Rewards</CardTitle>
              <CardDescription>
                Limited-time rewards available during our pre-launch phase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prelaunchRewards.map(option => (
                <RedemptionCard key={option.id} option={option} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="post-launch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Post-Launch Rewards</CardTitle>
              <CardDescription>
                These rewards will become available after MyJaipur officially launches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {postlaunchRewards.map(option => (
                <RedemptionCard key={option.id} option={option} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charity" className="space-y-4">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span>Support Jaipur Community</span>
              </CardTitle>
              <CardDescription>
                Use your JAICoins to make a positive impact in Jaipur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {charityOptions.map(option => (
                <RedemptionCard key={option.id} option={option} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JAICoinRedemption;
