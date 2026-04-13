import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Calendar,
  Eye,
  Archive,
  Star,
  StarOff,
  CheckCircle,
  FileEdit,
  Search,
  Download,
  Globe,
  Pencil,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

type AdminEvent = {
  id: string;
  title: string;
  slug?: string | null;
  short_description?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: "upcoming" | "ongoing" | "past" | "cancelled" | string | null;
  editorial_status?: "draft" | "published" | "archived" | string | null;
  is_indexable?: boolean | null;
  published_at?: string | null;
  updated_at?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  locality?: string | null;
  category?: string | null;
  ticket_price?: number | null;
  is_free?: boolean | null;
  is_featured?: boolean | null;
  registration_url?: string | null;
  organizer_name?: string | null;
  image_url?: string | null;
  cover_image_url?: string | null;
  cover_image?: string | null;
  source_url?: string | null;
  source_label?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  tags?: string[] | null;
};

const getEditorialStatus = (event: AdminEvent) =>
  (event.editorial_status || "draft").toLowerCase();

const getLifecycleStatus = (event: AdminEvent) =>
  (event.status || "upcoming").toLowerCase();

const getEventImage = (event: AdminEvent) =>
  event.cover_image_url || event.image_url || event.cover_image || "";

const formatEventDate = (value?: string | null) => {
  if (!value) return "—";
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return "—";
  }
};

const editorialBadgeVariant = (value: string) => {
  if (value === "published") return "default";
  if (value === "draft") return "secondary";
  return "outline";
};

const lifecycleBadgeClass = (value: string) => {
  if (value === "upcoming") return "bg-green-100 text-green-700 hover:bg-green-100";
  if (value === "ongoing") return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  if (value === "past") return "bg-muted text-muted-foreground hover:bg-muted";
  if (value === "cancelled") return "bg-red-100 text-red-700 hover:bg-red-100";
  return "";
};

