import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Store,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  Download,
  Star,
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

const MerchantsManagement = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: merchants, isLoading } = useQuery({
    queryKey: ["admin-merchants", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("merchants")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter === "active") {
        query = query.eq("is_active", true);
      } else if (statusFilter === "pending") {
        query = query.eq("approval_status", "pending");
      } else if (statusFilter === "verified") {
        query = query.eq("is_verified", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateMerchantMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Record<string, any>;
    }) => {
      const { error } = await supabase
        .from("merchants")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-merchants"] });
      toast.success("Merchant updated");
    },
    onError: () => {
      toast.error("Failed to update merchant");
    },
  });

  const filteredMerchants = merchants?.filter(
    (m) =>
      m.business_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: merchants?.length || 0,
    active: merchants?.filter((m) => m.is_active).length || 0,
    verified: merchants?.filter((m) => m.is_verified).length || 0,
    pending: merchants?.filter((m) => m.approval_status === "pending").length || 0,
  };

  const exportMerchants = () => {
    if (!filteredMerchants?.length) {
      toast.error("No merchants to export");
      return;
    }

    const csv = [
      ["Business Name", "Email", "Phone", "Address", "Type", "Status", "Verified", "Rating", "Deals"].join(","),
      ...filteredMerchants.map((m) =>
        [
          `"${m.business_name}"`,
          m.email || "",
          m.phone || "",
          `"${m.address || ""}"`,
          m.business_type || "",
          m.is_active ? "Active" : "Inactive",
          m.is_verified ? "Yes" : "No",
          m.average_rating || 0,
          m.total_deals || 0,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `merchants-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("Merchants exported!");
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
            <CardTitle className="text-sm font-medium">Total Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Merchants Management
          </CardTitle>
          <CardDescription>Manage merchant accounts and approvals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search merchants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Merchants</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportMerchants} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Merchants Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Deals</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMerchants?.map((merchant) => (
                  <TableRow key={merchant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {merchant.logo_url ? (
                          <img
                            src={merchant.logo_url}
                            alt=""
                            className="w-10 h-10 object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Store className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {merchant.business_name}
                            {merchant.is_verified && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {merchant.address?.substring(0, 30)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{merchant.email}</div>
                        <div className="text-muted-foreground">{merchant.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{merchant.business_type || "General"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {merchant.average_rating?.toFixed(1) || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>{merchant.total_deals || 0}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={merchant.is_active ? "default" : "secondary"}>
                          {merchant.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {merchant.approval_status === "pending" && (
                          <Badge variant="outline" className="text-yellow-600">
                            Pending Approval
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {merchant.approval_status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateMerchantMutation.mutate({
                                  id: merchant.id,
                                  updates: {
                                    approval_status: "approved",
                                    is_active: true,
                                    approved_at: new Date().toISOString(),
                                  },
                                })
                              }
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateMerchantMutation.mutate({
                                  id: merchant.id,
                                  updates: { approval_status: "rejected" },
                                })
                              }
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateMerchantMutation.mutate({
                              id: merchant.id,
                              updates: { is_verified: !merchant.is_verified },
                            })
                          }
                          title={merchant.is_verified ? "Unverify" : "Verify"}
                        >
                          <CheckCircle
                            className={`w-4 h-4 ${
                              merchant.is_verified ? "text-blue-500" : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateMerchantMutation.mutate({
                              id: merchant.id,
                              updates: { is_active: !merchant.is_active },
                            })
                          }
                          title={merchant.is_active ? "Deactivate" : "Activate"}
                        >
                          <Ban
                            className={`w-4 h-4 ${
                              merchant.is_active ? "text-muted-foreground" : "text-destructive"
                            }`}
                          />
                        </Button>
                      </div>
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

export default MerchantsManagement;
