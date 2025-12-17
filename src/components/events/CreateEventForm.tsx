import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Calendar, MapPin, Globe, Clock, Ticket, Image } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  { value: "music", label: "Music" },
  { value: "arts", label: "Arts & Culture" },
  { value: "food", label: "Food & Drinks" },
  { value: "sports", label: "Sports" },
  { value: "business", label: "Business" },
  { value: "community", label: "Community" },
  { value: "education", label: "Education" },
  { value: "festivals", label: "Festivals" },
  { value: "general", label: "General" },
];

const LOCALITIES = [
  "C-Scheme", "Vaishali Nagar", "Mansarovar", "Malviya Nagar",
  "Raja Park", "Tonk Road", "MI Road", "Bani Park",
  "Jagatpura", "Sodala", "Ajmer Road", "JLN Marg"
];

const CreateEventForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isFree, setIsFree] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    description: "",
    category: "general",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    venue_name: "",
    venue_address: "",
    locality: "",
    online_url: "",
    cover_image: "",
    ticket_price: "",
    max_tickets: "",
    organizer_name: "",
    organizer_email: "",
    organizer_phone: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateSlug = (title: string) => {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .trim();
    return `${baseSlug}-${Date.now()}`;
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to create an event");
        return;
      }

      const startDateTime = new Date(`${formData.start_date}T${formData.start_time || "00:00"}`);
      const endDateTime = formData.end_date
        ? new Date(`${formData.end_date}T${formData.end_time || "23:59"}`)
        : null;

      const eventData = {
        title: formData.title,
        slug: generateSlug(formData.title),
        short_description: formData.short_description,
        description: formData.description,
        category: formData.category,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime?.toISOString(),
        venue_name: isOnline ? null : formData.venue_name,
        venue_address: isOnline ? null : formData.venue_address,
        locality: isOnline ? null : formData.locality,
        is_online: isOnline,
        online_url: isOnline ? formData.online_url : null,
        cover_image: formData.cover_image || null,
        is_free: isFree,
        ticket_price: isFree ? null : parseFloat(formData.ticket_price),
        max_tickets: formData.max_tickets ? parseInt(formData.max_tickets) : null,
        organizer_id: user.id,
        organizer_name: formData.organizer_name,
        organizer_email: formData.organizer_email,
        organizer_phone: formData.organizer_phone,
        status: publish ? "published" : "draft",
        published_at: publish ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from("events")
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;

      toast.success(publish ? "Event published successfully!" : "Event saved as draft");
      navigate(`/events/${data.slug}`);
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast.error(error.message || "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Event Details
        </h3>
        
        <div className="space-y-2">
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Give your event a catchy title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(v) => handleChange("category", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="short_description">Short Description</Label>
          <Input
            id="short_description"
            value={formData.short_description}
            onChange={(e) => handleChange("short_description", e.target.value)}
            placeholder="Brief summary (shown in cards)"
            maxLength={150}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Full Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Tell attendees what to expect..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cover_image" className="flex items-center gap-2">
            <Image className="w-4 h-4" /> Cover Image URL
          </Label>
          <Input
            id="cover_image"
            value={formData.cover_image}
            onChange={(e) => handleChange("cover_image", e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      {/* Date & Time */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4" /> Date & Time
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date *</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              type="time"
              value={formData.start_time}
              onChange={(e) => handleChange("start_time", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => handleChange("end_date", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              type="time"
              value={formData.end_time}
              onChange={(e) => handleChange("end_time", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Location
        </h3>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Online Event</span>
          </div>
          <Switch checked={isOnline} onCheckedChange={setIsOnline} />
        </div>

        {isOnline ? (
          <div className="space-y-2">
            <Label htmlFor="online_url">Event Link</Label>
            <Input
              id="online_url"
              value={formData.online_url}
              onChange={(e) => handleChange("online_url", e.target.value)}
              placeholder="Zoom, Google Meet, or streaming link"
            />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="venue_name">Venue Name</Label>
              <Input
                id="venue_name"
                value={formData.venue_name}
                onChange={(e) => handleChange("venue_name", e.target.value)}
                placeholder="e.g., Jawahar Kala Kendra"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue_address">Address</Label>
              <Input
                id="venue_address"
                value={formData.venue_address}
                onChange={(e) => handleChange("venue_address", e.target.value)}
                placeholder="Full address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locality">Locality</Label>
              <Select value={formData.locality} onValueChange={(v) => handleChange("locality", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select locality" />
                </SelectTrigger>
                <SelectContent>
                  {LOCALITIES.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Tickets */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Ticket className="w-4 h-4" /> Tickets
        </h3>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm">Free Event</span>
          <Switch checked={isFree} onCheckedChange={setIsFree} />
        </div>

        {!isFree && (
          <div className="space-y-2">
            <Label htmlFor="ticket_price">Ticket Price (₹)</Label>
            <Input
              id="ticket_price"
              type="number"
              value={formData.ticket_price}
              onChange={(e) => handleChange("ticket_price", e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="max_tickets">Max Tickets (optional)</Label>
          <Input
            id="max_tickets"
            type="number"
            value={formData.max_tickets}
            onChange={(e) => handleChange("max_tickets", e.target.value)}
            placeholder="Leave empty for unlimited"
            min="1"
          />
        </div>
      </div>

      {/* Organizer */}
      <div className="space-y-4">
        <h3 className="font-semibold">Organizer Info</h3>
        
        <div className="space-y-2">
          <Label htmlFor="organizer_name">Organizer Name</Label>
          <Input
            id="organizer_name"
            value={formData.organizer_name}
            onChange={(e) => handleChange("organizer_name", e.target.value)}
            placeholder="Your name or organization"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="organizer_email">Email</Label>
            <Input
              id="organizer_email"
              type="email"
              value={formData.organizer_email}
              onChange={(e) => handleChange("organizer_email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organizer_phone">Phone</Label>
            <Input
              id="organizer_phone"
              value={formData.organizer_phone}
              onChange={(e) => handleChange("organizer_phone", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="outline"
          className="flex-1"
          disabled={isLoading}
        >
          Save Draft
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={isLoading}
          onClick={(e) => handleSubmit(e, true)}
        >
          {isLoading ? "Creating..." : "Publish Event"}
        </Button>
      </div>
    </form>
  );
};

export default CreateEventForm;
