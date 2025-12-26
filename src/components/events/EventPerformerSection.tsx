import { User, Mail, Phone, ExternalLink, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

interface EventPerformerSectionProps {
  event: {
    title: string;
    organizer_name?: string | null;
    organizer_email?: string | null;
    organizer_phone?: string | null;
    category: string;
  };
}

/**
 * Performer / Organizer Content Block
 * Critical for ranking across artist searches, tour variations, co-events
 * Enables future artist hub pages and internal clusters
 */
export const EventPerformerSection = ({ event }: EventPerformerSectionProps) => {
  const organizerName = event.organizer_name || 'JaipurCircle Events';
  const organizerInitials = organizerName
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Generate performer slug for future artist pages
  const organizerSlug = organizerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Generate contextual bio based on category
  const getPerformerBio = () => {
    const categoryBios: Record<string, string> = {
      'music': `${organizerName} is a music artist/band performing live in Jaipur. Known for captivating performances and engaging audiences across various venues in Rajasthan.`,
      'comedy': `${organizerName} brings laughter to Jaipur with their unique comedy style. Regular performer at comedy clubs and events across the Pink City.`,
      'workshop': `${organizerName} specializes in conducting interactive workshops and skill development sessions in Jaipur, helping participants learn and grow.`,
      'exhibition': `${organizerName} curates and organizes art exhibitions in Jaipur, showcasing local and contemporary art to diverse audiences.`,
      'festival': `${organizerName} is the organizer behind this festival experience, bringing together artists, performers, and audiences for a memorable celebration.`,
      'sports': `${organizerName} organizes sports events and activities in Jaipur, promoting fitness and healthy competition among participants.`,
    };

    return categoryBios[event.category.toLowerCase()] || 
      `${organizerName} brings quality events and experiences to Jaipur. They are committed to creating memorable moments for attendees across various categories.`;
  };

  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          About the Organizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Organizer Header */}
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {organizerInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{organizerName}</h3>
            <p className="text-sm text-muted-foreground capitalize">{event.category} Event Organizer</p>
            {/* Future: Link to organizer page */}
            <Link 
              to={`/organizers/${organizerSlug}`}
              className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
            >
              View all events <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Bio Summary */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {getPerformerBio()}
        </p>

        {/* Contact Info */}
        <div className="space-y-2 pt-3 border-t border-border/50">
          {event.organizer_email && (
            <a 
              href={`mailto:${event.organizer_email}`}
              className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>{event.organizer_email}</span>
            </a>
          )}
          {event.organizer_phone && (
            <a 
              href={`tel:${event.organizer_phone}`}
              className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{event.organizer_phone}</span>
            </a>
          )}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Globe className="w-4 h-4" />
            <span>Jaipur, Rajasthan</span>
          </div>
        </div>

        {/* Tour / Show Context */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
          <h4 className="text-sm font-medium mb-1">Event Context</h4>
          <p className="text-xs text-muted-foreground">
            This {event.category.toLowerCase()} event "{event.title}" is part of {organizerName}'s ongoing series of events in Jaipur. 
            Check their profile for upcoming shows and past editions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventPerformerSection;
