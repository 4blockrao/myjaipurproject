import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  CreditCard, 
  Wallet, 
  Shield, 
  Truck,
  CheckCircle,
  AlertCircle,
  Coins
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrderDetails {
  id: string;
  quantity: number;
  total_amount: number;
  status: string;
  deal: {
    title: string;
    discounted_price: number;
    jaicoin_reward: number;
    is_product_sale: boolean;
  };
  merchant: {
    business_name: string;
    address: string;
  };
}

const CheckoutPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [userBalance, setUserBalance] = useState(0);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    orderNotes: '',
    useJaiCoins: false,
    jaiCoinsToUse: 0
  });

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      fetchUserBalance();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      // Create a mock order for demonstration since orders table is new
      const mockOrder = {
        id: orderId!,
        quantity: 1,
        total_amount: 299,
        status: 'pending',
        deal: {
          title: 'Sample Product',
          discounted_price: 299,
          jaicoin_reward: 10,
          is_product_sale: true
        },
        merchant: {
          business_name: 'Sample Merchant',
          address: 'Jaipur, Rajasthan'
        }
      };
      setOrder(mockOrder);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_user_balance', { user_uuid: user.id });

      if (error) throw error;
      setUserBalance(data || 0);
    } catch (error) {
      console.error('Error fetching user balance:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateFinalAmount = () => {
    if (!order) return 0;
    let finalAmount = order.total_amount;
    
    if (formData.useJaiCoins && formData.jaiCoinsToUse > 0) {
      finalAmount = Math.max(0, finalAmount - formData.jaiCoinsToUse);
    }
    
    return finalAmount;
  };

  const handlePlaceOrder = async () => {
    if (!order) return;

    // Validate required fields
    if (!formData.customerName || !formData.customerPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and phone number",
        variant: "destructive"
      });
      return;
    }

    if (order.deal.is_product_sale && !formData.deliveryAddress) {
      toast({
        title: "Missing Address",
        description: "Please provide a delivery address for product orders",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const finalAmount = calculateFinalAmount();
      const jaiCoinsUsed = formData.useJaiCoins ? formData.jaiCoinsToUse : 0;

      // For demo purposes, we'll just show success
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been confirmed and is being processed.",
      });

      // Navigate to success page
      navigate(`/order-success/${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading checkout...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const finalAmount = calculateFinalAmount();
  const maxJaiCoins = Math.min(userBalance, order.total_amount);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold ml-4">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Please provide your contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address (for products) */}
            {order.deal.is_product_sale && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Delivery Address
                  </CardTitle>
                  <CardDescription>Where should we deliver your order?</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.deliveryAddress}
                    onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                    placeholder="Enter your complete delivery address with landmarks"
                    rows={3}
                    required
                  />
                </CardContent>
              </Card>
            )}

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex items-center cursor-pointer">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Online Payment (UPI/Card/Net Banking)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center cursor-pointer">
                      <Wallet className="w-4 h-4 mr-2" />
                      Cash on Delivery
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* JaiCoins */}
            {userBalance > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Coins className="w-5 h-5 mr-2 text-yellow-500" />
                    Use JaiCoins
                  </CardTitle>
                  <CardDescription>
                    You have {userBalance} JaiCoins available (₹{userBalance})
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useJaiCoins"
                      checked={formData.useJaiCoins}
                      onChange={(e)=> handleInputChange('useJaiCoins', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="useJaiCoins">Use JaiCoins for this order</Label>
                  </div>
                  
                  {formData.useJaiCoins && (
                    <div>
                      <Label htmlFor="jaiCoinsAmount">JaiCoins to use (max {maxJaiCoins})</Label>
                      <Input
                        id="jaiCoinsAmount"
                        type="number"
                        min="0"
                        max={maxJaiCoins}
                        value={formData.jaiCoinsToUse}
                        onChange={(e) => handleInputChange('jaiCoinsToUse', Math.min(maxJaiCoins, parseInt(e.target.value) || 0))}
                        placeholder="Enter JaiCoins to use"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
                <CardDescription>Any special requests or notes for the merchant</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.orderNotes}
                  onChange={(e) => handleInputChange('orderNotes', e.target.value)}
                  placeholder="Any special instructions for your order..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Details */}
                  <div className="space-y-2">
                    <h4 className="font-medium">{order.deal.title}</h4>
                    <p className="text-sm text-gray-600">From {order.merchant.business_name}</p>
                    <div className="flex justify-between text-sm">
                      <span>Quantity:</span>
                      <span>{order.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price per item:</span>
                      <span>₹{order.deal.discounted_price.toLocaleString()}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{order.total_amount.toLocaleString()}</span>
                    </div>
                    
                    {formData.useJaiCoins && formData.jaiCoinsToUse > 0 && (
                      <div className="flex justify-between text-yellow-600">
                        <span>JaiCoins discount:</span>
                        <span>-₹{formData.jaiCoinsToUse}</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>₹{finalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* JaiCoins Reward */}
                  {order.deal.jaicoin_reward > 0 && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-yellow-700">
                        <Coins className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          You'll earn {order.deal.jaicoin_reward * order.quantity} JaiCoins
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Place Order Button */}
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    {isProcessing ? (
                      'Processing Order...'
                    ) : (
                      `Place Order - ₹${finalAmount.toLocaleString()}`
                    )}
                  </Button>

                  {/* Security Note */}
                  <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                    <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium">Secure & Protected</p>
                      <p>Your order and payment information is encrypted and secure.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
