import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Receipt, ShoppingBag, QrCode, ChevronRight, Package } from "lucide-react";
import { Link } from "react-router-dom";

interface AccountOrdersProps {
  user: any;
}

const AccountOrders = ({ user }: AccountOrdersProps) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'coupons'>('orders');

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchCoupons();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          deal:deals(title, image_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select(`
          *,
          deal:deals(title)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <Button
          variant={activeTab === 'orders' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1"
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Orders
        </Button>
        <Button
          variant={activeTab === 'coupons' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1"
          onClick={() => setActiveTab('coupons')}
        >
          <QrCode className="w-4 h-4 mr-2" />
          Coupons
        </Button>
      </div>

      {activeTab === 'orders' ? (
        orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium mb-1">No orders yet</p>
            <p className="text-sm text-muted-foreground mb-4">Start exploring deals to make your first purchase</p>
            <Link to="/deals">
              <Button>Browse Deals</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{order.deal?.title || 'Order'}</p>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Order #{order.order_code || order.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{order.total_amount}</p>
                      <p className="text-xs text-muted-foreground">Qty: {order.quantity}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        coupons.length === 0 ? (
          <div className="text-center py-12">
            <QrCode className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium mb-1">No coupons yet</p>
            <p className="text-sm text-muted-foreground mb-4">Purchase deals to get discount coupons</p>
            <Link to="/deals">
              <Button>Browse Deals</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <Card key={coupon.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{coupon.deal?.title || 'Coupon'}</p>
                      <p className="font-mono text-sm text-primary mt-1">{coupon.coupon_code}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Expires: {formatDate(coupon.expires_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={coupon.status === 'active' ? 'default' : 'secondary'}>
                        {coupon.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">₹{coupon.discount_amount} off</p>
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
