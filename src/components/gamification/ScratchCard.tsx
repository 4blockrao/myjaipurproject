
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gift, Coins, Star, Sparkles } from "lucide-react";

interface ScratchCardProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: 'welcome' | 'referral' | 'daily' | 'achievement';
}

const ScratchCard = ({ isOpen, onClose, trigger }: ScratchCardProps) => {
  const [isScratched, setIsScratched] = useState(false);
  const [reward, setReward] = useState<{ type: 'coins' | 'badge'; amount?: number; badge?: string } | null>(null);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    if (isOpen) {
      generateReward();
    }
  }, [isOpen]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const generateReward = () => {
    const rewards = {
      welcome: [
        { type: 'coins' as const, amount: 30 },
        { type: 'coins' as const, amount: 50 },
        { type: 'coins' as const, amount: 100 },
        { type: 'badge' as const, badge: 'Hawa Mahal Hero' }
      ],
      referral: [
        { type: 'coins' as const, amount: 25 },
        { type: 'coins' as const, amount: 50 },
        { type: 'coins' as const, amount: 75 }
      ],
      daily: [
        { type: 'coins' as const, amount: 10 },
        { type: 'coins' as const, amount: 25 },
        { type: 'coins' as const, amount: 50 }
      ],
      achievement: [
        { type: 'coins' as const, amount: 100 },
        { type: 'coins' as const, amount: 200 },
        { type: 'badge' as const, badge: 'Achievement Hunter' }
      ]
    };

    const triggerRewards = rewards[trigger];
    const randomReward = triggerRewards[Math.floor(Math.random() * triggerRewards.length)];
    setReward(randomReward);
  };

  const scratchCard = async () => {
    if (!user || !reward) return;

    setIsScratched(true);

    try {
      if (reward.type === 'coins' && reward.amount) {
        // Award JAICoins
        const { error } = await supabase
          .from('jaicoin_transactions')
          .insert({
            user_id: user.id,
            amount: reward.amount,
            type: 'earned',
            source: 'scratch_card',
            description: `Scratch card reward - ${trigger}`
          });

        if (error) throw error;

        toast({
          title: "🎉 Scratch Card Reward!",
          description: `You won ${reward.amount} JAICoins!`,
        });
      } else if (reward.type === 'badge' && reward.badge) {
        // Award badge (would need badge system implementation)
        toast({
          title: "🏆 Badge Unlocked!",
          description: `You earned the "${reward.badge}" badge!`,
        });
      }
    } catch (error) {
      console.error('Error awarding scratch card reward:', error);
      toast({
        title: "Error",
        description: "Failed to award reward. Please contact support.",
        variant: "destructive"
      });
    }
  };

  const getTriggerTitle = () => {
    switch (trigger) {
      case 'welcome': return '🎊 Jaipur Welcome Scratch Card';
      case 'referral': return '👥 Referral Bonus Card';
      case 'daily': return '📅 Daily Surprise Card';
      case 'achievement': return '🏆 Achievement Reward Card';
      default: return '🎁 Scratch Card';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-pink-100 to-orange-100 border-pink-200">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{getTriggerTitle()}</CardTitle>
          <div className="flex justify-center space-x-2 mt-2">
            <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            <Gift className="w-8 h-8 text-pink-500" />
            <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {!isScratched ? (
            <div>
              <div className="w-48 h-32 mx-auto bg-gradient-to-r from-pink-400 to-orange-400 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer"
                   onClick={scratchCard}>
                <div className="absolute inset-0 bg-gray-300 opacity-80 flex items-center justify-center">
                  <p className="text-white font-bold text-lg">Scratch Here!</p>
                </div>
                <div className="text-white text-6xl opacity-20">?</div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Tap to reveal your reward!</p>
            </div>
          ) : (
            <div>
              <div className="w-48 h-32 mx-auto bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                {reward?.type === 'coins' ? (
                  <div className="text-center text-white">
                    <Coins className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{reward.amount} JC</p>
                  </div>
                ) : (
                  <div className="text-center text-white">
                    <Star className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-lg font-bold">{reward?.badge}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Congratulations! 🎉</h3>
                  <p className="text-gray-600">
                    {reward?.type === 'coins' 
                      ? `You won ${reward.amount} JAICoins!` 
                      : `You unlocked the "${reward?.badge}" badge!`}
                  </p>
                </div>
                
                <Button 
                  onClick={onClose}
                  className="w-full bg-pink-500 hover:bg-pink-600"
                >
                  Awesome! Continue
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScratchCard;
