import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, CreditCard, Smartphone, Wallet, 
  Shield, Lock, Gift, Coins, Percent, Users,
  CheckCircle, AlertCircle, Clock
} from "lucide-react";

interface OrderItem {
  id: string;
  title: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  quantity: number;
  location: string;
  merchant_name: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  description: string;
  processing_fee?: number;
}

const CheckoutPage = () => {
  const { orderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [useJaiCoins, setUseJaiCoins] = useState(false);
  const [jaiCoinsBalance, setJaiCoinsBalance] = useState(250);
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
    name: ""
  });
  const { toast } = useToast();

  const paymentMethods: PaymentMethod[] = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Visa, Mastercard, RuPay",
      processing_fee: 0
    },
    {
      id: "upi",
      name: "UPI Payment",
      icon: Smartphone,
      description: "Google Pay, PhonePe, Paytm",
      processing_fee: 0
    },
    {
      id: "wallet",
      name: "Digital Wallet",
      icon: Wallet,
      description: "Paytm, Amazon Pay, Mobikwik",
      processing_fee: 5
    }
  ];

  useEffect(() => {
    checkUser();
    fetchOrderDetails();
  }, [orderId]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      setContactInfo({
        email: session.user.email || "",
        phone: "",
        name: ""
      });
    } else {
      // Redirect to login
      navigate('/');
    }
  };

  const fetchOrderDetails = async () => {
    // Mock data - in real implementation, fetch from orders table
    // If we have an orderId, we can fetch specific order details
    const mockOrderItems: OrderItem[] = [
      {
        id: orderId || "1",
        title: "Royal Rajasthani Thali Experience",
        original_price: 800,
        discounted_price: 400,
        discount_percentage: 50,
        quantity: 2,
        location: "C-Scheme, Jaipur",
        merchant_name: "Royal Heritage Restaurant"
      }
    ];
    setOrderItems(mockOrderItems);
  };

  const getSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.discounted_price * item.quantity), 0);
  };

  const getCouponDiscount = () => {
    return appliedCoupon ? appliedCoupon.discount : 0;
  };

  const getJaiCoinsDiscount = () => {
    if (!useJaiCoins) return 0;
    const maxDiscount = Math.min(jaiCoinsBalance, getSubtotal() * 0.1); // Max 10% discount
    return Math.floor(maxDiscount);
  };

  const getProcessingFee = () => {
    const method = paymentMethods.find(m => m.id === selectedPaymentMethod);
    return method?.processing_fee || 0;
  };

  const getTotalAmount = () => {
    const subtotal = getSubtotal();
    const couponDiscount = getCouponDiscount();
    const jaiCoinsDiscount = getJaiCoinsDiscount();
    const processingFee = getProcessingFee();
    return Math.max(0, subtotal - couponDiscount - jaiCoinsDiscount + processingFee);
  };

  const getTotalSavings = () => {
    const originalTotal = orderItems.reduce((sum, item) => sum + (item.original_price * item.quantity), 0);
    const finalTotal = getTotalAmount();
    return originalTotal - finalTotal;
  };

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === "welcome10") {
      setAppliedCoupon({
        code: "WELCOME10",
        discount: Math.floor(getSubtotal() * 0.1),
        description: "10% off on first purchase"
      });
      toast({
        title: "Coupon Applied",
        description: "You saved ₹" + Math.floor(getSubtotal() * 0.1)
      });
    } else {
      toast({
        title: "Invalid Coupon",
        description: "The coupon code you entered is not valid",
        variant: "destructive"
      });
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handlePayment = async () => {
    if (!contactInfo.name || !contactInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required contact details",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Mock payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate success order ID if we don't have one
    const successOrderId = orderId || `order_${Date.now()}`;
    
    // Redirect to success page
    navigate(`/order-success/${successOrderId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to complete your purchase</p>
          <Button onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/deals">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Deals
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Checkout</h1>
              <p className="text-gray-600">Order #{orderId || 'NEW'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                      placeholder="Enter your email"
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <method.icon className="w-6 h-6 text-gray-600" />
                        <div className="flex-1">
                          <Label htmlFor={method.id} className="font-medium cursor-pointer">
                            {method.name}
                          </Label>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                        {method.processing_fee > 0 && (
                          <Badge variant="outline">+₹{method.processing_fee} fee</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Coupons & Offers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Coupons & Offers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code (try: WELCOME10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button onClick={applyCoupon} variant="outline">
                      Apply
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                        <p className="text-sm text-green-700">{appliedCoupon.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-600">-₹{appliedCoupon.discount}</span>
                      <Button variant="ghost" size="sm" onClick={removeCoupon}>
                        Remove
                      </Button>
                    </div>
                  </div>
                )}

                {/* JaiCoins */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="jaicoins"
                        checked={useJaiCoins}
                        onCheckedChange={(checked) => setUseJaiCoins(checked === true)}
                      />
                      <Coins className="w-5 h-5 text-yellow-500" />
                      <div>
                        <Label htmlFor="jaicoins" className="font-medium cursor-pointer">
                          Use JaiCoins (Balance: {jaiCoinsBalance})
                        </Label>
                        <p className="text-sm text-gray-600">Save up to ₹{Math.min(jaiCoinsBalance, Math.floor(getSubtotal() * 0.1))}</p>
                      </div>
                    </div>
                    {useJaiCoins && (
                      <span className="font-bold text-yellow-600">-₹{getJaiCoinsDiscount()}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-sm text-gray-600 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Your payment information is encrypted and secure. We never store your card details.</span>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-gray-600">{item.merchant_name}</p>
                          <p className="text-xs text-gray-500">{item.location}</p>
                        </div>
                        <span className="text-sm">×{item.quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 line-through">₹{item.original_price}</span>
                        <span className="font-bold text-pink-600">₹{item.discounted_price}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{getSubtotal()}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span>-₹{getCouponDiscount()}</span>
                    </div>
                  )}
                  
                  {useJaiCoins && getJaiCoinsDiscount() > 0 && (
                    <div className="flex justify-between text-yellow-600">
                      <span>JaiCoins Discount</span>
                      <span>-₹{getJaiCoinsDiscount()}</span>
                    </div>
                  )}
                  
                  {getProcessingFee() > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Processing Fee</span>
                      <span>+₹{getProcessingFee()}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{getTotalAmount()}</span>
                </div>

                <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    🎉 You're saving ₹{getTotalSavings()}!
                  </p>
                </div>

                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-lg py-6"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Pay ₹{getTotalAmount()}
                    </div>
                  )}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  By completing your purchase, you agree to our Terms of Service and Privacy Policy
                </div>
              </CardContent>
            </Card>

            {/* Estimated Delivery */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Digital coupon delivered instantly</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
