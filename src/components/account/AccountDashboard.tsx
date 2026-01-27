import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Coins, Trophy, Users, Star,
  Share2, ChevronRight, Zap, Gift, ShoppingBag, Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUserOrders } from "@/hooks/useUserOrders";
import { useUserTransactions } from "@/hooks/useUserTransactions";

interface AccountDashboardProps {
  user: any;
  profile: any;
  balance: number;
  onRefreshBalance: () => void;
}

const AccountDashboard = ({ user, profile, balance, onRefreshBalance }: AccountDashboardProps) => {
  const { data: orders = [], isLoading: ordersLoading } = useUserOrders();
  const { data: transactions = [], isLoading: transactionsLoading } = useUserTransactions();

  const level = Math.floor(balance / 100) + 1;
  const levelProgress = (balance % 100);
  const recentOrders = orders.slice(0, 3);
  const recentTransactions = transactions.slice(0, 3);

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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-5">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200/50">
          <CardContent className="p-3 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold text-lg text-foreground">#{profile?.rank || 1}</p>
            <p className="text-[11px] text-muted-foreground font-medium">City Rank</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
          <CardContent className="p-3 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold text-lg text-foreground">{profile?.total_referrals || 0}</p>
            <p className="text-[11px] text-muted-foreground font-medium">Referrals</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50">
          <CardContent className="p-3 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-sm">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold text-lg text-foreground">{balance}</p>
            <p className="text-[11px] text-muted-foreground font-medium">JAICoins</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold">Level {level}</span>
                <p className="text-xs text-muted-foreground">Keep earning to level up!</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 font-semibold">
              {levelProgress}/100
            </Badge>
          </div>
          <Progress value={levelProgress} className="h-2.5 bg-amber-100" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {100 - levelProgress} JAICoins to reach Level {level + 1}
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <Link to="/referral-program">
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 hover:shadow-lg transition-all active:scale-[0.98]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">Invite Friends</p>
                    <p className="text-xs text-green-100">+50 per referral</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/account?tab=wallet">
            <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0 hover:shadow-lg transition-all active:scale-[0.98]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">Daily Rewards</p>
                    <p className="text-xs text-purple-100">Spin & scratch!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Link to="/leaderboard">
          <Card className="hover:bg-muted/50 transition-colors active:scale-[0.99]">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-yellow-100 rounded-xl">
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold">Leaderboard</p>
                  <p className="text-sm text-muted-foreground">Compete with top earners</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Recent Orders</h3>
          <Link to="/account?tab=orders" className="text-xs text-primary font-medium">View All</Link>
        </div>
        
        <Card>
          <CardContent className="p-0 divide-y divide-border/50">
            {ordersLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No orders yet</p>
                <Link to="/deals" className="text-sm text-primary font-medium mt-1 block">
                  Browse deals →
                </Link>
              </div>
            ) : (
              recentOrders.map((order: any) => (
                <div key={order.id} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{order.deals?.title || 'Order'}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(order.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}
                  >
                    {order.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Recent Activity</h3>
          <Link to="/account?tab=wallet" className="text-xs text-primary font-medium">View All</Link>
        </div>
        
        <Card>
          <CardContent className="p-0 divide-y divide-border/50">
            {transactionsLoading ? (
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
            ) : recentTransactions.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted flex items-center justify-center">
                  <Coins className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No transactions yet</p>
                <p className="text-xs text-muted-foreground mt-1">Complete tasks to earn JAICoins!</p>
              </div>
            ) : (
              recentTransactions.map((tx: any) => (
                <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">{getSourceIcon(tx.source)}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(tx.created_at)}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={tx.type === 'earned' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                  >
                    {tx.type === 'earned' ? '+' : '-'}{tx.amount}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountDashboard;
