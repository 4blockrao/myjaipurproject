import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NewsCard } from './NewsCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'All', emoji: '📰' },
  { id: 'city', label: 'City', emoji: '🏛️' },
  { id: 'events', label: 'Events', emoji: '🎉' },
  { id: 'food', label: 'Food', emoji: '🍽️' },
  { id: 'culture', label: 'Culture', emoji: '🎭' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
];

interface NewsFeedProps {
  showHeader?: boolean;
  limit?: number;
  showCategories?: boolean;
  filterCategory?: string;
}

export function NewsFeed({ showHeader = true, limit, showCategories = true, filterCategory }: NewsFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState(filterCategory || 'all');

  const { data: articles, isLoading } = useQuery({
    queryKey: ['news-articles', selectedCategory, limit],
    queryFn: async () => {
      let query = supabase
        .from('news_articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory as any);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const featuredArticle = articles?.[0];
  const otherArticles = articles?.slice(1) || [];

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Jaipur News</h2>
        </div>
      )}

      {showCategories && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer whitespace-nowrap px-3 py-1.5 transition-colors',
                selectedCategory === cat.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent'
              )}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.emoji} {cat.label}
            </Badge>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ) : articles?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-2">📰</p>
          <p>No news articles yet</p>
          <p className="text-sm">Be the first to share local news!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {featuredArticle && (
            <NewsCard article={featuredArticle} variant="featured" />
          )}
          
          <div className="grid gap-4 sm:grid-cols-2">
            {otherArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
