import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import AppLayout from '@components/layout/AppLayout';
import GlobalSEO from '@components/seo/GlobalSEO';
import { supabase } from '@/lib/supabase/client';

export default function GuideDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return;
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      if (!error && data) setArticle(data);
      setLoading(false);
    }
    fetchArticle();
  }, [slug]);

  if (loading) return <AppLayout><div className="container mx-auto px-4 py-8">Loading...</div></AppLayout>;
  if (!article) return <AppLayout><div className="container mx-auto px-4 py-8 text-center">Guide not found.</div></AppLayout>;

  return (
    <>
      <GlobalSEO title={article.title} description={article.excerpt} canonicalUrl={`/guide/${article.slug}`} />
      <AppLayout>
        <article className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to="/guides" className="inline-flex items-center gap-1 text-pink-600 mb-6">← Back to Guides</Link>
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <div className="flex gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{article.published_at ? new Date(article.published_at).toLocaleDateString('en-IN') : 'Recent'}</span>
              <span className="flex items-center gap-1"><User className="w-4 h-4" />{article.author || 'JaipurCircle Team'}</span>
            </div>
          </header>
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>
      </AppLayout>
    </>
  );
}
