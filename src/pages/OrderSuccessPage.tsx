import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import NativeMobileHeader from "@/components/layout/NativeMobileHeader";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { 
  CheckCircle, Copy, Download, MapPin, Phone, Coins, 
  Trophy, ArrowRight, QrCode, Loader2
} from "lucide-react";

interface OrderDetails {
  id: string;
  status: string;
  total_amount: number;
  quantity: number;
  jaicoin_used: number;
  created_at: string;
  order_code: string;
  deal: {
    title: string;
    discounted_price: number;
    location: string;
    jaicoin_reward: number;
    merchant: { business_name: string; address: string; phone: string; };
  };
  coupon?: { coupon_code: string; expires_at: string; };
}

const OrderSuccessPage = () => {
  const { orderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (orderId) fetchOrderDetails();
    else setIsLoading(false);
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .select(`*, deals!inner(*, merchants!inner(business_name, address, phone))`)
        .eq("id", orderId)
        .single();

      if (error) throw error;

      const { data: coupon } = await supabase
        .from("coupons")
        .select("coupon_code, expires_at")
        .eq("deal_id", order.deals.id)
        .eq("user_id", order.user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setOrderDetails({
        id: order.id,
        status: order.status,
        total_amount: order.total_amount,
        quantity: order.quantity,
        jaicoin_used: order.jaicoin_used || 0,
        created_at: order.created_at,
        order_code: order.order_code || order.id.slice(0, 8).toUpperCase(),
        deal: {
          title: order.deals.title,
          discounted_price: order.deals.discounted_price,
          location: order.deals.location || "",
          jaicoin_reward: order.deals.jaicoin_reward || 0,
          merchant: {
            business_name: order.deals.merchants.business_name,
            address: order.deals.merchants.address || "",
            phone: order.deals.merchants.phone || ""
          }
        },
        coupon: coupon || undefined
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCouponCode = () => {
    if (orderDetails?.coupon) {
      navigator.clipboard.writeText(orderDetails.coupon.coupon_code);
      setCopiedCoupon(true);
      toast({ title: "Copied!", description: "Show this code at the merchant" });
      setTimeout(() => setCopiedCoupon(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!orderId || !orderDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="text-center p-6 max-w-sm w-full">
          <h2 className="font-bold text-lg mb-2">Order Not Found</h2>
          <p className="text-muted-foreground text-sm mb-4">No order information available.</p>
          <Button onClick={() => navigate('/deals')}>Browse Deals</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <NativeMobileHeader title="Order Confirmed" showBackButton={false} />

      {/* Success Animation */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 text-center">
        <div className="animate-bounce mb-4">
          <CheckCircle className="w-16 h-16 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Order Successful! 🎉</h1>
        <p className="text-green-100">Order #{orderDetails.order_code}</p>
      </div>

      <div className="p-4 space-y-4 -mt-4">
        {/* Coupon Card */}
        {orderDetails.coupon && (
          <Card className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50 dark:from-green-950/30 dark:to-green-900/20 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 text-center">
                <QrCode className="w-12 h-12 mx-auto mb-3" />
                <h3 className="text-2xl font-bold tracking-wider">{orderDetails.coupon.coupon_code}</h3>
                <Badge className="mt-2 bg-white/20">Deal Voucher</Badge>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground text-center">
                  Valid until: {new Date(orderDetails.coupon.expires_at).toLocaleDateString()}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={copyCouponCode}>
                    <Copy className="w-4 h-4 mr-1.5" />
                    {copiedCoupon ? "Copied!" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1.5" />
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* JAICoins Earned */}
        {orderDetails.deal.jaicoin_reward > 0 && (
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-900/20 border-amber-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">You earned</p>
                <div className="flex items-center gap-1.5">
                  <Coins className="w-5 h-5 text-amber-600" />
                  <span className="text-xl font-bold text-amber-700 dark:text-amber-400">
                    +{orderDetails.deal.jaicoin_reward} JAICoins
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Summary */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">{orderDetails.deal.title}</h3>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{orderDetails.deal.location}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
              <div>
                <p className="text-muted-foreground">Quantity</p>
                <p className="font-medium">{orderDetails.quantity}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Paid</p>
                <p className="font-bold text-primary">₹{orderDetails.total_amount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Merchant Info */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Redeem at</h3>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg">
                {orderDetails.deal.merchant.business_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{orderDetails.deal.merchant.business_name}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{orderDetails.deal.merchant.address}</p>
                {orderDetails.deal.merchant.phone && (
                  <a href={`tel:${orderDetails.deal.merchant.phone}`} className="flex items-center gap-1.5 mt-2 text-sm text-primary">
                    <Phone className="w-4 h-4" />
                    {orderDetails.deal.merchant.phone}
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Link to="/account?tab=orders">
            <Button variant="outline" className="w-full justify-between">
              View All Orders
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/deals">
            <Button className="w-full">Browse More Deals</Button>
          </Link>
        </div>
      </div>

      <NativeBottomNav />
    </div>
  );
};

export default OrderSuccessPage;
