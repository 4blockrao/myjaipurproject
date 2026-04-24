import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/layout/AppLayout";
import GlobalSEO from "@/components/seo/GlobalSEO";
import { Skeleton } from "@/components/ui/skeleton";

export default function StoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isListing, setIsListing] = useState(false);

  useEffect(() => {
    async function fetchContent() {
      if (!slug) {
        // No slug – show listing of all stories
        setIsListing(true);
        const { data, error } = await supabase
          .from("articles")
          .select("slug, title, excerpt, published_at")
          .eq("article_type", "story")
          .eq("status", "published")
          .order("published_at", { ascending: false });

        if (!error && data) {
          setArticle(data);
        }
        setLoading(false);
        return;
      }

      // Fetch single story
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (!error && data) {
        setArticle(data);
      }
      setLoading(false);
    }

    fetchContent();
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

  // Listing page (no slug)
  if (isListing) {
    const stories = article || [];
    return (
      <>
        <GlobalSEO
          title="Jaipur Stories | Lifestyle, Culture & Local Experiences"
          description="Explore Jaipur through our stories – from hidden gems to local experiences."
        />
        <AppLayout>
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-2">📖 Jaipur Stories</h1>
            <p className="text-gray-600 mb-8">Lifestyle, culture, and local experiences from the Pink City.</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stories.map((story: any) => (
                <Link
                  key={story.slug}
                  to={`/stories/${story.slug}`}
                  className="block bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition"
                >
                  <h2 className="text-xl font-bold mb-2">{story.title}</h2>
                  {story.excerpt && <p className="text-gray-600">{story.excerpt.substring(0, 120)}...</p>}
                  <div className="text-sm text-gray-400 mt-3">
                    {new Date(story.published_at).toLocaleDateString("en-IN")}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </AppLayout>
      </>
    );
  }

  // Single story not found
  if (!article) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Story Not Found</h1>
          <Link to="/stories" className="text-pink-600">
            ← Back to Stories
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Single story
  return (
    <>
      <GlobalSEO
        title={article.meta_title || article.title}
        description={article.meta_description}
        canonical={`/stories/${article.slug}`}
      />
      <AppLayout>
        <article className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to="/stories" className="text-pink-600 text-sm mb-4 inline-block">
            ← Back to Stories
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
          <div className="text-gray-500 text-sm mb-6">
            {new Date(article.published_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
          <div className="mt-8 pt-6 border-t text-center">
            <Link to="/ipl-2026" className="text-pink-600">
              ← Back to IPL 2026 Hub
            </Link>
          </div>
        </article>
      </AppLayout>
    </>
  );
}
