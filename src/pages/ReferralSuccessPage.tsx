import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import JaipurCircleLogo from "@/components/ui/JaipurCircleLogo";
import { 
  CheckCircle, Trophy, Users, Gift, Share2, 
  Home, ArrowRight, Coins, Crown, Info,
  Target, Star, Zap
} from "lucide-react";

const ReferralSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-emerald-600 pb-20">
      {/* Success Animation */}
      <div className="pt-12 pb-6 text-center text-white px-4">
        <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle className="w-16 h-16" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome to</h1>
        <div className="mb-4">
          <JaipurCircleLogo size="lg" className="!text-white [&>span]:!text-white" />
        </div>
        <p className="text-green-100 text-lg">You're now part of our rewards community!</p>
      </div>

      <div className="px-4 space-y-4">
        {/* JAICoins Earned */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-6 text-center text-white">
              <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                <Coins className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold mb-1">50 JAICoins</h2>
              <p className="text-amber-100">Credited to your wallet!</p>
            </div>
            
            <div className="p-4 bg-gradient-to-b from-amber-50 to-white">
              <p className="text-center text-sm text-muted-foreground">
                Use JAICoins to unlock exclusive deals and discounts
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What is JaipurCircle */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              What is JaipurCircle?
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              JaipurCircle is Jaipur's premier deals and rewards platform where you can discover 
              amazing local deals, earn JAICoins through various activities, and compete with 
              others on the city leaderboard!
            </p>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-primary/5 rounded-xl">
                <Gift className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">Exclusive Deals</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl">
                <Coins className="w-6 h-6 mx-auto mb-1 text-yellow-600" />
                <p className="text-xs font-medium">Earn Rewards</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <Trophy className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                <p className="text-xs font-medium">Win Prizes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Program Brief */}
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-full">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Viral Referral Program</h3>
                <p className="text-green-100 text-sm">Earn unlimited JAICoins!</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                <Zap className="w-5 h-5" />
                <span className="text-sm">Get 50 JAICoins for every friend who joins</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                <Star className="w-5 h-5" />
                <span className="text-sm">Your friends also get 50 JAICoins</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                <Crown className="w-5 h-5" />
                <span className="text-sm">Bonus rewards at milestones</span>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/referral-program')}
              className="w-full bg-white text-green-600 hover:bg-green-50"
            >
              Start Referring Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Leaderboard Teaser */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8" />
                <div>
                  <p className="font-bold">City Leaderboard</p>
                  <p className="text-sm text-purple-100">Compete for top rewards!</p>
                </div>
              </div>
              <Badge className="bg-white/20 text-white hover:bg-white/30">
                #1 = ₹10,000
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Start Earning Now
            </h3>
            <div className="space-y-3">
              {[
                { num: 1, title: "Share your referral link", desc: "Invite friends & family to join", color: "bg-green-500" },
                { num: 2, title: "Complete daily tasks", desc: "Spin wheel, scratch cards & more", color: "bg-blue-500" },
                { num: 3, title: "Redeem coins for rewards", desc: "Use JAICoins on amazing deals", color: "bg-purple-500" },
              ].map((step) => (
                <div key={step.num} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full ${step.color} flex items-center justify-center shrink-0`}>
                    <span className="font-bold text-white">{step.num}</span>
                  </div>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => navigate('/referral-program')}
            className="h-12"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Start Referring
          </Button>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="h-12 bg-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Explore Deals
          </Button>
        </div>

        <Button
          onClick={() => navigate('/account')}
          variant="ghost"
          className="w-full text-white hover:bg-white/10"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <NativeBottomNav />
    </div>
  );
};

export default ReferralSuccessPage;
