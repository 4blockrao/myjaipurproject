
import { useState, useEffect } from "react";
import ProMembership from "@/components/ProMembership";
import { supabase } from "@/integrations/supabase/client";

const ProMembershipPage = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  return <ProMembership userId={userId || undefined} />;
};

export default ProMembershipPage;
