import { useNavigate } from "react-router-dom";
import { Ticket, CheckCircle, XCircle, Copy, QrCode, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NativeDashboardLayout from "@/components/layout/NativeDashboardLayout";
import { NativeCard } from "@/components/ui/native-card";
import { useUserCoupons } from "@/hooks/useUserCoupons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CouponsPage = () => {
  const navigate = useNavigate();
  const { data: coupons, isLoading, error } = useUserCoupons();

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  if (isLoading) {
    return (
      <NativeDashboardLayout title="My Coupons">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      </NativeDashboardLayout>
    );
  }

  if (error) {
    return (
      <NativeDashboardLayout title="My Coupons">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to Load</h3>
          <p className="text-muted-foreground mb-4">We couldn't load your coupons</p>
          <Button onClick={() => window.location.reload()} className="rounded-xl">
            Try Again
          </Button>
        </div>
      </NativeDashboardLayout>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { 
          icon: <CheckCircle className="w-4 h-4" />, 
          bg: "bg-emerald-100 text-emerald-700",
          label: "Active"
        };
      case "redeemed":
        return { 
          icon: <CheckCircle className="w-4 h-4" />, 
          bg: "bg-blue-100 text-blue-700",
          label: "Used"
        };
      case "expired":
        return { 
          icon: <XCircle className="w-4 h-4" />, 
          bg: "bg-red-100 text-red-700",
          label: "Expired"
        };
      default:
        return { 
          icon: <Ticket className="w-4 h-4" />, 
          bg: "bg-muted text-muted-foreground",
          label: status
        };
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
    const statusConfig = getStatusConfig(coupon.status);
    
    return (
      <NativeCard variant="default" padding="none" className="overflow-hidden">
        {/* Coupon Header with Discount */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">₹{coupon.discount_amount}</p>
                <p className="text-xs text-muted-foreground">OFF</p>
              </div>
            </div>
            <Badge className={cn("rounded-full px-2.5 py-1 text-xs", statusConfig.bg)}>
              {statusConfig.icon}
              <span className="ml-1">{statusConfig.label}</span>
            </Badge>
          </div>
        </div>

        {/* Coupon Body */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-1">
              {coupon.deals?.title || "Coupon"}
            </h3>
            {coupon.merchants && (
              <p className="text-sm text-muted-foreground">
                {coupon.merchants.business_name}
              </p>
            )}
          </div>

          {/* Coupon Code */}
          <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2">
            <code className="flex-1 text-sm font-mono font-semibold tracking-wide">
              {coupon.coupon_code}
            </code>
            {coupon.status === "active" && !isExpired && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 rounded-lg"
                onClick={() => copyCouponCode(coupon.coupon_code)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {coupon.min_order_value > 0 && (
              <div className="text-muted-foreground">
                <span className="block text-xs">Min Order</span>
                <span className="font-medium text-foreground">₹{coupon.min_order_value}</span>
              </div>
            )}
            <div className="text-muted-foreground">
              <span className="block text-xs">Expires</span>
              <span className={cn(
                "font-medium",
                daysUntilExpiry <= 3 && !isExpired ? "text-red-600" : "text-foreground"
              )}>
                {isExpired ? 'Expired' : daysUntilExpiry <= 0 ? 'Today' : `${daysUntilExpiry} days`}
              </span>
            </div>
          </div>

          {/* Terms */}
          {coupon.usage_terms && (
            <p className="text-xs text-muted-foreground pt-2 border-t border-border/30 line-clamp-2">
              {coupon.usage_terms}
            </p>
          )}
        </div>
      </NativeCard>
    );
  };

  const EmptyState = ({ message, icon: Icon }: { message: string; icon: any }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <NativeDashboardLayout title="My Coupons" subtitle={`${allCoupons.length} coupons`}>
      {!coupons || coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Ticket className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Coupons Yet</h3>
          <p className="text-muted-foreground mb-6">
            Browse deals to get amazing discount coupons
          </p>
          <Button onClick={() => navigate("/deals")} className="rounded-xl">
            Browse Deals
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10 bg-muted/50 rounded-xl p-1 mb-4">
            <TabsTrigger value="all" className="rounded-lg text-xs">
              All ({allCoupons.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="rounded-lg text-xs">
              Active ({activeCoupons.length})
            </TabsTrigger>
            <TabsTrigger value="used" className="rounded-lg text-xs">
              Used ({redeemedCoupons.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-0">
            {allCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </TabsContent>

          <TabsContent value="active" className="mt-0">
            {activeCoupons.length === 0 ? (
              <EmptyState message="No active coupons" icon={Ticket} />
            ) : (
              <div className="space-y-3">
                {activeCoupons.map((coupon) => (
                  <CouponCard key={coupon.id} coupon={coupon} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="used" className="mt-0">
            {redeemedCoupons.length === 0 ? (
              <EmptyState message="No redeemed coupons" icon={CheckCircle} />
            ) : (
              <div className="space-y-3">
                {redeemedCoupons.map((coupon) => (
                  <CouponCard key={coupon.id} coupon={coupon} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </NativeDashboardLayout>
  );
};

export default CouponsPage;
