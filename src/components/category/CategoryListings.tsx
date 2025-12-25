import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Store, 
  Tag, 
  Calendar, 
  Newspaper, 
  MapPin,
  Star,
  ArrowRight,
  PlusCircle,
  Search,
  ChevronRight
} from 'lucide-react';
import { Category } from '@/hooks/useCategories';
import { format } from 'date-fns';

interface CategoryListingsProps {
  category: Category;
  listings: {
    merchants: any[];
    deals: any[];
    events: any[];
    news: any[];
    hasContent: boolean;
  };
  isLoading: boolean;
  localityName?: string;
  localitySlug?: string;
  siblingCategories?: Category[];
}

export const CategoryListings: React.FC<CategoryListingsProps> = ({
  category,
  listings,
  isLoading,
  localityName,
  localitySlug,
  siblingCategories = [],
}) => {
  const locationContext = localityName ? `in ${localityName}` : 'in Jaipur';
  
  // Popular localities for navigation
  const popularLocalities = [
    { name: 'Malviya Nagar', slug: 'malviya-nagar' },
    { name: 'Vaishali Nagar', slug: 'vaishali-nagar' },
    { name: 'C-Scheme', slug: 'c-scheme' },
    { name: 'Mansarovar', slug: 'mansarovar' },
    { name: 'Tonk Road', slug: 'tonk-road' },
    { name: 'Raja Park', slug: 'raja-park' },
  ];
  
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }
  
  // Fallback content when no listings exist
  const FallbackContent = () => (
    <div className="space-y-8">
      {/* AI Summary */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          About {category.name} {locationContext}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {category.description || 
            `Looking for ${category.name.toLowerCase()} ${locationContext}? JaipurCircle is building 
            a comprehensive directory of verified ${category.name.toLowerCase()} services and businesses. 
            Our listings are being verified to ensure quality recommendations for Jaipur residents.`}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Details being verified. Check back soon for updated listings.
        </p>
      </section>
      
      {/* Locality Navigation */}
      {!localitySlug && (
        <section>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Explore {category.name} by Locality
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {popularLocalities.map((locality) => (
              <Link
                key={locality.slug}
                to={`/jaipur/${locality.slug}/${category.slug}`}
                className="p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors text-center"
              >
                <span className="text-sm font-medium text-foreground">
                  {locality.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* Related Categories */}
      {siblingCategories.length > 0 && (
        <section>
          <h3 className="font-semibold text-foreground mb-3">Related Categories</h3>
          <div className="flex flex-wrap gap-2">
            {siblingCategories.map((cat) => (
              <Link key={cat.id} to={`/categories/${cat.slug}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* Call to Action */}
      <section className="border border-dashed border-primary/30 rounded-xl p-6 text-center">
        <PlusCircle className="h-10 w-10 text-primary mx-auto mb-3" />
        <h3 className="font-semibold text-foreground mb-2">
          Are you a {category.name} provider in Jaipur?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          List your business on JaipurCircle and reach thousands of local customers.
        </p>
        <Link to="/merchant-onboarding">
          <Button>List Your Business</Button>
        </Link>
      </section>
      
      {/* FAQ */}
      <section className="border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-foreground text-sm">
              How do I find {category.name.toLowerCase()} {locationContext}?
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Browse our curated listings above or use the locality filter to find options near you.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground text-sm">
              Are these listings verified?
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Yes, JaipurCircle verifies all business listings to ensure quality and reliability.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
  
  // If no content, show fallback
  if (!listings.hasContent) {
    return <FallbackContent />;
  }
  
  return (
    <div className="space-y-8">
      {/* AI Summary */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          {category.name} {locationContext}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Discover verified {category.name.toLowerCase()} {locationContext}. 
          JaipurCircle brings you {listings.merchants.length + listings.deals.length + listings.events.length} listings 
          including local businesses, exclusive deals, and upcoming events. 
          All listings are verified for quality and reliability.
        </p>
      </section>
      
      {/* Merchants Section */}
      {listings.merchants.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Local Businesses ({listings.merchants.length})
            </h3>
            <Link to="/merchants" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.merchants.slice(0, 6).map((merchant: any) => (
              <Link key={merchant.id} to={`/merchant/${merchant.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {merchant.business_name}
                        </h4>
                        {merchant.business_type && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {merchant.business_type}
                          </Badge>
                        )}
                        {merchant.address && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {merchant.address}
                          </p>
                        )}
                        {merchant.average_rating > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-muted-foreground">
                              {merchant.average_rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* Deals Section */}
      {listings.deals.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Deals & Offers ({listings.deals.length})
            </h3>
            <Link to="/deals" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.deals.slice(0, 6).map((deal: any) => (
              <Link key={deal.id} to={`/deal/${deal.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-foreground line-clamp-2">
                      {deal.title}
                    </h4>
                    {deal.discount_percentage && (
                      <Badge className="mt-2 bg-green-500">
                        {deal.discount_percentage}% OFF
                      </Badge>
                    )}
                    {deal.merchants?.business_name && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {deal.merchants.business_name}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {deal.discounted_price && (
                        <span className="font-semibold text-primary">
                          ₹{deal.discounted_price}
                        </span>
                      )}
                      {deal.original_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{deal.original_price}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* Events Section */}
      {listings.events.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Events ({listings.events.length})
            </h3>
            <Link to="/events" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.events.slice(0, 6).map((event: any) => (
              <Link key={event.id} to={`/events/${event.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-foreground line-clamp-2">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(event.start_date), 'MMM d, yyyy')}
                    </div>
                    {event.venue_name && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.venue_name}
                      </p>
                    )}
                    {event.is_free ? (
                      <Badge variant="secondary" className="mt-2">Free</Badge>
                    ) : event.ticket_price && (
                      <Badge variant="outline" className="mt-2">₹{event.ticket_price}</Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* News Section */}
      {listings.news.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              Related News ({listings.news.length})
            </h3>
            <Link to="/news" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.news.slice(0, 6).map((article: any) => (
              <Link key={article.id} to={`/news/${article.category}/${article.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="text-xs mb-2">
                      {article.category}
                    </Badge>
                    <h4 className="font-medium text-foreground line-clamp-2">
                      {article.title}
                    </h4>
                    {article.excerpt && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    {article.published_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(article.published_at), 'MMM d, yyyy')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* FAQ Section */}
      <section className="border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-foreground text-sm">
              What are the best {category.name.toLowerCase()} options {locationContext}?
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              JaipurCircle curates the best {category.name.toLowerCase()} based on verified reviews, 
              quality ratings, and community feedback. Browse the listings above for top recommendations.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground text-sm">
              How can I get deals on {category.name.toLowerCase()} {locationContext}?
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Check our Deals & Offers section above for exclusive discounts. 
              You can also earn JaiCoins on purchases to save on future orders.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground text-sm">
              Are these {category.name.toLowerCase()} listings verified?
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Yes, all businesses on JaipurCircle undergo verification to ensure quality and reliability.
            </p>
          </div>
        </div>
      </section>
      
      {/* Locality Navigation */}
      {!localitySlug && (
        <section className="bg-muted/30 rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Explore {category.name} by Locality
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {popularLocalities.map((locality) => (
              <Link
                key={locality.slug}
                to={`/jaipur/${locality.slug}/${category.slug}`}
                className="p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors text-center"
              >
                <span className="text-sm font-medium text-foreground">
                  {locality.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
