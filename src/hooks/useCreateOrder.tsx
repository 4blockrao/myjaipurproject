
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateOrderData {
  dealId: string;
  quantity: number;
  totalAmount: number;
  jaicoinsUsed: number;
  paymentMethod: "cod" | "online";
  couponCode?: string;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
}

export const useCreateOrder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Get deal information
      const { data: deal, error: dealError } = await supabase
        .from("deals")
        .select(`
          *,
          merchants!inner(
            id,
            business_name,
            address
          )
        `)
        .eq("id", orderData.dealId)
        .single();

      if (dealError) throw dealError;
      if (!deal) throw new Error("Deal not found");

      // Generate order code
      const orderCode = `JAI${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

      // Determine order status based on payment method
      const orderStatus = orderData.paymentMethod === "cod" ? "pending" : "pending";

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.user.id,
          deal_id: orderData.dealId,
          merchant_id: deal.merchants.id,
          quantity: orderData.quantity,
          total_amount: orderData.totalAmount,
          jaicoin_used: orderData.jaicoinsUsed,
          customer_name: orderData.customerInfo.name,
          customer_phone: orderData.customerInfo.phone,
          payment_method: orderData.paymentMethod,
          order_code: orderCode,
          status: orderStatus
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order item
      const { error: orderItemError } = await supabase
        .from("order_items")
        .insert({
          order_id: order.id,
          deal_id: orderData.dealId,
          quantity: orderData.quantity,
          unit_price: deal.discounted_price,
          total_price: orderData.totalAmount,
          jaicoin_used: orderData.jaicoinsUsed,
          item_type: "deal"
        });

      if (orderItemError) {
        console.error("Order item creation error:", orderItemError);
      }

      // Deduct JaiCoins if used
      if (orderData.jaicoinsUsed > 0) {
        await supabase
          .from("jaicoin_transactions")
          .insert({
            user_id: user.user.id,
            amount: orderData.jaicoinsUsed,
            type: "spent",
            source: "order_payment",
            description: `Used for order #${orderCode}`
          });
      }

      // Award JaiCoins for the purchase
      if (deal.jaicoin_reward && deal.jaicoin_reward > 0) {
        await supabase
          .from("jaicoin_transactions")
          .insert({
            user_id: user.user.id,
            amount: deal.jaicoin_reward * orderData.quantity,
            type: "earned",
            source: "purchase_reward",
            description: `Earned from purchase #${orderCode}`
          });
      }

      // Create coupon if this is a coupon-type deal
      if (deal.coupon_type) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (deal.validity_days || 30));

        const couponCode = `JAI${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        await supabase
          .from("coupons")
          .insert({
            deal_id: orderData.dealId,
            user_id: user.user.id,
            merchant_id: deal.merchants.id,
            coupon_code: couponCode,
            coupon_type: deal.coupon_type,
            purchase_amount: orderData.totalAmount,
            discount_amount: deal.discounted_price,
            expires_at: expiresAt.toISOString(),
            min_order_value: deal.min_order_value || 0,
            usage_terms: deal.usage_terms,
            status: "active"
          });
      }

      return {
        ...order,
        deal,
        merchant: deal.merchants
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      queryClient.invalidateQueries({ queryKey: ["user-balance"] });
      queryClient.invalidateQueries({ queryKey: ["user-coupons"] });
    },
    onError: (error) => {
      console.error("Order creation failed:", error);
      toast({
        title: "Order Failed",
        description: "There was an error creating your order. Please try again.",
        variant: "destructive"
      });
    }
  });
};
