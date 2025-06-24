
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  created_at: string;
  coupon_code: string;
  deal: {
    id: string;
    title: string;
    description: string;
    discount_percentage: number;
    location: string;
    end_date: string;
    merchant: {
      business_name: string;
      address: string;
      phone: string;
      website?: string;
      rating: number;
    };
  };
  jaicoins_earned: number;
}

const OrderSuccessPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrderDetails();
    // Confetti effect could be added here
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      // Generate coupon code with A + 5-digit numeric format
      const randomNumber = Math.floor(Math.random() * 90000) + 10000;
      const couponCode = 'A' + randomNumber.toString();
      
      // Mock data - in real implementation, fetch from orders table
      const mockOrderDetails: OrderDetails = {
        id: orderId!,
        status: "confirmed",
        total_amount: 400,
        created_at: new Date().toISOString(),
        coupon_code: couponCode,
        deal: {
          id: "1",
          title: "Royal Rajasthani Thali Experience",
          description: "Authentic Royal Rajasthani Thali featuring over 15 traditional dishes",
          discount_percentage: 50,
          location: "C-Scheme, Jaipur",
          end_date: "2024-07-31T23:59:59Z",
          merchant: {
            business_name: "Royal Heritage Restaurant",
            address: "123 Heritage Plaza, C-Scheme, Jaipur, Rajasthan 302001",
            phone: "+91 141-555-0123",
            website: "www.royalheritage.com",
            rating: 4.7
          }
        },
        jaicoins_earned: 40
      };
      setOrderDetails(mockOrderDetails);
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
    if (orderDetails) {
      navigator.clipboard.writeText(orderDetails.coupon_code);
      setCopiedCoupon(true);
      toast({
        title: "Coupon Code Copied",
        description: "Show this code at the merchant to redeem your deal"
      });
      setTimeout(() => setCopiedCoupon(false), 2000);
    }
  };

  const downloadCoupon = () => {
    // In real implementation, this would generate a PDF/image
    toast({
      title: "Coupon Downloaded",
      description: "Your coupon has been saved to downloads"
    });
  };

  const shareDeal = () => {
    if (navigator.share && orderDetails) {
      navigator.share({
        title: `I just got ${orderDetails.deal.discount_percentage}% off at ${orderDetails.deal.merchant.business_name}!`,
        text: "Check out MyJaipur for amazing deals in the Pink City!",
        url: `${window.location.origin}/deal/${orderDetails.deal.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/deal/${orderDetails.deal.id}`);
      toast({
        title: "Link Copied",
        description: "Share this deal with your friends!"
      });
    }
  };

  const sendCouponEmail = () => {
    // In real implementation, this would trigger an email
    toast({
      title: "Email Sent",
      description: "Coupon details have been sent to your email"
    });
  };

  const sendCouponSMS = () => {
    // In real implementation, this would trigger an SMS
    toast({
      title: "SMS Sent",
      description: "Coupon code has been sent to your phone"
    });
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
          <h1 className="text-4xl font-bold mb-4">Payment Successful! 🎉</h1>
          <p className="text-xl opacity-90 mb-2">Your order has been confirmed</p>
          <p className="opacity-75">Order #{orderDetails.id}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Digital Coupon */}
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
                  <h3 className="text-3xl font-bold mb-2">{orderDetails.coupon_code}</h3>
                  <Badge className="bg-white text-gray-800">
                    {orderDetails.deal.discount_percentage}% OFF
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button 
                    onClick={copyCouponCode}
                    variant="outline"
                    className={copiedCoupon ? "bg-green-50 border-green-200" : ""}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedCoupon ? "Copied!" : "Copy"}
                  </Button>
                  <Button onClick={downloadCoupon} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={sendCouponEmail} variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button onClick={sendCouponSMS} variant="outline">
                    <Smartphone className="w-4 h-4 mr-2" />
                    SMS
                  </Button>
                </div>

                {/* Important Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">How to Redeem:</h4>
                  <ol className="text-blue-700 text-sm space-y-1">
                    <li>1. Visit the merchant location</li>
                    <li>2. Show this coupon code to the staff</li>
                    <li>3. Enjoy your discount!</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Deal Details */}
            <Card>
              <CardHeader>
                <CardTitle>Deal Details</CardTitle>
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

                <div>
                  <h4 className="font-semibold mb-2">Valid Until</h4>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(orderDetails.deal.end_date).toLocaleDateString()}</span>
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
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{orderDetails.deal.merchant.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Address</h4>
                    <p className="text-gray-600 text-sm">{orderDetails.deal.merchant.address}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{orderDetails.deal.merchant.phone}</span>
                    </div>
                    {orderDetails.deal.merchant.website && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe className="w-4 h-4" />
                        <a 
                          href={orderDetails.deal.merchant.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-pink-600 hover:underline"
                        >
                          {orderDetails.deal.merchant.website}
                        </a>
                      </div>
                    )}
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
                  <span>Order Total</span>
                  <span className="font-bold">₹{orderDetails.total_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status</span>
                  <Badge className="bg-green-100 text-green-700">Confirmed</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Order Date</span>
                  <span>{new Date(orderDetails.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Rewards Earned */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Congratulations!</h3>
                <p className="text-gray-600 mb-3">You've earned rewards for this purchase</p>
                <div className="flex items-center justify-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  <span className="text-xl font-bold text-yellow-600">+{orderDetails.jaicoins_earned} JaiCoins</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={shareDeal} variant="outline" className="w-full justify-start">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share this deal
                </Button>
                <Link to="/favorites">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="w-4 h-4 mr-2" />
                    View my coupons
                  </Button>
                </Link>
                <Link to="/deals">
                  <Button variant="outline" className="w-full justify-start">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Browse more deals
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Referral Bonus */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Invite Friends & Earn</h3>
                <p className="text-gray-600 text-sm mb-3">Share MyJaipur with friends and earn ₹100 for each signup</p>
                <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                  <Gift className="w-4 h-4 mr-2" />
                  Invite Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support Information */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              If you have any questions about your order or need assistance with redemption, our support team is here to help.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/help">
                <Button variant="outline">
                  Contact Support
                </Button>
              </Link>
              <Button variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Call +91 141-555-0123
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
