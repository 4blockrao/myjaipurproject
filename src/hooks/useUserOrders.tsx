
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserOrders = () => {
  return useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user for orders');
        return [];
      }

      console.log('Fetching orders for user:', user.id);
      
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
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }

      console.log('Orders fetched:', orders?.length || 0);
      return orders || [];
    },
  });
};
