import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Coins, TrendingUp, TrendingDown, Gift, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface AccountWalletProps {
  user: any;
  balance: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  source: string;
  description: string;
  created_at: string;
}

const AccountWallet = ({ user, balance }: AccountWalletProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('jaicoin_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'referral':
        return '👥';
      case 'daily_spin':
        return '🎰';
      case 'daily_scratch':
        return '🎁';
      case 'task_completion':
        return '✅';
      case 'purchase':
        return '🛒';
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
    return date.toLocaleDateString();
  };

  const totalEarned = transactions
    .filter(t => t.type === 'earned')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter(t => t.type === 'spent')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-0">
        <CardContent className="p-6">
          <div className="text-center">
            <Coins className="w-10 h-10 mx-auto mb-2 opacity-90" />
            <p className="text-yellow-100 mb-1">Available Balance</p>
            <p className="text-4xl font-bold">{balance}</p>
            <p className="text-sm text-yellow-100">JAICoins</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="font-bold">{totalEarned}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="font-bold">{totalSpent}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Redeem CTA */}
      <Link to="/deals">
        <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
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
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground">Complete tasks to earn JAICoins!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl">{getSourceIcon(transaction.source)}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={transaction.type === 'earned' ? 'default' : 'secondary'}
                    className={transaction.type === 'earned' ? 'bg-green-500' : 'bg-red-500'}
                  >
                    {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountWallet;
