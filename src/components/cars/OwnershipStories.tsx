import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, ChevronRight, Star, ThumbsUp, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const OwnershipStories = () => {
  const { data: stories, isLoading } = useQuery({
    queryKey: ['ownership-stories-preview'],
    queryFn: async () => {
      const { data } = await supabase
        .from('car_ownership_stories')
        .select('*, model:car_models(name, slug, brand:car_brands(name, slug))')
        .eq('status', 'approved')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(3);
      return data || [];
    }
  });

  return (
    <section className="py-10 bg-muted/30">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              Real Owner Stories
            </h2>
            <p className="text-muted-foreground mt-1">Experiences from Jaipur car owners</p>
          </div>
          <Link to="/cars/stories">
            <Button variant="ghost" className="text-primary gap-1">
              All Stories <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : stories && stories.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {stories.map((story: any) => (
              <Card key={story.id} className="group hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  {/* Rating */}
                  {story.rating && (
                    <div className="flex items-center gap-1 mb-3">
                      {Array(5).fill(0).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < story.rating ? 'text-yellow-500 fill-current' : 'text-muted'}`} 
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Title */}
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {story.title}
                  </h3>
                  
                  {/* Car Info */}
                  <p className="text-sm text-muted-foreground mt-2">
                    {story.model?.brand?.name} {story.model?.name}
                    {story.ownership_duration_months && (
                      <span className="ml-2">• {Math.round(story.ownership_duration_months / 12)} year owner</span>
                    )}
                  </p>
                  
                  {/* Excerpt */}
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {story.content.substring(0, 100)}...
                  </p>
                  
                  {/* Pros/Cons Preview */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {story.pros?.slice(0, 2).map((pro: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                        ✓ {pro}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button variant="link" className="p-0 h-auto text-primary mt-4">
                    Read Full Story <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Share Your Experience</h3>
              <p className="text-muted-foreground mb-4">Help fellow Jaipurites make informed decisions</p>
              <Link to="/cars/stories/share">
                <Button className="gap-2">
                  <PenLine className="w-4 h-4" /> Write Your Story
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* CTA to share */}
        {stories && stories.length > 0 && (
          <div className="text-center mt-6">
            <Link to="/cars/stories/share">
              <Button variant="outline" className="gap-2">
                <PenLine className="w-4 h-4" /> Share Your Ownership Story
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default OwnershipStories;
