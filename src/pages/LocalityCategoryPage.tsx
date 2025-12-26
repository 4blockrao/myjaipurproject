import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { CategorySEO } from '@/components/category/CategorySEO';
import { CategoryListings } from '@/components/category/CategoryListings';
import { CategoryInternalLinks } from '@/components/category/CategoryInternalLinks';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  useCategoryBySlug, 
  useLocalityCategoryListings,
  useSiblingCategories,
  useRelatedCategories,
  useCategoryBreadcrumbs,
  useCategoryLocalityPage
} from '@/hooks/useCategories';
import { useLocality } from '@/hooks/useLocality';
import { useNearbyForCategory } from '@/hooks/useNearbyLocalities';
import { NearbyLocalitySwitch } from '@/components/locality/NearbyLocalityBlock';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { CheckCircle2, UserCheck, Clock, Zap } from 'lucide-react';

// Filter chip component
interface FilterChipProps {
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
    }`}
  >
    {icon}
    {label}
  </button>
);

const LocalityCategoryPage: React.FC = () => {
  const { slug: localitySlug, category: categorySlug } = useParams<{ 
    slug: string; 
    category: string; 
  }>();
  
  // Filter states
  const [filters, setFilters] = useState({
    verified: false,
    claimed: false,
    recentlyUpdated: false,
  });
  
  // Fetch locality data
  const { data: locality, isLoading: localityLoading } = useLocality(localitySlug);
  
  // Fetch category data
  const { data: category, isLoading: categoryLoading } = useCategoryBySlug(categorySlug);
  
  // Fetch nearby localities for switch
  const { data: nearbyLocalities = [], isLoading: nearbyLoading } = useNearbyForCategory(localitySlug, 5);
  
  // Check if this locality-category page is enabled
  const { data: localityPage } = useCategoryLocalityPage(categorySlug, localitySlug);
  
  // Fetch locality-specific listings
  const { data: listings, isLoading: listingsLoading } = useLocalityCategoryListings(categorySlug, localitySlug);
  
  // Fetch related categories
  const { data: siblingCategories = [] } = useSiblingCategories(category?.parent_slug || null, categorySlug || '');
  const { data: relatedCategories = [] } = useRelatedCategories(category?.pillar_slug, categorySlug || '');
  const { data: breadcrumbs = [] } = useCategoryBreadcrumbs(category);
  
  // Toggle filter
  const toggleFilter = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  // Loading state
  if (categoryLoading || localityLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-8 w-80 mb-2" />
          <Skeleton className="h-5 w-96 mb-6" />
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40" />
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
      
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Jaipur</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/jaipur/${localitySlug}`}>{localityName}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {category.name} in {localityName}, Jaipur
          </h1>
          <p className="text-muted-foreground mt-2">
            Trusted & verified businesses serving {localityName} and nearby areas.
          </p>
        </header>
        
        {/* Smart Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <FilterChip
            label="Verified"
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            isActive={filters.verified}
            onClick={() => toggleFilter('verified')}
          />
          <FilterChip
            label="Owner Claimed"
            icon={<UserCheck className="w-3.5 h-3.5" />}
            isActive={filters.claimed}
            onClick={() => toggleFilter('claimed')}
          />
          <FilterChip
            label="Recently Updated"
            icon={<Clock className="w-3.5 h-3.5" />}
            isActive={filters.recentlyUpdated}
            onClick={() => toggleFilter('recentlyUpdated')}
          />
        </div>
        
        {/* Nearby Locality Switch */}
        <NearbyLocalitySwitch
          localities={nearbyLocalities}
          categorySlug={categorySlug || ''}
          categoryName={category.name}
          isLoading={nearbyLoading}
        />
        
        {/* Listings */}
        <CategoryListings
          category={category}
          listings={listings || { merchants: [], deals: [], events: [], news: [], hasContent: false }}
          isLoading={listingsLoading}
          localityName={localityName}
          localitySlug={localitySlug}
          siblingCategories={siblingCategories}
        />
        
        {/* Contextual Insight Block */}
        {hasContent && (
          <section className="my-8 p-4 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {category.name} providers in {localityName} typically serve residents and businesses 
              in the area. Many also cover nearby localities such as{' '}
              {nearbyLocalities.slice(0, 3).map(l => l.name).join(', ') || 'surrounding areas'}.
              {category.description && ` ${category.description}`}
            </p>
          </section>
        )}
        
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
