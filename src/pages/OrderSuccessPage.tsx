
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Phone, 
  Mail,
  Calendar,
  Coins,
  Star,
  Download,
  Share2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrderSuccess {
  id: string;
  order_code: string;
  quantity: number;
  total_amount: number;
  jaicoin_used: number;
  status: string;
  payment_method: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  created_at: string;
  deal: {
    title: string;
    discounted_price: number;
    jaicoin_reward: number;
    is_product_sale: boolean;
  };
  merchant: {
    business_name: string;
    phone: string;
    email: string;
    address: string;
  };
}

const OrderSuccessPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderSuccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          deals!inner(
            title,
            discounted_price,
            jaicoin_reward,
            is_product_sale
          ),
          merchants!inner(
            business_name,
            phone,
            email,
            address
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      setOrder({
        id: data.id,
        order_code: data.order_code,
        quantity: data.quantity,
        total_amount: data.total_amount,
        jaicoin_used: data.jaicoin_used || 0,
        status: data.status,
        payment_method: data.payment_method,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        delivery_address: data.delivery_address,
        created_at: data.created_at,
        deal: {
          title: data.deals.title,
          discounted_price: data.deals.discounted_price,
          jaicoin_reward: data.deals.jaicoin_reward,
          is_product_sale: data.deals.is_product_sale
        },
        merchant: {
          business_name: data.merchants.business_name,
          phone: data.merchants.phone,
          email: data.merchants.email,
          address: data.merchants.address
        }
      });
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

  const handleShare = async () => {
    const shareText = `I just ordered ${order?.deal.title} from ${order?.merchant.business_name} on HiJaipur! Check out amazing deals at ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Order Successful - HiJaipur',
          text: shareText,
          url: window.location.origin,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard!",
        description: "Share text has been copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. We've received your request and will process it shortly.
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Order Details */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order Details</span>
                <Badge variant={order.status === 'confirmed' ? 'default' : 'secondary'}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Order ID</p>
                  <p className="font-medium">{order.order_code}</p>
                </div>
                <div>
                  <p className="text-gray-600">Order Date</p>
                  <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Payment Method</p>
                  <p className="font-medium capitalize">{order.payment_method.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Amount</p>
                  <p className="font-medium">₹{order.total_amount.toLocaleString()}</p>
                </div>
              </div>

              <Separator />

              {/* Item Details */}
              <div className="space-y-2">
                <h4 className="font-medium">{order.deal.title}</h4>
                <p className="text-sm text-gray-600">From {order.merchant.business_name}</p>
                <div className="flex justify-between text-sm">
                  <span>Quantity: {order.quantity}</span>
                  <span>₹{order.deal.discounted_price.toLocaleString()} each</span>
                </div>
              </div>

              {/* JaiCoins Info */}
              {(order.jaicoin_used > 0 || order.deal.jaicoin_reward > 0) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    {order.jaicoin_used > 0 && (
                      <div className="flex items-center justify-between text-sm text-yellow-600">
                        <span className="flex items-center">
                          <Coins className="w-4 h-4 mr-1" />
                          JaiCoins Used
                        </span>
                        <span>-₹{order.jaicoin_used}</span>
                      </div>
                    )}
                    {order.deal.jaicoin_reward > 0 && (
                      <div className="flex items-center justify-between text-sm text-yellow-600">
                        <span className="flex items-center">
                          <Coins className="w-4 h-4 mr-1" />
                          JaiCoins Earned
                        </span>
                        <span>+{order.deal.jaicoin_reward * order.quantity}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-medium">{order.customer_phone}</p>
                </div>
              </div>

              {order.delivery_address && (
                <div>
                  <p className="text-gray-600 text-sm">Delivery Address</p>
                  <p className="font-medium">{order.delivery_address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Merchant Information */}
          <Card>
            <CardHeader>
              <CardTitle>Merchant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">{order.merchant.business_name}</h4>
                {order.merchant.address && (
                  <p className="text-sm text-gray-600">{order.merchant.address}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm">
                  {order.merchant.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{order.merchant.phone}</span>
                    </div>
                  )}
                  {order.merchant.email && (
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{order.merchant.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Calendar className="w-5 h-5 mr-2" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700 space-y-2">
              {order.deal.is_product_sale ? (
                <>
                  <div className="flex items-start space-x-2">
                    <Package className="w-4 h-4 mt-0.5" />
                    <span className="text-sm">Your order is being prepared by the merchant</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Truck className="w-4 h-4 mt-0.5" />
                    <span className="text-sm">You'll receive delivery updates via SMS/WhatsApp</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Phone className="w-4 h-4 mt-0.5" />
                    <span className="text-sm">The merchant may contact you to confirm delivery details</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5" />
                    <span className="text-sm">Visit the merchant with your order ID to redeem this deal</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Phone className="w-4 h-4 mt-0.5" />
                    <span className="text-sm">Call the merchant to confirm availability and timing</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
            <Button onClick={handleShare} variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share Order
            </Button>
            <Link to="/profile" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500">
                View All Orders
              </Button>
            </Link>
          </div>

          {/* Rating Prompt */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h3 className="font-medium text-yellow-800 mb-2">Rate Your Experience</h3>
                <p className="text-sm text-yellow-700 mb-4">
                  Help other customers by sharing your experience with {order.merchant.business_name}
                </p>
                <Button variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                  Rate & Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
