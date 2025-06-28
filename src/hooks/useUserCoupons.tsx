
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserCoupons = () => {
  return useQuery({
    queryKey: ["user-coupons"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user for coupons');
        return [];
      }

      console.log('Fetching coupons for user:', user.id);
      
      const { data: coupons, error } = await supabase
        .from("coupons")
        .select(`
          *,
          deals:deal_id (
            title,
            original_price,
            discounted_price
          ),
          merchants:merchant_id (
            business_name,
            address,
            phone
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching coupons:", error);
        throw error;
      }

      console.log('Coupons fetched:', coupons?.length || 0);
      return coupons || [];
    },
  });
};
