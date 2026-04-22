import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '@components/layout/AppLayout';
import GlobalSEO from '@components/seo/GlobalSEO';
import { supabase } from '@/lib/supabase/client'; // Adjust import to your Supabase client

interface Guide {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  article_type: 'pillar' | 'cluster';
  published_at: string | null;
}

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGuides() {
      const { data, error } = await supabase
        .from('articles')
        .select('id, slug, title, excerpt, category, article_type, published_at')
        .in('article_type', ['pillar', 'cluster'])
        .eq('status', 'published')
        .order('is_evergreen', { ascending: false })
        .order('published_at', { ascending: false });

      if (!error && data) setGuides(data);
      setLoading(false);
    }
    fetchGuides();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">Loading guides...</div>
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
          <h1 className="text-3xl md:text-4xl font-bold mb-3">📚 Guides & Resources</h1>
          <p className="text-gray-600 text-lg mb-8">Everything you need to know about Jaipur - from IPL matches to local events.</p>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link key={guide.id} to={`/guide/${guide.slug}`} className="block bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition">
                <h2 className="text-xl font-bold mb-2">{guide.title}</h2>
                <p className="text-gray-600 text-sm mb-3">{guide.excerpt?.substring(0, 100)}...</p>
                <div className="text-xs text-gray-400">{guide.category} • {guide.published_at ? new Date(guide.published_at).toLocaleDateString('en-IN') : 'Updated 2026'}</div>
              </Link>
            ))}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
