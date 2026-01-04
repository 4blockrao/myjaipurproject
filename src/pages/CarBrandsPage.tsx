import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, Car, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';

const CarBrandsPage = () => {
  const { data: brands, isLoading } = useQuery({
    queryKey: ['car-brands-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_brands')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Group brands by popularity
  const popularBrands = brands?.filter(b => b.is_popular) || [];
  const otherBrands = brands?.filter(b => !b.is_popular) || [];

  return (
    <AppLayout>
      <Helmet>
        <title>All Car Brands in India 2025 | Car Companies in Jaipur</title>
        <meta name="description" content="Explore all car brands available in Jaipur. Compare prices, models, and find authorized dealers for Maruti Suzuki, Tata, Hyundai, Mahindra, and 30+ brands." />
        <link rel="canonical" href="https://jaipurcircle.com/cars/brands" />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12">
          <div className="container px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-primary">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/cars" className="hover:text-primary">Cars</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">All Brands</span>
            </nav>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              All Car Brands in India (2025)
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Explore {brands?.length || '35+'} car brands available in Jaipur. From budget hatchbacks to luxury sedans, 
              find the perfect car with on-road prices, dealer information, and model comparisons.
            </p>
          </div>
        </section>

        {/* Popular Brands */}
        <section className="py-10 container px-4">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-2xl font-bold">Popular Brands</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {popularBrands.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/cars/${brand.slug}`}
                  className="group bg-card border rounded-xl p-4 hover:shadow-lg hover:border-primary/50 transition-all"
                >
                  <div className="aspect-square mb-3 flex items-center justify-center bg-muted/50 rounded-lg p-4">
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={`${brand.name} logo`}
                        className="max-h-16 object-contain group-hover:scale-110 transition-transform"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`${brand.logo_url ? 'hidden' : ''} h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center`}>
                      <span className="text-2xl font-bold text-primary">{brand.name.charAt(0)}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-center group-hover:text-primary transition-colors">
                    {brand.name}
                  </h3>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    {brand.country}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Other Brands */}
        {otherBrands.length > 0 && (
          <section className="py-10 container px-4 border-t">
            <div className="flex items-center gap-2 mb-6">
              <Car className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-2xl font-bold">Other Brands</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {otherBrands.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/cars/${brand.slug}`}
                  className="group bg-card border rounded-xl p-4 hover:shadow-md hover:border-primary/50 transition-all"
                >
                  <div className="aspect-video mb-2 flex items-center justify-center bg-muted/50 rounded-lg p-2">
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={`${brand.name} logo`}
                        className="max-h-10 object-contain group-hover:scale-110 transition-transform"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-xl font-bold text-primary">{brand.name.charAt(0)}</span>
                    )}
                  </div>
                  <h3 className="font-medium text-sm text-center group-hover:text-primary transition-colors">
                    {brand.name}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SEO Content */}
        <section className="py-10 container px-4 border-t">
          <div className="max-w-4xl mx-auto prose prose-sm text-muted-foreground">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Car Brands Available in Jaipur (2025)
            </h2>
            <p>
              Jaipur's automotive market features a diverse mix of Indian and international car manufacturers. 
              <strong> Maruti Suzuki</strong> leads the market with the widest dealer network across Mansarovar, 
              Tonk Road, and Vaishali Nagar. <strong>Tata Motors</strong> and <strong>Mahindra</strong> offer 
              popular SUVs with strong after-sales support throughout the city.
            </p>
            <p>
              Premium brands like <strong>Hyundai</strong>, <strong>Kia</strong>, and <strong>Skoda</strong> have 
              established significant presence with multiple showrooms. For luxury buyers, <strong>BMW</strong>, 
              <strong>Mercedes-Benz</strong>, and <strong>Audi</strong> have exclusive showrooms on Ajmer Road and 
              Tonk Road. The EV segment is growing with <strong>Tata</strong>, <strong>MG</strong>, and 
              <strong>BYD</strong> leading the charge with expanding charging infrastructure.
            </p>
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default CarBrandsPage;
