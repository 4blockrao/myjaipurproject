
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserBalance = () => {
  return useQuery({
    queryKey: ["user-balance"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user for balance');
        return 0;
      }

      console.log('Fetching balance for user:', user.id);

      const { data: balance, error } = await supabase
        .rpc("get_user_balance", { user_uuid: user.id });

      if (error) {
        console.error("Error fetching balance:", error);
        throw error;
      }

      console.log('Balance fetched:', balance);
      return balance || 0;
    },
  });
};
