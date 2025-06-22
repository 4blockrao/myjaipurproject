
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Gift, ShoppingBag, Users } from "lucide-react";

interface HeroBannerProps {
  user: any;
  profile: any;
}

const HeroBanner = ({ user, profile }: HeroBannerProps) => {
  const banners = [
    {
      id: 1,
      title: "Unlock Jaipur's Best Deals!",
      subtitle: "Save up to 70% on local favorites",
      image: "https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&h=400&fit=crop",
      cta: "Explore Deals"
    },
    {
      id: 2,
      title: "Shop Local Products",
      subtitle: "Authentic Rajasthani crafts & more",
      image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=400&fit=crop",
      cta: "Shop Now"
    },
    {
      id: 3,
      title: "Refer Friends & Earn",
      subtitle: "Get 100 JAICoins for every referral",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=400&fit=crop",
      cta: "Refer Now"
    }
  ];

  return (
    <section className="relative">
      <Carousel className="w-full">
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className="relative h-80 md:h-96 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${banner.image})`
                  }}
                />
                <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
                  <div className="text-white max-w-2xl">
                    {user && profile && (
                      <p className="text-lg mb-2 opacity-90">
                        Hi {profile.full_name?.split(' ')[0] || 'there'}! 👋
                      </p>
                    )}
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                      {banner.title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-90">
                      {banner.subtitle}
                      {profile?.locality && (
                        <span className="block text-lg mt-2">
                          Near {profile.locality}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold px-8 py-3 text-lg shadow-lg">
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        {banner.cta}
                      </Button>
                      <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30 font-semibold px-8 py-3 text-lg backdrop-blur-sm">
                        <Users className="w-5 h-5 mr-2" />
                        Refer & Earn
                      </Button>
                      <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30 font-semibold px-8 py-3 text-lg backdrop-blur-sm">
                        <Gift className="w-5 h-5 mr-2" />
                        Mystery Deal
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  );
};

export default HeroBanner;
