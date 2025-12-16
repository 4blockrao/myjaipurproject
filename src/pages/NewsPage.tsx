import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Plus, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsFeed } from '@/components/news/NewsFeed';
import NativeBottomNav from '@/components/home/NativeBottomNav';

export default function NewsPage() {
  return (
    <>
      <Helmet>
        <title>Jaipur News - Latest Local Updates | JaipurCircle</title>
        <meta 
          name="description" 
          content="Stay updated with the latest news from Jaipur. Local events, city updates, food, culture, business and sports news from the Pink City." 
        />
        <meta name="keywords" content="Jaipur news, Jaipur local news, Pink City news, Rajasthan news, Jaipur events" />
        <link rel="canonical" href="https://jaipurcircle.com/news" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Jaipur News - Latest Local Updates | JaipurCircle" />
        <meta property="og:description" content="Stay updated with the latest news from Jaipur. Local events, city updates, food, culture, business and sports news." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jaipurcircle.com/news" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Jaipur News - JaipurCircle" />
        <meta name="twitter:description" content="Latest local news from Jaipur, Rajasthan" />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Newspaper className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">Jaipur News</h1>
                  <p className="text-xs text-muted-foreground">Latest from the Pink City</p>
                </div>
              </div>
            </div>
            <Link to="/news/create">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Write
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4">
          <NewsFeed showHeader={false} />
        </main>

        <NativeBottomNav />
      </div>
    </>
  );
}
