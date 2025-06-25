
import { useState } from "react";
import { ArrowLeft, Coins, Plus, Minus, TrendingUp, Gift, Award, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileOptimizedLayout from "@/components/layout/MobileOptimizedLayout";
import { useUserBalance } from "@/hooks/useUserBalance";
import { useUserTransactions } from "@/hooks/useUserTransactions";

const WalletPage = () => {
  const { data: balance, isLoading: balanceLoading } = useUserBalance();
  const { data: transactions, isLoading: transactionsLoading } = useUserTransactions();

  const getTransactionIcon = (source: string) => {
    switch (source) {
      case "signup":
      case "referral":
        return <Gift className="w-5 h-5 text-green-600" />;
      case "spin":
      case "review":
        return <Award className="w-5 h-5 text-blue-600" />;
      case "deal_purchase":
        return <ShoppingBag className="w-5 h-5 text-orange-600" />;
      default:
        return <Coins className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    return type === "earned" 
      ? "text-green-600" 
      : "text-red-600";
  };

  const filterTransactionsByType = (type?: string) => {
    if (!transactions) return [];
    if (!type) return transactions;
    return transactions.filter(tx => tx.type === type);
  };

  const allTransactions = filterTransactionsByType();
  const earnedTransactions = filterTransactionsByType("earned");
  const spentTransactions = filterTransactionsByType("spent");

  return (
    <DashboardLayout pageTitle="JaiCoin Wallet" showBackButton>
      <MobileOptimizedLayout>
        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-pink-500 to-orange-400 text-white mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white/90 text-sm font-medium">
                  Total Balance
                </CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <Coins className="w-8 h-8" />
                  <span className="text-3xl font-bold">
                    {balanceLoading ? "..." : balance?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <TrendingUp className="w-6 h-6 mb-2" />
                <p className="text-xs text-white/80">JaiCoins</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Earned</p>
                  <p className="font-semibold text-green-600">
                    {earnedTransactions.reduce((sum, tx) => sum + tx.amount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Minus className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Spent</p>
                  <p className="font-semibold text-red-600">
                    {spentTransactions.reduce((sum, tx) => sum + tx.amount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              </div>
            ) : !transactions || transactions.length === 0 ? (
              <div className="text-center py-8">
                <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No transactions yet</p>
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="earned">Earned</TabsTrigger>
                  <TabsTrigger value="spent">Spent</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <div className="space-y-3">
                    {allTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(transaction.source)}
                          <div>
                            <p className="font-medium text-sm">
                              {transaction.description || transaction.source}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                            {transaction.type === "earned" ? "+" : "-"}{transaction.amount}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {transaction.source}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="earned">
                  <div className="space-y-3">
                    {earnedTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(transaction.source)}
                          <div>
                            <p className="font-medium text-sm">
                              {transaction.description || transaction.source}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            +{transaction.amount}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {transaction.source}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="spent">
                  <div className="space-y-3">
                    {spentTransactions.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No spending history</p>
                      </div>
                    ) : (
                      spentTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {getTransactionIcon(transaction.source)}
                            <div>
                              <p className="font-medium text-sm">
                                {transaction.description || transaction.source}
                              </p>
                              <p className="text-xs text-gray-600">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-red-600">
                              -{transaction.amount}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {transaction.source}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </MobileOptimizedLayout>
    </DashboardLayout>
  );
};

export default WalletPage;
