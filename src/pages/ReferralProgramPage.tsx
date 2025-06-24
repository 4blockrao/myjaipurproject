
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Users, Coins, Gift, Star, Trophy, Crown, Share2, Target,
  CheckCircle, ArrowRight, Sparkles, TrendingUp, Heart,
  MessageCircle, Instagram, Phone, Mail, Copy, QrCode,
  Clock, Zap, Award, Medal, Shirt, Coffee, CreditCard,
  ChevronRight, ArrowLeft, Smartphone, Download
} from "lucide-react";

const ReferralProgramPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userBalance, setUserBalance] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await fetchUserData(session.user.id);
    }
  };

  const fetchUserData = async (userId: string) => {
    // Get profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(profileData);

    // Get balance
    const { data: balance } = await supabase.rpc('get_user_balance', {
      user_uuid: userId
    });
    setUserBalance(balance || 0);

    // Get referral count
    const { data: referrals } = await supabase
      .from('profiles')
      .select('id')
      .eq('referred_by', userId);
    setReferralCount(referrals?.length || 0);
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

  const shareTemplates = [
    {
      platform: "WhatsApp",
      icon: MessageCircle,
      template: "🎉 Hey! I found this amazing app MyJaipur with great deals in our city! Join using my link and get 30 FREE JAICoins to start with: [LINK]",
      color: "bg-green-500"
    },
    {
      platform: "Instagram",
      icon: Instagram,
      template: "Discovered @MyJaipur - the best deals app for Jaipur! 🏰 Join with my referral and get 30 JAICoins free! #MyJaipur #JaipurDeals [LINK]",
      color: "bg-pink-500"
    },
    {
      platform: "SMS",
      icon: Phone,
      template: "Check out MyJaipur app for amazing local deals! Use my referral link and get 30 JAICoins: [LINK]",
      color: "bg-blue-500"
    }
  ];

  const milestones = [
    { count: 3, reward: 100, title: "Jaipur Explorer", icon: Target, description: "Beta access + digital badge", color: "green" },
    { count: 10, reward: 300, title: "Jaipur Star", icon: Star, description: "2 spins daily + 10% bonus", color: "blue" },
    { count: 25, reward: 1000, title: "Jaipur Champion", icon: Shirt, description: "Free T-shirt + digital badge", color: "pink" },
    { count: 50, reward: 2500, title: "Jaipur Legend", icon: Trophy, description: "VIP event invite", color: "yellow" },
    { count: 100, reward: 10000, title: "Jaipur Maharaja", icon: Crown, description: "Ambassador status + grand prize", color: "purple" }
  ];

  const tips = [
    {
      icon: Users,
      title: "Target the Right People",
      description: "Focus on friends who love shopping, deals, and trying new apps. They're more likely to sign up and stay active."
    },
    {
      icon: MessageCircle,
      title: "Personal Touch Works",
      description: "Don't just copy-paste. Add a personal message explaining why you think they'd love MyJaipur."
    },
    {
      icon: Sparkles,
      title: "Highlight Free JAICoins",
      description: "Emphasize the immediate 30 JAICoins they get for free - it's instant gratification!"
    },
    {
      icon: TrendingUp,
      title: "Share Success Stories",
      description: "Tell them about deals you've found or JAICoins you've earned. Social proof is powerful!"
    },
    {
      icon: Clock,
      title: "Perfect Timing",
      description: "Share during lunch breaks, evenings, or weekends when people are more likely to check new apps."
    },
    {
      icon: Heart,
      title: "Build FOMO",
      description: "Mention limited-time offers, exclusive deals, or that it's the hottest new app in Jaipur."
    }
  ];

  const getCurrentRank = (count: number) => {
    if (count >= 100) return { name: 'Jaipur Maharaja', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' };
    if (count >= 50) return { name: 'Jaipur Legend', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (count >= 25) return { name: 'Jaipur Champion', icon: Shirt, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' };
    if (count >= 10) return { name: 'Jaipur Star', icon: Star, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (count >= 3) return { name: 'Jaipur Explorer', icon: Target, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    return { name: 'Local Explorer', icon: Users, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
  };

  const currentRank = getCurrentRank(referralCount);
  const RankIcon = currentRank.icon;
  const nextMilestone = milestones.find(m => m.count > referralCount) || milestones[milestones.length - 1];
  const progress = nextMilestone ? (referralCount / nextMilestone.count) * 100 : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Refer & Earn Program</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-orange-500/10 to-yellow-500/10 rounded-3xl"></div>
          <div className="relative py-12 px-6">
            <Badge className="bg-gradient-to-r from-pink-500 to-orange-400 text-white border-0 mb-4 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Build Your Empire
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome to the <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">JAICoin Universe</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              MyJaipur's revolutionary referral program that rewards you for sharing the love. 
              Every friend you bring earns you JAICoins, unlocks exclusive perks, and builds your Jaipur Empire!
            </p>
            
            {user && (
              <div className="flex justify-center">
                <Card className={`${currentRank.bg} ${currentRank.border} border-2`}>
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <RankIcon className={`w-6 h-6 ${currentRank.color}`} />
                      <span className="text-lg font-bold text-gray-900">{currentRank.name}</span>
                    </div>
                    <div className="text-3xl font-bold text-pink-600 mb-1">{userBalance} JC</div>
                    <p className="text-sm text-gray-600">{referralCount} friends referred</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* What are JAICoins */}
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 border-0 text-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Coins className="w-6 h-6" />
              <span>What are JAICoins?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Digital Currency</h3>
                <p className="text-yellow-100">MyJaipur's exclusive currency that you earn through referrals and activities</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Real Value</h3>
                <p className="text-yellow-100">Redeem for deals, cash, products, experiences, and even donate to charity</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Growing Rewards</h3>
                <p className="text-yellow-100">The more you earn, the more valuable perks and exclusive benefits you unlock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="how-it-works" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="share">Share & Earn</TabsTrigger>
            <TabsTrigger value="tips">Pro Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="how-it-works" className="space-y-6">
            {/* Multi-Level System */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-6 h-6 text-blue-500" />
                  <span>Multi-Level Referral System</span>
                </CardTitle>
                <CardDescription>
                  Earn from 4 levels deep - your referrals' referrals also earn you JAICoins!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">Level 1 (Direct Friend)</span>
                        <Badge className="bg-green-500">50 JC</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium">Level 2 (Friend's Friend)</span>
                        <Badge className="bg-blue-500">25 JC</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="font-medium">Level 3</span>
                        <Badge className="bg-purple-500">15 JC</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <span className="font-medium">Level 4</span>
                        <Badge className="bg-orange-500">10 JC</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-4">🏰</div>
                        <h3 className="font-bold text-lg mb-2">Your Jaipur Empire</h3>
                        <p className="text-gray-600">Watch your network grow and earn from every level!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress to Next Milestone */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                  <CardDescription>
                    {referralCount}/{nextMilestone.count} referrals to {nextMilestone.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="h-3 mb-4" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Current: {referralCount} referrals</span>
                    <span>Next: {nextMilestone.count} referrals</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            {/* Milestone Rewards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <span>Milestone Rewards</span>
                </CardTitle>
                <CardDescription>
                  Unlock exclusive ranks and rewards as you grow your referral network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => {
                    const Icon = milestone.icon;
                    const isCompleted = referralCount >= milestone.count;
                    const isCurrent = referralCount < milestone.count && 
                      (index === 0 || referralCount >= milestones[index - 1].count);

                    return (
                      <div key={milestone.count} className={`p-4 rounded-lg border-2 ${
                        isCompleted ? 'bg-green-50 border-green-200' : 
                        isCurrent ? 'bg-blue-50 border-blue-200' : 
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-green-500' : 
                              isCurrent ? 'bg-blue-500' : 
                              'bg-gray-400'
                            }`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{milestone.title}</h3>
                              <p className="text-gray-600">{milestone.count} referrals • {milestone.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{milestone.reward} JC</div>
                            {isCompleted && <Badge className="bg-green-500 mt-1">Completed!</Badge>}
                            {isCurrent && <Badge className="bg-blue-500 mt-1">Next Goal</Badge>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Redemption Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="w-6 h-6 text-pink-500" />
                  <span>Redeem Your JAICoins</span>
                </CardTitle>
                <CardDescription>
                  Turn your JAICoins into real value and experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Coffee className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-bold">Food & Drinks</h4>
                    <p className="text-sm text-gray-600">Coffee, desserts, meals</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Shirt className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-bold">Merchandise</h4>
                    <p className="text-sm text-gray-600">T-shirts, badges, gear</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <CreditCard className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <h4 className="font-bold">Cash Rewards</h4>
                    <p className="text-sm text-gray-600">Direct UPI transfers</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-bold">Charity</h4>
                    <p className="text-sm text-gray-600">Support Jaipur causes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="share" className="space-y-6">
            {user && profile?.referral_code ? (
              <>
                {/* Referral Link */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Share2 className="w-6 h-6 text-pink-500" />
                      <span>Your Referral Link</span>
                    </CardTitle>
                    <CardDescription>
                      Share this link with friends to start earning JAICoins
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <div className="flex-1 p-3 bg-gray-50 rounded-lg border text-center">
                          <span className="font-mono font-bold text-lg">{profile.referral_code}</span>
                        </div>
                        <Button onClick={copyReferralCode} className="bg-pink-500 hover:bg-pink-600">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </Button>
                      </div>
                      
                      <div className="text-center">
                        <Button variant="outline" className="border-pink-300 text-pink-600">
                          <QrCode className="w-4 h-4 mr-2" />
                          Generate QR Code
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Share Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ready-to-Share Templates</CardTitle>
                    <CardDescription>
                      Copy these proven messages that convert friends into sign-ups
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {shareTemplates.map((template, index) => {
                        const Icon = template.icon;
                        return (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className={`w-10 h-10 ${template.color} rounded-full flex items-center justify-center`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="font-bold">{template.platform}</h4>
                            </div>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm mb-3">
                              {template.template.replace('[LINK]', `${window.location.origin}?ref=${profile.referral_code}`)}
                            </p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  template.template.replace('[LINK]', `${window.location.origin}?ref=${profile.referral_code}`)
                                );
                                toast({
                                  title: "Template Copied!",
                                  description: `${template.platform} message copied to clipboard`,
                                });
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Template
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Join to Start Sharing</h3>
                  <p className="text-gray-600 mb-4">
                    Sign up to get your unique referral link and start earning JAICoins!
                  </p>
                  <Button className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white">
                    Join Now & Get 30 JAICoins Free!
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-6 h-6 text-purple-500" />
                  <span>Pro Tips to Maximize Your Earnings</span>
                </CardTitle>
                <CardDescription>
                  Learn from top referrers and accelerate your JAICoin journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tips.map((tip, index) => {
                    const Icon = tip.icon;
                    return (
                      <div key={index} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">{tip.title}</h4>
                          <p className="text-gray-600 text-sm">{tip.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Success Stories */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Medal className="w-6 h-6 text-green-600" />
                  <span>Success Stories</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-gray-700 mb-2">"I earned 2,500 JAICoins in just 2 weeks by sharing in my college WhatsApp groups!"</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">P</span>
                      </div>
                      <span className="text-sm font-medium">Priya S. - Jaipur Legend</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-gray-700 mb-2">"The T-shirt quality is amazing! Worth every referral. Now targeting Jaipur Maharaja!"</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">R</span>
                      </div>
                      <span className="text-sm font-medium">Rahul K. - Jaipur Champion</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <Card className="bg-gradient-to-r from-pink-500 to-orange-400 border-0 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Build Your Jaipur Empire?</h2>
            <p className="text-xl text-pink-100 mb-6">
              Join thousands of Jaipurites earning JAICoins and unlocking exclusive rewards!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/gamification">
                  <Button size="lg" className="bg-white text-pink-600 hover:bg-gray-100">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    View Your Dashboard
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="bg-white text-pink-600 hover:bg-gray-100">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Join Now & Get 30 JAICoins Free!
                </Button>
              )}
              <Link to="/">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferralProgramPage;
