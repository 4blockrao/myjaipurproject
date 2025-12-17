import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NewsInternalLinksProps {
  article: {
    category: string;
    locality?: string | null;
    tags?: string[] | null;
  };
}

/**
 * Internal Linking Component for News Articles
 * Links to: Category pages, Locality pages, Tag/Topic pages
 * Improves SEO crawlability and page authority
 */
export const NewsInternalLinks = ({ article }: NewsInternalLinksProps) => {
  const categoryLabels: Record<string, string> = {
    city: 'City News',
    events: 'Events & Entertainment',
    food: 'Food & Dining',
    culture: 'Arts & Culture',
    business: 'Business & Finance',
    sports: 'Sports',
  };

  const links = [
    // Category link
    {
      label: `More ${categoryLabels[article.category] || article.category} News`,
      href: `/news/${article.category}`,
      type: 'category',
    },
    // Locality link
    ...(article.locality ? [{
      label: `News from ${article.locality}`,
      href: `/news?locality=${encodeURIComponent(article.locality)}`,
      type: 'locality',
    }] : []),
    // All news link
    {
      label: 'All Jaipur News',
      href: '/news',
      type: 'all',
    },
  ];

  return (
    <section className="space-y-4 mt-8 pt-6 border-t" aria-label="Related News">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        More to Read
      </h3>
      
      {/* Main navigation links */}
      <div className="space-y-2">
        {links.map((link) => (
          <Link 
            key={link.href}
            to={link.href}
            className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors group"
          >
            <span className="font-medium text-sm">{link.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>

      {/* Tag links */}
      {article.tags && article.tags.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs text-muted-foreground mb-2">Related Topics</h4>
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 6).map((tag) => (
              <Link 
                key={tag} 
                to={`/news?search=${encodeURIComponent(tag)}`}
              >
                <Badge 
                  variant="secondary" 
                  className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Breadcrumb links for SEO */}
      <nav aria-label="Breadcrumb" className="pt-4 border-t border-border/50">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-primary">Home</Link>
          </li>
          <li className="mx-1">/</li>
          <li>
            <Link to="/news" className="hover:text-primary">News</Link>
          </li>
          <li className="mx-1">/</li>
          <li>
            <Link 
              to={`/news/${article.category}`} 
              className="hover:text-primary capitalize"
            >
              {categoryLabels[article.category] || article.category}
            </Link>
          </li>
          {article.locality && (
            <>
              <li className="mx-1">/</li>
              <li>
                <Link 
                  to={`/news?locality=${encodeURIComponent(article.locality)}`}
                  className="hover:text-primary"
                >
                  {article.locality}
                </Link>
              </li>
            </>
          )}
        </ol>
      </nav>
    </section>
  );
};

export default NewsInternalLinks;
