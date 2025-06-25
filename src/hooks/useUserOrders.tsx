
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserOrders = () => {
  return useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          *,
          deals:deal_id (
            title,
            discounted_price,
            jaicoin_reward,
            is_product_sale
          ),
          merchants:merchant_id (
            business_name,
            address
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }

      return orders || [];
    },
  });
};
