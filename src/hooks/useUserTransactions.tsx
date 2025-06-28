
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserTransactions = () => {
  return useQuery({
    queryKey: ["user-transactions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user for transactions');
        return [];
      }

      console.log('Fetching transactions for user:', user.id);
      
      const { data: transactions, error } = await supabase
        .from("jaicoin_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }

      console.log('Transactions fetched:', transactions?.length || 0);
      return transactions || [];
    },
  });
};
