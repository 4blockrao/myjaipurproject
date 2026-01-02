import AppLayout from '@/components/layout/AppLayout';
import { CarsListSEO } from '@/components/seo/CarSEO';
import CarSearchHero from '@/components/cars/CarSearchHero';
import TrendingCars from '@/components/cars/TrendingCars';
import PopularBrands from '@/components/cars/PopularBrands';
import CarsByBudget from '@/components/cars/CarsByBudget';
import CarsByBodyType from '@/components/cars/CarsByBodyType';
import LocalityDealers from '@/components/cars/LocalityDealers';
import EVSection from '@/components/cars/EVSection';
import CarCompareWidget from '@/components/cars/CarCompareWidget';
import OwnershipStories from '@/components/cars/OwnershipStories';

const CarsHubPage = () => {
  return (
    <AppLayout>
      <CarsListSEO />
      <main className="min-h-screen bg-background">
        {/* CarWale-style Hero with Search */}
        <CarSearchHero />
        
        {/* Trending Cars - Horizontal scroll on mobile */}
        <TrendingCars />
        
        {/* Popular Brands Grid */}
        <PopularBrands />
        
        {/* Cars by Budget with Tabs */}
        <CarsByBudget />
        
        {/* Body Type Categories */}
        <CarsByBodyType />
        
        {/* Compare Cars Widget */}
        <CarCompareWidget />
        
        {/* EV Section with Charging Stations */}
        <EVSection />
        
        {/* Dealers by Locality */}
        <LocalityDealers />
        
        {/* Ownership Stories */}
        <OwnershipStories />
        
        {/* SEO Content */}
        <section className="py-10 container px-4">
          <div className="max-w-4xl mx-auto prose prose-sm text-muted-foreground">
            <h2 className="text-lg font-bold text-foreground mb-3">
              Your Complete Car Buying Guide for Jaipur (2025)
            </h2>
            <p>
              JaipurCircle is your hyperlocal car research hub. Compare on-road prices for all major brands, 
              find authorized dealers in Mansarovar, Tonk Road, Vaishali Nagar, Malviya Nagar and 100+ localities. 
              Explore electric vehicles with Jaipur-specific charging infrastructure info, read real ownership 
              stories from fellow Jaipurites, and make an informed decision. Whether you're looking for a 
              compact hatchback for city commutes or a spacious SUV for weekend highway drives to Ajmer or Delhi, 
              we have all the information you need.
            </p>
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default CarsHubPage;
