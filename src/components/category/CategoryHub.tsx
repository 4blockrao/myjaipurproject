import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  MapPin, 
  TrendingUp, 
  BookOpen, 
  ChevronRight,
  Grid3X3,
  Search
} from 'lucide-react';
import { Category } from '@/hooks/useCategories';

interface CategoryHubProps {
  category: Category;
  childCategories: Category[];
  siblingCategories: Category[];
  relatedCategories: Category[];
}

export const CategoryHub: React.FC<CategoryHubProps> = ({
  category,
  childCategories,
  siblingCategories,
  relatedCategories,
}) => {
  // Popular Jaipur localities for category exploration
  const popularLocalities = [
    { name: 'Malviya Nagar', slug: 'malviya-nagar' },
    { name: 'Vaishali Nagar', slug: 'vaishali-nagar' },
    { name: 'C-Scheme', slug: 'c-scheme' },
    { name: 'Mansarovar', slug: 'mansarovar' },
    { name: 'Tonk Road', slug: 'tonk-road' },
    { name: 'Raja Park', slug: 'raja-park' },
  ];
  
  const getIconComponent = (iconName: string | null) => {
    // Return a default icon if none specified
    return <Grid3X3 className="h-5 w-5" />;
  };
  
  return (
    <div className="space-y-8">
      {/* Category Intro */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 md:p-8">
        <div className="max-w-3xl">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {category.name} in Jaipur
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {category.description || 
              `Explore ${category.name.toLowerCase()} across Jaipur. JaipurCircle brings you verified listings, 
              exclusive deals, and community reviews to help you find the best ${category.name.toLowerCase()} 
              options in the Pink City. Whether you're looking in specific localities or across the city, 
              our curated directory ensures you connect with trusted services and businesses.`}
          </p>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              Jaipur Local
            </Badge>
            <Badge variant="outline" className="text-xs">
              Verified Listings
            </Badge>
            <Badge variant="outline" className="text-xs">
              Community Reviews
            </Badge>
          </div>
        </div>
      </section>
      
      {/* Subcategory Grid */}
      {childCategories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-primary" />
              Browse {category.name} Categories
            </h2>
            <span className="text-sm text-muted-foreground">
              {childCategories.length} subcategories
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {childCategories.map((child) => (
              <Link key={child.id} to={`/categories/${child.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow border-border/50 hover:border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {getIconComponent(child.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {child.name}
                        </h3>
                        {child.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {child.description}
                          </p>
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
      
      {/* Popular Localities Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {category.name} by Location
          </h2>
          <Link to="/jaipur/all" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all localities
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
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
      
      {/* Top Searches / Trending */}
      <section className="bg-muted/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          Popular Searches in {category.name}
        </h2>
        
        <div className="flex flex-wrap gap-2">
          {[
            `Best ${category.name.toLowerCase()} in Jaipur`,
            `${category.name} near me`,
            `${category.name} deals Jaipur`,
            `Top rated ${category.name.toLowerCase()}`,
            `${category.name} in Malviya Nagar`,
            `Affordable ${category.name.toLowerCase()} Jaipur`,
          ].map((search, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="cursor-pointer hover:bg-secondary/80"
            >
              <Search className="h-3 w-3 mr-1" />
              {search}
            </Badge>
          ))}
        </div>
      </section>
      
      {/* Related Categories */}
      {(siblingCategories.length > 0 || relatedCategories.length > 0) && (
        <section>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            Related Categories
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...siblingCategories, ...relatedCategories].slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="flex items-center gap-2 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground truncate">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* FAQ Section */}
      <section className="border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-1">
              What are the best {category.name.toLowerCase()} options in Jaipur?
            </h3>
            <p className="text-sm text-muted-foreground">
              JaipurCircle offers a curated list of {category.name.toLowerCase()} in Jaipur, 
              including verified merchants, exclusive deals, and community reviews to help you 
              make informed decisions.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-foreground mb-1">
              How do I find {category.name.toLowerCase()} near me in Jaipur?
            </h3>
            <p className="text-sm text-muted-foreground">
              Use our locality filter above to explore {category.name.toLowerCase()} in your 
              specific area. We cover all major localities across Jaipur with detailed listings 
              and reviews.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-foreground mb-1">
              Are there any deals available for {category.name.toLowerCase()} in Jaipur?
            </h3>
            <p className="text-sm text-muted-foreground">
              Yes! JaipurCircle regularly features exclusive deals and discounts on 
              {category.name.toLowerCase()} from verified merchants across Jaipur. 
              Check our deals section for current offers.
            </p>
          </div>
        </div>
      </section>
      
      {/* Internal Links / Pillar Navigation */}
      <section className="bg-muted/20 rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-3">
          Explore More on JaipurCircle
        </h3>
        <div className="flex flex-wrap gap-2">
          <Link to="/deals">
            <Button variant="outline" size="sm">All Deals</Button>
          </Link>
          <Link to="/events">
            <Button variant="outline" size="sm">Events</Button>
          </Link>
          <Link to="/merchants">
            <Button variant="outline" size="sm">Local Businesses</Button>
          </Link>
          <Link to="/news">
            <Button variant="outline" size="sm">Jaipur News</Button>
          </Link>
          <Link to="/jaipur">
            <Button variant="outline" size="sm">Explore Jaipur</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
