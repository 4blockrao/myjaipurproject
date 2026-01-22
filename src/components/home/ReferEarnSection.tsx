
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Users, Coins, Gift, Star, Trophy, Crown,
  Share2, ChevronRight, Target
} from "lucide-react";

interface ReferEarnSectionProps {
  user: any;
  profile: any;
}

const ReferEarnSection = ({ user, profile }: ReferEarnSectionProps) => {
  const [userBalance, setUserBalance] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Get user balance
      const { data: balance, error: balanceError } = await supabase.rpc('get_user_balance', {
        user_uuid: user.id
      });
      
      if (balanceError) {
        console.error('Error fetching balance:', balanceError);
      } else {
        setUserBalance(balance || 0);
      }

      // Get referral count
      const { data: referrals, error: referralError } = await supabase
        .from('profiles')
        .select('id')
        .eq('referred_by', user.id);
      
      if (referralError) {
        console.error('Error fetching referrals:', referralError);
      } else {
        setReferralCount(referrals?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (profile?.referral_code) {
      const referralLink = `${window.location.origin}?ref=${profile.referral_code}`;
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "🎉 Referral Link Copied!",
        description: "Share this with friends to start earning JAICoins!",
      });
    }
  };

  const copyUserIdCode = async () => {
    if (profile?.user_id_code) {
      await navigator.clipboard.writeText(profile.user_id_code);
      toast({
        title: "🎉 User ID Copied!",
        description: "Share this ID for friends to find you!",
      });
    }
  };

  const getCurrentRank = (count: number) => {
    if (count >= 100) return { name: 'Jaipur Maharaja', icon: Crown, color: 'text-purple-600' };
    if (count >= 50) return { name: 'Jaipur Legend', icon: Trophy, color: 'text-yellow-600' };
    if (count >= 25) return { name: 'Jaipur Champion', icon: Star, color: 'text-pink-600' };
    if (count >= 10) return { name: 'Jaipur Star', icon: Star, color: 'text-blue-600' };
    if (count >= 3) return { name: 'Jaipur Explorer', icon: Target, color: 'text-green-600' };
    return { name: 'Local Explorer', icon: Users, color: 'text-gray-600' };
  };

  const currentRank = getCurrentRank(referralCount);
  const RankIcon = currentRank.icon;

  const benefits = [
    { icon: Coins, title: "50 JAICoins", subtitle: "Per friend signup" },
    { icon: Gift, title: "Milestone Rewards", subtitle: "T-shirts, badges & more" },
    { icon: Trophy, title: "Rank System", subtitle: "Become Jaipur Maharaja" },
    { icon: Star, title: "VIP Access", subtitle: "Exclusive deals & events" }
  ];

  if (isLoading) {
    return (
      <section className="relative overflow-hidden px-4 py-8 lg:px-8 lg:py-16">
        <div className="flex items-center justify-center min-h-[200px]">
          <LoadingSpinner size="lg" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden px-4 py-8 lg:px-8 lg:py-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 opacity-50">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-pink-200 rounded-full opacity-30"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-orange-200 rounded-lg rotate-45 opacity-30"></div>
        <div className="absolute top-32 right-10 w-12 h-12 border-2 border-yellow-300 rounded-full opacity-30"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-6 lg:mb-8">
          <Badge className="bg-gradient-to-r from-pink-500 to-orange-400 text-white border-0 mb-3 lg:mb-4 px-3 lg:px-4 py-1 lg:py-2">
            <Coins className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            <span className="text-xs lg:text-sm">Refer & Earn Program</span>
          </Badge>
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-3 lg:mb-4 px-2">
            Build Your <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">Jaipur Empire</span>
          </h2>
          <p className="text-sm lg:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Invite friends, earn JAICoins, and unlock exclusive rewards. The more you share, the more you earn!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left Side - Benefits */}
          <div className="space-y-4 lg:space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="border-2 border-pink-100 hover:border-pink-200 transition-colors">
                    <CardContent className="p-3 lg:p-4 text-center">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
                        <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1 text-sm lg:text-base">{benefit.title}</h3>
                      <p className="text-xs lg:text-sm text-gray-600">{benefit.subtitle}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-gradient-to-r from-pink-500 to-orange-400 border-0 text-white">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold mb-2">Quick Math!</h3>
                    <p className="text-pink-100 text-sm lg:text-base">Refer 25 friends = 1,250 JAICoins + Free T-shirt</p>
                    <p className="text-pink-100 text-sm lg:text-base">That's ₹1,250+ in rewards!</p>
                  </div>
                  <div className="text-2xl lg:text-4xl">💰</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - User Stats or CTA */}
          <div className="space-y-4 lg:space-y-6">
            {user ? (
              <Card className="border-2 border-pink-200 bg-white">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center mb-4 lg:mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <RankIcon className={`w-5 h-5 lg:w-6 lg:h-6 ${currentRank.color}`} />
                      <span className="text-base lg:text-lg font-bold text-gray-900">{currentRank.name}</span>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-pink-600 mb-1">{userBalance} JC</div>
                    <p className="text-xs lg:text-sm text-gray-600">{referralCount} friends referred</p>
                  </div>

                  <div className="space-y-3">
                    {/* User ID Code */}
                    {profile?.user_id_code && (
                      <div className="flex space-x-2">
                        <div className="flex-1 p-2 lg:p-3 bg-blue-50 rounded-lg border text-center">
                          <div className="text-xs text-blue-600 mb-1">User ID</div>
                          <span className="font-mono font-bold text-sm lg:text-base text-blue-700">{profile.user_id_code}</span>
                        </div>
                        <Button onClick={copyUserIdCode} size="sm" className="bg-blue-500 hover:bg-blue-600 px-3">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Referral Code */}
                    {profile?.referral_code && (
                      <div className="flex space-x-2">
                        <div className="flex-1 p-2 lg:p-3 bg-gray-50 rounded-lg border text-center">
                          <div className="text-xs text-gray-600 mb-1">Referral Code</div>
                          <span className="font-mono font-bold text-sm lg:text-base">{profile.referral_code}</span>
                        </div>
                        <Button onClick={copyReferralCode} size="sm" className="bg-pink-500 hover:bg-pink-600 px-3">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    <Link to="/referral-program">
                      <Button className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white h-auto py-3">
                        <span className="text-sm lg:text-base">View Full Program</span>
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-pink-200 bg-white">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="mb-4">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                      <Users className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Start Earning Today!</h3>
                    <p className="text-gray-600 mb-4 text-sm lg:text-base">
                      Join thousands of Jaipurites earning JAICoins and building their empire
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white h-auto py-3">
                      <span className="text-sm lg:text-lg font-medium">Join Now & Get 30 JAICoins Free!</span>
                    </Button>
                    
                    <Link to="/referral-program">
                      <Button variant="outline" className="w-full border-pink-300 text-pink-600 hover:bg-pink-50 h-auto py-2">
                        <span className="text-sm">Learn More About Program</span>
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3 lg:p-4">
                <h4 className="font-bold text-blue-900 mb-2 text-sm lg:text-base">💡 Pro Tips to Maximize Earnings</h4>
                <ul className="text-xs lg:text-sm text-blue-800 space-y-1">
                  <li>• Share in WhatsApp groups for faster signups</li>
                  <li>• Post on Instagram stories with location tags</li>
                  <li>• Target friends who love deals and shopping</li>
                  <li>• Explain the free JAICoins benefit clearly</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ReferEarnSection;
