import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar, Upload, Link2, MapPin, Tag } from "lucide-react";

interface EventEditorProps {
  event: any;
  open: boolean;
  onClose: () => void;
}

const EVENT_CATEGORIES = [
  "comedy",
  "music",
  "party",
  "workshop",
  "art",
  "business",
  "community",
  "talk",
  "performance",
  "family",
  "sports",
  "other",
];

const EVENT_LIFECYCLE_STATUSES = ["upcoming", "ongoing", "past", "cancelled"];
const EDITORIAL_STATUSES = ["draft", "published", "archived"];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const EventEditor = ({ event, open, onClose }: EventEditorProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    short_description: "",
    description: "",
    start_date: "",
    end_date: "",
    venue_name: "",
    venue_address: "",
    locality: "",
    category: "other",
    locality_id: "",
    venue_id: "",
    ticket_price: "",
    is_free: false,
    image_url: "",
    cover_image_url: "",
    cover_image: "",
    registration_url: "",
    organizer_name: "",
    status: "upcoming",
    editorial_status: "draft",
    is_featured: false,
    is_indexable: true,
    source_url: "",
    source_label: "",
    meta_title: "",
    meta_description: "",
    tags: "",
  });

  const [uploading, setUploading] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([]);

  const { data: localities = [] } = useQuery({
    queryKey: ["event-editor-localities"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("localities")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (error) {
        console.warn("Localities load failed:", error.message);
        return [];
      }

      return data || [];
    },
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["event-editor-venues"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("venues")
        .select("id, name, slug, locality_id")
        .order("name", { ascending: true });

      if (error) {
        console.warn("Venues load failed:", error.message);
        return [];
      }

      return data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["event-editor-categories"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("categories")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (error) {
        console.warn("Categories load failed:", error.message);
        return [];
      }

      return data || [];
    },
  });

  const { data: artists = [] } = useQuery({
    queryKey: ["event-editor-artists"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("artists")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (error) {
        console.warn("Artists load failed:", error.message);
        return [];
      }

      return data || [];
    },
  });

  useEffect(() => {
    if (!event) return;

    const nextTitle = event.title || "";

    setFormData({
      title: nextTitle,
      slug: event.slug || slugify(nextTitle),
      short_description: event.short_description || "",
      description: event.description || "",
      start_date: event.start_date
        ? new Date(event.start_date).toISOString().slice(0, 16)
        : "",
      end_date: event.end_date
        ? new Date(event.end_date).toISOString().slice(0, 16)
        : "",
      venue_name: event.venue_name || "",
      venue_address: event.venue_address || "",
      locality: event.locality || "",
      category: event.category || "other",
      locality_id: event.locality_id || "",
      venue_id: event.venue_id || "",
      ticket_price: event.ticket_price?.toString() || "",
      is_free: event.is_free || false,
      image_url: event.image_url || "",
      cover_image_url: event.cover_image_url || event.cover_image || "",
      cover_image: event.cover_image || event.cover_image_url || "",
      registration_url: event.registration_url || "",
      organizer_name: event.organizer_name || "",
      status: event.status || "upcoming",
      editorial_status: event.editorial_status || "draft",
      is_featured: event.is_featured || false,
      is_indexable:
        typeof event.is_indexable === "boolean" ? event.is_indexable : true,
      source_url: event.source_url || "",
      source_label: event.source_label || "",
      meta_title: event.meta_title || "",
      meta_description: event.meta_description || "",
      tags: Array.isArray(event.tags) ? event.tags.join(", ") : "",
    });
  }, [event]);

  useEffect(() => {
    const loadRelations = async () => {
      if (!event?.id) return;

      try {
        const { data: eventCategoryRows } = await (supabase as any)
          .from("event_categories")
          .select("category_id")
          .eq("event_id", event.id);

        setSelectedCategoryIds(
          (eventCategoryRows || []).map((row: any) => row.category_id).filter(Boolean)
        );
      } catch (err) {
        console.warn("Event categories load skipped");
      }

      try {
        const { data: eventArtistRows } = await (supabase as any)
          .from("event_artists")
          .select("artist_id")
          .eq("event_id", event.id);

        setSelectedArtistIds(
          (eventArtistRows || []).map((row: any) => row.artist_id).filter(Boolean)
        );
      } catch (err) {
        console.warn("Event artists load skipped");
      }
    };

    loadRelations();
  }, [event?.id]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const selectedLocality =
        localities.find((item: any) => item.id === formData.locality_id) || null;

      const selectedVenue =
        venues.find((item: any) => item.id === formData.venue_id) || null;

      const selectedCategoryObjects = categories.filter((item: any) =>
        selectedCategoryIds.includes(item.id)
      );

      const updates: Record<string, any> = {
        title: formData.title,
        slug: formData.slug || slugify(formData.title),
        short_description: formData.short_description,
        description: formData.description,
        start_date: formData.start_date
          ? new Date(formData.start_date).toISOString()
          : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        venue_name: selectedVenue?.name || formData.venue_name || null,
        venue_address: formData.venue_address || null,
        locality: selectedLocality?.slug || formData.locality || null,
        category:
          selectedCategoryObjects[0]?.slug || formData.category || EVENT_CATEGORIES[0],
        locality_id: formData.locality_id || null,
        venue_id: formData.venue_id || null,
        ticket_price:
          formData.is_free || !formData.ticket_price
            ? null
            : parseFloat(formData.ticket_price),
        is_free: formData.is_free,
        image_url: formData.image_url || null,
        cover_image_url: formData.cover_image_url || null,
        cover_image: formData.cover_image_url || null,
        registration_url: formData.registration_url || null,
        organizer_name: formData.organizer_name || null,
        status: formData.status,
        editorial_status: formData.editorial_status,
        is_featured: formData.is_featured,
        is_indexable: formData.is_indexable,
        source_url: formData.source_url || null,
        source_label: formData.source_label || null,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        updated_at: new Date().toISOString(),
      };

      if (formData.editorial_status === "published" && !event?.published_at) {
        updates.published_at = new Date().toISOString();
      }

      const { error } = await supabase.from("events").update(updates).eq("id", event.id);
      if (error) throw error;

      try {
        await (supabase as any).from("event_categories").delete().eq("event_id", event.id);

        if (selectedCategoryIds.length > 0) {
          const rows = selectedCategoryIds.map((categoryId) => ({
            event_id: event.id,
            category_id: categoryId,
          }));

          await (supabase as any).from("event_categories").insert(rows);
        }
      } catch (err) {
        console.warn("Event categories sync skipped");
      }

      try {
        await (supabase as any).from("event_artists").delete().eq("event_id", event.id);

        if (selectedArtistIds.length > 0) {
          const rows = selectedArtistIds.map((artistId) => ({
            event_id: event.id,
            artist_id: artistId,
          }));

          await (supabase as any).from("event_artists").insert(rows);
        }
      } catch (err) {
        console.warn("Event artists sync skipped");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Event updated successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error("Failed to update event: " + error.message);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !event?.id) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `event-${event.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(fileName, file);

      if (uploadError) {
        toast.error("Image upload failed. Please use an image URL instead.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("event-images").getPublicUrl(fileName);

      setFormData((prev) => ({
        ...prev,
        image_url: publicUrl,
        cover_image_url: publicUrl,
        cover_image: publicUrl,
      }));

      toast.success("Image uploaded");
    } catch (error) {
      toast.error("Upload failed. Please use an image URL.");
    } finally {
      setUploading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleArtist = (artistId: string) => {
    setSelectedArtistIds((prev) =>
      prev.includes(artistId)
        ? prev.filter((id) => id !== artistId)
        : [...prev, artistId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.slug.trim()) {
      setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }

    updateMutation.mutate();
  };

  const selectedLocality = localities.find(
    (item: any) => item.id === formData.locality_id
  );

  const localityScopedVenues =
    formData.locality_id && venues.length > 0
      ? venues.filter(
          (item: any) =>
            !item.locality_id || item.locality_id === formData.locality_id
        )
      : venues;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Edit Event
          </DialogTitle>
          <DialogDescription>
            Update publishing, lifecycle, location, classification, SEO, and source details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Basic Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                    slug: prev.slug ? prev.slug : slugify(e.target.value),
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: slugify(e.target.value) })
                }
                placeholder="event-slug"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description</Label>
              <Textarea
                id="short_description"
                value={formData.short_description}
                onChange={(e) =>
                  setFormData({ ...formData, short_description: e.target.value })
                }
                rows={2}
                placeholder="Brief description for cards and previews"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={6}
              />
            </div>
          </div>

          {/* Status & Publishing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Lifecycle & Publishing
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Lifecycle Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_LIFECYCLE_STATUSES.map((item) => (
                      <SelectItem key={item} value={item} className="capitalize">
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editorial_status">Editorial Status</Label>
                <Select
                  value={formData.editorial_status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, editorial_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EDITORIAL_STATUSES.map((item) => (
                      <SelectItem key={item} value={item} className="capitalize">
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-6 pb-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_featured: checked })
                    }
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_indexable"
                    checked={formData.is_indexable}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_indexable: checked })
                    }
                  />
                  <Label htmlFor="is_indexable">Indexable</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Date & Time
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date & Time</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date & Time</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Locality</Label>
                <Select
                  value={formData.locality_id || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      locality_id: value === "none" ? "" : value,
                      locality:
                        value === "none"
                          ? ""
                          : localities.find((item: any) => item.id === value)?.slug || "",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select locality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No locality</SelectItem>
                    {localities.map((item: any) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!formData.locality_id ? (
                  <Input
                    value={formData.locality}
                    onChange={(e) =>
                      setFormData({ ...formData, locality: e.target.value })
                    }
                    placeholder="Fallback locality slug/text"
                  />
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Venue</Label>
                <Select
                  value={formData.venue_id || "none"}
                  onValueChange={(value) => {
                    const nextVenue =
                      localityScopedVenues.find((item: any) => item.id === value) || null;

                    setFormData({
                      ...formData,
                      venue_id: value === "none" ? "" : value,
                      venue_name:
                        value === "none" ? formData.venue_name : nextVenue?.name || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No venue</SelectItem>
                    {localityScopedVenues.map((item: any) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!formData.venue_id ? (
                  <Input
                    value={formData.venue_name}
                    onChange={(e) =>
                      setFormData({ ...formData, venue_name: e.target.value })
                    }
                    placeholder="Fallback venue name"
                  />
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue_address">Venue Address</Label>
              <Input
                id="venue_address"
                value={formData.venue_address}
                onChange={(e) =>
                  setFormData({ ...formData, venue_address: e.target.value })
                }
                placeholder="Complete venue address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizer_name">Organizer Name</Label>
              <Input
                id="organizer_name"
                value={formData.organizer_name}
                onChange={(e) =>
                  setFormData({ ...formData, organizer_name: e.target.value })
                }
                placeholder="Event organizer"
              />
            </div>

            {selectedLocality ? (
              <p className="text-xs text-muted-foreground">
                Selected locality: {selectedLocality.name}
              </p>
            ) : null}
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Classification
            </h3>

            <div className="space-y-2">
              <Label>Primary Category (legacy compatibility)</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {categories.length > 0 ? (
              <div className="space-y-2">
                <Label>Category Relations</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map((cat: any) => {
                    const checked = selectedCategoryIds.includes(cat.id);
                    return (
                      <Button
                        key={cat.id}
                        type="button"
                        variant={checked ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => toggleCategory(cat.id)}
                      >
                        {cat.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {artists.length > 0 ? (
              <div className="space-y-2">
                <Label>Artists</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {artists.map((artist: any) => {
                    const checked = selectedArtistIds.includes(artist.id);
                    return (
                      <Button
                        key={artist.id}
                        type="button"
                        variant={checked ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => toggleArtist(artist.id)}
                      >
                        {artist.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {/* Tickets & Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Tickets & Pricing
            </h3>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_free"
                  checked={formData.is_free}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      is_free: checked,
                      ticket_price: checked ? "" : formData.ticket_price,
                    })
                  }
                />
                <Label htmlFor="is_free">Free Event</Label>
              </div>
            </div>

            {!formData.is_free ? (
              <div className="space-y-2">
                <Label htmlFor="ticket_price">Ticket Price (₹)</Label>
                <Input
                  id="ticket_price"
                  type="number"
                  value={formData.ticket_price}
                  onChange={(e) =>
                    setFormData({ ...formData, ticket_price: e.target.value })
                  }
                  placeholder="Starting price"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="registration_url" className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Registration / Booking URL
              </Label>
              <Input
                id="registration_url"
                type="url"
                value={formData.registration_url}
                onChange={(e) =>
                  setFormData({ ...formData, registration_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Source & Media */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Source & Images
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source_url">Source URL</Label>
                <Input
                  id="source_url"
                  type="url"
                  value={formData.source_url}
                  onChange={(e) =>
                    setFormData({ ...formData, source_url: e.target.value })
                  }
                  placeholder="https://bookmyshow.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source_label">Source Label</Label>
                <Input
                  id="source_label"
                  value={formData.source_label}
                  onChange={(e) =>
                    setFormData({ ...formData, source_label: e.target.value })
                  }
                  placeholder="BookMyShow / Insider / Manual"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover_image_url">Cover Image URL</Label>
              <Input
                id="cover_image_url"
                type="url"
                value={formData.cover_image_url}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cover_image_url: e.target.value,
                    cover_image: e.target.value,
                  })
                }
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="max-w-xs"
              />
              {uploading ? (
                <span className="text-sm text-muted-foreground">Uploading...</span>
              ) : null}
            </div>

            {formData.cover_image_url ? (
              <div className="mt-2">
                <img
                  src={formData.cover_image_url}
                  alt="Preview"
                  className="w-40 h-24 object-cover rounded-lg border"
                />
              </div>
            ) : null}
          </div>

          {/* SEO */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Tag className="w-4 h-4" />
              SEO & Tags
            </h3>

            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Title (max 60 chars)</Label>
              <Input
                id="meta_title"
                value={formData.meta_title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    meta_title: e.target.value.slice(0, 60),
                  })
                }
                placeholder="SEO-optimized title for search engines"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {formData.meta_title.length}/60
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_description">
                Meta Description (max 160 chars)
              </Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    meta_description: e.target.value.slice(0, 160),
                  })
                }
                placeholder="SEO-optimized description for search results"
                rows={2}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                {formData.meta_description.length}/160
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="jaipur, event, comedy, live-show"
              />
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventEditor;
