import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateNewsArticle } from '@/components/news/CreateNewsArticle';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import { toast } from 'sonner';

export default function CreateNewsPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        toast.error('Please log in to write articles');
        navigate('/');
      } else {
        setIsAuthenticated(true);
      }
    });
  }, [navigate]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Write News Article | JaipurCircle</title>
        <meta name="description" content="Write and publish local news articles about Jaipur using AI assistance." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center gap-3 p-4">
            <Link to="/news">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Newspaper className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold">Write Article</h1>
                <p className="text-xs text-muted-foreground">AI-powered news creation</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <CreateNewsArticle />
        </main>

        <NativeBottomNav />
      </div>
    </>
  );
}
