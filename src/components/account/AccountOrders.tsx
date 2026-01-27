import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserOrders } from "@/hooks/useUserOrders";
import { useUserCoupons } from "@/hooks/useUserCoupons";
import { ShoppingBag, QrCode, Package, Clock, MapPin, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface AccountOrdersProps {
  user: any;
}

const AccountOrders = ({ user }: AccountOrdersProps) => {
  const { data: orders = [], isLoading: ordersLoading } = useUserOrders();
  const { data: coupons = [], isLoading: couponsLoading } = useUserCoupons();
  const [activeTab, setActiveTab] = useState<'orders' | 'coupons'>('orders');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'redeemed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isLoading = ordersLoading || couponsLoading;

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 bg-muted rounded-xl">
        <Button
          variant={activeTab === 'orders' ? 'default' : 'ghost'}
          size="sm"
          className={`flex-1 rounded-lg font-medium ${activeTab === 'orders' ? '' : 'hover:bg-transparent'}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Orders ({orders.length})
        </Button>
        <Button
          variant={activeTab === 'coupons' ? 'default' : 'ghost'}
          size="sm"
          className={`flex-1 rounded-lg font-medium ${activeTab === 'coupons' ? '' : 'hover:bg-transparent'}`}
          onClick={() => setActiveTab('coupons')}
        >
          <QrCode className="w-4 h-4 mr-2" />
          Coupons ({coupons.length})
        </Button>
      </div>

      {activeTab === 'orders' ? (
        ordersLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-1" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-semibold mb-1">No orders yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start exploring deals to make your first purchase
              </p>
              <Link to="/deals">
                <Button className="rounded-xl">
                  Browse Deals
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <Card key={order.id} className="hover:shadow-md transition-all active:scale-[0.99]">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">{order.deals?.title || 'Order'}</p>
                        <Badge className={`${getStatusColor(order.status)} shrink-0`} variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Order #{order.order_code || order.id.slice(0, 8)}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(order.created_at)}
                          </span>
                          {order.merchants?.business_name && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {order.merchants.business_name}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">₹{order.total_amount}</p>
                          {order.quantity > 1 && (
                            <p className="text-xs text-muted-foreground">Qty: {order.quantity}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        couponsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-5 w-1/3 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                <QrCode className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-semibold mb-1">No coupons yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Purchase deals to get discount coupons
              </p>
              <Link to="/deals">
                <Button className="rounded-xl">
                  Browse Deals
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon: any) => (
              <Card key={coupon.id} className="hover:shadow-md transition-all overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Left coupon strip */}
                    <div className="w-2 bg-gradient-to-b from-primary to-primary/70" />
                    
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{coupon.deals?.title || 'Coupon'}</p>
                          <p className="font-mono text-base font-bold text-primary mt-1">
                            {coupon.coupon_code}
                          </p>
                        </div>
                        <Badge className={getStatusColor(coupon.status)} variant="secondary">
                          {coupon.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          Expires: {formatDate(coupon.expires_at)}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{coupon.discount_amount} OFF</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default AccountOrders;
