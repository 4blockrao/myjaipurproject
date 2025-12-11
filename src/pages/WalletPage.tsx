import { Coins, Plus, Minus, TrendingUp, Gift, Award, ShoppingBag, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserBalance } from "@/hooks/useUserBalance";
import { useUserTransactions } from "@/hooks/useUserTransactions";
import NativeDashboardLayout from "@/components/layout/NativeDashboardLayout";
import { NativeCard, NativeCardContent } from "@/components/ui/native-card";
import { cn } from "@/lib/utils";

const WalletPage = () => {
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useUserBalance();
  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useUserTransactions();

  const getTransactionIcon = (source: string) => {
    const iconClass = "w-5 h-5";
    switch (source) {
      case "signup":
      case "referral":
        return <Gift className={cn(iconClass, "text-emerald-600")} />;
      case "spin":
      case "review":
        return <Award className={cn(iconClass, "text-blue-600")} />;
      case "deal_purchase":
        return <ShoppingBag className={cn(iconClass, "text-orange-600")} />;
      default:
        return <Coins className={cn(iconClass, "text-muted-foreground")} />;
    }
  };

  const filterTransactionsByType = (type?: string) => {
    if (!transactions) return [];
    if (!type) return transactions;
    return transactions.filter(tx => tx.type === type);
  };

  const allTransactions = filterTransactionsByType();
  const earnedTransactions = filterTransactionsByType("earned");
  const spentTransactions = filterTransactionsByType("spent");

  const handleRefresh = () => {
    refetchBalance();
    refetchTransactions();
  };

  const TransactionItem = ({ transaction }: { transaction: any }) => (
    <div className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        transaction.type === "earned" ? "bg-emerald-100" : "bg-red-100"
      )}>
        {getTransactionIcon(transaction.source)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {transaction.description || transaction.source}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(transaction.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn(
          "text-sm font-semibold",
          transaction.type === "earned" ? "text-emerald-600" : "text-red-600"
        )}>
          {transaction.type === "earned" ? "+" : "-"}{transaction.amount}
        </p>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {transaction.source}
        </Badge>
      </div>
    </div>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
        <Coins className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <NativeDashboardLayout 
      title="Wallet" 
      subtitle="JaiCoin Balance"
      rightAction={
        <button onClick={handleRefresh} className="p-2 rounded-full active:bg-muted/50">
          <RefreshCw className="w-5 h-5 text-muted-foreground" />
        </button>
      }
    >
      <div className="space-y-4">
        {/* Balance Card */}
        <NativeCard 
          variant="elevated" 
          padding="lg"
          className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-primary-foreground/80 font-medium">Total Balance</p>
              <div className="flex items-baseline gap-2 mt-1">
                <Coins className="w-7 h-7" />
                <span className="text-4xl font-bold tracking-tight">
                  {balanceLoading ? "..." : balance?.toLocaleString() || "0"}
                </span>
              </div>
              <p className="text-xs text-primary-foreground/70 mt-2">JaiCoins</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </NativeCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <NativeCard variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Plus className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Earned</p>
                <p className="text-lg font-bold text-emerald-600">
                  {earnedTransactions.reduce((sum, tx) => sum + tx.amount, 0)}
                </p>
              </div>
            </div>
          </NativeCard>
          
          <NativeCard variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Minus className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-lg font-bold text-red-600">
                  {spentTransactions.reduce((sum, tx) => sum + tx.amount, 0)}
                </p>
              </div>
            </div>
          </NativeCard>
        </div>

        {/* Transactions */}
        <NativeCard variant="default" padding="none">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-base font-semibold">Transaction History</h2>
          </div>
          
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <EmptyState message="No transactions yet" />
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <div className="px-4">
                <TabsList className="grid w-full grid-cols-3 h-10 bg-muted/50 rounded-xl p-1">
                  <TabsTrigger value="all" className="rounded-lg text-xs">All</TabsTrigger>
                  <TabsTrigger value="earned" className="rounded-lg text-xs">Earned</TabsTrigger>
                  <TabsTrigger value="spent" className="rounded-lg text-xs">Spent</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="px-4 pb-4 mt-4">
                <div className="space-y-0">
                  {allTransactions.slice(0, 20).map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="earned" className="px-4 pb-4 mt-4">
                {earnedTransactions.length === 0 ? (
                  <EmptyState message="No earnings yet" />
                ) : (
                  <div className="space-y-0">
                    {earnedTransactions.slice(0, 20).map((transaction) => (
                      <TransactionItem key={transaction.id} transaction={transaction} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="spent" className="px-4 pb-4 mt-4">
                {spentTransactions.length === 0 ? (
                  <EmptyState message="No spending history" />
                ) : (
                  <div className="space-y-0">
                    {spentTransactions.slice(0, 20).map((transaction) => (
                      <TransactionItem key={transaction.id} transaction={transaction} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </NativeCard>
      </div>
    </NativeDashboardLayout>
  );
};

export default WalletPage;
