import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import NativeMobileHeader from "@/components/layout/NativeMobileHeader";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { 
  CreditCard, Smartphone, Wallet, Shield, Gift, Coins,
  CheckCircle, Loader2
} from "lucide-react";

interface OrderItem {
  id: string;
  title: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  quantity: number;
  merchant_name: string;
}

const CheckoutPage = () => {
  const { orderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [useJaiCoins, setUseJaiCoins] = useState(false);
  const [jaiCoinsBalance] = useState(250);
  const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "" });
  const { toast } = useToast();

  const paymentMethods = [
    { id: "upi", name: "UPI", icon: Smartphone, desc: "GPay, PhonePe, Paytm" },
    { id: "card", name: "Card", icon: CreditCard, desc: "Credit/Debit Card" },
    { id: "wallet", name: "Wallet", icon: Wallet, desc: "Paytm, Amazon Pay" },
  ];

  useEffect(() => {
    checkUser();
    fetchOrderDetails();
  }, [orderId]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setProfile(data);
        setContactInfo({
          name: data.full_name || "",
          phone: data.phone || "",
          email: data.email || session.user.email || ""
        });
      }
    } else {
      navigate('/');
    }
  };

  const fetchOrderDetails = async () => {
    setOrderItems([{
      id: orderId || "1",
      title: "Royal Rajasthani Thali Experience",
      original_price: 800,
      discounted_price: 400,
      discount_percentage: 50,
      quantity: 2,
      merchant_name: "Royal Heritage Restaurant"
    }]);
  };

  const getSubtotal = () => orderItems.reduce((sum, item) => sum + (item.discounted_price * item.quantity), 0);
  const getCouponDiscount = () => appliedCoupon?.discount || 0;
  const getJaiCoinsDiscount = () => useJaiCoins ? Math.min(jaiCoinsBalance, getSubtotal() * 0.1) : 0;
  const getTotalAmount = () => Math.max(0, getSubtotal() - getCouponDiscount() - getJaiCoinsDiscount());

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === "welcome10") {
      setAppliedCoupon({ code: "WELCOME10", discount: Math.floor(getSubtotal() * 0.1) });
      toast({ title: "Coupon Applied!", description: "10% discount applied" });
    } else {
      toast({ title: "Invalid Coupon", variant: "destructive" });
    }
  };

  const handlePayment = async () => {
    if (!contactInfo.name || !contactInfo.phone) {
      toast({ title: "Missing Info", description: "Please fill contact details", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const { data: order, error } = await supabase.from('orders').insert([{
        user_id: user.id,
        deal_id: orderItems[0]?.id,
        quantity: orderItems[0]?.quantity || 1,
        total_amount: getTotalAmount(),
        jaicoin_used: getJaiCoinsDiscount(),
        payment_method: selectedPayment,
        customer_name: contactInfo.name,
        customer_phone: contactInfo.phone,
        status: 'pending'
      }]).select().single();

      if (error) throw error;
      await new Promise(r => setTimeout(r, 1500));
      navigate(`/order-success/${order.id}`);
    } catch (error) {
      toast({ title: "Payment Failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="text-center p-6 max-w-sm w-full">
          <h2 className="font-bold text-lg mb-2">Sign In Required</h2>
          <p className="text-muted-foreground text-sm mb-4">Please sign in to checkout</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <NativeMobileHeader title="Checkout" subtitle={`Order #${orderId || 'NEW'}`} backPath="/deals" />

      <div className="p-4 space-y-4">
        {/* Order Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderItems.map(item => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.merchant_name} × {item.quantity}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="font-semibold">₹{item.discounted_price * item.quantity}</p>
                  <p className="text-xs text-muted-foreground line-through">₹{item.original_price * item.quantity}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Full Name *</Label>
              <Input 
                value={contactInfo.name}
                onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                placeholder="Enter name"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Phone *</Label>
              <Input 
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                placeholder="+91 XXXXX XXXXX"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
              <div className="space-y-2">
                {paymentMethods.map(method => (
                  <div key={method.id} className="flex items-center p-3 border rounded-lg">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <method.icon className="h-5 w-5 mx-3 text-muted-foreground" />
                    <div className="flex-1">
                      <Label htmlFor={method.id} className="text-sm font-medium">{method.name}</Label>
                      <p className="text-xs text-muted-foreground">{method.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Coupons */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="h-4 w-4" /> Apply Coupon
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!appliedCoupon ? (
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter code (try: WELCOME10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={applyCoupon}>Apply</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm text-green-700 dark:text-green-400">{appliedCoupon.code}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600">-₹{appliedCoupon.discount}</span>
                  <Button variant="ghost" size="sm" onClick={() => setAppliedCoupon(null)}>Remove</Button>
                </div>
              </div>
            )}

            {/* JaiCoins */}
            <div className="mt-4 p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="jaicoins" checked={useJaiCoins} onCheckedChange={(c) => setUseJaiCoins(c === true)} />
                  <Label htmlFor="jaicoins" className="text-sm flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-amber-500" />
                    Use {jaiCoinsBalance} JAICoins
                  </Label>
                </div>
                {useJaiCoins && <Badge variant="secondary">-₹{Math.floor(getJaiCoinsDiscount())}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-6">Save up to 10% with JAICoins</p>
            </div>
          </CardContent>
        </Card>

        {/* Price Breakdown */}
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{getSubtotal()}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Coupon Discount</span>
                <span>-₹{getCouponDiscount()}</span>
              </div>
            )}
            {useJaiCoins && (
              <div className="flex justify-between text-sm text-amber-600">
                <span>JAICoins</span>
                <span>-₹{Math.floor(getJaiCoinsDiscount())}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">₹{Math.floor(getTotalAmount())}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pay Button */}
        <Button 
          className="w-full h-12 text-base font-semibold" 
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Pay ₹{Math.floor(getTotalAmount())}
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <Shield className="h-3 w-3" />
          Secure payment powered by Razorpay
        </p>
      </div>

      <NativeBottomNav />
    </div>
  );
};

export default CheckoutPage;
