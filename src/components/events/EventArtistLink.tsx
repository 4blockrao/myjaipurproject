import { Link } from 'react-router-dom';
import { User, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { extractArtistFromEvent, eventHasArtist } from '@/utils/artistExtractor';

interface EventArtistLinkProps {
  event: {
    title: string;
    category: string;
    tags?: string[] | null;
    organizer_name?: string | null;
  };
  compact?: boolean;
}

/**
 * Artist link component for event pages
 * Links to the artist hub page for SEO hub-and-spoke structure
 */
export const EventArtistLink = ({ event, compact = false }: EventArtistLinkProps) => {
  // Check if event has a featured artist
  if (!eventHasArtist(event)) {
    return null;
  }

  const artist = extractArtistFromEvent(event);
  
  if (!artist) {
    return null;
  }

  const artistInitials = artist.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (compact) {
    return (
      <Link 
        to={`/artists/${artist.slug}`}
        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <User className="w-4 h-4" />
        {artist.name}
        <ExternalLink className="w-3 h-3" />
      </Link>
    );
  }

  return (
    <Link 
      to={`/artists/${artist.slug}`}
      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
    >
      <Avatar className="w-12 h-12 border-2 border-primary/20">
        <AvatarFallback className="bg-primary/10 text-primary font-bold">
          {artistInitials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <p className="font-semibold">{artist.name}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {artist.category === 'comedy' ? 'Stand-up Comedian' : 
           artist.category === 'music' ? 'Music Artist' : 'Performer'}
        </p>
      </div>
      
      <ExternalLink className="w-4 h-4 text-muted-foreground" />
    </Link>
  );
};

export default EventArtistLink;
