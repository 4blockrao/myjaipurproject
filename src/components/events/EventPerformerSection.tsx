import { User, Mail, Phone, ExternalLink, Globe, Mic2, Music } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { extractArtistFromEvent, eventHasArtist } from '@/utils/artistExtractor';

interface EventPerformerSectionProps {
  event: {
    title: string;
    organizer_name?: string | null;
    organizer_email?: string | null;
    organizer_phone?: string | null;
    category: string;
    tags?: string[] | null;
  };
}

/**
 * Performer / Organizer Content Block
 * Critical for ranking across artist searches, tour variations, co-events
 * Links to artist hub pages for SEO hub-and-spoke structure
 */
export const EventPerformerSection = ({ event }: EventPerformerSectionProps) => {
  const organizerName = event.organizer_name || 'JaipurCircle Events';
  const organizerInitials = organizerName
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Extract artist info for linking
  const hasArtist = eventHasArtist(event);
  const artist = hasArtist ? extractArtistFromEvent(event) : null;
  
  const artistInitials = artist?.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '';

  // Generate contextual bio based on category
  const getPerformerBio = () => {
    if (artist) {
      const categoryBios: Record<string, string> = {
        'music': `${artist.name} is a celebrated music artist performing live in Jaipur. Known for captivating performances that leave audiences wanting more.`,
        'comedy': `${artist.name} is a popular stand-up comedian bringing laughter to Jaipur. Their unique style and witty observations have earned them a dedicated fan following.`,
      };
      return categoryBios[event.category.toLowerCase()] || 
        `${artist.name} is a talented performer known for delivering memorable experiences to audiences in Jaipur.`;
    }

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

  const getCategoryIcon = () => {
    switch (event.category.toLowerCase()) {
      case 'comedy':
        return <Mic2 className="w-5 h-5 text-primary" />;
      case 'music':
        return <Music className="w-5 h-5 text-primary" />;
      default:
        return <User className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {getCategoryIcon()}
          {artist ? 'About the Artist' : 'About the Organizer'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Artist Section - Primary for artist-driven events */}
        {artist && (
          <Link 
            to={`/artists/${artist.slug}`}
            className="flex items-start gap-4 p-3 -mx-3 rounded-lg hover:bg-primary/5 transition-colors"
          >
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {artistInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{artist.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {artist.category === 'comedy' ? 'Stand-up Comedian' : 
                 artist.category === 'music' ? 'Music Artist' : 'Performer'}
              </p>
              <span className="text-sm text-primary flex items-center gap-1 mt-1">
                View all events <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </Link>
        )}

        {/* Organizer Header - Secondary or primary for non-artist events */}
        {!artist && (
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {organizerInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{organizerName}</h3>
              <p className="text-sm text-muted-foreground capitalize">{event.category} Event Organizer</p>
            </div>
          </div>
        )}

        {/* Bio Summary */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {getPerformerBio()}
        </p>

        {/* Organizer Info - Show below artist if both exist */}
        {artist && organizerName !== 'JaipurCircle Events' && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Organized by</p>
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs bg-muted">
                  {organizerInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{organizerName}</span>
            </div>
          </div>
        )}

        {/* Contact Info */}
        {(event.organizer_email || event.organizer_phone) && (
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
        )}

        {/* Tour / Show Context */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
          <h4 className="text-sm font-medium mb-1">Event Context</h4>
          <p className="text-xs text-muted-foreground">
            {artist 
              ? `This ${event.category.toLowerCase()} event "${event.title}" features ${artist.name}. Check their profile for more upcoming shows in Jaipur.`
              : `This ${event.category.toLowerCase()} event "${event.title}" is part of ${organizerName}'s ongoing series of events in Jaipur.`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventPerformerSection;
