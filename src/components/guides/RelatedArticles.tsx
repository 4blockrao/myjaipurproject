import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import CategoryBadge from './CategoryBadge';

interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  article_type: string | null;
}

interface RelatedArticlesProps {
  category?: string | null;
  currentSlug: string;
}

export default function RelatedArticles({ category, currentSlug }: RelatedArticlesProps) {
  const [articles, setArticles] = useState<RelatedArticle[]>([]);

  useEffect(() => {
    async function fetchRelated() {
      let query = supabase
        .from('articles')
        .select('id, slug, title, excerpt, category, article_type')
        .eq('status', 'published')
        .eq('type', 'guide')
        .eq('is_evergreen', true)
        .neq('slug', currentSlug)
        .limit(3);

      if (category) query = query.eq('category', category);

      const { data } = await query.order('published_at', { ascending: false });
      setArticles(data || []);
    }

    fetchRelated();
  }, [category, currentSlug]);

  if (!articles.length) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-2xl font-bold text-foreground">Related guides</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {articles.map((article) => (
          <Link key={article.id} to={`/guide/${article.slug}`} className="group rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-1 hover:shadow-heritage">
            <CategoryBadge category={article.category} articleType={article.article_type} />
            <h3 className="mt-3 line-clamp-2 font-bold text-card-foreground group-hover:text-primary">{article.title}</h3>
            {article.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>}
            <span className="mt-3 inline-flex items-center text-sm font-semibold text-primary">
              Read guide <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
