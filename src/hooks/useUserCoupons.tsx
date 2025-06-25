
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserCoupons = () => {
  return useQuery({
    queryKey: ["user-coupons"],
    queryFn: async () => {
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
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching coupons:", error);
        throw error;
      }

      return coupons || [];
    },
  });
};
