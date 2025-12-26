import { Sparkles, Users, Clock, Music, Camera, Utensils } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EventHighlightsProps {
  event: {
    title: string;
    category: string;
    description?: string | null;
    is_free?: boolean | null;
    tags?: string[] | null;
  };
}

/**
 * Event Highlights & Experience Section
 * Improves dwell time, skim-read UX, and answers "What to expect"
 */
export const EventHighlights = ({ event }: EventHighlightsProps) => {
  // Generate category-specific highlights
  const getHighlights = () => {
    const categoryHighlights: Record<string, { icon: React.ReactNode; text: string }[]> = {
      'music': [
        { icon: <Music className="w-4 h-4" />, text: 'Live Music Performance' },
        { icon: <Users className="w-4 h-4" />, text: 'Meet Fellow Music Lovers' },
        { icon: <Camera className="w-4 h-4" />, text: 'Photo Opportunities' },
        { icon: <Sparkles className="w-4 h-4" />, text: 'Immersive Sound Experience' },
      ],
      'comedy': [
        { icon: <Sparkles className="w-4 h-4" />, text: 'Live Stand-up Comedy' },
        { icon: <Users className="w-4 h-4" />, text: 'Interactive Audience Moments' },
        { icon: <Utensils className="w-4 h-4" />, text: 'Food & Beverages Available' },
        { icon: <Clock className="w-4 h-4" />, text: '90+ Minutes of Entertainment' },
      ],
      'workshop': [
        { icon: <Sparkles className="w-4 h-4" />, text: 'Hands-on Learning Experience' },
        { icon: <Users className="w-4 h-4" />, text: 'Expert-Led Sessions' },
        { icon: <Camera className="w-4 h-4" />, text: 'Take Home Materials' },
        { icon: <Clock className="w-4 h-4" />, text: 'Certificate of Completion' },
      ],
      'festival': [
        { icon: <Music className="w-4 h-4" />, text: 'Multiple Performances' },
        { icon: <Utensils className="w-4 h-4" />, text: 'Food Stalls & Drinks' },
        { icon: <Users className="w-4 h-4" />, text: 'Community Celebration' },
        { icon: <Camera className="w-4 h-4" />, text: 'Photo Zones & Activities' },
      ],
      'exhibition': [
        { icon: <Sparkles className="w-4 h-4" />, text: 'Curated Art Collection' },
        { icon: <Camera className="w-4 h-4" />, text: 'Photography Allowed' },
        { icon: <Users className="w-4 h-4" />, text: 'Meet the Artists' },
        { icon: <Clock className="w-4 h-4" />, text: 'Self-Paced Viewing' },
      ],
    };

    return categoryHighlights[event.category.toLowerCase()] || [
      { icon: <Sparkles className="w-4 h-4" />, text: 'Unique Experience' },
      { icon: <Users className="w-4 h-4" />, text: 'Connect with Community' },
      { icon: <Clock className="w-4 h-4" />, text: 'Quality Entertainment' },
      { icon: <Camera className="w-4 h-4" />, text: 'Create Memories' },
    ];
  };

  // Generate audience type based on category
  const getAudienceType = () => {
    const audiences: Record<string, string> = {
      'music': 'Music enthusiasts, concert-goers, and fans of live performances',
      'comedy': 'Comedy lovers, young professionals, and groups looking for a fun night out',
      'workshop': 'Learners, hobbyists, and anyone looking to develop new skills',
      'festival': 'Families, friends, and festival enthusiasts',
      'exhibition': 'Art lovers, collectors, and culture enthusiasts',
      'sports': 'Sports fans, athletes, and fitness enthusiasts',
      'kids': 'Families with children, parents, and young learners',
    };
    return audiences[event.category.toLowerCase()] || 'Anyone looking for quality events and experiences in Jaipur';
  };

  const highlights = getHighlights();

  return (
    <Card className="bg-gradient-to-br from-accent/30 to-transparent border-accent/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          What to Expect
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Experience Highlights Grid */}
        <div className="grid grid-cols-2 gap-3">
          {highlights.map((highlight, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-border/50"
            >
              <span className="text-primary">{highlight.icon}</span>
              <span className="text-sm font-medium">{highlight.text}</span>
            </div>
          ))}
        </div>

        {/* Audience Type */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Perfect For</h4>
          <p className="text-sm text-muted-foreground">{getAudienceType()}</p>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.slice(0, 6).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Free Event Highlight */}
        {event.is_free && (
          <div className="p-3 bg-green-600/10 border border-green-600/20 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              ✨ This is a free event — no ticket purchase required!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventHighlights;
