import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Users, Coins, Gift, Star, Trophy, Crown, Share2, Copy, Check,
  TrendingUp, Award, Target, Zap, Heart, ShoppingBag, UserPlus,
  ArrowRight, CheckCircle2, Sparkles, Rocket
} from "lucide-react";

interface DetailedReferralProgramProps {
  user: any;
  profile: any;
}

const DetailedReferralProgram = ({ user, profile }: DetailedReferralProgramProps) => {
  const [userBalance, setUserBalance] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
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
      
      const { data: balance, error: balanceError } = await supabase.rpc('get_user_balance', {
        user_uuid: user.id
      });
      
      if (balanceError) {
        console.error('Error fetching balance:', balanceError);
      } else {
        setUserBalance(balance || 0);
      }

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

  const copyReferralLink = async () => {
    if (profile?.referral_code) {
      const referralLink = `${window.location.origin}?ref=${profile.referral_code}`;
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "🎉 Referral Link Copied!",
        description: "Share this with friends to start earning!",
      });
    }
  };

  const getCurrentRank = (count: number) => {
    if (count >= 100) return { name: 'Jaipur Maharaja', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', nextMilestone: null, coinsEarned: count * 50 };
    if (count >= 50) return { name: 'Jaipur Legend', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', nextMilestone: 100, coinsEarned: count * 50 };
    if (count >= 25) return { name: 'Jaipur Champion', icon: Star, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200', nextMilestone: 50, coinsEarned: count * 50 };
    if (count >= 10) return { name: 'Jaipur Star', icon: Star, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', nextMilestone: 25, coinsEarned: count * 50 };
    if (count >= 3) return { name: 'Jaipur Explorer', icon: Target, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', nextMilestone: 10, coinsEarned: count * 50 };
    return { name: 'Local Explorer', icon: Users, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', nextMilestone: 3, coinsEarned: count * 50 };
  };

  const currentRank = getCurrentRank(referralCount);
  const RankIcon = currentRank.icon;

  const milestoneRewards = [
    { referrals: 3, reward: "Exclusive JaipurCircle Sticker", icon: Gift, color: "green" },
    { referrals: 10, reward: "JaipurCircle T-Shirt", icon: Award, color: "blue" },
    { referrals: 25, reward: "JaipurCircle Hoodie + ₹500 Deal Voucher", icon: Trophy, color: "pink" },
    { referrals: 50, reward: "Premium Merchandise Bundle + ₹2000 Voucher", icon: Star, color: "yellow" },
    { referrals: 100, reward: "VIP Status + Lifetime Benefits + ₹5000 Voucher", icon: Crown, color: "purple" },
  ];

  const earningStructure = [
    { level: "Direct Referral (Level 1)", earning: "50 JAICoins", description: "When your friend signs up" },
    { level: "Secondary Referral (Level 2)", earning: "25 JAICoins", description: "When your friend refers someone" },
    { level: "Third Level (Level 3)", earning: "10 JAICoins", description: "When their friend refers someone" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Section with Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Complete Referral Program</h1>
          </div>
          <p className="text-lg opacity-90 mb-6">
            Earn unlimited JAICoins by inviting friends to JaipurCircle. The more you share, the more you earn!
          </p>
          
          {user && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8" />
                    <div>
                      <p className="text-2xl font-bold">{referralCount}</p>
                      <p className="text-sm opacity-90">Friends Referred</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Coins className="w-8 h-8" />
                    <div>
                      <p className="text-2xl font-bold">{currentRank.coinsEarned}</p>
                      <p className="text-sm opacity-90">JAICoins Earned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <RankIcon className="w-8 h-8" />
                    <div>
                      <p className="text-lg font-bold">{currentRank.name}</p>
                      <p className="text-sm opacity-90">Current Rank</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {user && profile?.referral_code && (
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <p className="text-sm mb-2 opacity-90">Your Referral Link</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/20 rounded-lg px-4 py-2 font-mono text-sm break-all">
                    {`${window.location.origin}?ref=${profile.referral_code}`}
                  </div>
                  <Button 
                    onClick={copyReferralLink}
                    className="bg-white text-purple-600 hover:bg-white/90"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-bold mb-2">1. Share Your Link</h3>
              <p className="text-sm text-muted-foreground">
                Copy and share your unique referral link with friends and family
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">2. Friend Signs Up</h3>
              <p className="text-sm text-muted-foreground">
                When they create an account using your link, they become your referral
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold mb-2">3. Earn JAICoins</h3>
              <p className="text-sm text-muted-foreground">
                Get 50 JAICoins instantly when they complete signup
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold mb-2">4. Multiply Earnings</h3>
              <p className="text-sm text-muted-foreground">
                Earn from their referrals too - up to 3 levels deep!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Level Earning Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            3-Level Earning Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earningStructure.map((level, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex-shrink-0">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {level.earning}
                  </Badge>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold">{level.level}</h4>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Example Earnings Scenario
            </h4>
            <p className="text-sm text-green-800">
              If you refer 5 friends, and each refers 2 people, who each refer 1 person:
            </p>
            <ul className="text-sm text-green-800 mt-2 space-y-1">
              <li>• Level 1: 5 friends × 50 = <strong>250 JAICoins</strong></li>
              <li>• Level 2: 10 referrals × 25 = <strong>250 JAICoins</strong></li>
              <li>• Level 3: 10 referrals × 10 = <strong>100 JAICoins</strong></li>
              <li className="pt-2 border-t border-green-300">
                <strong>Total Earnings: 600 JAICoins!</strong> 💰
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Milestone Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            Milestone Rewards & Rank System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestoneRewards.map((milestone, index) => {
              const MilestoneIcon = milestone.icon;
              const isAchieved = referralCount >= milestone.referrals;
              const colorClasses = {
                green: "bg-green-100 text-green-700 border-green-300",
                blue: "bg-blue-100 text-blue-700 border-blue-300",
                pink: "bg-pink-100 text-pink-700 border-pink-300",
                yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
                purple: "bg-purple-100 text-purple-700 border-purple-300",
              };

              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    isAchieved
                      ? 'bg-green-50 border-green-300'
                      : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isAchieved ? 'bg-green-500' : colorClasses[milestone.color as keyof typeof colorClasses]
                  }`}>
                    {isAchieved ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <MilestoneIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={isAchieved ? "default" : "secondary"}>
                        {milestone.referrals} Referrals
                      </Badge>
                      {isAchieved && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Unlocked
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-bold">{milestone.reward}</h4>
                  </div>
                </div>
              );
            })}
          </div>
          
          {currentRank.nextMilestone && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Next Milestone:</strong> Refer {currentRank.nextMilestone - referralCount} more {currentRank.nextMilestone - referralCount === 1 ? 'friend' : 'friends'} to reach the next rank and unlock exclusive rewards!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-6 h-6 text-primary" />
            Why Join Our Referral Program?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <Coins className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Unlimited Earning Potential</h4>
                <p className="text-sm text-muted-foreground">
                  No cap on referrals or earnings. The more you share, the more you earn!
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Help Your Community</h4>
                <p className="text-sm text-muted-foreground">
                  Share amazing deals with friends and help them save money on local purchases
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Exclusive Merchandise</h4>
                <p className="text-sm text-muted-foreground">
                  Unlock branded merchandise and premium vouchers as you hit milestones
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Recognition & Status</h4>
                <p className="text-sm text-muted-foreground">
                  Climb the ranks from Local Explorer to Jaipur Maharaja and gain VIP benefits
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I get my referral link?</AccordionTrigger>
              <AccordionContent>
                Once you create an account on JaipurCircle, you'll automatically receive a unique referral code. You can find it in your profile or on this referral program page. Simply copy and share it with friends!
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>When do I receive my JAICoins?</AccordionTrigger>
              <AccordionContent>
                You receive JAICoins instantly when your referred friend completes their signup. Additional earnings from Level 2 and Level 3 referrals are also credited immediately when those signups happen.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>What can I do with JAICoins?</AccordionTrigger>
              <AccordionContent>
                JAICoins can be used to purchase deals, get discounts on products, participate in special events, and redeem exclusive rewards. 1 JAICoin = ₹1 value on most purchases.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Is there a limit to how many people I can refer?</AccordionTrigger>
              <AccordionContent>
                No! There's absolutely no limit. You can refer as many friends as you want and earn unlimited JAICoins. The sky's the limit!
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>How do milestone rewards work?</AccordionTrigger>
              <AccordionContent>
                As you reach referral milestones (3, 10, 25, 50, 100 referrals), you automatically unlock physical rewards like stickers, t-shirts, hoodies, and vouchers. These are delivered to your registered address within 15-30 days.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger>What happens if someone uses my link but doesn't complete signup?</AccordionTrigger>
              <AccordionContent>
                You only earn rewards when your friend completes the signup process. Incomplete signups don't count as referrals, but your friend can always return and complete the signup later using your link.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-7">
              <AccordionTrigger>Can I track my referrals?</AccordionTrigger>
              <AccordionContent>
                Yes! Visit your profile dashboard to see detailed statistics about your referrals, including total count, earnings by level, and progress toward the next milestone.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            1. <strong>Eligibility:</strong> The referral program is open to all registered JaipurCircle users.
          </p>
          <p>
            2. <strong>Valid Referrals:</strong> A referral is considered valid only when the referred user creates a new account and completes the verification process.
          </p>
          <p>
            3. <strong>Self-Referrals:</strong> Creating multiple accounts or referring yourself is strictly prohibited and may result in account suspension.
          </p>
          <p>
            4. <strong>Reward Distribution:</strong> JAICoins are credited automatically. Physical milestone rewards are shipped within 15-30 business days.
          </p>
          <p>
            5. <strong>Earning Limits:</strong> While there's no limit on referrals, JaipurCircle reserves the right to investigate suspicious activity.
          </p>
          <p>
            6. <strong>Program Changes:</strong> JaipurCircle may modify or terminate the referral program at any time with prior notice.
          </p>
          <p>
            7. <strong>JAICoin Expiry:</strong> Earned JAICoins are valid for 1 year from the date of earning.
          </p>
          <p>
            8. <strong>Fraudulent Activity:</strong> Any fraudulent activity will result in immediate forfeiture of rewards and possible account termination.
          </p>
          <Separator className="my-4" />
          <p className="text-xs">
            For any questions or concerns regarding the referral program, please contact us at <a href="mailto:support@jaipurcircle.com" className="text-primary hover:underline">support@jaipurcircle.com</a>
          </p>
        </CardContent>
      </Card>

      {/* CTA */}
      {!user && (
        <Card className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Earning?</h3>
            <p className="mb-6">Join JaipurCircle today and start sharing to earn unlimited JAICoins!</p>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
              Sign Up Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DetailedReferralProgram;