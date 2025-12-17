import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { 
  CheckCircle, Trophy, Users, Gift, Share2, 
  Home, ArrowRight, Coins, Crown 
} from "lucide-react";

const ReferralSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-emerald-600 pb-20">
      {/* Success Animation */}
      <div className="pt-16 pb-8 text-center text-white">
        <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle className="w-16 h-16" />
        </div>
        <h1 className="text-3xl font-bold mb-2">You're In! 🎉</h1>
        <p className="text-green-100 text-lg">Welcome to the JaipurCircle Rewards Program</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Rewards Card */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-1">50 JAICoins Credited!</h2>
              <p className="text-muted-foreground">Your welcome bonus is ready to use</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="text-center p-3 bg-primary/5 rounded-xl">
                <Coins className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="font-bold text-lg">50</p>
                <p className="text-xs text-muted-foreground">Per Referral</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-xl">
                <Crown className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                <p className="font-bold text-lg">Unlimited</p>
                <p className="text-xs text-muted-foreground">Earnings</p>
              </div>
            </div>
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
              <Badge className="bg-white/20 text-white">
                #1 = ₹10,000
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">🚀 Start Earning Now</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <span className="font-bold text-green-600">1</span>
                </div>
                <div>
                  <p className="font-medium">Share your referral link</p>
                  <p className="text-sm text-muted-foreground">Invite friends & family to join</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium">Complete daily tasks</p>
                  <p className="text-sm text-muted-foreground">Spin wheel, scratch cards & more</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <span className="font-bold text-purple-600">3</span>
                </div>
                <div>
                  <p className="font-medium">Redeem coins for rewards</p>
                  <p className="text-sm text-muted-foreground">Use JAICoins on amazing deals</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => navigate('/account?tab=referral')}
            className="h-12"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Start Referring
          </Button>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="h-12"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>

        <Button
          onClick={() => navigate('/account')}
          variant="ghost"
          className="w-full"
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
