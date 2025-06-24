
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarContent, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, Star, Clock, Users, Share2, Heart, 
  ArrowLeft, Calendar, Phone, Globe, Percent,
  ShoppingCart, Gift, Award, Camera, ChevronLeft,
  ChevronRight, Bookmark, MessageCircle
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

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
}

const DealDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedDeals, setRelatedDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchDealDetails();
      fetchReviews();
      fetchRelatedDeals();
    }
  }, [id]);

  const fetchDealDetails = async () => {
    try {
      // Mock data - in real implementation, fetch from deals table
      const mockDeal: Deal = {
        id: id!,
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
      };
      setDeal(mockDeal);
    } catch (error) {
      console.error('Error fetching deal details:', error);
      toast({
        title: "Error",
        description: "Failed to load deal details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    // Mock data - in real implementation, fetch from reviews table
    const mockReviews: Review[] = [
      {
        id: "1",
        user_name: "Priya S.",
        rating: 5,
        comment: "Amazing food! The thali was huge and every dish was delicious. The ambiance with live folk music made it even better.",
        created_at: "2024-06-15T10:30:00Z",
        helpful_count: 12
      },
      {
        id: "2",
        user_name: "Rahul K.",
        rating: 4,
        comment: "Great value for money. The Dal Baati Churma was outstanding. Service was quick and staff was friendly.",
        created_at: "2024-06-10T18:45:00Z",
        helpful_count: 8
      },
      {
        id: "3",
        user_name: "Anita M.",
        rating: 5,
        comment: "Perfect place for experiencing authentic Rajasthani cuisine. The discount made it even more attractive!",
        created_at: "2024-06-08T14:20:00Z",
        helpful_count: 15
      }
    ];
    setReviews(mockReviews);
  };

  const fetchRelatedDeals = async () => {
    // Mock data - in real implementation, fetch similar deals
    const mockRelatedDeals: Deal[] = [
      {
        id: "2",
        title: "Buffet Dinner at Spice Garden",
        description: "All-you-can-eat buffet with 50+ dishes",
        category: "Food & Dining",
        discount_percentage: 40,
        original_price: 1200,
        discounted_price: 720,
        location: "Malviya Nagar, Jaipur",
        start_date: "2024-06-01T00:00:00Z",
        end_date: "2024-07-31T23:59:59Z",
        merchants: {
          id: "2",
          business_name: "Spice Garden",
          business_type: "Restaurant",
          address: "Malviya Nagar, Jaipur",
          phone: "+91 141-555-0124",
          average_rating: 4.5,
          total_reviews: 189
        }
      }
    ];
    setRelatedDeals(mockRelatedDeals);
  };

  const handleSaveDeal = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from favorites" : "Added to favorites",
      description: isSaved ? "Deal removed from your saved list" : "Deal saved to your favorites"
    });
  };

  const handleShareDeal = () => {
    if (navigator.share) {
      navigator.share({
        title: deal?.title,
        text: `Check out this amazing deal: ${deal?.discount_percentage}% off!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Deal link has been copied to clipboard"
      });
    }
  };

  const handlePurchase = () => {
    if (!deal) return;
    // In real implementation, this would create an order and redirect to checkout
    const orderId = `order_${Date.now()}`;
    window.location.href = `/checkout/${orderId}`;
  };

  const getRemainingTime = () => {
    if (!deal) return '';
    const endDate = new Date(deal.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) return `${Math.floor(diffDays / 30)} months left`;
    if (diffDays > 0) return `${diffDays} days left`;
    return 'Expires soon';
  };

  const getAvailabilityStatus = () => {
    if (!deal) return { available: 0, total: 0, percentage: 0 };
    const available = (deal.max_redemptions || 0) - (deal.current_redemptions || 0);
    const total = deal.max_redemptions || 0;
    const percentage = total > 0 ? (available / total) * 100 : 0;
    return { available, total, percentage };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Deal Not Found</h2>
          <p className="text-gray-600 mb-6">The deal you're looking for doesn't exist or has been removed.</p>
          <Link to="/deals">
            <Button>Browse Other Deals</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { available, total, percentage } = getAvailabilityStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/deals">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Deals
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleSaveDeal}>
                <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShareDeal}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Deal Images */}
            <Card>
              <CardContent className="p-0">
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
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500 text-white text-lg px-3 py-1">
                      {deal.discount_percentage}% OFF
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-3">{deal.category}</Badge>
                    <CardTitle className="text-2xl mb-2">{deal.title}</CardTitle>
                    <CardDescription className="text-base">{deal.description}</CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{deal.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{getRemainingTime()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{available} left of {total}</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Tabs for additional information */}
            <Tabs defaultValue="details" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="merchant">Merchant</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Deal Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">What's Included</h4>
                      <p className="text-gray-600">{deal.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Validity</h4>
                      <p className="text-gray-600">
                        Valid from {new Date(deal.start_date).toLocaleDateString()} to{' '}
                        {new Date(deal.end_date).toLocaleDateString()}
                      </p>
                    </div>

                    {deal.terms_conditions && (
                      <div>
                        <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                        <p className="text-gray-600 text-sm">{deal.terms_conditions}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">Availability</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-pink-500 to-orange-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{available} left</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {deal.current_redemptions} of {deal.max_redemptions} deals claimed
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="merchant">
                {deal.merchants && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarContent>
                            <div className="w-full h-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-white font-bold text-xl">
                              {deal.merchants.business_name.charAt(0)}
                            </div>
                          </AvatarContent>
                          <AvatarFallback>{deal.merchants.business_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{deal.merchants.business_name}</h3>
                          <p className="text-gray-600">{deal.merchants.business_type}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{deal.merchants.average_rating}</span>
                            </div>
                            <span className="text-gray-500">({deal.merchants.total_reviews} reviews)</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {deal.merchants.description && (
                        <div>
                          <h4 className="font-semibold mb-2">About</h4>
                          <p className="text-gray-600">{deal.merchants.description}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Contact Information</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">{deal.merchants.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span className="text-sm">{deal.merchants.phone}</span>
                            </div>
                            {deal.merchants.website && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Globe className="w-4 h-4" />
                                <a href={deal.merchants.website} target="_blank" rel="noopener noreferrer" className="text-sm text-pink-600 hover:underline">
                                  {deal.merchants.website}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                    {deal.merchants && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xl font-bold">{deal.merchants.average_rating}</span>
                          <span className="text-gray-600">out of 5</span>
                        </div>
                        <span className="text-gray-500">({deal.merchants.total_reviews} reviews)</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarContent>
                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                                  {review.user_name.charAt(0)}
                                </div>
                              </AvatarContent>
                              <AvatarFallback>{review.user_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{review.user_name}</span>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating 
                                          ? 'fill-yellow-400 text-yellow-400' 
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-gray-500 text-sm">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700 mb-2">{review.comment}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <button className="flex items-center gap-1 hover:text-pink-600">
                                  <MessageCircle className="w-3 h-3" />
                                  Helpful ({review.helpful_count})
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-pink-600">₹{deal.discounted_price}</span>
                    <span className="text-lg text-gray-500 line-through">₹{deal.original_price}</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700 text-lg px-3 py-1">
                    Save ₹{deal.original_price - deal.discounted_price}
                  </Badge>
                </div>

                <Button 
                  onClick={handlePurchase}
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-lg py-6"
                  disabled={available <= 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {available <= 0 ? 'Sold Out' : 'Buy This Deal'}
                </Button>

                {available > 0 && available <= 10 && (
                  <p className="text-center text-red-600 text-sm mt-2">
                    ⚡ Only {available} left! Hurry up!
                  </p>
                )}

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    <span>Instant digital delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Earn JaiCoins on purchase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Valid until {new Date(deal.end_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Deals */}
            {relatedDeals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Similar Deals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedDeals.map((relatedDeal) => (
                    <Link key={relatedDeal.id} to={`/deal/${relatedDeal.id}`}>
                      <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-orange-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">🍽️</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{relatedDeal.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">{relatedDeal.location}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-pink-600 text-sm">₹{relatedDeal.discounted_price}</span>
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              {relatedDeal.discount_percentage}% OFF
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealDetailPage;
