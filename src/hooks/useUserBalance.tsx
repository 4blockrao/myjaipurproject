
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserBalance = () => {
  return useQuery({
    queryKey: ["user-balance"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error("No authenticated user");
      }

      const { data: balance, error } = await supabase
        .rpc("get_user_balance", { user_uuid: user.user.id });

      if (error) {
        console.error("Error fetching balance:", error);
        throw error;
      }

      return balance || 0;
    },
  });
};
