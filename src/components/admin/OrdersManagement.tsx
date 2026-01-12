import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { 
  ShoppingBag, DollarSign, Search, Download, 
  Package, Clock, CheckCircle2, XCircle, Truck, User
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Order {
  id: string;
  order_code: string;
  user_id: string | null;
  deal_id: string | null;
  merchant_id: string | null;
  quantity: number;
  total_amount: number;
  jaicoin_used: number | null;
  status: string;
  payment_method: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_address: string | null;
  order_notes: string | null;
  created_at: string;
  deals?: {
    title: string;
    discounted_price: number | null;
    image_url: string | null;
  };
  merchants?: {
    business_name: string;
  };
  profiles?: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

const OrdersManagement = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          deals (title, discounted_price, image_url),
          merchants (business_name)
        `)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      // Fetch user profiles for each order
      const ordersWithProfiles = await Promise.all(
        (data || []).map(async (order) => {
          if (order.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, email, phone")
              .eq("id", order.user_id)
              .single();
            return { ...order, profiles: profile };
          }
          return order;
        })
      );

      return ordersWithProfiles as Order[];
    },
  });

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.order_code?.toLowerCase().includes(search.toLowerCase()) ||
      order.deals?.title?.toLowerCase().includes(search.toLowerCase()) ||
      order.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.profiles?.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter((o) => o.status === "pending").length || 0,
    confirmed: orders?.filter((o) => o.status === "confirmed").length || 0,
    delivered: orders?.filter((o) => o.status === "delivered").length || 0,
    cancelled: orders?.filter((o) => o.status === "cancelled").length || 0,
    totalRevenue: orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
    totalJaicoinUsed: orders?.reduce((sum, o) => sum + (o.jaicoin_used || 0), 0) || 0,
  };

  const exportOrders = () => {
    if (!filteredOrders?.length) {
      toast.error("No orders to export");
      return;
    }

    const csv = [
      ["Order Code", "Customer", "Email", "Phone", "Deal", "Merchant", "Quantity", "Amount", "JaiCoin Used", "Status", "Payment Method", "Created At"].join(","),
      ...filteredOrders.map((o) =>
        [
          o.order_code || "",
          `"${o.customer_name || o.profiles?.full_name || ""}"`,
          o.profiles?.email || "",
          o.customer_phone || o.profiles?.phone || "",
          `"${o.deals?.title || ""}"`,
          `"${o.merchants?.business_name || ""}"`,
          o.quantity || 0,
          o.total_amount || 0,
          o.jaicoin_used || 0,
          o.status || "",
          o.payment_method || "",
          o.created_at ? format(new Date(o.created_at), "yyyy-MM-dd HH:mm") : "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("Orders exported!");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-blue-500"><CheckCircle2 className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      case "delivered":
        return <Badge className="bg-green-500"><Truck className="w-3 h-3 mr-1" />Delivered</Badge>;
      case "processing":
        return <Badge className="bg-yellow-500"><Package className="w-3 h-3 mr-1" />Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Orders</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <p className="text-2xl font-bold mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Confirmed</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.confirmed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Delivered</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.delivered}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Cancelled</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.cancelled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">JaiCoin Used</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.totalJaicoinUsed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Orders Management
          </CardTitle>
          <CardDescription>View and manage all deal purchases and orders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, order code, deal..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button variant="outline" onClick={exportOrders} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Deal</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {order.order_code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              {order.customer_name || order.profiles?.full_name || "Guest"}
                            </span>
                          </div>
                          {order.profiles?.email && (
                            <p className="text-xs text-muted-foreground">{order.profiles.email}</p>
                          )}
                          {(order.customer_phone || order.profiles?.phone) && (
                            <p className="text-xs text-muted-foreground">
                              {order.customer_phone || order.profiles?.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm truncate max-w-[200px]">
                          {order.deals?.title || "Unknown Deal"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.merchants?.business_name || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{order.quantity}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold">₹{(order.total_amount || 0).toLocaleString()}</p>
                          {order.jaicoin_used ? (
                            <p className="text-xs text-muted-foreground">
                              -{order.jaicoin_used} JC
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status || "pending")}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.created_at && format(new Date(order.created_at), "MMM d, HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersManagement;
