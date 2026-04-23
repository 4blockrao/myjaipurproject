import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CategoryBadge from '@/components/guides/CategoryBadge';

export default function GuidesHomeSection() {
  const { data: guides = [], isLoading } = useQuery({
    queryKey: ['home-guides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, slug, title, excerpt, category, article_type, published_at')
        .eq('status', 'published')
        .eq('type', 'guide')
        .eq('is_evergreen', true)
        .order('published_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Essential Guides for IPL 2026</h2>
            <p className="text-xs text-muted-foreground">Tickets, stadium, traffic and match-day help</p>
          </div>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-primary">
          <Link to="/guides">View All <ChevronRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((item) => <Skeleton key={item} className="h-32 rounded-2xl" />)}
        </div>
      ) : guides.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-3">
          {guides.map((guide) => (
            <Link key={guide.id} to={`/guide/${guide.slug}`} className="rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-1 hover:shadow-heritage">
              <CategoryBadge category={guide.category} articleType={guide.article_type} />
              <h3 className="mt-3 line-clamp-2 font-bold text-card-foreground">{guide.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{guide.excerpt || 'Your quick IPL 2026 Jaipur guide from JaipurCircle.'}</p>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
