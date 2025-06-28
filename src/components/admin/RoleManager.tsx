
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Users, Shield, Crown, Store, FileText, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/hooks/useUserRoles";

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string;
  roles: UserRole[];
  created_at: string;
}

const RoleManager = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [searchEmail, setSearchEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const roleIcons = {
    user: Users,
    pro_user: Crown,
    merchant: Store,
    listing_agent: FileText,
    listing_supervisor: Eye,
    admin: Shield
  };

  const roleColors = {
    user: "default",
    pro_user: "secondary",
    merchant: "outline",
    listing_agent: "destructive",
    listing_supervisor: "default",
    admin: "default"
  } as const;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Get all profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at');

      if (profilesError) throw profilesError;

      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: rolesData } = await supabase.rpc('get_user_roles', { 
            _user_id: profile.id 
          });
          
          return {
            ...profile,
            roles: rolesData?.map((r: any) => r.role) || ['user']
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const assignRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role ${role} assigned successfully`,
      });

      fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: `Failed to assign role: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const findUserByEmail = async () => {
    if (!searchEmail) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', searchEmail.toLowerCase())
        .single();

      if (error) throw error;
      
      if (data) {
        await assignRole(data.id, selectedRole);
        setSearchEmail('');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message === 'JSON object requested, multiple (or no) rows returned' 
          ? "User not found" 
          : `Failed to find user: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchEmail.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role Management
          </CardTitle>
          <CardDescription>
            Assign and manage user roles across the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search by email or name..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="pro_user">Pro User</SelectItem>
                <SelectItem value="merchant">Merchant</SelectItem>
                <SelectItem value="listing_agent">Listing Agent</SelectItem>
                <SelectItem value="listing_supervisor">Listing Supervisor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={findUserByEmail}>
              Assign Role
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              return (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{user.full_name || 'Unknown User'}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-gray-500">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role) => {
                      const IconComponent = roleIcons[role];
                      return (
                        <Badge 
                          key={role} 
                          variant={roleColors[role]}
                          className="flex items-center gap-1"
                        >
                          <IconComponent className="w-3 h-3" />
                          {role.replace('_', ' ')}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManager;
