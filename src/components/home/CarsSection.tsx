import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Car, Fuel, Gauge, Zap } from "lucide-react";
import { useState } from "react";

// Reliable car placeholder images by body type - using stable Unsplash URLs
const carPlaceholders: Record<string, string> = {
  'suv': 'https://images.unsplash.com/photo-1606611013016-96f7f5c69d10?w=400&h=300&fit=crop&auto=format',
  'compact-suv': 'https://images.unsplash.com/photo-1625395005224-0fce68a3cdc8?w=400&h=300&fit=crop&auto=format',
  'compact suv': 'https://images.unsplash.com/photo-1625395005224-0fce68a3cdc8?w=400&h=300&fit=crop&auto=format',
  'hatchback': 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=300&fit=crop&auto=format',
  'sedan': 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400&h=300&fit=crop&auto=format',
  'muv': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop&auto=format',
  'coupe': 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=400&h=300&fit=crop&auto=format',
  'default': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=300&fit=crop&auto=format',
};

const getCarPlaceholder = (bodyType: string | null) => {
  if (!bodyType) return carPlaceholders['default'];
  const key = bodyType.toLowerCase().trim();
  return carPlaceholders[key] || carPlaceholders['default'];
};

// Separate card component to properly use hooks
const CarCard = ({ car, formatPrice, navigate }: { car: any; formatPrice: (p: number | null) => string; navigate: any }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  
  // Always use placeholder if no cover_image or on error
  const hasCoverImage = car.cover_image && car.cover_image.trim() !== '';
  const imgSrc = imgError || !hasCoverImage ? getCarPlaceholder(car.body_type) : car.cover_image;

  return (
    <Card 
      onClick={() => navigate(`/cars/${car.car_brands?.slug}/${car.slug}`)}
      className="w-48 shrink-0 cursor-pointer group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-card to-muted/30"
    >
      {/* Image */}
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-muted/30 to-muted/60">
        {/* Placeholder background while loading */}
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted/50" />
        )}
        <img 
          src={imgSrc} 
          alt={car.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgError(true); setImgLoaded(true); }}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {car.is_ev && (
            <Badge className="bg-emerald-500 text-[10px] px-1.5 py-0.5">
              <Zap className="w-2.5 h-2.5 mr-0.5" />
              EV
            </Badge>
          )}
          {car.is_new_launch && (
            <Badge className="bg-orange-500 text-[10px] px-1.5 py-0.5">
              New
            </Badge>
          )}
          {car.is_trending && (
            <Badge className="bg-primary text-[10px] px-1.5 py-0.5">
              Trending
            </Badge>
          )}
        </div>
        
        {/* Brand Logo */}
        {car.car_brands?.logo_url && (
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md p-1">
            <img 
              src={car.car_brands.logo_url} 
              alt={car.car_brands.name}
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-3">
        {/* Brand Name */}
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
          {car.car_brands?.name}
        </p>
        
        <h3 className="font-bold text-sm line-clamp-1 text-foreground mb-1.5">
          {car.name}
        </h3>
        
        {/* Specs */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
          {car.fuel_type && (
            <div className="flex items-center gap-0.5">
              <Fuel className="w-3 h-3" />
              <span>{car.fuel_type}</span>
            </div>
          )}
          {car.transmission && (
            <div className="flex items-center gap-0.5">
              <Gauge className="w-3 h-3" />
              <span>{car.transmission}</span>
            </div>
          )}
        </div>
        
        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-foreground">
            {formatPrice(car.on_road_price_jaipur_min)}
          </span>
          {car.on_road_price_jaipur_max && car.on_road_price_jaipur_max !== car.on_road_price_jaipur_min && (
            <span className="text-[10px] text-muted-foreground">
              - {formatPrice(car.on_road_price_jaipur_max)}
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">On-Road Jaipur</p>
      </CardContent>
    </Card>
  );
};

const CarsSection = () => {
  const navigate = useNavigate();

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['home-cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_models')
        .select(`
          *,
          car_brands (name, logo_url, slug)
        `)
        .order('is_trending', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const formatPrice = (price: number | null) => {
    if (!price) return 'Price on Request';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    return `₹${(price / 100000).toFixed(2)} L`;
  };

  if (isLoading) {
    return (
      <section className="py-4">
        <div className="px-4 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary">
              <Car className="w-4 h-4 text-primary-foreground" />
            </div>
            <h2 className="text-base font-bold text-foreground">Cars in Jaipur</h2>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pl-4 pb-2 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-52 h-52 rounded-2xl shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (cars.length === 0) {
    return null;
  }

  return (
    <section className="py-4">
      <div className="px-4 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary">
            <Car className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Cars in Jaipur</h2>
            <p className="text-[10px] text-muted-foreground">On-Road Prices & Dealers</p>
          </div>
        </div>
        <Link 
          to="/cars" 
          className="text-xs text-primary flex items-center gap-1 hover:underline font-medium"
        >
          View All
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pl-4 pb-2 scrollbar-hide">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} formatPrice={formatPrice} navigate={navigate} />
        ))}
        
        {/* View More Card */}
        <Link to="/cars">
          <Card className="w-36 h-52 shrink-0 flex items-center justify-center bg-primary/10 border-dashed border-2 border-primary/30 hover:border-primary/50 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-primary flex items-center justify-center mb-2">
                <ChevronRight className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="text-xs font-medium text-primary">Explore</p>
              <p className="text-xs text-primary/80">All Cars</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
};

export default CarsSection;