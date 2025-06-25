
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileOptimizedLayout from "@/components/layout/MobileOptimizedLayout";
import { useUserOrders } from "@/hooks/useUserOrders";
import { toast } from "sonner";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { data: orders, isLoading, error } = useUserOrders();

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="My Orders" showBackButton>
        <MobileOptimizedLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          </div>
        </MobileOptimizedLayout>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout pageTitle="My Orders" showBackButton>
        <MobileOptimizedLayout>
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Orders</h3>
            <p className="text-gray-600 mb-4">We couldn't load your orders. Please try again.</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </MobileOptimizedLayout>
      </DashboardLayout>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filterOrdersByStatus = (status?: string) => {
    if (!orders) return [];
    if (!status) return orders;
    return orders.filter(order => order.status === status);
  };

  const allOrders = filterOrdersByStatus();
  const pendingOrders = filterOrdersByStatus("pending");
  const completedOrders = filterOrdersByStatus("completed");

  const OrderCard = ({ order }: { order: any }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {order.deals?.title || "Order"}
            </CardTitle>
            <p className="text-sm text-gray-600">
              Order #{order.order_code}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(order.status)}
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Amount</span>
            <span className="font-semibold">₹{order.total_amount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Quantity</span>
            <span>{order.quantity}</span>
          </div>
          {order.jaicoin_used > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">JaiCoins Used</span>
              <span className="text-orange-600 font-medium">{order.jaicoin_used} coins</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Order Date</span>
            <span className="text-sm">
              {new Date(order.created_at).toLocaleDateString()}
            </span>
          </div>
          {order.merchants && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-gray-900">
                {order.merchants.business_name}
              </p>
              <p className="text-xs text-gray-600">
                {order.merchants.address}
              </p>
            </div>
          )}
        </div>
        <div className="flex space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/order/${order.id}`)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout pageTitle="My Orders" showBackButton>
      <MobileOptimizedLayout>
        {!orders || orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start exploring deals to make your first purchase!
            </p>
            <Button onClick={() => navigate("/deals")}>
              Browse Deals
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">All ({allOrders.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-4">
                {allOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending">
              <div className="space-y-4">
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending orders</p>
                  </div>
                ) : (
                  pendingOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="space-y-4">
                {completedOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No completed orders</p>
                  </div>
                ) : (
                  completedOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </MobileOptimizedLayout>
    </DashboardLayout>
  );
};

export default OrdersPage;
