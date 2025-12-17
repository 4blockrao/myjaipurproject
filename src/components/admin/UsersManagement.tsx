import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Users,
  Search,
  Crown,
  Shield,
  Store,
  Download,
  Coins,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/hooks/useUserRoles";

interface ProfileWithRoles {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  locality: string | null;
  is_pro: boolean | null;
  total_referrals: number | null;
  created_at: string | null;
  roles: UserRole[];
  balance: number;
}

const UsersManagement = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: rolesData } = await supabase.rpc("get_user_roles", {
            _user_id: profile.id,
          });

          const { data: balanceData } = await supabase.rpc("get_user_balance", {
            user_uuid: profile.id,
          });

          return {
            ...profile,
            roles: rolesData?.map((r: any) => r.role) || ["user"],
            balance: balanceData || 0,
          } as ProfileWithRoles;
        })
      );

      return usersWithRoles;
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { data: currentUser } = await supabase.auth.getUser();
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: role,
        assigned_by: currentUser.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role assigned");
    },
    onError: (err: any) => {
      if (err.code === "23505") {
        toast.error("User already has this role");
      } else {
        toast.error("Failed to assign role");
      }
    },
  });

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "all" || user.roles.includes(roleFilter as UserRole);

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users?.length || 0,
    proUsers: users?.filter((u) => u.is_pro).length || 0,
    admins: users?.filter((u) => u.roles.includes("admin")).length || 0,
    merchants: users?.filter((u) => u.roles.includes("merchant")).length || 0,
  };

  const exportUsers = () => {
    if (!filteredUsers?.length) {
      toast.error("No users to export");
      return;
    }

    const csv = [
      ["Name", "Email", "Phone", "Locality", "Pro", "Referrals", "Balance", "Roles", "Joined"].join(","),
      ...filteredUsers.map((u) =>
        [
          `"${u.full_name || ""}"`,
          u.email || "",
          u.phone || "",
          u.locality || "",
          u.is_pro ? "Yes" : "No",
          u.total_referrals || 0,
          u.balance,
          `"${u.roles.join(", ")}"`,
          u.created_at ? format(new Date(u.created_at), "yyyy-MM-dd") : "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("Users exported!");
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pro Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.proUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.merchants}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users Management
          </CardTitle>
          <CardDescription>Manage user accounts and roles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="pro_user">Pro Users</SelectItem>
                <SelectItem value="merchant">Merchants</SelectItem>
                <SelectItem value="listing_agent">Listing Agents</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportUsers} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Locality</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {user.full_name || "Unknown"}
                            {user.is_pro && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.total_referrals || 0} referrals
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-muted-foreground">{user.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.locality || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        {user.balance}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge
                            key={role}
                            variant={
                              role === "admin"
                                ? "destructive"
                                : role === "pro_user"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {role === "admin" && <Shield className="w-3 h-3 mr-1" />}
                            {role === "pro_user" && <Crown className="w-3 h-3 mr-1" />}
                            {role === "merchant" && <Store className="w-3 h-3 mr-1" />}
                            {role.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.created_at
                        ? format(new Date(user.created_at), "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Select
                        onValueChange={(value) =>
                          assignRoleMutation.mutate({
                            userId: user.id,
                            role: value as UserRole,
                          })
                        }
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue placeholder="Add role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pro_user">Pro User</SelectItem>
                          <SelectItem value="merchant">Merchant</SelectItem>
                          <SelectItem value="listing_agent">Listing Agent</SelectItem>
                          <SelectItem value="listing_supervisor">
                            Listing Supervisor
                          </SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;
