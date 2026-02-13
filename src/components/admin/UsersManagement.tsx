import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Users, Search, Crown, Shield, Store, Download, Coins, Mail, Phone,
  MapPin, Calendar, ShoppingBag, Ticket, ChevronDown, ChevronUp, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/hooks/useUserRoles";

interface ProfileWithDetails {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  locality: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_pro: boolean | null;
  pro_tier: string | null;
  pro_expires_at: string | null;
  subscription_status: string | null;
  total_referrals: number | null;
  referral_code: string | null;
  user_id_code: string | null;
  created_at: string | null;
  updated_at: string | null;
  roles: UserRole[];
  balance: number;
  ordersCount: number;
  eventRegistrationsCount: number;
}

interface UserOrder {
  id: string;
  order_code: string;
  total_amount: number;
  status: string;
  created_at: string;
  deals?: { title: string };
}

interface UserEventRegistration {
  id: string;
  registration_code: string;
  total_amount: number;
  ticket_count: number;
  status: string;
  registered_at: string;
  events?: { title: string };
}

const UsersManagement = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users-detailed"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const usersWithDetails = await Promise.all(
        (profiles || []).map(async (profile) => {
          const [rolesResult, balanceResult, ordersResult, eventRegsResult] = await Promise.all([
            supabase.rpc("get_user_roles", { _user_id: profile.id }),
            supabase.rpc("get_user_balance", { user_uuid: profile.id }),
            supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
            supabase.from("event_registrations").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
          ]);

          return {
            ...profile,
            roles: rolesResult.data?.map((r: any) => r.role) || ["user"],
            balance: balanceResult.data || 0,
            ordersCount: ordersResult.count || 0,
            eventRegistrationsCount: eventRegsResult.count || 0,
          } as ProfileWithDetails;
        })
      );

      return usersWithDetails;
    },
  });

  // Fetch user details for modal
  const { data: userDetails, isLoading: userDetailsLoading } = useQuery({
    queryKey: ["admin-user-details", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;

      const [ordersResult, eventRegsResult, transactionsResult] = await Promise.all([
        supabase
          .from("orders")
          .select("id, order_code, total_amount, status, created_at, deals(title)")
          .eq("user_id", selectedUserId)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("event_registrations")
          .select("id, registration_code, total_amount, ticket_count, status, registered_at, events(title)")
          .eq("user_id", selectedUserId)
          .order("registered_at", { ascending: false })
          .limit(20),
        supabase
          .from("jaicoin_transactions")
          .select("*")
          .eq("user_id", selectedUserId)
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

      return {
        orders: ordersResult.data as UserOrder[] || [],
        eventRegistrations: eventRegsResult.data as UserEventRegistration[] || [],
        transactions: transactionsResult.data || [],
      };
    },
    enabled: !!selectedUserId,
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
      queryClient.invalidateQueries({ queryKey: ["admin-users-detailed"] });
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
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.phone?.includes(search) ||
      user.locality?.toLowerCase().includes(search.toLowerCase()) ||
      user.user_id_code?.includes(search);

    const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter as UserRole);

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users?.length || 0,
    proUsers: users?.filter((u) => u.is_pro).length || 0,
    admins: users?.filter((u) => u.roles.includes("admin")).length || 0,
    merchants: users?.filter((u) => u.roles.includes("merchant")).length || 0,
    withOrders: users?.filter((u) => u.ordersCount > 0).length || 0,
    withEventRegs: users?.filter((u) => u.eventRegistrationsCount > 0).length || 0,
  };

  const exportUsers = () => {
    if (!filteredUsers?.length) {
      toast.error("No users to export");
      return;
    }

    const csv = [
      ["Name", "Email", "Phone", "Locality", "City", "User ID", "Pro", "Pro Tier", "Referrals", "Referral Code", "Balance", "Orders", "Event Registrations", "Roles", "Joined"].join(","),
      ...filteredUsers.map((u) =>
        [
          `"${u.full_name || ""}"`,
          u.email || "",
          u.phone || "",
          u.locality || "",
          u.city || "",
          u.user_id_code || "",
          u.is_pro ? "Yes" : "No",
          u.pro_tier || "",
          u.total_referrals || 0,
          u.referral_code || "",
          u.balance,
          u.ordersCount,
          u.eventRegistrationsCount,
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

  const selectedUser = users?.find((u) => u.id === selectedUserId);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
            <CardTitle className="text-sm font-medium">With Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.withOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Event Buyers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.withEventRegs}</div>
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
            <div className="text-2xl font-bold text-orange-600">{stats.merchants}</div>
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
          <CardDescription>Manage user accounts, roles, and view purchase history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, locality..."
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
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                   <TableHead>Email</TableHead>
                   <TableHead>Phone</TableHead>
                   <TableHead>Location</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Activity</TableHead>
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
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {user.full_name || "Unknown"}
                            {user.is_pro && <Crown className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {user.user_id_code || user.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="truncate max-w-[180px]">{user.email || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span>{user.phone || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {user.locality && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {user.locality}
                          </div>
                        )}
                        {user.city && (
                          <span className="text-xs text-muted-foreground">{user.city}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">{user.balance}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3 text-green-500" />
                          {user.ordersCount} orders
                        </div>
                        <div className="flex items-center gap-1">
                          <Ticket className="w-3 h-3 text-blue-500" />
                          {user.eventRegistrationsCount} events
                        </div>
                        <div className="text-muted-foreground">
                          {user.total_referrals || 0} referrals
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge
                            key={role}
                            variant={
                              role === "admin" ? "destructive" :
                              role === "pro_user" ? "default" : "secondary"
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
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {user.created_at ? format(new Date(user.created_at), "MMM d, yyyy") : "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUserId(user.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                {selectedUser?.full_name || "User Details"}
                                {selectedUser?.is_pro && <Crown className="w-5 h-5 text-yellow-500" />}
                              </DialogTitle>
                              <DialogDescription>
                                {selectedUser?.email} • {selectedUser?.phone || "No phone"}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <Tabs defaultValue="overview" className="w-full">
                              <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="orders">Orders</TabsTrigger>
                                <TabsTrigger value="events">Events</TabsTrigger>
                                <TabsTrigger value="transactions">JaiCoin</TabsTrigger>
                              </TabsList>

                              <TabsContent value="overview" className="mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">User ID</p>
                                    <p className="font-medium">{selectedUser?.user_id_code || selectedUser?.id.slice(0, 8)}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Referral Code</p>
                                    <p className="font-mono">{selectedUser?.referral_code || "-"}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Location</p>
                                    <p>{selectedUser?.locality || "-"}, {selectedUser?.city || "Jaipur"}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Balance</p>
                                    <p className="font-bold text-lg">{selectedUser?.balance} JaiCoins</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                                    <p>{selectedUser?.total_referrals || 0}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Pro Status</p>
                                    <p>
                                      {selectedUser?.is_pro ? (
                                        <Badge className="bg-yellow-500">{selectedUser.pro_tier || "Pro"}</Badge>
                                      ) : (
                                        <Badge variant="secondary">Free</Badge>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                {selectedUser?.bio && (
                                  <div className="mt-4 p-3 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Bio</p>
                                    <p className="text-sm">{selectedUser.bio}</p>
                                  </div>
                                )}
                              </TabsContent>

                              <TabsContent value="orders" className="mt-4">
                                <ScrollArea className="h-[300px]">
                                  {userDetailsLoading ? (
                                    <Skeleton className="h-20 w-full" />
                                  ) : userDetails?.orders?.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">No orders yet</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {userDetails?.orders?.map((order) => (
                                        <div key={order.id} className="p-3 border rounded-lg">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="font-medium">{order.deals?.title || "Unknown Deal"}</p>
                                              <p className="text-xs text-muted-foreground">{order.order_code}</p>
                                            </div>
                                            <div className="text-right">
                                              <p className="font-semibold">₹{order.total_amount}</p>
                                              <Badge variant="secondary" className="text-xs">{order.status}</Badge>
                                            </div>
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-2">
                                            {format(new Date(order.created_at), "MMM d, yyyy HH:mm")}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </ScrollArea>
                              </TabsContent>

                              <TabsContent value="events" className="mt-4">
                                <ScrollArea className="h-[300px]">
                                  {userDetailsLoading ? (
                                    <Skeleton className="h-20 w-full" />
                                  ) : userDetails?.eventRegistrations?.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">No event registrations yet</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {userDetails?.eventRegistrations?.map((reg) => (
                                        <div key={reg.id} className="p-3 border rounded-lg">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="font-medium">{reg.events?.title || "Unknown Event"}</p>
                                              <p className="text-xs text-muted-foreground">{reg.registration_code}</p>
                                            </div>
                                            <div className="text-right">
                                              <p className="font-semibold">₹{reg.total_amount}</p>
                                              <Badge variant="secondary" className="text-xs">
                                                {reg.ticket_count} tickets
                                              </Badge>
                                            </div>
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-2">
                                            {format(new Date(reg.registered_at), "MMM d, yyyy HH:mm")}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </ScrollArea>
                              </TabsContent>

                              <TabsContent value="transactions" className="mt-4">
                                <ScrollArea className="h-[300px]">
                                  {userDetailsLoading ? (
                                    <Skeleton className="h-20 w-full" />
                                  ) : userDetails?.transactions?.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">No transactions yet</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {userDetails?.transactions?.map((tx: any) => (
                                        <div key={tx.id} className="p-3 border rounded-lg flex justify-between items-center">
                                          <div>
                                            <p className="font-medium text-sm">{tx.description || tx.source}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {format(new Date(tx.created_at), "MMM d, yyyy HH:mm")}
                                            </p>
                                          </div>
                                          <div className={`font-bold ${tx.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'earned' ? '+' : '-'}{tx.amount}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </ScrollArea>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                        
                        <Select
                          onValueChange={(value) =>
                            assignRoleMutation.mutate({ userId: user.id, role: value as UserRole })
                          }
                        >
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue placeholder="Add role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pro_user">Pro User</SelectItem>
                            <SelectItem value="merchant">Merchant</SelectItem>
                            <SelectItem value="listing_agent">Agent</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;
