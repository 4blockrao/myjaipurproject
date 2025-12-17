import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Users,
  Ticket,
  IndianRupee,
  Eye,
  Edit,
  BarChart3,
  Download,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import NativeBottomNav from "@/components/home/NativeBottomNav";

const EventOrganizerDashboardPage = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  // Fetch organizer's events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["organizer-events", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", user.id)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch registrations for all organizer's events
  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ["organizer-registrations", user?.id],
    queryFn: async () => {
      if (!events?.length) return [];

      const eventIds = events.map((e) => e.id);
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*, events(title, start_date)")
        .in("event_id", eventIds)
        .order("registered_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!events?.length,
  });

  // Calculate stats
  const stats = {
    totalEvents: events?.length || 0,
    upcomingEvents: events?.filter((e) => new Date(e.start_date) > new Date()).length || 0,
    totalRegistrations: registrations?.length || 0,
    totalRevenue:
      registrations?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0,
    totalTickets: registrations?.reduce((sum, r) => sum + (r.ticket_count || 1), 0) || 0,
  };

  const updateRegistrationStatus = async (
    registrationId: string,
    status: string
  ) => {
    const { error } = await supabase
      .from("event_registrations")
      .update({ status })
      .eq("id", registrationId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Registration ${status}`);
    }
  };

  const exportRegistrations = (eventId?: string) => {
    const data = eventId
      ? registrations?.filter((r) => r.event_id === eventId)
      : registrations;

    if (!data?.length) {
      toast.error("No registrations to export");
      return;
    }

    const csv = [
      ["Name", "Email", "Phone", "Tickets", "Amount", "Status", "Event", "Date"].join(","),
      ...data.map((r) =>
        [
          r.name,
          r.email,
          r.phone || "",
          r.ticket_count,
          r.total_amount || 0,
          r.status,
          (r.events as any)?.title || "",
          format(new Date(r.registered_at || ""), "yyyy-MM-dd HH:mm"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("Registrations exported!");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign in Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to access your event organizer dashboard.
            </p>
            <Link to="/">
              <Button>Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/events">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Event Organizer</h1>
              <p className="text-xs text-muted-foreground">Manage your events</p>
            </div>
          </div>
          <Link to="/events/create">
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              New Event
            </Button>
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.upcomingEvents} upcoming
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTickets} tickets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalEvents
                  ? Math.round(stats.totalTickets / stats.totalEvents)
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">Per event</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="w-4 h-4" />
              My Events
            </TabsTrigger>
            <TabsTrigger value="registrations" className="gap-2">
              <Users className="w-4 h-4" />
              Registrations
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            {eventsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : events?.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Events Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first event to start selling tickets
                  </p>
                  <Link to="/events/create">
                    <Button>Create Event</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              events?.map((event) => {
                const eventRegs = registrations?.filter(
                  (r) => r.event_id === event.id
                );
                const ticketsSold =
                  eventRegs?.reduce((sum, r) => sum + (r.ticket_count || 1), 0) ||
                  0;
                const revenue =
                  eventRegs?.reduce((sum, r) => sum + (r.total_amount || 0), 0) ||
                  0;
                const isPast = new Date(event.start_date) < new Date();

                return (
                  <Card key={event.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription>
                            {format(
                              new Date(event.start_date),
                              "EEEE, MMM d, yyyy • h:mm a"
                            )}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            isPast
                              ? "secondary"
                              : event.status === "published"
                              ? "default"
                              : "outline"
                          }
                        >
                          {isPast ? "Past" : event.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                          <div className="font-bold">{eventRegs?.length || 0}</div>
                          <div className="text-xs text-muted-foreground">
                            Registrations
                          </div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <Ticket className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                          <div className="font-bold">{ticketsSold}</div>
                          <div className="text-xs text-muted-foreground">
                            Tickets
                          </div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <IndianRupee className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                          <div className="font-bold">
                            ₹{revenue.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Revenue
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Link to={`/events/${event.slug}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => exportRegistrations(event.id)}
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Registrations Tab */}
          <TabsContent value="registrations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">All Registrations</h3>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => exportRegistrations()}
              >
                <Download className="w-4 h-4" />
                Export All
              </Button>
            </div>

            {registrationsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : registrations?.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Registrations Yet</h3>
                  <p className="text-muted-foreground">
                    Registrations will appear here when people sign up
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Attendee</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>Tickets</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registrations?.map((reg) => (
                          <TableRow key={reg.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{reg.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {reg.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {(reg.events as any)?.title}
                              </div>
                            </TableCell>
                            <TableCell>{reg.ticket_count || 1}</TableCell>
                            <TableCell>
                              {reg.total_amount ? `₹${reg.total_amount}` : "Free"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  reg.status === "confirmed"
                                    ? "default"
                                    : reg.status === "cancelled"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {reg.status === "confirmed" && (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                )}
                                {reg.status === "pending_payment" && (
                                  <Clock className="w-3 h-3 mr-1" />
                                )}
                                {reg.status === "cancelled" && (
                                  <XCircle className="w-3 h-3 mr-1" />
                                )}
                                {reg.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {reg.status === "pending_payment" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      updateRegistrationStatus(reg.id, "confirmed")
                                    }
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                {reg.status !== "cancelled" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      updateRegistrationStatus(reg.id, "cancelled")
                                    }
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <NativeBottomNav />
    </div>
  );
};

export default EventOrganizerDashboardPage;
