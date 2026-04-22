import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// FIXED: Use the correct import path - change this to match your working pages
import AppLayout from '@/components/layout/AppLayout';
import GlobalSEO from '@/components/seo/GlobalSEO';
import { supabase } from '@/integrations/supabase/client';

interface Guide {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  article_type: string;
  published_at: string | null;
}

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGuides() {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('id, slug, title, excerpt, category, article_type, published_at')
          .in('article_type', ['pillar', 'cluster'])
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setGuides(data);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchGuides();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">Loading guides...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <GlobalSEO 
        title="Jaipur Guides & Resources"
        description="Comprehensive guides for Jaipur residents - IPL tickets, stadium information, local events, and city resources."
        canonicalUrl="/guides"
      />
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            📚 Guides & Resources
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Everything you need to know about Jaipur - from IPL matches to local events.
          </p>

          {guides.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500">No guides available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <Link
                  key={guide.id}
                  to={`/guide/${guide.slug}`}
                  className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      guide.article_type === 'pillar' 
                        ? 'bg-pink-600 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {guide.article_type === 'pillar' ? '⭐ ULTIMATE GUIDE' : guide.category?.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-2 line-clamp-2 text-gray-800">
                    {guide.title}
                  </h2>
                  {guide.excerpt && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {guide.excerpt}
                    </p>
                  )}
                  <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                    {guide.published_at 
                      ? new Date(guide.published_at).toLocaleDateString('en-IN')
                      : 'Updated 2026'}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}
