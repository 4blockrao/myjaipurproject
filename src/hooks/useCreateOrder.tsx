
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateOrderData {
  dealId: string;
  quantity: number;
  totalAmount: number;
  jaicoinsUsed: number;
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
          payment_method: "online",
          status: "pending"
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order item
      await supabase
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

      // Deduct JaiCoins if used
      if (orderData.jaicoinsUsed > 0) {
        await supabase
          .from("jaicoin_transactions")
          .insert({
            user_id: user.user.id,
            amount: orderData.jaicoinsUsed,
            type: "spent",
            source: "order_payment",
            description: `Used for order #${order.order_code}`
          });
      }

      // Create coupon if this is a coupon purchase
      if (deal.coupon_type) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (deal.validity_days || 30));

        await supabase
          .from("coupons")
          .insert({
            deal_id: orderData.dealId,
            user_id: user.user.id,
            merchant_id: deal.merchants.id,
            coupon_code: orderData.couponCode || `A${Math.floor(Math.random() * 90000) + 10000}`,
            coupon_type: deal.coupon_type,
            purchase_amount: orderData.totalAmount,
            discount_amount: deal.discounted_price,
            expires_at: expiresAt.toISOString(),
            min_order_value: deal.min_order_value || 0,
            usage_terms: deal.usage_terms
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
