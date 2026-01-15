
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { useUserBalance } from "@/hooks/useUserBalance";
import { 
  ArrowLeft, CreditCard, Coins, Gift, CheckCircle,
  MapPin, Calendar, Phone, Users, Wallet, Banknote
} from "lucide-react";

interface Deal {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  jaicoin_reward: number;
  location: string;
  validity_days: number;
  coupon_type: string;
  merchants: {
    id: string;
    business_name: string;
    address: string;
    phone: string;
  };
}

type PaymentMethod = "cod" | "online";

const CheckoutFlow = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: jaiCoinsBalance } = useUserBalance();
  const createOrderMutation = useCreateOrder();

  const [deal, setDeal] = useState<Deal | null>(null);
  const [user, setUser] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [useJaiCoins, setUseJaiCoins] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
    if (dealId) {
      fetchDealDetails();
    }
  }, [dealId]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      setContactInfo(prev => ({
        ...prev,
        email: session.user.email || ""
      }));
      
      // Fetch user profile for name and phone
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        setContactInfo(prev => ({
          ...prev,
          name: profile.full_name || "",
          phone: profile.phone || ""
        }));
      }
    } else {
      navigate(`/auth?redirect=/checkout/deal/${dealId}`);
    }
  };

  const fetchDealDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          merchants!inner(
            id,
            business_name,
            address,
            phone
          )
        `)
        .eq('id', dealId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setDeal(data);
    } catch (error) {
      console.error('Error fetching deal:', error);
      toast({
        title: "Error",
        description: "Failed to load deal details",
        variant: "destructive"
      });
      navigate('/deals');
    } finally {
      setIsLoading(false);
    }
  };

  const getSubtotal = () => {
    if (!deal) return 0;
    return deal.discounted_price * quantity;
  };

  const getJaiCoinsDiscount = () => {
    if (!useJaiCoins || !jaiCoinsBalance) return 0;
    const maxDiscount = Math.min(jaiCoinsBalance, Math.floor(getSubtotal() * 0.1));
    return Math.floor(maxDiscount);
  };

  const getTotalAmount = () => {
    const subtotal = getSubtotal();
    const jaiCoinsDiscount = getJaiCoinsDiscount();
    return Math.max(0, subtotal - jaiCoinsDiscount);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleCheckout = async () => {
    if (!deal || !user) return;

    if (!contactInfo.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name",
        variant: "destructive"
      });
      return;
    }

    if (!contactInfo.phone.trim() || !validatePhone(contactInfo.phone)) {
      toast({
        title: "Valid Phone Required",
        description: "Please enter a valid 10-digit Indian mobile number",
        variant: "destructive"
      });
      return;
    }

    const orderData = {
      dealId: deal.id,
      quantity,
      totalAmount: getTotalAmount(),
      jaicoinsUsed: getJaiCoinsDiscount(),
      paymentMethod,
      customerInfo: contactInfo
    };

    createOrderMutation.mutate(orderData, {
      onSuccess: (order) => {
        toast({
          title: "Order Placed Successfully!",
          description: paymentMethod === "cod" 
            ? "Your order has been confirmed. Pay at the time of redemption."
            : "Payment confirmed. Your order is ready!",
        });
        navigate(`/order-success/${order.id}`);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Deal Not Found</h2>
          <p className="text-muted-foreground mb-6">The deal you're looking for is not available.</p>
          <Button onClick={() => navigate('/deals')}>
            Browse Deals
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Checkout</h1>
              <p className="text-muted-foreground">Complete your purchase</p>
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
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quantity Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>Select how you'd like to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="space-y-3"
                >
                  <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Banknote className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when you redeem at the store</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Pay Online</p>
                        <p className="text-sm text-muted-foreground">UPI, Cards, Netbanking (Coming Soon)</p>
                      </div>
                    </Label>
                    {paymentMethod === 'online' && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Beta</span>
                    )}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* JaiCoins */}
            {jaiCoinsBalance && jaiCoinsBalance > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    Use JaiCoins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="jaicoins"
                        checked={useJaiCoins}
                        onCheckedChange={(checked) => setUseJaiCoins(checked === true)}
                      />
                      <div>
                        <Label htmlFor="jaicoins" className="font-medium cursor-pointer">
                          Use JaiCoins (Balance: {jaiCoinsBalance})
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Save up to ₹{Math.min(jaiCoinsBalance, Math.floor(getSubtotal() * 0.1))}
                        </p>
                      </div>
                    </div>
                    {useJaiCoins && (
                      <span className="font-bold text-yellow-600">-₹{getJaiCoinsDiscount()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Deal Details */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">{deal.title}</h4>
                    <p className="text-xs text-muted-foreground">{deal.merchants.business_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{deal.location}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Unit Price:</span>
                    <div>
                      <span className="text-muted-foreground line-through mr-2">₹{deal.original_price}</span>
                      <span className="font-bold text-primary">₹{deal.discounted_price}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Quantity:</span>
                    <span>{quantity}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{getSubtotal()}</span>
                  </div>
                  
                  {useJaiCoins && getJaiCoinsDiscount() > 0 && (
                    <div className="flex justify-between text-yellow-600">
                      <span>JaiCoins Discount</span>
                      <span>-₹{getJaiCoinsDiscount()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-muted-foreground">
                    <span>Payment Method</span>
                    <span>{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{getTotalAmount()}</span>
                  </div>
                </div>

                <div className="text-center p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-800 dark:text-green-200 font-medium text-sm">
                    🎉 You're saving ₹{(deal.original_price * quantity) - getTotalAmount()}!
                  </p>
                </div>

                {deal.jaicoin_reward > 0 && (
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium text-sm flex items-center justify-center gap-2">
                      <Coins className="w-4 h-4" />
                      Earn {deal.jaicoin_reward * quantity} JaiCoins with this purchase!
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleCheckout}
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-lg py-6"
                >
                  {createOrderMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {paymentMethod === 'cod' ? (
                        <Banknote className="w-5 h-5" />
                      ) : (
                        <CreditCard className="w-5 h-5" />
                      )}
                      {paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'} - ₹{getTotalAmount()}
                    </div>
                  )}
                </Button>

                {paymentMethod === 'cod' && (
                  <p className="text-xs text-muted-foreground text-center">
                    💡 Pay ₹{getTotalAmount()} at the store when you redeem your coupon
                  </p>
                )}

                <div className="text-xs text-muted-foreground text-center">
                  By completing your purchase, you agree to our Terms of Service
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFlow;
