
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap, Gift, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProMembershipProps {
  userId?: string;
}

const ProMembership = ({ userId }: ProMembershipProps) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeToPro = async (tier: string) => {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const { error } = await supabase
      .from('profiles')
      .update({
        is_pro: true,
        pro_tier: tier,
        pro_expires_at: expiryDate.toISOString(),
        subscription_status: 'active'
      })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to upgrade membership",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success!",
        description: `Upgraded to ${tier} membership!`
      });
      fetchUserProfile();
    }
  };

  const proFeatures = [
    "Exclusive deals access",
    "Higher JaiCoin rewards",
    "Priority customer support",
    "Advanced analytics dashboard",
    "Merchant partnership opportunities",
    "Early access to new features"
  ];

  const premiumFeatures = [
    ...proFeatures,
    "VIP merchant events",
    "Personal deal curator",
    "Custom referral bonuses",
    "Premium badge & status",
    "Monthly JaiCoin bonus"
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-600 flex items-center justify-center gap-2">
            <Crown className="w-6 h-6" />
            Pro Membership
          </CardTitle>
          <CardDescription>
            Unlock exclusive benefits and enhanced rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userProfile?.is_pro ? (
            <div className="text-center space-y-4">
              <Badge className="bg-gold text-white px-4 py-2 text-lg">
                <Crown className="w-4 h-4 mr-2" />
                {userProfile.pro_tier?.toUpperCase()} MEMBER
              </Badge>
              <p className="text-gray-600">
                Your membership expires on {new Date(userProfile.pro_expires_at).toLocaleDateString()}
              </p>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Your Pro Benefits:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {(userProfile.pro_tier === 'premium' ? premiumFeatures : proFeatures).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-blue-200">
                <CardHeader className="text-center">
                  <Star className="w-12 h-12 mx-auto text-blue-500 mb-2" />
                  <CardTitle className="text-blue-600">Pro</CardTitle>
                  <div className="text-2xl font-bold">₹299/month</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {proFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={() => upgradeToPro('pro')} 
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    Upgrade to Pro
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-purple-200 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white">Most Popular</Badge>
                </div>
                <CardHeader className="text-center">
                  <Zap className="w-12 h-12 mx-auto text-purple-500 mb-2" />
                  <CardTitle className="text-purple-600">Premium</CardTitle>
                  <div className="text-2xl font-bold">₹499/month</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {premiumFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={() => upgradeToPro('premium')} 
                    className="w-full bg-purple-500 hover:bg-purple-600"
                  >
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProMembership;
