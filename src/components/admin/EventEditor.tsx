import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  event: any | null;
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

const getInitialFormData = () => ({
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

export const EventEditor = ({ event, open, onClose }: EventEditorProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(getInitialFormData());
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (event) {
      setFormData({
        title: event.title || "",
        slug: event.slug || slugify(event.title || ""),
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
        ticket_price: event.ticket_price?.toString() || "",
        is_free: !!event.is_free,
        image_url: event.image_url || "",
        cover_image_url: event.cover_image_url || event.cover_image || "",
        cover_image: event.cover_image || event.cover_image_url || "",
        registration_url: event.registration_url || "",
        organizer_name: event.organizer_name || "",
        status: event.status || "upcoming",
        editorial_status: event.editorial_status || "draft",
        is_featured: !!event.is_featured,
        is_indexable:
          typeof event.is_indexable === "boolean" ? event.is_indexable : true,
        source_url: event.source_url || "",
        source_label: event.source_label || "",
        meta_title: event.meta_title || "",
        meta_description: event.meta_description || "",
        tags: Array.isArray(event.tags) ? event.tags.join(", ") : "",
      });
    } else {
      setFormData(getInitialFormData());
    }
  }, [event, open]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const slug = formData.slug?.trim() || slugify(formData.title);

      const payload: Record<string, any> = {
        title: formData.title.trim(),
        slug,
        short_description: formData.short_description || null,
        description: formData.description || null,
        start_date: formData.start_date
          ? new Date(formData.start_date).toISOString()
          : null,
        end_date: formData.end_date
          ? new Date(formData.end_date).toISOString()
          : null,
        venue_name: formData.venue_name || null,
        venue_address: formData.venue_address || null,
        locality: formData.locality || null,
        category: formData.category || "other",
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

      if (formData.editorial_status === "published") {
        payload.published_at = event?.published_at || new Date().toISOString();
      }

      if (event?.id) {
        const { error } = await supabase.from("events").update(payload).eq("id", event.id);
        if (error) throw error;
      } else {
        payload.created_at = new Date().toISOString();
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success(event?.id ? "Event updated successfully" : "Event created successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to save event");
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `event-${event?.id || "new"}-${Date.now()}.${fileExt}`;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Event title is required");
      return;
    }

    if (!formData.start_date) {
      toast.error("Start date is required");
      return;
    }

    saveMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {event?.id ? "Edit Event" : "Create Event"}
          </DialogTitle>
          <DialogDescription>
            Fill the required fields, save as draft or publish when ready.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Basic Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
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
              <Label htmlFor="slug">Slug *</Label>
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

          {/* Publishing & Lifecycle */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Publishing & Lifecycle
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lifecycle Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
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
                <Label>Editorial Status *</Label>
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
            </div>

            <div className="flex items-center gap-6 flex-wrap">
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

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Date & Time
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date & Time *</Label>
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

          {/* Venue & Location */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Venue & Location
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue_name">Venue Name</Label>
                <Input
                  id="venue_name"
                  value={formData.venue_name}
                  onChange={(e) =>
                    setFormData({ ...formData, venue_name: e.target.value })
                  }
                  placeholder="e.g., Jawahar Kala Kendra"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locality">Locality</Label>
                <Input
                  id="locality"
                  value={formData.locality}
                  onChange={(e) =>
                    setFormData({ ...formData, locality: e.target.value })
                  }
                  placeholder="e.g., c-scheme"
                />
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
          </div>

          {/* Category & Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Category & Pricing
            </h3>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
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

          {/* Source & Images */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Source & Images
            </h3>

            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="BookMyShow / Manual / Insider"
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
                placeholder="SEO-optimized title"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {formData.meta_title.length}/60
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Description (max 160 chars)</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    meta_description: e.target.value.slice(0, 160),
                  })
                }
                placeholder="SEO-optimized description"
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
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="comedy, jaipur, live-show"
              />
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? event?.id
                  ? "Saving..."
                  : "Creating..."
                : event?.id
                ? "Save Changes"
                : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventEditor;
