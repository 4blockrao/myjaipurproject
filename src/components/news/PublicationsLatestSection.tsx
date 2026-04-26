import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getPublicationUrl } from '@/utils/publicationUrl';

type ContentType = 'news' | 'guide' | 'explore' | 'story';

interface PublicationsLatestSectionProps {
  /** Restrict to a single content_type. Omit to mix all 4. */
  contentType?: ContentType;
  limit?: number;
  heading?: string;
  className?: string;
}

const typeBadge: Record<string, string> = {
  news: 'bg-blue-500/10 text-blue-600 border-blue-200',
  guide: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  explore: 'bg-orange-500/10 text-orange-600 border-orange-200',
  story: 'bg-purple-500/10 text-purple-600 border-purple-200',
};

export function PublicationsLatestSection({
  contentType,
  limit = 12,
  heading,
  className,
}: PublicationsLatestSectionProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['publications-latest', contentType ?? 'all', limit],
    queryFn: async () => {
      let q = supabase
        .from('publications')
        .select('id, slug, title, excerpt, dek, cover_image_url, content_type, canonical_url, published_at, updated_at')
        .eq('status', 'published')
        .eq('index_status', 'index')
        .eq('is_indexable', true)
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('updated_at', { ascending: false })
        .limit(limit);
      if (contentType) q = q.eq('content_type', contentType);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className={className}>
        {heading && <h2 className="text-lg font-bold text-foreground mb-3">{heading}</h2>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <section className={className}>
      {heading && <h2 className="text-lg font-bold text-foreground mb-3">{heading}</h2>}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
        {data.map((item) => {
          const href = getPublicationUrl(item);
          const summary = item.excerpt || item.dek || '';
          return (
            <li key={item.id}>
              <Link
                to={href}
                className="block h-full rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <Badge variant="outline" className={`text-xs capitalize ${typeBadge[item.content_type] || ''}`}>
                  {item.content_type}
                </Badge>
                <h3 className="mt-2 line-clamp-2 font-semibold text-card-foreground">{item.title}</h3>
                {summary && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{summary}</p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default PublicationsLatestSection;
