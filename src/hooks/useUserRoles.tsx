
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type UserRole = 'user' | 'pro_user' | 'merchant' | 'listing_agent' | 'listing_supervisor' | 'admin' | 'real_estate_broker' | 'event_organizer';

interface UserRoleData {
  role: UserRole;
  assigned_at: string;
  metadata: any;
}

export const useUserRoles = (userId?: string) => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchUserRoles(userId);
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchUserRoles = async (uid: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_user_roles', { _user_id: uid });
      
      if (error) throw error;
      
      const userRoles = data?.map((item: UserRoleData) => item.role) || [];
      setRoles(userRoles);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching user roles:', err);
      setError(err.message);
      // Set default user role if error occurs
      setRoles(['user']);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (rolesToCheck: UserRole[]): boolean => {
    return rolesToCheck.some(role => roles.includes(role));
  };

  const isUser = hasRole('user');
  const isProUser = hasRole('pro_user');
  const isMerchant = hasRole('merchant');
  const isListingAgent = hasRole('listing_agent');
  const isListingSupervisor = hasRole('listing_supervisor');
  const isAdmin = hasRole('admin');

  const canManageDeals = hasAnyRole(['listing_agent', 'listing_supervisor', 'admin']);
  const canApproveDeals = hasAnyRole(['listing_supervisor', 'admin']);
  const canManageUsers = hasAnyRole(['listing_supervisor', 'admin']);

  const assignRole = async (targetUserId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: targetUserId,
          role: role,
          assigned_by: userId
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role ${role} assigned successfully`,
      });

      return true;
    } catch (err: any) {
      console.error('Error assigning role:', err);
      toast({
        title: "Error",
        description: `Failed to assign role: ${err.message}`,
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    roles,
    isLoading,
    error,
    hasRole,
    hasAnyRole,
    isUser,
    isProUser,
    isMerchant,
    isListingAgent,
    isListingSupervisor,
    isAdmin,
    canManageDeals: canManageDeals,
    canApproveDeals: canApproveDeals,
    canManageUsers: canManageUsers,
    assignRole,
    refetch: () => userId && fetchUserRoles(userId)
  };
};
