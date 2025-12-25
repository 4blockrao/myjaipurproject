import { MapPin, Calendar, Users } from "lucide-react";

interface EventDiscoverSummaryProps {
  title: string;
  summary: string;
  locality?: string;
  eventType?: string;
  eventCount?: number;
}

const EventDiscoverSummary = ({ 
  title, 
  summary, 
  locality, 
  eventType,
  eventCount 
}: EventDiscoverSummaryProps) => {
  return (
    <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 mb-6">
      <h1 className="text-2xl font-bold text-foreground mb-3">{title}</h1>
      
      <p className="text-muted-foreground leading-relaxed mb-4">
        {summary}
      </p>
      
      <div className="flex flex-wrap gap-4 text-sm">
        {locality && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{locality}, Jaipur</span>
          </div>
        )}
        
        {eventType && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{eventType}</span>
          </div>
        )}
        
        {eventCount !== undefined && eventCount > 0 && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>{eventCount} upcoming events</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDiscoverSummary;
