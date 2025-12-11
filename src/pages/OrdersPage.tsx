import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Package, MapPin, Phone, ChevronRight, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import NativeDashboardLayout from "@/components/layout/NativeDashboardLayout";
import { NativeCard, NativeCardContent } from "@/components/ui/native-card";
import { cn } from "@/lib/utils";

const OrdersPage = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          deals (
            title,
            original_price,
            discounted_price,
            image_url,
            merchants (
              business_name,
              phone,
              email
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (!user) {
    return (
      <NativeDashboardLayout title="My Orders">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">Please sign in to view your orders</p>
          <Link to="/">
            <Button className="rounded-xl">Go to Home</Button>
          </Link>
        </div>
      </NativeDashboardLayout>
    );
  }

  return (
    <NativeDashboardLayout title="My Orders" subtitle={`${orders.length} orders`}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">No Orders Yet</h2>
          <p className="text-muted-foreground mb-6">Start exploring deals to place your first order</p>
          <Link to="/deals">
            <Button className="rounded-xl">Browse Deals</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <NativeCard key={order.id} variant="default" padding="none" pressable>
              <div className="p-4">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        #{order.order_code}
                      </span>
                      <Badge className={cn("text-[10px] px-2 py-0.5 rounded-full border", getStatusColor(order.status))}>
                        {order.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground truncate pr-2">
                      {order.deals?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {order.deals?.merchants?.business_name}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                </div>

                {/* Order Details */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>{new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    <span>Qty: {order.quantity}</span>
                  </div>
                </div>

                {/* Price & Payment */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div>
                    <span className="text-xs text-muted-foreground">Total</span>
                    <p className="text-lg font-bold text-primary">₹{order.total_amount}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Payment</span>
                    <p className="text-sm font-medium capitalize">{order.payment_method}</p>
                  </div>
                </div>

                {/* Delivery Address if exists */}
                {order.delivery_address && (
                  <div className="flex items-start gap-2 mt-3 pt-3 border-t border-border/50">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {order.delivery_address}
                    </p>
                  </div>
                )}
              </div>
            </NativeCard>
          ))}
        </div>
      )}
    </NativeDashboardLayout>
  );
};

export default OrdersPage;
