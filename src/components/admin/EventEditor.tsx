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

export const EventEditor = ({ event, open, onClose }: EventEditorProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
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
    cover_image: "",
    registration_url: "",
    organizer_name: "",
    status: "draft",
    is_featured: false,
    meta_title: "",
    meta_description: "",
    tags: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        short_description: event.short_description || "",
        description: event.description || "",
        start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : "",
        end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : "",
        venue_name: event.venue_name || "",
        venue_address: event.venue_address || "",
        locality: event.locality || "",
        category: event.category || "other",
        ticket_price: event.ticket_price?.toString() || "",
        is_free: event.is_free || false,
        cover_image: event.cover_image || "",
        registration_url: event.registration_url || "",
        organizer_name: event.organizer_name || "",
        status: event.status || "draft",
        is_featured: event.is_featured || false,
        meta_title: event.meta_title || "",
        meta_description: event.meta_description || "",
        tags: event.tags?.join(", ") || "",
      });
    }
  }, [event]);

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", event.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Event updated successfully");
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to update event: " + error.message);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `event-${event.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(fileName, file);

      if (uploadError) {
        // If bucket doesn't exist, use a URL input instead
        toast.error("Image upload failed. Please use an image URL instead.");
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("event-images")
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, cover_image: publicUrl }));
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Upload failed. Please use an image URL.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = {
      ...formData,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      ticket_price: formData.ticket_price ? parseFloat(formData.ticket_price) : null,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    };

    updateMutation.mutate(updates);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Edit Event
          </DialogTitle>
          <DialogDescription>
            Make changes to the event. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description</Label>
              <Textarea
                id="short_description"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                rows={2}
                placeholder="Brief description for cards and previews"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description (Markdown supported)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
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

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Date & Time</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date & Time</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date & Time (optional)</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Venue */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Venue
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue_name">Venue Name</Label>
                <Input
                  id="venue_name"
                  value={formData.venue_name}
                  onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                  placeholder="e.g., Jawahar Kala Kendra"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locality">Locality</Label>
                <Input
                  id="locality"
                  value={formData.locality}
                  onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                  placeholder="e.g., c-scheme"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue_address">Full Address</Label>
              <Input
                id="venue_address"
                value={formData.venue_address}
                onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
                placeholder="Complete venue address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizer_name">Organizer Name</Label>
              <Input
                id="organizer_name"
                value={formData.organizer_name}
                onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
                placeholder="Event organizer"
              />
            </div>
          </div>

          {/* Tickets & Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Tickets & Pricing</h3>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_free"
                  checked={formData.is_free}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, is_free: checked, ticket_price: checked ? "" : formData.ticket_price })
                  }
                />
                <Label htmlFor="is_free">Free Event</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label htmlFor="is_featured">Featured Event</Label>
              </div>
            </div>

            {!formData.is_free && (
              <div className="space-y-2">
                <Label htmlFor="ticket_price">Ticket Price (₹)</Label>
                <Input
                  id="ticket_price"
                  type="number"
                  value={formData.ticket_price}
                  onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
                  placeholder="Starting price"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="registration_url" className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Registration/Booking URL
              </Label>
              <Input
                id="registration_url"
                type="url"
                value={formData.registration_url}
                onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                placeholder="https://bookmyshow.com/..."
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Event Image
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="cover_image">Cover Image URL</Label>
              <Input
                id="cover_image"
                type="url"
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                placeholder="https://example.com/image.jpg"
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
              {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
            </div>

            {formData.cover_image && (
              <div className="mt-2">
                <img
                  src={formData.cover_image}
                  alt="Preview"
                  className="w-40 h-24 object-cover rounded-lg border"
                />
              </div>
            )}
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
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value.slice(0, 60) })}
                placeholder="SEO-optimized title for search engines"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">{formData.meta_title.length}/60</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Description (max 160 chars)</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value.slice(0, 160) })}
                placeholder="SEO-optimized description for search results"
                rows={2}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">{formData.meta_description.length}/160</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="comedy, jaipur, stand-up, live-show"
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
