import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { 
  Search, Filter, MapPin, Clock, Star, 
  Heart, Share2, ShoppingCart, Percent,
  TrendingUp, Gift, Users
} from "lucide-react";

interface Deal {
  id: string;
  title: string;
  description: string;
  category: string;
  discount_percentage: number;
  original_price: number;
  discounted_price: number;
  location: string;
  image_url?: string;
  start_date: string;
  end_date: string;
  terms_conditions?: string;
  max_redemptions?: number;
  current_redemptions?: number;
  merchants?: {
    id: string;
    business_name: string;
    business_type: string;
    address: string;
    phone: string;
    website?: string;
    average_rating: number;
    total_reviews: number;
    description?: string;
  };
}

const DealsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("Jaipur");
  const [sortBy, setSortBy] = useState("relevance");
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchDeals();
  }, [selectedCategory, searchQuery, selectedLocation, sortBy]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await fetchUserProfile(session.user.id);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      // Mock data - in real implementation, fetch from deals table
      const mockDeals: Deal[] = [
        {
          id: "1",
          title: "Royal Rajasthani Thali Experience",
          description: "Indulge in an authentic Royal Rajasthani Thali featuring over 15 traditional dishes including Dal Baati Churma, Gatte ki Sabzi, Ker Sangri, and much more. Experience the rich culinary heritage of Rajasthan in our beautifully decorated restaurant with live folk music.",
          category: "Food & Dining",
          discount_percentage: 50,
          original_price: 800,
          discounted_price: 400,
          location: "C-Scheme, Jaipur",
          image_url: "/placeholder.svg",
          start_date: "2024-06-01T00:00:00Z",
          end_date: "2024-07-31T23:59:59Z",
          terms_conditions: "Valid for dine-in only. Cannot be combined with other offers. Advanced booking recommended. Valid for up to 4 people per coupon.",
          max_redemptions: 100,
          current_redemptions: 45,
          merchants: {
            id: "1",
            business_name: "Royal Heritage Restaurant",
            business_type: "Restaurant",
            address: "123 Heritage Plaza, C-Scheme, Jaipur, Rajasthan 302001",
            phone: "+91 141-555-0123",
            website: "www.royalheritage.com",
            average_rating: 4.7,
            total_reviews: 324,
            description: "Established in 1985, Royal Heritage Restaurant has been serving authentic Rajasthani cuisine to locals and tourists alike. Our chefs use traditional recipes passed down through generations."
          }
        },
        {
          id: "2",
          title: "Spa Day with Aromatherapy Massage",
          description: "Relax and rejuvenate with our signature aromatherapy massage. Choose from a variety of essential oils to customize your experience. Includes access to sauna and steam room.",
          category: "Beauty & Wellness",
          discount_percentage: 30,
          original_price: 1500,
          discounted_price: 1050,
          location: "Vaishali Nagar, Jaipur",
          image_url: "/placeholder.svg",
          start_date: "2024-06-15T00:00:00Z",
          end_date: "2024-08-15T23:59:59Z",
          terms_conditions: "Valid for appointments booked in advance. Not valid on weekends. Cannot be combined with other offers.",
          max_redemptions: 75,
          current_redemptions: 22,
          merchants: {
            id: "2",
            business_name: "Serene Spa & Wellness",
            business_type: "Spa",
            address: "456 Tranquility Lane, Vaishali Nagar, Jaipur, Rajasthan 302021",
            phone: "+91 141-555-0456",
            website: "www.serenespa.com",
            average_rating: 4.9,
            total_reviews: 456,
            description: "Serene Spa & Wellness is dedicated to providing a tranquil escape from the stresses of daily life. Our experienced therapists offer a range of treatments to relax and rejuvenate your body and mind."
          }
        },
        {
          id: "3",
          title: "Handcrafted Leather Handbag",
          description: "Shop our exclusive collection of handcrafted leather handbags. Each piece is made with the finest quality leather and designed with attention to detail. Perfect for adding a touch of elegance to your wardrobe.",
          category: "Shopping",
          discount_percentage: 25,
          original_price: 2500,
          discounted_price: 1875,
          location: "Bapu Bazaar, Jaipur",
          image_url: "/placeholder.svg",
          start_date: "2024-07-01T00:00:00Z",
          end_date: "2024-09-30T23:59:59Z",
          terms_conditions: "Valid on select items only. Cannot be combined with other discounts. Exchange only within 7 days of purchase.",
          max_redemptions: 50,
          current_redemptions: 15,
          merchants: {
            id: "3",
            business_name: "Artisan Leather Boutique",
            business_type: "Retail",
            address: "789 Leather Street, Bapu Bazaar, Jaipur, Rajasthan 302003",
            phone: "+91 141-555-0789",
            website: "www.artisanleather.com",
            average_rating: 4.6,
            total_reviews: 234,
            description: "Artisan Leather Boutique specializes in handcrafted leather goods made by local artisans. We are committed to preserving traditional craftsmanship and providing unique, high-quality products to our customers."
          }
        },
        {
          id: "4",
          title: "Premium Noise Cancelling Headphones",
          description: "Experience crystal-clear audio with our premium noise cancelling headphones. Perfect for travel, work, or relaxation. Features Bluetooth 5.0, comfortable earcups, and long battery life.",
          category: "Electronics",
          discount_percentage: 40,
          original_price: 3500,
          discounted_price: 2100,
          location: "Sardar Patel Marg, Jaipur",
          image_url: "/placeholder.svg",
          start_date: "2024-07-15T00:00:00Z",
          end_date: "2024-10-31T23:59:59Z",
          terms_conditions: "Valid for online purchases only. Free shipping on orders over ₹500. 1-year warranty included.",
          max_redemptions: 60,
          current_redemptions: 30,
          merchants: {
            id: "4",
            business_name: "Tech Gadgets Emporium",
            business_type: "Electronics Store",
            address: "101 Tech Plaza, Sardar Patel Marg, Jaipur, Rajasthan 302004",
            phone: "+91 141-555-1010",
            website: "www.techgadgets.com",
            average_rating: 4.8,
            total_reviews: 567,
            description: "Tech Gadgets Emporium offers a wide range of electronics and gadgets from top brands. Our knowledgeable staff is dedicated to providing excellent customer service and helping you find the perfect tech solutions for your needs."
          }
        },
        {
          id: "5",
          title: "Yoga and Meditation Retreat",
          description: "Join our rejuvenating yoga and meditation retreat in the serene outskirts of Jaipur. Includes daily yoga sessions, guided meditation, healthy meals, and nature walks. Perfect for all skill levels.",
          category: "Health & Fitness",
          discount_percentage: 35,
          original_price: 4000,
          discounted_price: 2600,
          location: "Amer Road, Jaipur",
          image_url: "/placeholder.svg",
          start_date: "2024-08-01T00:00:00Z",
          end_date: "2024-11-30T23:59:59Z",
          terms_conditions: "Valid for bookings made before July 31, 2024. Non-refundable deposit required. Limited spots available.",
          max_redemptions: 40,
          current_redemptions: 10,
          merchants: {
            id: "5",
            business_name: "Zenith Wellness Center",
            business_type: "Wellness Center",
            address: "222 Serenity Villa, Amer Road, Jaipur, Rajasthan 302005",
            phone: "+91 141-555-2222",
            website: "www.zenithwellness.com",
            average_rating: 4.9,
            total_reviews: 678,
            description: "Zenith Wellness Center is committed to promoting holistic health and well-being. Our experienced instructors and therapists offer a variety of programs and services to help you achieve your wellness goals."
          }
        },
        {
          id: "6",
          title: "Home Cleaning Services",
          description: "Get your home sparkling clean with our professional cleaning services. Our experienced cleaners use eco-friendly products and pay attention to every detail. Book your appointment today!",
          category: "Services",
          discount_percentage: 20,
          original_price: 1200,
          discounted_price: 960,
          location: "All Areas, Jaipur",
          image_url: "/placeholder.svg",
          start_date: "2024-08-15T00:00:00Z",
          end_date: "2024-12-31T23:59:59Z",
          terms_conditions: "Valid for first-time customers only. Minimum 2-hour booking required. Additional charges may apply for extra services.",
          max_redemptions: 80,
          current_redemptions: 50,
          merchants: {
            id: "6",
            business_name: "Clean Sweep Home Services",
            business_type: "Cleaning Services",
            address: "333 Clean Street, All Areas, Jaipur, Rajasthan 302006",
            phone: "+91 141-555-3333",
            website: "www.cleansweep.com",
            average_rating: 4.7,
            total_reviews: 345,
            description: "Clean Sweep Home Services provides reliable and affordable cleaning solutions for homes and businesses. Our dedicated team is committed to delivering exceptional results and ensuring your complete satisfaction."
          }
        },
      ];
      setDeals(mockDeals);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDeal = (dealId: string) => {
    toast({
      title: "Save Deal",
      description: `Deal ${dealId} saved successfully!`
    });
  };

  const handleShareDeal = (dealId: string) => {
    toast({
      title: "Share Deal",
      description: `Deal ${dealId} shared successfully!`
    });
  };

  return (
    <AppLayout user={user} profile={profile}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Deals in Jaipur</h1>
                <Badge variant="secondary">
                  <MapPin className="w-3 h-3 mr-1" />
                  {selectedLocation}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Search deals..."
                  className="sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setSelectedCategory(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                  <SelectItem value="Beauty & Wellness">Beauty & Wellness</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-pink-100 to-orange-100 rounded-t-lg flex items-center justify-center relative">
                    {deal.image_url ? (
                      <img
                        src={deal.image_url}
                        alt={deal.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="text-6xl">🍽️</div>
                    )}
                    <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                      {deal.discount_percentage}% OFF
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-semibold line-clamp-1">{deal.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-500 line-clamp-2">{deal.description}</CardDescription>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-xl font-bold text-pink-600">₹{deal.discounted_price}</span>
                        <span className="text-gray-500 line-through ml-2">₹{deal.original_price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleSaveDeal(deal.id)}>
                          <Heart className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleShareDeal(deal.id)}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                        <Link to={`/deal/${deal.id}`}>
                          <Button size="sm">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DealsPage;
