import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import GlobalSEO from '@/components/seo/GlobalSEO';
import { supabase } from '@/integrations/supabase/client';

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  article_type: string;
  author: string;
  published_at: string | null;
}

export default function GuideDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return;

      try {
        // REMOVED 'excerpt' from select
        const { data, error } = await supabase
          .from('articles')
          .select('id, slug, title, content, category, article_type, author, published_at')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (error || !data) {
          setError(true);
        } else {
          setArticle(data);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !article) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Guide Not Found</h1>
          <p className="text-gray-600 mb-6">
            The guide you're looking for doesn't exist or hasn't been published yet.
          </p>
          <Link to="/guides" className="text-pink-600 hover:underline">
            ← Back to Guides
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <GlobalSEO 
        title={article.title}
        description={`Comprehensive guide about ${article.title} for Jaipur residents.`}
        canonicalUrl={`/guide/${article.slug}`}
      />
      <AppLayout>
        <article className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to="/guides" className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Guides
          </Link>

          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {article.article_type === 'pillar' ? (
                <span className="bg-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  ⭐ ULTIMATE GUIDE
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {article.category?.toUpperCase()} GUIDE
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-t border-b py-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {article.published_at 
                  ? new Date(article.published_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : 'Recently updated'}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {article.author || 'JaipurCircle Team'}
              </span>
            </div>
          </header>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content || 'Content coming soon...' }}
          />

          <div className="mt-12 p-6 bg-green-50 rounded-xl text-center">
            <h3 className="text-xl font-bold mb-2">📱 Get Instant Updates on WhatsApp</h3>
            <p className="text-gray-600 mb-4">
              Join 10,000+ Jaipurites getting real-time alerts.
            </p>
            <a
              href="https://wa.me/919XXXXXXXXX?text=Hi%20I%20want%20to%20join%20JaipurCircle%20alerts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg"
            >
              Join WhatsApp Alerts →
            </a>
          </div>
        </article>
      </AppLayout>
    </>
  );
}
