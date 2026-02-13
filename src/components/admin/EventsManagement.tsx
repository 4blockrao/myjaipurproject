import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Calendar,
  Eye,
  Trash2,
  Star,
  StarOff,
  CheckCircle,
  XCircle,
  Search,
  Download,
  Globe,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventScraper } from "@/components/admin/EventScraper";
import { EventEditor } from "@/components/admin/EventEditor";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const EventsManagement = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState<"upcoming" | "past" | "all">("upcoming");
  const [editingEvent, setEditingEvent] = useState<any>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: registrationCounts } = useQuery({
    queryKey: ["admin-event-registration-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("event_id, ticket_count");

      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach((r) => {
        counts[r.event_id] = (counts[r.event_id] || 0) + (r.ticket_count || 1);
      });
      return counts;
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Record<string, any>;
    }) => {
      const { error } = await supabase.from("events").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Event updated");
    },
    onError: () => {
      toast.error("Failed to update event");
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Event deleted");
    },
    onError: () => {
      toast.error("Failed to delete event");
    },
  });

  const now = new Date().toISOString();
  const upcomingEvents = events?.filter((e) => e.start_date >= now) || [];
  const pastEvents = events?.filter((e) => e.start_date < now) || [];

  const timeFilteredEvents = timeFilter === "upcoming" ? upcomingEvents 
    : timeFilter === "past" ? pastEvents 
    : events || [];

  const filteredEvents = timeFilteredEvents.filter(
    (event) =>
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.category?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: events?.length || 0,
    upcoming: upcomingEvents.length,
    past: pastEvents.length,
    published: events?.filter((e) => e.status === "published").length || 0,
    draft: events?.filter((e) => e.status === "draft").length || 0,
    featured: events?.filter((e) => e.is_featured).length || 0,
  };

  const exportEvents = () => {
    if (!filteredEvents?.length) {
      toast.error("No events to export");
      return;
    }

    const csv = [
      ["Title", "Category", "Date", "Venue", "Status", "Featured", "Registrations", "Price"].join(","),
      ...filteredEvents.map((e) =>
        [
          `"${e.title}"`,
          e.category,
          format(new Date(e.start_date), "yyyy-MM-dd"),
          `"${e.venue_name || "Online"}"`,
          e.status,
          e.is_featured ? "Yes" : "No",
          registrationCounts?.[e.id] || 0,
          e.is_free ? "Free" : e.ticket_price,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `events-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("Events exported!");
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Tabs defaultValue="manage" className="space-y-6">
      <TabsList>
        <TabsTrigger value="manage" className="gap-2">
          <Calendar className="w-4 h-4" />
          Manage Events
        </TabsTrigger>
        <TabsTrigger value="scraper" className="gap-2">
          <Globe className="w-4 h-4" />
          Import from Web
        </TabsTrigger>
      </TabsList>

      <TabsContent value="manage" className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className={timeFilter === "upcoming" ? "ring-2 ring-primary" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium cursor-pointer" onClick={() => setTimeFilter("upcoming")}>Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
          </CardContent>
        </Card>
        <Card className={timeFilter === "past" ? "ring-2 ring-primary" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium cursor-pointer" onClick={() => setTimeFilter("past")}>Past</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.past}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.featured}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Events Management
          </CardTitle>
          <CardDescription>
            Manage all events on the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="all">All Events</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportEvents} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Registrations</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents?.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {event.cover_image && (
                          <img
                            src={event.cover_image}
                            alt=""
                            className="w-12 h-8 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {event.title}
                            {event.is_featured && (
                              <Star className="w-4 h-4 text-primary fill-primary" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {event.venue_name || "Online"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(event.start_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {event.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{registrationCounts?.[event.id] || 0}</TableCell>
                    <TableCell>
                      {event.is_free ? (
                        <Badge variant="secondary">Free</Badge>
                      ) : (
                        `₹${event.ticket_price}`
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          event.status === "published" ? "default" : "secondary"
                        }
                      >
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingEvent(event)}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateEventMutation.mutate({
                              id: event.id,
                              updates: { is_featured: !event.is_featured },
                            })
                          }
                          title={event.is_featured ? "Unfeature" : "Feature"}
                        >
                          {event.is_featured ? (
                            <StarOff className="w-4 h-4" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </Button>
                        {event.status === "draft" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateEventMutation.mutate({
                                id: event.id,
                                updates: {
                                  status: "published",
                                  published_at: new Date().toISOString(),
                                },
                              })
                            }
                            title="Publish"
                          >
                            <CheckCircle className="w-4 h-4 text-primary" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateEventMutation.mutate({
                                id: event.id,
                                updates: { status: "draft" },
                              })
                            }
                            title="Unpublish"
                          >
                            <XCircle className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        )}
                        <a
                          href={`/events/${event.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm" title="View">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </a>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Delete">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{event.title}" and all
                                associated registrations. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteEventMutation.mutate(event.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="scraper">
        <EventScraper />
      </TabsContent>

      {/* Event Editor Modal */}
      {editingEvent && (
        <EventEditor
          event={editingEvent}
          open={!!editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </Tabs>
  );
};

export default EventsManagement;
