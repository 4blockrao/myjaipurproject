
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, Clock, CheckCircle, XCircle, QrCode, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileOptimizedLayout from "@/components/layout/MobileOptimizedLayout";
import { useUserCoupons } from "@/hooks/useUserCoupons";
import { toast } from "sonner";

const CouponsPage = () => {
  const navigate = useNavigate();
  const { data: coupons, isLoading, error } = useUserCoupons();

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied to clipboard!");
  };

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="My Coupons" showBackButton>
        <MobileOptimizedLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your coupons...</p>
            </div>
          </div>
        </MobileOptimizedLayout>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout pageTitle="My Coupons" showBackButton>
        <MobileOptimizedLayout>
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Coupons</h3>
            <p className="text-gray-600 mb-4">We couldn't load your coupons. Please try again.</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </MobileOptimizedLayout>
      </DashboardLayout>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "redeemed":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "expired":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Ticket className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "redeemed":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filterCouponsByStatus = (status?: string) => {
    if (!coupons) return [];
    if (!status) return coupons;
    return coupons.filter(coupon => coupon.status === status);
  };

  const allCoupons = filterCouponsByStatus();
  const activeCoupons = filterCouponsByStatus("active");
  const redeemedCoupons = filterCouponsByStatus("redeemed");

  const CouponCard = ({ coupon }: { coupon: any }) => {
    const isExpired = new Date(coupon.expires_at) < new Date();
    const daysUntilExpiry = Math.ceil((new Date(coupon.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                {coupon.deals?.title || "Coupon"}
              </CardTitle>
              <p className="text-sm text-gray-600">
                Code: {coupon.coupon_code}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(coupon.status)}
              <Badge className={getStatusColor(coupon.status)}>
                {coupon.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Discount</span>
              <span className="font-semibold text-green-600">₹{coupon.discount_amount}</span>
            </div>
            {coupon.purchase_amount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Purchase Amount</span>
                <span>₹{coupon.purchase_amount}</span>
              </div>
            )}
            {coupon.min_order_value > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Min Order</span>
                <span>₹{coupon.min_order_value}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Expires</span>
              <span className={`text-sm ${daysUntilExpiry <= 3 && !isExpired ? 'text-red-600 font-medium' : ''}`}>
                {isExpired ? 'Expired' : daysUntilExpiry <= 0 ? 'Today' : `${daysUntilExpiry} days`}
              </span>
            </div>
            {coupon.merchants && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium text-gray-900">
                  {coupon.merchants.business_name}
                </p>
                <p className="text-xs text-gray-600">
                  {coupon.merchants.address}
                </p>
              </div>
            )}
            {coupon.usage_terms && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Terms:</span> {coupon.usage_terms}
                </p>
              </div>
            )}
          </div>
          {coupon.status === "active" && !isExpired && (
            <div className="flex space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => copyCouponCode(coupon.coupon_code)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
              {coupon.qr_code && (
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // TODO: Show QR code modal
                    toast.info("QR code feature coming soon!");
                  }}
                >
                  <QrCode className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout pageTitle="My Coupons" showBackButton>
      <MobileOptimizedLayout>
        {!coupons || coupons.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Coupons Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't purchased any coupons yet. Browse our deals to get amazing discounts!
            </p>
            <Button onClick={() => navigate("/deals")}>
              Browse Deals
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">All ({allCoupons.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeCoupons.length})</TabsTrigger>
              <TabsTrigger value="redeemed">Used ({redeemedCoupons.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-4">
                {allCoupons.map((coupon) => (
                  <CouponCard key={coupon.id} coupon={coupon} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="active">
              <div className="space-y-4">
                {activeCoupons.length === 0 ? (
                  <div className="text-center py-8">
                    <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active coupons</p>
                  </div>
                ) : (
                  activeCoupons.map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="redeemed">
              <div className="space-y-4">
                {redeemedCoupons.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No redeemed coupons</p>
                  </div>
                ) : (
                  redeemedCoupons.map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </MobileOptimizedLayout>
    </DashboardLayout>
  );
};

export default CouponsPage;
