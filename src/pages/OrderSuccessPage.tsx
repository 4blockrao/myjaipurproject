
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, Download, Share2, Calendar, 
  MapPin, Phone, Globe, Star, Gift, Coins,
  QrCode, Copy, Mail, Smartphone, ArrowRight,
  Trophy, Users, Heart
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
    id: string;
    title: string;
    description: string;
    discount_percentage: number;
    discounted_price: number;
    location: string;
    validity_days: number;
    jaicoin_reward: number;
    merchant: {
      business_name: string;
      address: string;
      phone: string;
      website?: string;
    };
  };
  coupon?: {
    coupon_code: string;
    expires_at: string;
  };
}

const OrderSuccessPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          deals!inner(
            *,
            merchants!inner(
              business_name,
              address,
              phone,
              website
            )
          )
        `)
        .eq("id", orderId)
        .single();

      if (orderError) throw orderError;

      // Check if there's a coupon for this order
      const { data: coupon } = await supabase
        .from("coupons")
        .select("coupon_code, expires_at")
        .eq("deal_id", order.deals.id)
        .eq("user_id", order.user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Award JaiCoins for the purchase
      if (order.deals.jaicoin_reward > 0) {
        await supabase
          .from("jaicoin_transactions")
          .insert({
            user_id: order.user_id,
            amount: order.deals.jaicoin_reward,
            type: "earned",
            source: "order_reward",
            description: `Earned for purchasing: ${order.deals.title}`
          });
      }

      const formattedOrder: OrderDetails = {
        id: order.id,
        status: order.status,
        total_amount: order.total_amount,
        quantity: order.quantity,
        jaicoin_used: order.jaicoin_used,
        created_at: order.created_at,
        order_code: order.order_code,
        deal: {
          id: order.deals.id,
          title: order.deals.title,
          description: order.deals.description || "",
          discount_percentage: order.deals.discount_percentage || 0,
          discounted_price: order.deals.discounted_price,
          location: order.deals.location || "",
          validity_days: order.deals.validity_days || 30,
          jaicoin_reward: order.deals.jaicoin_reward || 0,
          merchant: {
            business_name: order.deals.merchants.business_name,
            address: order.deals.merchants.address || "",
            phone: order.deals.merchants.phone || "",
            website: order.deals.merchants.website
          }
        },
        coupon: coupon || undefined
      };

      setOrderDetails(formattedOrder);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyCouponCode = () => {
    if (orderDetails?.coupon) {
      navigator.clipboard.writeText(orderDetails.coupon.coupon_code);
      setCopiedCoupon(true);
      toast({
        title: "Coupon Code Copied",
        description: "Show this code at the merchant to redeem your deal"
      });
      setTimeout(() => setCopiedCoupon(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Link to="/deals">
            <Button>Browse Deals</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-bounce mb-6">
            <CheckCircle className="w-20 h-20 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Order Successful! 🎉</h1>
          <p className="text-xl opacity-90 mb-2">Your order has been confirmed</p>
          <p className="opacity-75">Order #{orderDetails.order_code}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Digital Coupon */}
            {orderDetails.coupon && (
              <Card className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                    <QrCode className="w-8 h-8 text-green-600" />
                    Your Digital Coupon
                  </CardTitle>
                  <CardDescription>Show this code at the merchant to redeem your deal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Coupon Code */}
                  <div className="bg-gradient-to-r from-pink-500 to-orange-400 rounded-lg p-8 text-white text-center">
                    <QrCode className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-3xl font-bold mb-2">{orderDetails.coupon.coupon_code}</h3>
                    <Badge className="bg-white text-gray-800">
                      Deal Voucher
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={copyCouponCode}
                      variant="outline"
                      className={copiedCoupon ? "bg-green-50 border-green-200" : ""}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copiedCoupon ? "Copied!" : "Copy Code"}
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  {/* Expiry Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Valid Until:</h4>
                    <p className="text-blue-700 text-sm">
                      {new Date(orderDetails.coupon.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Deal Details */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{orderDetails.deal.title}</h3>
                  <p className="text-gray-600 mb-3">{orderDetails.deal.description}</p>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{orderDetails.deal.location}</span>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Quantity:</span>
                    <p className="font-semibold">{orderDetails.quantity}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <p className="font-semibold">₹{orderDetails.total_amount}</p>
                  </div>
                  {orderDetails.jaicoin_used > 0 && (
                    <div>
                      <span className="text-gray-600">JaiCoins Used:</span>
                      <p className="font-semibold text-yellow-600">{orderDetails.jaicoin_used}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Order Date:</span>
                    <p className="font-semibold">{new Date(orderDetails.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Merchant Information */}
            <Card>
              <CardHeader>
                <CardTitle>Merchant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-orange-400 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    {orderDetails.deal.merchant.business_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{orderDetails.deal.merchant.business_name}</h3>
                    <p className="text-gray-600 text-sm">{orderDetails.deal.merchant.address}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {orderDetails.deal.merchant.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{orderDetails.deal.merchant.phone}</span>
                        </div>
                      )}
                      {orderDetails.deal.merchant.website && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={orderDetails.deal.merchant.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-pink-600 hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Status</span>
                  <Badge className="bg-green-100 text-green-700">Confirmed</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total Paid</span>
                  <span className="font-bold">₹{orderDetails.total_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order ID</span>
                  <span className="font-mono text-sm">{orderDetails.order_code}</span>
                </div>
              </CardContent>
            </Card>

            {/* Rewards Earned */}
            {orderDetails.deal.jaicoin_reward > 0 && (
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Congratulations!</h3>
                  <p className="text-gray-600 mb-3">You've earned JaiCoins for this purchase</p>
                  <div className="flex items-center justify-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className="text-xl font-bold text-yellow-600">+{orderDetails.deal.jaicoin_reward} JaiCoins</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/orders">
                  <Button variant="outline" className="w-full justify-start">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    View All Orders
                  </Button>
                </Link>
                <Link to="/coupons">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="w-4 h-4 mr-2" />
                    My Coupons
                  </Button>
                </Link>
                <Link to="/deals">
                  <Button variant="outline" className="w-full justify-start">
                    <Gift className="w-4 h-4 mr-2" />
                    Browse More Deals
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
