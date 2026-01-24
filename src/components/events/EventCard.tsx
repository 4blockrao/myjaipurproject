import { format } from "date-fns";
import { Calendar, MapPin, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { normalizeImageUrl } from "@/utils/imageUrl";
import { useAnalytics } from "@/contexts/AnalyticsContext";

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
  const { trackClick } = useAnalytics();
  const startDate = new Date(event.start_date);
  const dayOfMonth = format(startDate, "d");
  const monthShort = format(startDate, "MMM").toUpperCase();
  const timeStr = format(startDate, "h:mm a");
  const isoDate = startDate.toISOString();
  const fullDateStr = format(startDate, "EEEE, MMMM d, yyyy 'at' h:mm a");

  const handleEventClick = () => {
    trackClick('event_card', event.title, event.id, `/events/${event.slug}`);
  };

  if (variant === "compact") {
    return (
      <Link 
        to={`/events/${event.slug}`} 
        className="block"
        aria-label={`View ${event.title} event on ${fullDateStr}`}
        onClick={handleEventClick}
      >
        <article 
          className="flex gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
          itemScope 
          itemType="https://schema.org/Event"
        >
          <time 
            dateTime={isoDate}
            className="flex flex-col items-center justify-center min-w-[50px] bg-primary/10 rounded-lg p-2"
            itemProp="startDate"
          >
            <span className="text-lg font-bold text-primary">{dayOfMonth}</span>
            <span className="text-xs text-primary/80">{monthShort}</span>
          </time>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-1" itemProp="name">{event.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1" itemProp="location">
              {event.is_online ? (
                <span>Online Event</span>
              ) : (
                <>
                  <MapPin className="w-3 h-3" aria-hidden="true" />
                  {event.venue_name || event.locality}
                </>
              )}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                <span itemProp="isAccessibleForFree" content={event.is_free ? "true" : "false"}>
                  {event.is_free ? "Free" : `₹${event.ticket_price}`}
                </span>
              </Badge>
            </div>
          </div>
          <meta itemProp="url" content={`https://jaipurcircle.com/events/${event.slug}`} />
        </article>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link 
        to={`/events/${event.slug}`} 
        className="block"
        aria-label={`View featured event: ${event.title}`}
        onClick={handleEventClick}
      >
        <article 
          className="relative overflow-hidden rounded-2xl bg-card border border-border group"
          itemScope 
          itemType="https://schema.org/Event"
        >
          <div className="aspect-[16/9] relative">
            <img
              src={normalizeImageUrl(event.cover_image) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop"}
              alt={`${event.title} - ${event.category} event in ${event.locality || 'Jaipur'}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              itemProp="image"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            {event.is_featured && (
              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                Featured
              </Badge>
            )}
            <time 
              dateTime={isoDate}
              className="absolute top-3 right-3 flex flex-col items-center bg-background/90 backdrop-blur-sm rounded-lg p-2 min-w-[50px]"
              itemProp="startDate"
            >
              <span className="text-xl font-bold text-primary">{dayOfMonth}</span>
              <span className="text-xs text-muted-foreground">{monthShort}</span>
            </time>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <Badge variant="secondary" className="mb-2 capitalize">
                {event.category}
              </Badge>
              <h3 className="font-bold text-lg text-white line-clamp-2" itemProp="name">{event.title}</h3>
              <div className="flex items-center gap-3 mt-2 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>{timeStr}</span>
                </span>
                {!event.is_online && event.locality && (
                  <span className="flex items-center gap-1" itemProp="location" itemScope itemType="https://schema.org/Place">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    <span itemProp="name">{event.locality}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <meta itemProp="url" content={`https://jaipurcircle.com/events/${event.slug}`} />
          <meta itemProp="eventStatus" content="https://schema.org/EventScheduled" />
        </article>
      </Link>
    );
  }

  // Default variant
  return (
    <Link 
      to={`/events/${event.slug}`} 
      className="block"
      aria-label={`View ${event.title} - ${event.category} event`}
      onClick={handleEventClick}
    >
      <article 
        className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all group"
        itemScope 
        itemType="https://schema.org/Event"
      >
        <div className="aspect-[16/10] relative">
          <img
            src={normalizeImageUrl(event.cover_image) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop"}
            alt={`${event.title} - ${event.category} event in ${event.locality || 'Jaipur'}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            itemProp="image"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop";
            }}
          />
          <time 
            dateTime={isoDate}
            className="absolute top-3 left-3 flex flex-col items-center bg-background/90 backdrop-blur-sm rounded-lg p-2 min-w-[45px]"
            itemProp="startDate"
          >
            <span className="text-lg font-bold text-primary">{dayOfMonth}</span>
            <span className="text-[10px] text-muted-foreground">{monthShort}</span>
          </time>
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
          <h3 className="font-semibold line-clamp-2 mb-2" itemProp="name">{event.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3" itemProp="description">
            {event.short_description}
          </p>
          <div className="flex items-center justify-between text-sm">
            <div 
              className="flex items-center gap-1 text-muted-foreground"
              itemProp="location"
              itemScope
              itemType={event.is_online ? "https://schema.org/VirtualLocation" : "https://schema.org/Place"}
            >
              {event.is_online ? (
                <span itemProp="name">Online</span>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="truncate max-w-[100px]" itemProp="name">
                    {event.venue_name || event.locality}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-muted-foreground" aria-label={`${event.interested_count} people interested`}>
                <Heart className="w-3.5 h-3.5" aria-hidden="true" />
                {event.interested_count}
              </span>
              <Badge variant={event.is_free ? "secondary" : "default"} className="text-xs">
                <span itemProp="isAccessibleForFree" content={event.is_free ? "true" : "false"}>
                  {event.is_free ? "Free" : `₹${event.ticket_price}`}
                </span>
              </Badge>
            </div>
          </div>
        </div>
        <meta itemProp="url" content={`https://jaipurcircle.com/events/${event.slug}`} />
        <meta itemProp="eventStatus" content="https://schema.org/EventScheduled" />
      </article>
    </Link>
  );
};

export default EventCard;
