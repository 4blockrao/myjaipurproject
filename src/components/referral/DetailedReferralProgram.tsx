import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Users, Coins, Gift, Star, Trophy, Crown, Share2, Copy, Check,
  TrendingUp, Award, Target, Heart, ShoppingBag, Sparkles, Rocket, 
  RotateCcw, Dice6, MessageCircle, Instagram, Twitter, Youtube, 
  Camera, Calendar, Flame, Megaphone, Store, HandCoins, PartyPopper, ShieldCheck
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
    if (!user?.id) return;
    try {
      const { data: balance } = await supabase.rpc('get_user_balance', { user_uuid: user.id });
      setUserBalance(balance || 0);
      const { data: referrals } = await supabase.from('profiles').select('id').eq('referred_by', user.id);
      setReferralCount(referrals?.length || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (profile?.referral_code) {
      await navigator.clipboard.writeText(`${window.location.origin}?ref=${profile.referral_code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "🎉 Link Copied!", description: "Share with friends!" });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>;
  if (!user) return <Card><CardHeader><CardTitle>Please Sign In</CardTitle></CardHeader></Card>;

  return (
    <div className="space-y-6">
      {/* Vision Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-purple-50 to-pink-50 border-2">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl">JaipurCircle Rewards Program</CardTitle>
          </div>
          <CardDescription className="text-lg">India's First Community-Powered Local Commerce Platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-background/50 rounded-lg p-4 border">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Empowering Every Jaipurite
            </h3>
            <p className="text-muted-foreground">
              Building Jaipur's first truly democratic marketplace - owned by the community, operated by the people. 
              Every action earns JAICoins, making you a stakeholder in Jaipur's digital economy revolution.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-background/50 rounded-lg p-4 border text-center">
              <HandCoins className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="font-semibold">Community Ownership</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold">People-First Platform</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold">Economic Empowerment</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status & Share */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your JAICoins: {userBalance}</span>
            <Badge>Friends: {referralCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-background rounded-lg p-4 border">
            <div className="text-sm font-medium mb-2">Your Referral Code</div>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted px-4 py-2 rounded font-mono">{profile?.referral_code}</div>
              <Button onClick={copyReferralLink} size="sm">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earning Opportunities - Comprehensive Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-600" />
            15+ Ways to Earn JAICoins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold mb-3">🚀 Instant Rewards (110 JC)</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Sign Up Bonus: +30 JC</li>
                <li>✓ Complete Profile: +15 JC</li>
                <li>✓ Join WhatsApp: +20 JC</li>
                <li>✓ Follow Instagram: +15 JC</li>
                <li>✓ Follow Twitter: +15 JC</li>
                <li>✓ Subscribe YouTube: +15 JC</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-3">📅 Daily Rewards (50-175 JC)</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Daily Spin Wheel: 5-50 JC</li>
                <li>✓ Daily Scratch Card: 10-100 JC</li>
                <li>✓ Login Streak: 5-25 JC</li>
                <li>✓ Like 3 Deals: +5 JC</li>
                <li>✓ Share a Deal: +10 JC</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-3">👥 Referral System (Unlimited!)</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Level 1 (Direct): 50 JC per signup</li>
                <li>✓ Level 2 (Indirect): 25 JC per signup</li>
                <li>✓ Level 3: 10 JC per signup</li>
                <li>✓ Level 4: 5 JC per signup</li>
                <li>✓ Milestones: 100-3000 JC bonuses</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-3">🏪 Merchant Referrals (High Value!)</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Onboarding: +200 JC</li>
                <li>✓ First Deal: +100 JC</li>
                <li>✓ Per Redemption: +10 JC</li>
                <li>✓ 10 Redemptions: +250 JC</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-br from-primary/20 to-purple-50 border-2 border-primary">
        <CardContent className="p-6 text-center">
          <Rocket className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">Ready to Build Jaipur's Future?</h3>
          <Button size="lg" onClick={copyReferralLink} className="gap-2 mt-4">
            <Share2 className="w-5 h-5" />
            Share Your Link
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedReferralProgram;