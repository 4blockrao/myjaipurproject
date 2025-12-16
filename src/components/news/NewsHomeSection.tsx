import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NewsCard } from './NewsCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NewsHomeSection() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['home-news-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    },
  });

  const featuredArticle = articles?.[0];
  const sideArticles = articles?.slice(1, 4) || [];

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Newspaper className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Jaipur News</h2>
            <p className="text-xs text-muted-foreground">Latest from the Pink City</p>
          </div>
        </div>
        <Link to="/news">
          <Button variant="ghost" size="sm" className="text-primary">
            See All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ) : articles?.length === 0 ? (
        <div className="text-center py-8 bg-card rounded-2xl border">
          <p className="text-3xl mb-2">📰</p>
          <p className="text-muted-foreground text-sm">No news yet</p>
          <Link to="/news/create">
            <Button size="sm" className="mt-3">
              Write First Article
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {featuredArticle && (
            <NewsCard article={featuredArticle} variant="featured" />
          )}
          
          <div className="space-y-2">
            {sideArticles.map((article) => (
              <NewsCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
