import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUserBalance } from "@/hooks/useUserBalance";
import { useUserTransactions } from "@/hooks/useUserTransactions";
import { supabase } from "@/integrations/supabase/client";
import ScratchCard from "@/components/gamification/ScratchCard";
import { 
  Coins, TrendingUp, TrendingDown, Gift, ArrowRight, 
  RotateCcw, Sparkles, Wallet
} from "lucide-react";
import { Link } from "react-router-dom";

interface AccountWalletProps {
  user: any;
  balance: number;
  onRefreshBalance?: () => void;
}

const AccountWallet = ({ user, balance, onRefreshBalance }: AccountWalletProps) => {
  const { data: transactions = [], isLoading, refetch: refetchTransactions } = useUserTransactions();
  const [dailySpinUsed, setDailySpinUsed] = useState(() => {
    const lastSpin = localStorage.getItem(`lastSpin_${user?.id}`);
    return lastSpin === new Date().toDateString();
  });
  const [scratchCardUsed, setScratchCardUsed] = useState(() => {
    const lastScratch = localStorage.getItem(`lastScratch_${user?.id}`);
    return lastScratch === new Date().toDateString();
  });
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const { toast } = useToast();

  const handleDailySpin = async () => {
    if (dailySpinUsed || !user) return;
    
    setIsSpinning(true);
    
    setTimeout(async () => {
      const rewards = [5, 10, 15, 20, 25, 50];
      const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
      
      try {
        await supabase
          .from('jaicoin_transactions')
          .insert({
            user_id: user.id,
            amount: randomReward,
            type: 'earned',
            source: 'daily_spin',
            description: `Daily spin wheel reward`
          });

        toast({
          title: "🎉 You won!",
          description: `+${randomReward} JAICoins added to your wallet!`,
        });

        setDailySpinUsed(true);
        localStorage.setItem(`lastSpin_${user.id}`, new Date().toDateString());
        onRefreshBalance?.();
        refetchTransactions();
        
      } catch (error) {
        console.error('Error awarding spin reward:', error);
        toast({
          title: "Error",
          description: "Failed to award reward. Please try again.",
          variant: "destructive"
        });
      }
      
      setIsSpinning(false);
    }, 2000);
  };

  const handleScratchCard = () => {
    if (scratchCardUsed || !user) return;
    setShowScratchCard(true);
    setScratchCardUsed(true);
    localStorage.setItem(`lastScratch_${user.id}`, new Date().toDateString());
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'referral':
      case 'referral_reward':
        return '👥';
      case 'daily_spin':
        return '🎰';
      case 'daily_scratch':
        return '🎁';
      case 'task_completion':
        return '✅';
      case 'purchase':
        return '🛒';
      case 'signup_bonus':
        return '🎉';
      default:
        return '💰';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const totalEarned = transactions
    .filter((t: any) => t.type === 'earned')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter((t: any) => t.type === 'spent')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  return (
    <div className="space-y-5">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-500 text-white border-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Wallet className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-sm font-medium mb-0.5">Available Balance</p>
              <p className="text-4xl font-bold tracking-tight">{balance}</p>
              <p className="text-white/70 text-xs mt-0.5">JAICoins</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg text-green-700">{totalEarned}</p>
                <p className="text-xs text-green-600 font-medium">Total Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg text-red-700">{totalSpent}</p>
                <p className="text-xs text-red-600 font-medium">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Rewards Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Daily Rewards</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Spin Wheel */}
          <Card className={`overflow-hidden ${dailySpinUsed ? 'opacity-60' : ''}`}>
            <CardContent className="p-4 text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center shadow-lg ${isSpinning ? 'animate-spin' : ''}`}>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <h4 className="font-bold text-sm mb-0.5">Daily Spin</h4>
              <p className="text-xs text-muted-foreground mb-3">Win 5-50 JAICoins</p>
              <Button
                onClick={handleDailySpin}
                disabled={dailySpinUsed || isSpinning}
                size="sm"
                className="w-full rounded-xl font-semibold"
              >
                {isSpinning ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    Spinning...
                  </span>
                ) : dailySpinUsed ? (
                  'Done ✓'
                ) : (
                  'Spin Now!'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Scratch Card */}
          <Card className={`overflow-hidden ${scratchCardUsed ? 'opacity-60' : ''}`}>
            <CardContent className="p-4 text-center">
              <div className="w-16 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-sm mb-0.5">Scratch Card</h4>
              <p className="text-xs text-muted-foreground mb-3">Mystery reward!</p>
              <Button
                onClick={handleScratchCard}
                disabled={scratchCardUsed}
                size="sm"
                variant="outline"
                className="w-full rounded-xl font-semibold"
              >
                {scratchCardUsed ? 'Done ✓' : 'Scratch!'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Redeem CTA */}
      <Link to="/deals">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:shadow-md transition-all active:scale-[0.99]">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Redeem JAICoins</p>
                <p className="text-sm text-muted-foreground">Use coins for discounts on deals</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-primary" />
          </CardContent>
        </Card>
      </Link>

      {/* Transaction History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-muted flex items-center justify-center">
                <Coins className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="font-medium text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground mt-1">Complete tasks to earn JAICoins!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {transactions.slice(0, 20).map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">{getSourceIcon(transaction.source)}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={transaction.type === 'earned' 
                      ? 'bg-green-100 text-green-700 font-semibold' 
                      : 'bg-red-100 text-red-700 font-semibold'
                    }
                  >
                    {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ScratchCard 
        isOpen={showScratchCard}
        onClose={() => {
          setShowScratchCard(false);
          onRefreshBalance?.();
          refetchTransactions();
        }}
        trigger="daily"
      />
    </div>
  );
};

export default AccountWallet;
