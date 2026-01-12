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
  Ticket, Calendar, Users, DollarSign, Search, Download, 
  Mail, Phone, CheckCircle2, Clock, XCircle 
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  ticket_count: number;
  total_amount: number;
  status: string;
  registration_code: string;
  registered_at: string;
  cancelled_at: string | null;
  attended_at: string | null;
  events?: {
    title: string;
    start_date: string;
    venue_name: string | null;
  };
}

const EventRegistrationsManagement = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["admin-event-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          *,
          events (title, start_date, venue_name)
        `)
        .order("registered_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      return data as EventRegistration[];
    },
  });

  const filteredRegistrations = registrations?.filter((reg) => {
    const matchesSearch =
      reg.name?.toLowerCase().includes(search.toLowerCase()) ||
      reg.email?.toLowerCase().includes(search.toLowerCase()) ||
      reg.registration_code?.toLowerCase().includes(search.toLowerCase()) ||
      reg.events?.title?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || reg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: registrations?.length || 0,
    pending: registrations?.filter((r) => r.status === "pending").length || 0,
    confirmed: registrations?.filter((r) => r.status === "confirmed").length || 0,
    cancelled: registrations?.filter((r) => r.status === "cancelled").length || 0,
    totalRevenue: registrations?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0,
    totalTickets: registrations?.reduce((sum, r) => sum + (r.ticket_count || 0), 0) || 0,
  };

  const exportRegistrations = () => {
    if (!filteredRegistrations?.length) {
      toast.error("No registrations to export");
      return;
    }

    const csv = [
      ["Name", "Email", "Phone", "Event", "Tickets", "Amount", "Status", "Code", "Registered At"].join(","),
      ...filteredRegistrations.map((r) =>
        [
          `"${r.name || ""}"`,
          r.email || "",
          r.phone || "",
          `"${r.events?.title || ""}"`,
          r.ticket_count || 0,
          r.total_amount || 0,
          r.status || "",
          r.registration_code || "",
          r.registered_at ? format(new Date(r.registered_at), "yyyy-MM-dd HH:mm") : "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-registrations-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("Registrations exported!");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      case "attended":
        return <Badge className="bg-blue-500"><CheckCircle2 className="w-3 h-3 mr-1" />Attended</Badge>;
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Registrations</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Total Tickets</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.totalTickets}</p>
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
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Confirmed</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.confirmed}</p>
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
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Event Registrations
          </CardTitle>
          <CardDescription>View and manage all event ticket purchases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, code or event..."
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
              <option value="cancelled">Cancelled</option>
              <option value="attended">Attended</option>
            </select>
            <Button variant="outline" onClick={exportRegistrations} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations?.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{reg.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {reg.email}
                        </div>
                        {reg.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {reg.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-sm truncate max-w-[200px]">
                          {reg.events?.title || "Unknown Event"}
                        </p>
                        {reg.events?.start_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(reg.events.start_date), "MMM d, yyyy")}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{reg.ticket_count} tickets</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{(reg.total_amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(reg.status || "pending")}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{reg.registration_code}</code>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {reg.registered_at && format(new Date(reg.registered_at), "MMM d, HH:mm")}
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

export default EventRegistrationsManagement;
