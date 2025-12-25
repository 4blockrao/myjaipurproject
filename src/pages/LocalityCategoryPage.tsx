import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { CategorySEO } from '@/components/category/CategorySEO';
import { CategoryListings } from '@/components/category/CategoryListings';
import { CategoryInternalLinks } from '@/components/category/CategoryInternalLinks';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useCategoryBySlug, 
  useLocalityCategoryListings,
  useSiblingCategories,
  useRelatedCategories,
  useCategoryBreadcrumbs,
  useCategoryLocalityPage
} from '@/hooks/useCategories';
import { useLocality } from '@/hooks/useLocality';

const LocalityCategoryPage: React.FC = () => {
  const { slug: localitySlug, category: categorySlug } = useParams<{ 
    slug: string; 
    category: string; 
  }>();
  
  // Fetch locality data
  const { data: locality, isLoading: localityLoading } = useLocality(localitySlug);
  
  // Fetch category data
  const { data: category, isLoading: categoryLoading } = useCategoryBySlug(categorySlug);
  
  // Check if this locality-category page is enabled
  const { data: localityPage } = useCategoryLocalityPage(categorySlug, localitySlug);
  
  // Fetch locality-specific listings
  const { data: listings, isLoading: listingsLoading } = useLocalityCategoryListings(categorySlug, localitySlug);
  
  // Fetch related categories
  const { data: siblingCategories = [] } = useSiblingCategories(category?.parent_slug || null, categorySlug || '');
  const { data: relatedCategories = [] } = useRelatedCategories(category?.pillar_slug, categorySlug || '');
  const { data: breadcrumbs = [] } = useCategoryBreadcrumbs(category);
  
  // Loading state
  if (categoryLoading || localityLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // 404 if category or locality not found
  if (!category || !locality) {
    return <Navigate to="/categories" replace />;
  }
  
  // If no content and page not explicitly enabled, redirect to main category page
  // This prevents thin/empty pages from being indexed
  const hasContent = listings?.hasContent || false;
  const isExplicitlyEnabled = localityPage?.is_enabled === true;
  
  if (!hasContent && !isExplicitlyEnabled) {
    return <Navigate to={`/categories/${categorySlug}`} replace />;
  }
  
  const localityName = locality.name;
  
  return (
    <AppLayout>
      {/* SEO with locality context */}
      <CategorySEO 
        category={category}
        breadcrumbs={breadcrumbs}
        localityName={localityName}
        localitySlug={localitySlug}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {category.name} in {localityName}, Jaipur
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover the best {category.name.toLowerCase()} options in {localityName}. 
            Verified listings, exclusive deals, and community reviews.
          </p>
        </header>
        
        {/* Listings */}
        <CategoryListings
          category={category}
          listings={listings || { merchants: [], deals: [], events: [], news: [], hasContent: false }}
          isLoading={listingsLoading}
          localityName={localityName}
          localitySlug={localitySlug}
          siblingCategories={siblingCategories}
        />
        
        {/* Internal Links Footer */}
        <CategoryInternalLinks
          category={category}
          breadcrumbs={breadcrumbs}
          siblingCategories={siblingCategories}
          relatedCategories={relatedCategories}
          localitySlug={localitySlug}
          localityName={localityName}
        />
      </div>
    </AppLayout>
  );
};

export default LocalityCategoryPage;
