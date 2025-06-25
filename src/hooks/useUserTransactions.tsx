
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserTransactions = () => {
  return useQuery({
    queryKey: ["user-transactions"],
    queryFn: async () => {
      const { data: transactions, error } = await supabase
        .from("jaicoin_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }

      return transactions || [];
    },
  });
};
