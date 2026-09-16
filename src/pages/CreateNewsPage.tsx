import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreateNewsArticle } from '@/components/news/CreateNewsArticle';
import NativeBottomNav from '@/components/home/NativeBottomNav';
import AppLayout from '@/components/layout/AppLayout';
import { useUserRoles } from '@/hooks/useUserRoles';
import { toast } from 'sonner';

export default function CreateNewsPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { isLoading: rolesLoading, isAuthor, isAdmin } = useUserRoles(userId);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        toast.error('Please log in to write articles');
        navigate('/');
      } else {
        setUserId(data.session.user.id);
        setIsAuthenticated(true);
      }
    });
  }, [navigate]);

  // Route-guard note: this only gates the UI. The real enforcement is the
  // RLS policy on news_articles (20260915120200_...sql) - a logged-in user
  // who isn't 'author'/'admin' and somehow reaches CreateNewsArticle would
  // still be rejected at the database on submit. This guard exists so that
  // rejection shows as a clear "you don't have access" state instead of a
  // confusing RLS error surfacing mid-form.
  if (isAuthenticated === null || rolesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthor && !isAdmin) {
    return (
      <AppLayout title="Access Denied" showBackButton={true} backPath="/news">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Writing articles requires the "author" role. If you'd like to
                contribute to JaipurCircle's editorial content, see{' '}
                <Link to="/about" className="underline">About JaipurCircle</Link>{' '}
                for how to get in touch.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
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
