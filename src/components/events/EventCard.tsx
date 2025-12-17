import { format } from "date-fns";
import { Calendar, MapPin, Users, Heart, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: {
    id: string;
    slug: string;
    title: string;
    short_description?: string;
    cover_image?: string;
    start_date: string;
    end_date?: string;
    venue_name?: string;
    locality?: string;
    is_online: boolean;
    is_free: boolean;
    ticket_price?: number;
    category: string;
    interested_count: number;
    is_featured: boolean;
  };
  variant?: "default" | "featured" | "compact";
}

const EventCard = ({ event, variant = "default" }: EventCardProps) => {
  const startDate = new Date(event.start_date);
  const dayOfMonth = format(startDate, "d");
  const monthShort = format(startDate, "MMM").toUpperCase();
  const timeStr = format(startDate, "h:mm a");

  if (variant === "compact") {
    return (
      <Link to={`/events/${event.slug}`} className="block">
        <div className="flex gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all">
          <div className="flex flex-col items-center justify-center min-w-[50px] bg-primary/10 rounded-lg p-2">
            <span className="text-lg font-bold text-primary">{dayOfMonth}</span>
            <span className="text-xs text-primary/80">{monthShort}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-1">{event.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {event.is_online ? (
                <span>Online Event</span>
              ) : (
                <>
                  <MapPin className="w-3 h-3" />
                  {event.venue_name || event.locality}
                </>
              )}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {event.is_free ? "Free" : `₹${event.ticket_price}`}
              </Badge>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link to={`/events/${event.slug}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border group">
          <div className="aspect-[16/9] relative">
            <img
              src={event.cover_image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop"}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            {event.is_featured && (
              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                Featured
              </Badge>
            )}
            <div className="absolute top-3 right-3 flex flex-col items-center bg-background/90 backdrop-blur-sm rounded-lg p-2 min-w-[50px]">
              <span className="text-xl font-bold text-primary">{dayOfMonth}</span>
              <span className="text-xs text-muted-foreground">{monthShort}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <Badge variant="secondary" className="mb-2 capitalize">
                {event.category}
              </Badge>
              <h3 className="font-bold text-lg text-white line-clamp-2">{event.title}</h3>
              <div className="flex items-center gap-3 mt-2 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {timeStr}
                </span>
                {!event.is_online && event.locality && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.locality}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link to={`/events/${event.slug}`} className="block">
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all group">
        <div className="aspect-[16/10] relative">
          <img
            src={event.cover_image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop"}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 flex flex-col items-center bg-background/90 backdrop-blur-sm rounded-lg p-2 min-w-[45px]">
            <span className="text-lg font-bold text-primary">{dayOfMonth}</span>
            <span className="text-[10px] text-muted-foreground">{monthShort}</span>
          </div>
          {event.is_featured && (
            <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px]">
              Featured
            </Badge>
          )}
        </div>
        <div className="p-4">
          <Badge variant="outline" className="mb-2 capitalize text-[10px]">
            {event.category}
          </Badge>
          <h3 className="font-semibold line-clamp-2 mb-2">{event.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {event.short_description}
          </p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              {event.is_online ? (
                <span>Online</span>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[100px]">{event.venue_name || event.locality}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Heart className="w-3.5 h-3.5" />
                {event.interested_count}
              </span>
              <Badge variant={event.is_free ? "secondary" : "default"} className="text-xs">
                {event.is_free ? "Free" : `₹${event.ticket_price}`}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
