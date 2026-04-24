import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import GlobalSEO from '@/components/seo/GlobalSEO';
import { Skeleton } from '@/components/ui/skeleton';

export default function StoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStory() {
      if (!slug) return;
      
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (!error && data) {
        setArticle(data);
      }
      setLoading(false);
    }
    
    fetchStory();
  }, [slug]);

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!article) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Story Not Found</h1>
          <Link to="/" className="text-pink-600">← Back to Home</Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <GlobalSEO 
        title={article.meta_title || article.title}
        description={article.meta_description}
        canonical={`/stories/${article.slug}`}
      />
      <AppLayout>
        <article className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          <div className="mt-8 text-center">
            <Link to="/ipl-2026" className="text-pink-600">← Back to IPL 2026 Hub</Link>
          </div>
        </article>
      </AppLayout>
    </>
  );
}
