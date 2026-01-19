import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Home, MapPin, Bed, Bath, Square } from "lucide-react";

const PropertiesSection = () => {
  const navigate = useNavigate();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['home-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) {
        // If properties table doesn't exist, return empty
        console.log('Properties table not available');
        return [];
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fallback property cards if no data
  const fallbackProperties = [
    {
      id: '1',
      title: '3 BHK Luxury Apartment',
      locality: 'Malviya Nagar',
      price: 8500000,
      bedrooms: 3,
      bathrooms: 2,
      area_sqft: 1650,
      property_type: 'Apartment',
      listing_type: 'sale',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      title: '2 BHK Flat for Rent',
      locality: 'Vaishali Nagar',
      price: 18000,
      bedrooms: 2,
      bathrooms: 2,
      area_sqft: 1100,
      property_type: 'Apartment',
      listing_type: 'rent',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop'
    },
    {
      id: '3',
      title: 'Independent Villa',
      locality: 'Jagatpura',
      price: 15000000,
      bedrooms: 4,
      bathrooms: 4,
      area_sqft: 2800,
      property_type: 'Villa',
      listing_type: 'sale',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop'
    },
    {
      id: '4',
      title: 'Commercial Shop',
      locality: 'C-Scheme',
      price: 45000,
      area_sqft: 450,
      property_type: 'Commercial',
      listing_type: 'rent',
      image: 'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=400&h=300&fit=crop'
    }
  ];

  const displayProperties = properties.length > 0 ? properties : fallbackProperties;

  if (isLoading) {
    return (
      <section className="py-4">
        <div className="px-4 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500">
              <Home className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-foreground">Properties in Jaipur</h2>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pl-4 pb-2 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-56 h-48 rounded-2xl shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-4">
      <div className="px-4 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500">
            <Home className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Properties in Jaipur</h2>
            <p className="text-[10px] text-muted-foreground">Buy, Rent & Sell Properties</p>
          </div>
        </div>
        <Link 
          to="/properties" 
          className="text-xs text-primary flex items-center gap-1 hover:underline font-medium"
        >
          View All
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pl-4 pb-2 scrollbar-hide">
        {displayProperties.map((property: any) => (
          <Card 
            key={property.id}
            onClick={() => navigate(`/properties/${property.id}`)}
            className="w-56 shrink-0 cursor-pointer group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300"
          >
            {/* Image */}
            <div className="relative h-32 overflow-hidden">
              <img 
                src={property.cover_image || property.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'} 
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              {/* Type badge */}
              <Badge className={`absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 ${
                property.listing_type === 'rent' ? 'bg-blue-500' : 'bg-emerald-500'
              }`}>
                For {property.listing_type === 'rent' ? 'Rent' : 'Sale'}
              </Badge>
              
              {/* Property Type */}
              <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] bg-white/90 text-foreground">
                {property.property_type}
              </Badge>
              
              {/* Location */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1">
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <MapPin className="w-2.5 h-2.5 text-white" />
                  <span className="text-[10px] text-white font-medium">{property.locality}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <CardContent className="p-3">
              <h3 className="font-semibold text-sm line-clamp-1 text-foreground mb-1.5">
                {property.title}
              </h3>
              
              {/* Features */}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                {property.bedrooms && (
                  <div className="flex items-center gap-1">
                    <Bed className="w-3 h-3" />
                    <span>{property.bedrooms} Bed</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-1">
                    <Bath className="w-3 h-3" />
                    <span>{property.bathrooms} Bath</span>
                  </div>
                )}
                {property.area_sqft && (
                  <div className="flex items-center gap-1">
                    <Square className="w-3 h-3" />
                    <span>{property.area_sqft} sqft</span>
                  </div>
                )}
              </div>
              
              {/* Price */}
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-foreground">
                  ₹{property.price >= 10000000 
                    ? `${(property.price / 10000000).toFixed(1)} Cr` 
                    : property.price >= 100000 
                      ? `${(property.price / 100000).toFixed(1)} L` 
                      : property.price.toLocaleString()
                  }
                </span>
                {property.listing_type === 'rent' && (
                  <span className="text-[10px] text-muted-foreground">/month</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* View More Card */}
        <Link to="/properties">
          <Card className="w-36 h-48 shrink-0 flex items-center justify-center bg-emerald-50 border-dashed border-2 border-emerald-200 hover:border-emerald-400 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500 flex items-center justify-center mb-2">
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-medium text-emerald-700">Explore</p>
              <p className="text-xs text-emerald-600">Properties</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
};

export default PropertiesSection;
