import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import { 
  Utensils, Scissors, ShoppingBag, Smartphone, Dumbbell, Car, Camera, Plane, 
  GraduationCap, Briefcase, Home, Heart, Calendar, Newspaper, Building, BookOpen,
  MapPin, Users, Star, Sparkles, Tag, Bed, Warehouse, ParkingCircle, Building2, 
  Fuel, Gauge, CarFront, Battery, Truck
} from "lucide-react";

// Icon mapping for categories
const iconMap: Record<string, React.ElementType> = {
  'restaurants': Utensils,
  'food': Utensils,
  'dining': Utensils,
  'beauty': Scissors,
  'wellness': Heart,
  'health': Heart,
  'shopping': ShoppingBag,
  'electronics': Smartphone,
  'fitness': Dumbbell,
  'gyms': Dumbbell,
  'automotive': Car,
  'services': Camera,
  'travel': Plane,
  'education': GraduationCap,
  'jobs': Briefcase,
  'real-estate': Home,
  'events': Calendar,
  'news': Newspaper,
  'business': Building,
  'guides': BookOpen,
  'localities': MapPin,
  'property': Home,
  'cars': Car,
};

// Color mapping for pillar groups
const pillarColors: Record<string, { bg: string; icon: string }> = {
  'core': { bg: 'bg-primary/10', icon: 'text-primary' },
  'growth': { bg: 'bg-green-100 dark:bg-green-900/20', icon: 'text-green-600' },
  'revenue': { bg: 'bg-amber-100 dark:bg-amber-900/20', icon: 'text-amber-600' },
  'authority': { bg: 'bg-purple-100 dark:bg-purple-900/20', icon: 'text-purple-600' },
  'featured': { bg: 'bg-gradient-to-br from-primary/10 to-accent/10', icon: 'text-primary' },
};

const getIcon = (slug: string): React.ElementType => {
  for (const [key, icon] of Object.entries(iconMap)) {
    if (slug.includes(key)) return icon;
  }
  return Sparkles;
};

// Featured Platform Pillars (Property & Cars with subcategories)
const featuredPillars = [
  {
    name: "Property",
    slug: "property",
    path: "/properties",
    description: "Find homes, apartments, plots & commercial spaces in Jaipur",
    icon: Home,
    gradient: "from-emerald-500 to-teal-600",
    subcategories: [
      { name: "Apartments", slug: "apartments", icon: Building2 },
      { name: "Independent Houses", slug: "independent-houses", icon: Home },
      { name: "Plots & Land", slug: "plots-land", icon: MapPin },
      { name: "PG & Hostels", slug: "pg-hostels", icon: Bed },
      { name: "Commercial", slug: "commercial", icon: Warehouse },
    ]
  },
  {
    name: "Cars & Vehicles",
    slug: "cars",
    path: "/cars",
    description: "Browse new cars, used cars & vehicles with Jaipur prices",
    icon: Car,
    gradient: "from-blue-500 to-indigo-600",
    subcategories: [
      { name: "New Cars", slug: "new-cars", icon: CarFront },
      { name: "Used Cars", slug: "used-cars", icon: Car },
      { name: "Electric Vehicles", slug: "ev-cars", icon: Battery },
      { name: "SUVs", slug: "suvs", icon: Truck },
      { name: "Car Dealers", slug: "car-dealers", icon: Building2 },
    ]
  },
];

