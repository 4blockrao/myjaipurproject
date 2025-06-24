
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Ticket, QrCode, Download, Share2, Clock, MapPin, AlertTriangle, 
  CheckCircle, Copy, Phone, Mail, Globe, Star, Calendar, 
  Receipt, Eye, Info, Shield, Gift, Zap, Store, Navigation,
  Users, CreditCard, RefreshCw, ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import QRCodeGenerator from "@/components/QRCodeGenerator";

interface PurchasedCoupon {
  id: string;
  coupon_code: string;
  purchase_date: string;
  expiry_date: string;
  is_used: boolean;
  redemption_count: number;
  max_redemptions: number;
  purchase_amount: number;
  discount_amount: number;
  payment_method: string;
  qr_code: string;
  usage_terms: string;
  min_order_value: number;
  deal: {
    id: string;
    title: string;
    description: string;
    category: string;
    subcategory: string;
    discount_percentage: number;
    original_price: number;
    discounted_price: number;
    location: string;
    validity_days: number;
    terms_conditions: string;
    image_url: string;
    merchants?: {
      id: string;
      business_name: string;
      phone: string;
      email: string;
      address: string;
      website: string;
      average_rating: number;
      total_reviews: number;
      business_type: string;
      is_verified: boolean;
      description: string;
      logo_url: string;
    };
  };
  redemption_history?: Array<{
    redeemed_at: string;
    location: string;
    merchant_staff: string;
    amount_used: number;
  }>;
}

const CouponsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [purchasedCoupons, setPurchasedCoupons] = useState<PurchasedCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<PurchasedCoupon | null>(null);
  const [showCouponDetails, setShowCouponDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPurchasedCoupons();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await fetchUserProfile(session.user.id);
    }
    setIsLoading(false);
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchPurchasedCoupons = async () => {
    try {
      // Enhanced mock data with complete merchant and redemption details
      const mockCoupons: PurchasedCoupon[] = [
        {
          id: "1",
          coupon_code: "SAVE50JH2024",
          purchase_date: "2024-06-20T10:30:00Z",
          expiry_date: "2024-07-20T23:59:59Z",
          is_used: false,
          redemption_count: 0,
          max_redemptions: 1,
          purchase_amount: 1200,
          discount_amount: 800,
          payment_method: "Credit Card",
          qr_code: "QR_SAVE50JH2024_SECURE",
          usage_terms: "Valid only for spa services. Advance booking required 24 hours prior. Cannot be combined with other offers. Valid for all services except premium treatments. Blackout dates may apply during peak seasons.",
          min_order_value: 2000,
          deal: {
            id: "1",
            title: "Spa & Wellness Package - Complete Relaxation Experience",
            description: "Indulge in our premium spa experience featuring aromatherapy massage, facial treatment, and access to our wellness facilities including sauna and steam room.",
            category: "Beauty & Wellness",
            subcategory: "Spa Services",
            discount_percentage: 40,
            original_price: 2000,
            discounted_price: 1200,
            location: "Malviya Nagar, Jaipur",
            validity_days: 30,
            terms_conditions: "Valid only for spa services. Advance booking required 24 hours prior. Cannot be combined with other offers.",
            image_url: "/api/placeholder/400/300",
            merchants: {
              id: "merchant_1",
              business_name: "Serenity Spa & Wellness Center",
              phone: "+91 98765 43210",
              email: "bookings@serenityspa.com",
              address: "Plot 45, Sector 7, Malviya Nagar, Jaipur, Rajasthan 302017",
              website: "www.serenityspa.com",
              average_rating: 4.8,
              total_reviews: 234,
              business_type: "Spa & Wellness",
              is_verified: true,
              description: "Premier spa destination offering holistic wellness treatments with certified therapists and premium facilities.",
              logo_url: "/api/placeholder/100/100"
            }
          },
          redemption_history: []
        },
        {
          id: "2",
          coupon_code: "FOOD30JH2024",
          purchase_date: "2024-06-18T14:20:00Z",
          expiry_date: "2024-07-18T23:59:59Z",
          is_used: true,
          redemption_count: 1,
          max_redemptions: 1,
          purchase_amount: 1050,
          discount_amount: 450,
          payment_method: "UPI",
          qr_code: "QR_FOOD30JH2024_USED",
          usage_terms: "Valid for dine-in only. Cannot be used for delivery or takeaway. Valid on weekdays only. Prior reservation recommended.",
          min_order_value: 1500,
          deal: {
            id: "2",
            title: "Romantic Dinner for Two - Royal Experience",
            description: "Enjoy an intimate dinner experience with live music, candlelight setting, and our chef's special 5-course meal featuring authentic Rajasthani cuisine.",
            category: "Food & Dining",
            subcategory: "Fine Dining",
            discount_percentage: 30,
            original_price: 1500,
            discounted_price: 1050,
            location: "C-Scheme, Jaipur",
            validity_days: 30,
            terms_conditions: "Valid for dine-in only. Prior reservation required. Valid on weekdays only.",
            image_url: "/api/placeholder/400/300",
            merchants: {
              id: "merchant_2",
              business_name: "Royal Palace Restaurant",
              phone: "+91 98765 43211",
              email: "reservations@royalpalace.com",
              address: "15-A, C-Scheme, Near Ashok Marg, Jaipur, Rajasthan 302001",
              website: "www.royalpalacerestaurant.com",
              average_rating: 4.6,
              total_reviews: 892,
              business_type: "Fine Dining Restaurant",
              is_verified: true,
              description: "Authentic Rajasthani cuisine in a royal ambiance with live cultural performances and traditional hospitality.",
              logo_url: "/api/placeholder/100/100"
            }
          },
          redemption_history: [
            {
              redeemed_at: "2024-06-22T19:30:00Z",
              location: "C-Scheme, Jaipur",
              merchant_staff: "Rajesh Kumar",
              amount_used: 1050
            }
          ]
        }
      ];
      setPurchasedCoupons(mockCoupons);
    } catch (error) {
      console.error('Error fetching purchased coupons:', error);
    }
  };

  const generateSecureQRData = (coupon: PurchasedCoupon) => {
    const timestamp = Date.now();
    const qrData = {
      couponId: coupon.id,
      couponCode: coupon.coupon_code,
      userId: user?.id,
      dealId: coupon.deal.id,
      merchantId: coupon.deal.merchants?.id,
      amount: coupon.discount_amount,
      minOrderValue: coupon.min_order_value,
      expiresAt: coupon.expiry_date,
      timestamp: timestamp,
      securityHash: btoa(`${coupon.id}-${user?.id}-${timestamp}-JAIPUR_DEALS_SECURE`),
      version: "v2.0"
    };
    return JSON.stringify(qrData);
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Coupon code copied to clipboard",
    });
  };

  const downloadCoupon = (coupon: PurchasedCoupon) => {
    const couponData = {
      code: coupon.coupon_code,
      deal: coupon.deal.title,
      merchant: coupon.deal.merchants?.business_name,
      originalPrice: coupon.deal.original_price,
      discountedPrice: coupon.deal.discounted_price,
      discount: coupon.discount_amount,
      purchasedDate: coupon.purchase_date,
      expiresDate: coupon.expiry_date,
      terms: coupon.usage_terms
    };
    
    const dataStr = JSON.stringify(couponData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `coupon-${coupon.coupon_code}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Coupon Downloaded",
      description: "Your coupon has been saved to downloads"
    });
  };

  const shareCoupon = (coupon: PurchasedCoupon) => {
    const shareText = `Check out this amazing deal I got: ${coupon.deal.discount_percentage}% off at ${coupon.deal.merchants?.business_name}! 🎉`;
    if (navigator.share) {
      navigator.share({
        title: `${coupon.deal.title}`,
        text: shareText,
        url: `${window.location.origin}/deal/${coupon.deal.id}`
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.origin}/deal/${coupon.deal.id}`);
      toast({
        title: "Link copied",
        description: "Deal details copied to clipboard"
      });
    }
  };

  const checkCouponValidity = (coupon: PurchasedCoupon) => {
    const now = new Date();
    const expiry = new Date(coupon.expiry_date);
    const isExpired = now > expiry;
    const isExhausted = coupon.redemption_count >= coupon.max_redemptions;
    
    return {
      isValid: !isExpired && !isExhausted && !coupon.is_used,
      isExpired,
      isExhausted,
      daysLeft: Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    };
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="My Coupons">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="My Coupons">
        <Card className="m-4">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your coupons</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const activeCoupons = purchasedCoupons.filter(c => {
    const validity = checkCouponValidity(c);
    return validity.isValid;
  });
  
  const usedCoupons = purchasedCoupons.filter(c => {
    const validity = checkCouponValidity(c);
    return !validity.isValid;
  });

  return (
    <DashboardLayout user={user} profile={profile} pageTitle="My Coupons" showBackButton>
      <div className="p-4 max-w-6xl mx-auto space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{activeCoupons.length}</div>
              <div className="text-sm text-gray-600">Active Coupons</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <Ticket className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{usedCoupons.length}</div>
              <div className="text-sm text-gray-600">Used/Expired</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <Gift className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">{purchasedCoupons.length}</div>
              <div className="text-sm text-gray-600">Total Purchased</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-700">
                ₹{purchasedCoupons.reduce((sum, c) => sum + c.discount_amount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Saved</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Coupons */}
        {activeCoupons.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Active Coupons
            </h2>
            
            {activeCoupons.map((coupon) => {
              const validity = checkCouponValidity(coupon);
              return (
                <Card key={coupon.id} className="overflow-hidden border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Coupon Image & Code Section */}
                      <div className="lg:w-1/3 bg-gradient-to-br from-blue-600 to-purple-700 text-white p-6">
                        <div className="text-center">
                          <div className="mb-4">
                            {coupon.deal.image_url ? (
                              <img 
                                src={coupon.deal.image_url} 
                                alt={coupon.deal.title}
                                className="w-full h-32 object-cover rounded-lg mb-4"
                              />
                            ) : (
                              <div className="w-full h-32 bg-white/20 rounded-lg mb-4 flex items-center justify-center">
                                <Ticket className="w-12 h-12 text-white/60" />
                              </div>
                            )}
                          </div>
                          
                          <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4">
                            <div className="text-lg font-bold tracking-wider mb-2">{coupon.coupon_code}</div>
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                              {validity.daysLeft <= 7 && (
                                <Badge className="bg-orange-500 text-white">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {validity.daysLeft}d left
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => copyCouponCode(coupon.coupon_code)}
                              className="w-full"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Code
                            </Button>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-3xl font-bold">₹{coupon.discount_amount}</div>
                            <div className="text-sm opacity-90">You Save</div>
                          </div>
                        </div>
                      </div>

                      {/* Deal Details Section */}
                      <div className="lg:w-2/3 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2">{coupon.deal.category}</Badge>
                            <h3 className="text-xl font-bold mb-2">{coupon.deal.title}</h3>
                            <p className="text-gray-600 mb-3">{coupon.deal.description}</p>
                          </div>
                        </div>

                        {/* Merchant Info */}
                        {coupon.deal.merchants && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-3 mb-3">
                              {coupon.deal.merchants.logo_url ? (
                                <img 
                                  src={coupon.deal.merchants.logo_url} 
                                  alt={coupon.deal.merchants.business_name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                  <Store className="w-6 h-6 text-gray-500" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold">{coupon.deal.merchants.business_name}</h4>
                                  {coupon.deal.merchants.is_verified && (
                                    <Badge className="bg-green-100 text-green-700 text-xs">
                                      <Shield className="w-3 h-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                {renderStarRating(coupon.deal.merchants.average_rating)}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span>{coupon.deal.merchants.address}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span>{coupon.deal.merchants.phone}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Purchase Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <div className="text-gray-500">Original Price</div>
                            <div className="font-bold line-through text-gray-500">₹{coupon.deal.original_price}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">You Paid</div>
                            <div className="font-bold text-green-600">₹{coupon.purchase_amount}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Min Order</div>
                            <div className="font-bold">₹{coupon.min_order_value}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Expires</div>
                            <div className={`font-bold ${validity.daysLeft <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                              {new Date(coupon.expiry_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                onClick={() => setSelectedCoupon(coupon)}
                                className="bg-gradient-to-r from-pink-500 to-orange-400"
                              >
                                <QrCode className="w-4 h-4 mr-2" />
                                Show QR Code
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-center">Scan to Redeem</DialogTitle>
                              </DialogHeader>
                              <div className="text-center space-y-4">
                                <QRCodeGenerator 
                                  value={generateSecureQRData(coupon)} 
                                  size={240}
                                  className="mx-auto"
                                />
                                <div className="space-y-2">
                                  <p className="font-bold text-xl">{coupon.coupon_code}</p>
                                  <p className="text-sm text-gray-600">{coupon.deal.title}</p>
                                  <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm font-medium text-blue-800">{coupon.deal.merchants?.business_name}</p>
                                    <p className="text-xs text-blue-600">{coupon.deal.location}</p>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    Show this QR code to the merchant for redemption
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  setSelectedCoupon(coupon);
                                  setShowCouponDetails(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Full Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Coupon Details</DialogTitle>
                              </DialogHeader>
                              {selectedCoupon && (
                                <Tabs defaultValue="details" className="space-y-4">
                                  <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    <TabsTrigger value="merchant">Merchant</TabsTrigger>
                                    <TabsTrigger value="terms">Terms</TabsTrigger>
                                    <TabsTrigger value="history">History</TabsTrigger>
                                  </TabsList>
                                  
                                  <TabsContent value="details" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-semibold mb-2">Purchase Information</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span>Coupon Code:</span>
                                            <span className="font-mono">{selectedCoupon.coupon_code}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Purchase Date:</span>
                                            <span>{new Date(selectedCoupon.purchase_date).toLocaleDateString()}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Payment Method:</span>
                                            <span>{selectedCoupon.payment_method}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Amount Paid:</span>
                                            <span className="text-green-600 font-bold">₹{selectedCoupon.purchase_amount}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold mb-2">Savings Information</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span>Original Price:</span>
                                            <span className="line-through">₹{selectedCoupon.deal.original_price}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Discount:</span>
                                            <span className="text-pink-600 font-bold">₹{selectedCoupon.discount_amount}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Discount %:</span>
                                            <span className="text-pink-600 font-bold">{selectedCoupon.deal.discount_percentage}%</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Min Order Value:</span>
                                            <span>₹{selectedCoupon.min_order_value}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="merchant" className="space-y-4">
                                    {selectedCoupon.deal.merchants && (
                                      <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                          {selectedCoupon.deal.merchants.logo_url ? (
                                            <img 
                                              src={selectedCoupon.deal.merchants.logo_url} 
                                              alt={selectedCoupon.deal.merchants.business_name}
                                              className="w-16 h-16 rounded-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                              <Store className="w-8 h-8 text-gray-500" />
                                            </div>
                                          )}
                                          <div>
                                            <h3 className="text-xl font-bold">{selectedCoupon.deal.merchants.business_name}</h3>
                                            <p className="text-gray-600">{selectedCoupon.deal.merchants.business_type}</p>
                                            {renderStarRating(selectedCoupon.deal.merchants.average_rating)}
                                          </div>
                                        </div>
                                        
                                        <p className="text-gray-700">{selectedCoupon.deal.merchants.description}</p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                              <MapPin className="w-5 h-5 text-gray-500" />
                                              <span>{selectedCoupon.deal.merchants.address}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Phone className="w-5 h-5 text-gray-500" />
                                              <span>{selectedCoupon.deal.merchants.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Mail className="w-5 h-5 text-gray-500" />
                                              <span>{selectedCoupon.deal.merchants.email}</span>
                                            </div>
                                            {selectedCoupon.deal.merchants.website && (
                                              <div className="flex items-center gap-2">
                                                <Globe className="w-5 h-5 text-gray-500" />
                                                <a 
                                                  href={`https://${selectedCoupon.deal.merchants.website}`} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer"
                                                  className="text-blue-600 hover:underline"
                                                >
                                                  {selectedCoupon.deal.merchants.website}
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                          <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                              <span>Total Reviews:</span>
                                              <span className="font-bold">{selectedCoupon.deal.merchants.total_reviews}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                              <span>Verification:</span>
                                              <Badge className={selectedCoupon.deal.merchants.is_verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                                {selectedCoupon.deal.merchants.is_verified ? "Verified" : "Pending"}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </TabsContent>
                                  
                                  <TabsContent value="terms" className="space-y-4">
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-semibold mb-2">Usage Terms</h4>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                          {selectedCoupon.usage_terms}
                                        </p>
                                      </div>
                                      
                                      <div>
                                        <h4 className="font-semibold mb-2">General Terms & Conditions</h4>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                          {selectedCoupon.deal.terms_conditions}
                                        </p>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="text-gray-500">Validity Period:</span>
                                          <div className="font-bold">{selectedCoupon.deal.validity_days} days</div>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Max Redemptions:</span>
                                          <div className="font-bold">{selectedCoupon.max_redemptions}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="history" className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-4">Redemption History</h4>
                                      {selectedCoupon.redemption_history && selectedCoupon.redemption_history.length > 0 ? (
                                        <div className="space-y-3">
                                          {selectedCoupon.redemption_history.map((redemption, index) => (
                                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                              <div className="flex justify-between items-start">
                                                <div>
                                                  <p className="font-medium">Redeemed at {redemption.location}</p>
                                                  <p className="text-sm text-gray-600">Staff: {redemption.merchant_staff}</p>
                                                  <p className="text-xs text-gray-500">
                                                    {new Date(redemption.redeemed_at).toLocaleString()}
                                                  </p>
                                                </div>
                                                <div className="text-right">
                                                  <p className="font-bold text-green-600">₹{redemption.amount_used}</p>
                                                  <p className="text-xs text-gray-500">Amount Used</p>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-center py-8">
                                          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                          <p className="text-gray-500">No redemptions yet</p>
                                          <p className="text-sm text-gray-400">Your redemption history will appear here</p>
                                        </div>
                                      )}
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button variant="outline" onClick={() => downloadCoupon(coupon)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>

                          <Button variant="outline" onClick={() => shareCoupon(coupon)}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Used/Expired Coupons */}
        {usedCoupons.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-gray-500" />
              Used & Expired Coupons
            </h2>
            
            <div className="space-y-3">
              {usedCoupons.map((coupon) => {
                const validity = checkCouponValidity(coupon);
                return (
                  <Card key={coupon.id} className="opacity-75 border-l-4 border-l-gray-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Ticket className="w-6 h-6 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{coupon.deal.title}</h3>
                            <p className="text-sm text-gray-600">{coupon.coupon_code}</p>
                            <p className="text-xs text-gray-500">{coupon.deal.merchants?.business_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-1">
                            {validity.isExpired ? 'Expired' : 'Used'}
                          </Badge>
                          <p className="text-sm text-gray-500">
                            {validity.isExpired 
                              ? `Expired ${new Date(coupon.expiry_date).toLocaleDateString()}`
                              : coupon.redemption_history?.[0]
                                ? `Used ${new Date(coupon.redemption_history[0].redeemed_at).toLocaleDateString()}`
                                : 'Used'
                            }
                          </p>
                          <p className="text-sm font-bold text-gray-600">Saved ₹{coupon.discount_amount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {purchasedCoupons.length === 0 && (
          <Card className="p-12 text-center">
            <Ticket className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No coupons yet</h3>
            <p className="text-gray-500 mb-6">Purchase deals to get exclusive coupons and start saving!</p>
            <Button 
              onClick={() => window.location.href = '/deals'}
              className="bg-gradient-to-r from-pink-500 to-orange-400"
            >
              <Gift className="w-4 h-4 mr-2" />
              Browse Deals
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CouponsPage;
