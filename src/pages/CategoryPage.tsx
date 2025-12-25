import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { CategorySEO } from '@/components/category/CategorySEO';
import { CategoryHub } from '@/components/category/CategoryHub';
import { CategoryListings } from '@/components/category/CategoryListings';
import { CategoryInternalLinks } from '@/components/category/CategoryInternalLinks';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useCategoryBySlug, 
  useChildCategories, 
  useCategoryListings,
  useSiblingCategories,
  useRelatedCategories,
  useCategoryBreadcrumbs
} from '@/hooks/useCategories';

const CategoryPage: React.FC = () => {
  const { slug, childSlug } = useParams<{ slug: string; childSlug?: string }>();
  
  // Use child slug if available, otherwise use main slug
  const categorySlug = childSlug || slug;
  
  // Fetch category data
  const { data: category, isLoading: categoryLoading } = useCategoryBySlug(categorySlug);
  const { data: childCategories = [], isLoading: childrenLoading } = useChildCategories(categorySlug);
  const { data: listings, isLoading: listingsLoading } = useCategoryListings(categorySlug);
  const { data: siblingCategories = [] } = useSiblingCategories(category?.parent_slug || null, categorySlug || '');
  const { data: relatedCategories = [] } = useRelatedCategories(category?.pillar_slug, categorySlug || '');
  const { data: breadcrumbs = [] } = useCategoryBreadcrumbs(category);
  
  // Loading state
  if (categoryLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // 404 if category not found
  if (!category) {
    return <Navigate to="/categories" replace />;
  }
  
  // Determine if this is a hub page (has children) or listing page (leaf)
  const isHubPage = childCategories.length > 0;
  
  return (
    <AppLayout>
      {/* SEO */}
      <CategorySEO 
        category={category}
        breadcrumbs={breadcrumbs}
        childCategories={childCategories}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Render Hub or Listings based on category type */}
        {isHubPage ? (
          <CategoryHub
            category={category}
            childCategories={childCategories}
            siblingCategories={siblingCategories}
            relatedCategories={relatedCategories}
          />
        ) : (
          <CategoryListings
            category={category}
            listings={listings || { merchants: [], deals: [], events: [], news: [], hasContent: false }}
            isLoading={listingsLoading}
            siblingCategories={siblingCategories}
          />
        )}
        
        {/* Internal Links Footer */}
        <CategoryInternalLinks
          category={category}
          breadcrumbs={breadcrumbs}
          siblingCategories={siblingCategories}
          relatedCategories={relatedCategories}
        />
      </div>
    </AppLayout>
  );
};

export default CategoryPage;