const CategoriesPage = () => {
  // Fetch all pillar categories
  const { data: pillars = [], isLoading } = useQuery({
    queryKey: ['all-pillars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .is('parent_slug', null)
        .eq('is_active', true)
        .order('pillar_group')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Group pillars by pillar_group
  const groupedPillars = pillars.reduce((acc, pillar) => {
    const group = pillar.pillar_group || 'other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(pillar);
    return acc;
  }, {} as Record<string, typeof pillars>);

  const groupLabels: Record<string, string> = {
    'core': 'Core Pillars',
    'growth': 'Growth Pillars',
    'revenue': 'Revenue Pillars',
    'authority': 'Authority Pillars',
    'other': 'Other Categories',
  };

  // Schema for categories - include featured pillars
  const allCategories = [
    ...featuredPillars.map(p => ({ name: p.name, slug: p.slug })),
    ...pillars
  ];
  
  const categoriesSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Browse All Categories in Jaipur",
    "description": "Explore categories for property, cars, news, events, deals, businesses, and services across Jaipur localities.",
    "url": "https://www.jaipurcircle.com/categories",
    "isPartOf": {
      "@type": "WebSite",
      "name": "JaipurCircle",
      "url": "https://www.jaipurcircle.com"
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": allCategories.map((cat, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": cat.name,
        "url": `https://www.jaipurcircle.com/categories/${cat.slug}`
      }))
    }
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.jaipurcircle.com" },
      { "@type": "ListItem", "position": 2, "name": "Categories", "item": "https://www.jaipurcircle.com/categories" }
    ]
  };

  return (
    <AppLayout
      title="Categories"
      subtitle="Browse all categories"
      showBackButton={true}
      backPath="/"
    >
      {/* SEO */}
      <Helmet>
        <title>Browse All Categories | Property, Cars, Events, Deals & News | JaipurCircle</title>
        <meta name="description" content="Explore categories for property listings, cars & vehicles, news, events, deals, businesses, and services across Jaipur. Find what you're looking for in the Pink City." />
        <link rel="canonical" href="https://www.jaipurcircle.com/categories" />
        <meta property="og:title" content="Browse All Categories in Jaipur | JaipurCircle" />
        <meta property="og:description" content="Explore categories for property, cars, news, events, deals, businesses, and services across Jaipur localities." />
        <meta property="og:url" content="https://www.jaipurcircle.com/categories" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(categoriesSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="p-4 space-y-6">
        {/* Featured Pillars - Property & Cars */}
        <section>
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Badge className="text-xs bg-primary text-primary-foreground">Featured</Badge>
            Platform Pillars
          </h2>
          <div className="space-y-4">
            {featuredPillars.map((pillar) => {
              const PillarIcon = pillar.icon;
              return (
                <div key={pillar.slug} className="space-y-3">
                  <Link to={pillar.path}>
                    <Card className="hover:shadow-lg transition-all active:scale-[0.99] overflow-hidden">
                      <CardContent className="p-0">
                        <div className={`bg-gradient-to-r ${pillar.gradient} p-4 text-white`}>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/20">
                              <PillarIcon className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{pillar.name}</h3>
                              <p className="text-sm text-white/90">{pillar.description}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  {/* Subcategories */}
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 pl-1">
                    {pillar.subcategories.map((sub) => {
                      const SubIcon = sub.icon;
                      return (
                        <Link key={sub.slug} to={`${pillar.path}?type=${sub.slug}`}>
                          <Badge 
                            variant="outline" 
                            className="flex items-center gap-1.5 px-3 py-2 hover:bg-muted transition-colors whitespace-nowrap"
                          >
                            <SubIcon className="h-3.5 w-3.5" />
                            {sub.name}
                          </Badge>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Database Categories */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          Object.entries(groupLabels).map(([group, label]) => {
            const categories = groupedPillars[group];
            if (!categories?.length) return null;
            
            const colors = pillarColors[group] || pillarColors.core;
            
            return (
              <section key={group}>
                <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {label}
                  </Badge>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => {
                    const Icon = getIcon(category.slug);
                    return (
                      <Link key={category.slug} to={`/categories/${category.slug}`}>
                        <Card className={`h-full hover:shadow-md transition-all active:scale-[0.98] ${colors.bg}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className={`p-2 rounded-lg bg-background/50 ${colors.icon}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                            </div>
                            <h3 className="font-semibold text-sm text-foreground line-clamp-2">
                              {category.name}
                            </h3>
                            {category.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {category.description}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}

        {!isLoading && pillars.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Categories Found</h3>
            <p className="text-sm text-muted-foreground">
              Categories are being set up. Check back soon!
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CategoriesPage;
