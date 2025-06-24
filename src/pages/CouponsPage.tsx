
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Ticket, QrCode, Download, Share2, Clock, MapPin, AlertTriangle, CheckCircle, Copy } from "lucide-react";
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
  deal: {
    id: string;
    title: string;
    description: string;
    category: string;
    discount_percentage: number;
    original_price: number;
    discounted_price: number;
    location: string;
    merchants?: {
      business_name: string;
      average_rating: number;
    };
  };
}

const CouponsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [purchasedCoupons, setPurchasedCoupons] = useState<PurchasedCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<PurchasedCoupon | null>(null);
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
      // Enhanced mock data with fraud prevention fields
      const mockCoupons: PurchasedCoupon[] = [
        {
          id: "1",
          coupon_code: "SAVE50JH2024",
          purchase_date: "2024-06-20",
          expiry_date: "2024-07-20",
          is_used: false,
          redemption_count: 0,
          max_redemptions: 1,
          deal: {
            id: "1",
            title: "Spa & Wellness Package",
            description: "Relaxing spa experience with aromatherapy",
            category: "Beauty & Wellness",
            discount_percentage: 40,
            original_price: 2000,
            discounted_price: 1200,
            location: "Malviya Nagar, Jaipur",
            merchants: {
              business_name: "Serenity Spa",
              average_rating: 4.8
            }
          }
        },
        {
          id: "2",
          coupon_code: "FOOD30JH2024",
          purchase_date: "2024-06-18",
          expiry_date: "2024-07-18",
          is_used: true,
          redemption_count: 1,
          max_redemptions: 1,
          deal: {
            id: "2",
            title: "Dinner for Two",
            description: "Romantic dinner experience with live music",
            category: "Food & Dining",
            discount_percentage: 30,
            original_price: 1500,
            discounted_price: 1050,
            location: "C-Scheme, Jaipur",
            merchants: {
              business_name: "Royal Palace Restaurant",
              average_rating: 4.6
            }
          }
        }
      ];
      setPurchasedCoupons(mockCoupons);
    } catch (error) {
      console.error('Error fetching purchased coupons:', error);
    }
  };

  const generateQRData = (coupon: PurchasedCoupon) => {
    // Generate secure QR data with fraud prevention
    const qrData = {
      couponId: coupon.id,
      couponCode: coupon.coupon_code,
      userId: user?.id,
      dealId: coupon.deal.id,
      timestamp: Date.now(),
      hash: btoa(`${coupon.id}-${user?.id}-${Date.now()}`), // Simple hash for demo
    };
    return JSON.stringify(qrData);
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Coupon code copied to clipboard"
    });
  };

  const downloadCoupon = (coupon: PurchasedCoupon) => {
    // Create a downloadable version
    const couponData = {
      code: coupon.coupon_code,
      deal: coupon.deal.title,
      expires: coupon.expiry_date,
      merchant: coupon.deal.merchants?.business_name
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
    if (navigator.share) {
      navigator.share({
        title: `My ${coupon.deal.title} coupon`,
        text: `I got this amazing deal: ${coupon.deal.discount_percentage}% off!`,
        url: `${window.location.origin}/deal/${coupon.deal.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/deal/${coupon.deal.id}`);
      toast({
        title: "Link copied",
        description: "Deal link has been copied to clipboard"
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
      <div className="p-4 max-w-6xl mx-auto space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-3 text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-700">{activeCoupons.length}</div>
              <div className="text-xs text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
            <CardContent className="p-3 text-center">
              <Ticket className="w-6 h-6 text-gray-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-700">{usedCoupons.length}</div>
              <div className="text-xs text-gray-600">Used/Expired</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-3 text-center">
              <QrCode className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-700">{purchasedCoupons.length}</div>
              <div className="text-xs text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-orange-700">
                ₹{purchasedCoupons.reduce((sum, c) => sum + (c.deal.original_price - c.deal.discounted_price), 0)}
              </div>
              <div className="text-xs text-gray-600">Total Saved</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Coupons */}
        {activeCoupons.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Active Coupons</span>
            </h2>
            <div className="space-y-3">
              {activeCoupons.map((coupon) => {
                const validity = checkCouponValidity(coupon);
                return (
                  <Card key={coupon.id} className="overflow-hidden border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Coupon Code Section */}
                        <div className="lg:w-1/3">
                          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-4 text-white text-center">
                            <div className="text-lg font-bold mb-2">{coupon.coupon_code}</div>
                            <div className="flex items-center justify-center space-x-2 mb-3">
                              <Badge className="bg-green-500 text-white text-xs">Valid</Badge>
                              {validity.daysLeft <= 7 && (
                                <Badge className="bg-orange-500 text-white text-xs">
                                  {validity.daysLeft}d left
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => copyCouponCode(coupon.coupon_code)}
                              className="text-xs"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy Code
                            </Button>
                          </div>
                        </div>

                        {/* Deal Details Section */}
                        <div className="lg:w-2/3">
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant="outline" className="text-xs">{coupon.deal.category}</Badge>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedCoupon(coupon)}
                                    className="text-xs"
                                  >
                                    <QrCode className="w-3 h-3 mr-1" />
                                    QR Code
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="text-center">Scan at Merchant</DialogTitle>
                                  </DialogHeader>
                                  <div className="text-center space-y-4">
                                    <QRCodeGenerator 
                                      value={generateQRData(coupon)} 
                                      size={200}
                                      className="mx-auto"
                                    />
                                    <div className="space-y-2">
                                      <p className="font-bold text-lg">{coupon.coupon_code}</p>
                                      <p className="text-sm text-gray-600">{coupon.deal.title}</p>
                                      <p className="text-xs text-gray-500">
                                        Show this QR code to the merchant for redemption
                                      </p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadCoupon(coupon)}
                                className="text-xs"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => shareCoupon(coupon)}
                                className="text-xs"
                              >
                                <Share2 className="w-3 h-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>

                          <h3 className="font-semibold mb-2 text-sm">{coupon.deal.title}</h3>
                          <p className="text-gray-600 mb-3 text-sm">{coupon.deal.description}</p>

                          <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                            <div>
                              <p className="text-gray-500">Merchant</p>
                              <p className="font-medium">{coupon.deal.merchants?.business_name}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Location</p>
                              <p className="font-medium">{coupon.deal.location}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Purchased</p>
                              <p className="font-medium">{new Date(coupon.purchase_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Expires</p>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-red-500" />
                                <p className="font-medium text-red-600 text-xs">{new Date(coupon.expiry_date).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-pink-600">₹{coupon.deal.discounted_price}</span>
                              <span className="text-sm text-gray-500 line-through">₹{coupon.deal.original_price}</span>
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                {coupon.deal.discount_percentage}% OFF
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">
                              Uses: {coupon.redemption_count}/{coupon.max_redemptions}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Used/Expired Coupons */}
        {usedCoupons.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-gray-500" />
              <span>Used & Expired Coupons</span>
            </h2>
            <div className="space-y-2">
              {usedCoupons.map((coupon) => {
                const validity = checkCouponValidity(coupon);
                return (
                  <Card key={coupon.id} className="opacity-60 border-l-4 border-l-gray-300">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Ticket className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{coupon.deal.title}</h3>
                            <p className="text-xs text-gray-600">{coupon.coupon_code}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-xs">
                            {validity.isExpired ? 'Expired' : 'Used'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {validity.isExpired ? 'Expired' : 'Used'} on {new Date(coupon.purchase_date).toLocaleDateString()}
                          </p>
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
          <Card className="p-8 text-center">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No coupons yet</h3>
            <p className="text-gray-500 mb-6">Purchase deals to get exclusive coupons</p>
            <Button onClick={() => window.location.href = '/deals'}>
              Browse Deals
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CouponsPage;