const EventsManagement = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editorialFilter, setEditorialFilter] = useState("all");
  const [lifecycleFilter, setLifecycleFilter] = useState("all");
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return (data || []) as AdminEvent[];
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
      (data || []).forEach((r) => {
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
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update event");
    },
  });

  const archiveEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("events")
        .update({ editorial_status: "archived", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Event archived");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to archive event");
    },
  });

  const allEvents = events || [];

  const filteredEvents = allEvents.filter((event) => {
    const editorialStatus = getEditorialStatus(event);
    const lifecycleStatus = getLifecycleStatus(event);

    const haystack = [
      event.title,
      event.slug,
      event.category,
      event.venue_name,
      event.locality,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = !search || haystack.includes(search.toLowerCase());
    const matchesEditorial =
      editorialFilter === "all" || editorialStatus === editorialFilter;
    const matchesLifecycle =
      lifecycleFilter === "all" || lifecycleStatus === lifecycleFilter;

    return matchesSearch && matchesEditorial && matchesLifecycle;
  });

  const stats = {
    total: allEvents.length,
    published: allEvents.filter((e) => getEditorialStatus(e) === "published").length,
    draft: allEvents.filter((e) => getEditorialStatus(e) === "draft").length,
    archived: allEvents.filter((e) => getEditorialStatus(e) === "archived").length,
    upcoming: allEvents.filter((e) => getLifecycleStatus(e) === "upcoming").length,
    past: allEvents.filter((e) => getLifecycleStatus(e) === "past").length,
    featured: allEvents.filter((e) => e.is_featured).length,
  };

  const exportEvents = () => {
    if (!filteredEvents.length) {
      toast.error("No events to export");
      return;
    }

    const csv = [
      [
        "Title",
        "Slug",
        "Editorial Status",
        "Lifecycle Status",
        "Date",
        "Venue",
        "Locality",
        "Category",
        "Registrations",
        "Price",
      ].join(","),
      ...filteredEvents.map((e) =>
        [
          `"${e.title || ""}"`,
          e.slug || "",
          getEditorialStatus(e),
          getLifecycleStatus(e),
          e.start_date ? format(new Date(e.start_date), "yyyy-MM-dd") : "",
          `"${e.venue_name || ""}"`,
          `"${e.locality || ""}"`,
          `"${e.category || ""}"`,
          registrationCounts?.[e.id] || 0,
          e.is_free ? "Free" : e.ticket_price ?? "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `events-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("Events exported");
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <>
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
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className={editorialFilter === "published" ? "ring-2 ring-primary" : ""}>
              <CardHeader className="pb-2">
                <CardTitle
                  className="text-sm font-medium cursor-pointer"
                  onClick={() => setEditorialFilter("published")}
                >
                  Published
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.published}</div>
              </CardContent>
            </Card>

            <Card className={editorialFilter === "draft" ? "ring-2 ring-primary" : ""}>
              <CardHeader className="pb-2">
                <CardTitle
                  className="text-sm font-medium cursor-pointer"
                  onClick={() => setEditorialFilter("draft")}
                >
                  Drafts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">{stats.draft}</div>
              </CardContent>
            </Card>

            <Card className={editorialFilter === "archived" ? "ring-2 ring-primary" : ""}>
              <CardHeader className="pb-2">
                <CardTitle
                  className="text-sm font-medium cursor-pointer"
                  onClick={() => setEditorialFilter("archived")}
                >
                  Archived
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.archived}</div>
              </CardContent>
            </Card>

            <Card className={lifecycleFilter === "upcoming" ? "ring-2 ring-primary" : ""}>
              <CardHeader className="pb-2">
                <CardTitle
                  className="text-sm font-medium cursor-pointer"
                  onClick={() => setLifecycleFilter("upcoming")}
                >
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
              </CardContent>
            </Card>

            <Card className={lifecycleFilter === "past" ? "ring-2 ring-primary" : ""}>
              <CardHeader className="pb-2">
                <CardTitle
                  className="text-sm font-medium cursor-pointer"
                  onClick={() => setLifecycleFilter("past")}
                >
                  Past
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">{stats.past}</div>
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

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Events Management
                  </CardTitle>
                  <CardDescription>
                    Create, edit, publish, archive, and manage events.
                  </CardDescription>
                </div>

                <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Event
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, slug, venue, locality, category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={editorialFilter} onValueChange={setEditorialFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Editorial Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Editorial</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={lifecycleFilter} onValueChange={setLifecycleFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Lifecycle Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Lifecycle</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={exportEvents} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

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
                    {filteredEvents.map((event) => {
                      const editorialStatus = getEditorialStatus(event);
                      const lifecycleStatus = getLifecycleStatus(event);
                      const eventImage = getEventImage(event);

                      return (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {eventImage ? (
                                <img
                                  src={eventImage}
                                  alt=""
                                  className="w-12 h-8 object-cover rounded"
                                />
                              ) : null}

                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {event.title}
                                  {event.is_featured ? (
                                    <Star className="w-4 h-4 text-primary fill-primary" />
                                  ) : null}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {event.venue_name || "Venue not set"}
                                </div>
                                {event.locality ? (
                                  <div className="text-xs text-muted-foreground">
                                    {event.locality}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>{formatEventDate(event.start_date)}</TableCell>

                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {event.category || "uncategorized"}
                            </Badge>
                          </TableCell>

                          <TableCell>{registrationCounts?.[event.id] || 0}</TableCell>

                          <TableCell>
                            {event.is_free ? (
                              <Badge variant="secondary">Free</Badge>
                            ) : event.ticket_price ? (
                              `₹${event.ticket_price}`
                            ) : (
                              "—"
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant={editorialBadgeVariant(editorialStatus)}>
                                {editorialStatus}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`capitalize ${lifecycleBadgeClass(lifecycleStatus)}`}
                              >
                                {lifecycleStatus}
                              </Badge>
                            </div>
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
                                    updates: {
                                      is_featured: !event.is_featured,
                                      updated_at: new Date().toISOString(),
                                    },
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

                              {editorialStatus !== "published" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    updateEventMutation.mutate({
                                      id: event.id,
                                      updates: {
                                        editorial_status: "published",
                                        published_at:
                                          event.published_at || new Date().toISOString(),
                                        updated_at: new Date().toISOString(),
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
                                      updates: {
                                        editorial_status: "draft",
                                        updated_at: new Date().toISOString(),
                                      },
                                    })
                                  }
                                  title="Move to Draft"
                                >
                                  <FileEdit className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              )}

                              {event.slug ? (
                                <a
                                  href={`/events/${event.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="ghost" size="sm" title="Preview">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </a>
                              ) : null}

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" title="Archive">
                                    <Archive className="w-4 h-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Archive Event?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will archive "{event.title}" instead of permanently deleting it.
                                      You can still recover it later if needed.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => archiveEventMutation.mutate(event.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Archive
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {filteredEvents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                          No events found for the current filters.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scraper">
          <EventScraper />
        </TabsContent>
      </Tabs>

      {editingEvent ? (
        <EventEditor
          event={editingEvent}
          open={!!editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      ) : null}

      {isCreateOpen ? (
        <EventEditor
          event={null}
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      ) : null}
    </>
  );
};

export default EventsManagement;
