
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, Star, Clock, Camera, Users, Navigation,
  Search, Filter, Heart, Share2, Calendar, Phone,
  Globe, Award, Compass, Map, Route, Mountain
} from "lucide-react";
import { Link } from "react-router-dom";

interface Attraction {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  rating: number;
  reviews_count: number;
  image_url?: string;
  opening_hours: string;
  entry_fee?: string;
  popular_times: string;
  nearby_deals?: number;
}

interface LocalGuide {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  languages: string[];
  price_per_hour: number;
  availability: string;
}

interface Tour {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  includes: string[];
  highlights: string[];
  difficulty: 'easy' | 'moderate' | 'challenging';
  group_size: string;
}

const ExplorePage = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [localGuides, setLocalGuides] = useState<LocalGuide[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const categories = [
    { id: "all", name: "All", icon: "🏛️" },
    { id: "historical", name: "Historical", icon: "🏰" },
    { id: "temples", name: "Temples", icon: "🕌" },
    { id: "markets", name: "Markets", icon: "🛒" },
    { id: "gardens", name: "Gardens", icon: "🌸" },
    { id: "museums", name: "Museums", icon: "🏛️" },
    { id: "food", name: "Food Spots", icon: "🍽️" },
    { id: "shopping", name: "Shopping", icon: "🛍️" }
  ];

  useEffect(() => {
    fetchAttractions();
    fetchLocalGuides();
    fetchTours();
  }, []);

  const fetchAttractions = async () => {
    // Mock data - in real implementation, fetch from attractions table
    const mockAttractions: Attraction[] = [
      {
        id: "1",
        name: "Hawa Mahal (Palace of Winds)",
        description: "A stunning five-story palace with 953 windows, built for royal ladies to observe street festivals",
        category: "historical",
        location: "Badi Choupad, Jaipur",
        rating: 4.6,
        reviews_count: 12847,
        opening_hours: "9:00 AM - 4:30 PM",
        entry_fee: "₹50 for Indians, ₹200 for foreigners",
        popular_times: "Best visited early morning or late afternoon",
        nearby_deals: 15
      },
      {
        id: "2",
        name: "City Palace",
        description: "A magnificent complex of courtyards, gardens and buildings, showcasing Rajput and Mughal architecture",
        category: "historical",
        location: "Tulsi Marg, Jaipur",
        rating: 4.7,
        reviews_count: 9654,
        opening_hours: "9:30 AM - 5:00 PM",
        entry_fee: "₹300 for Indians, ₹500 for foreigners",
        popular_times: "Less crowded on weekday mornings",
        nearby_deals: 22
      },
      {
        id: "3",
        name: "Amber Fort",
        description: "A majestic fort palace with intricate mirror work and stunning views of Maota Lake",
        category: "historical",
        location: "Amer, Jaipur",
        rating: 4.8,
        reviews_count: 18293,
        opening_hours: "8:00 AM - 6:00 PM",
        entry_fee: "₹100 for Indians, ₹500 for foreigners",
        popular_times: "Visit early morning to avoid crowds",
        nearby_deals: 8
      },
      {
        id: "4",
        name: "Johari Bazaar",
        description: "Famous for jewelry, especially traditional Kundan and Meenakari work",
        category: "markets",
        location: "Old City, Jaipur",
        rating: 4.4,
        reviews_count: 3421,
        opening_hours: "10:00 AM - 9:00 PM",
        entry_fee: "Free",
        popular_times: "Evening is best for shopping",
        nearby_deals: 35
      },
      {
        id: "5",
        name: "Jantar Mantar",
        description: "UNESCO World Heritage astronomical observatory with 19 architectural instruments",
        category: "historical",
        location: "Gangori Bazaar, Jaipur",
        rating: 4.3,
        reviews_count: 5892,
        opening_hours: "9:00 AM - 4:30 PM",
        entry_fee: "₹50 for Indians, ₹200 for foreigners",
        popular_times: "Best experience with a guide",
        nearby_deals: 12
      }
    ];
    setAttractions(mockAttractions);
  };

  const fetchLocalGuides = async () => {
    // Mock data - in real implementation, fetch from guides table
    const mockGuides: LocalGuide[] = [
      {
        id: "1",
        name: "Rajesh Sharma",
        specialty: "Historical Sites & Culture",
        rating: 4.9,
        experience: "8 years",
        languages: ["Hindi", "English", "French"],
        price_per_hour: 800,
        availability: "Available today"
      },
      {
        id: "2",
        name: "Priya Gupta",
        specialty: "Food Tours & Local Markets",
        rating: 4.8,
        experience: "5 years",
        languages: ["Hindi", "English", "German"],
        price_per_hour: 600,
        availability: "Available tomorrow"
      },
      {
        id: "3",
        name: "Vikram Singh",
        specialty: "Photography & Heritage Walks",
        rating: 4.7,
        experience: "6 years",
        languages: ["Hindi", "English", "Spanish"],
        price_per_hour: 1000,
        availability: "Available today"
      }
    ];
    setLocalGuides(mockGuides);
  };

  const fetchTours = async () => {
    // Mock data - in real implementation, fetch from tours table
    const mockTours: Tour[] = [
      {
        id: "1",
        title: "Royal Jaipur Heritage Walk",
        description: "Explore the majestic forts and palaces that tell the story of Rajput royalty",
        duration: "6 hours",
        price: 2500,
        includes: ["Professional guide", "Entry tickets", "Traditional lunch", "Transportation"],
        highlights: ["Amber Fort", "City Palace", "Hawa Mahal", "Jantar Mantar"],
        difficulty: "easy",
        group_size: "Max 12 people"
      },
      {
        id: "2",
        title: "Pink City Food Adventure",
        description: "Taste the authentic flavors of Rajasthan with this culinary journey",
        duration: "4 hours",
        price: 1800,
        includes: ["Food tastings", "Local guide", "Recipe cards", "Spice shopping"],
        highlights: ["Street food tour", "Traditional sweets", "Spice market", "Cooking demo"],
        difficulty: "easy",
        group_size: "Max 8 people"
      },
      {
        id: "3",
        title: "Artisan Workshop Experience",
        description: "Learn traditional crafts from master artisans in their workshops",
        duration: "5 hours",
        price: 3200,
        includes: ["Workshop sessions", "Materials", "Expert guidance", "Refreshments"],
        highlights: ["Block printing", "Jewelry making", "Pottery", "Textile weaving"],
        difficulty: "moderate",
        group_size: "Max 6 people"
      }
    ];
    setTours(mockTours);
    setIsLoading(false);
  };

  const filteredAttractions = attractions.filter(attraction => {
    const matchesSearch = !searchQuery || 
      attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attraction.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || attraction.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'challenging': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 to-orange-400 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Explore Jaipur</h1>
            <p className="text-xl opacity-90 mb-8">
              Discover the Pink City's hidden gems, historical treasures, and vibrant culture
            </p>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search attractions, tours, or guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-3 text-lg bg-white text-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="attractions" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="attractions" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Attractions
            </TabsTrigger>
            <TabsTrigger value="tours" className="flex items-center gap-2">
              <Route className="w-4 h-4" />
              Tours
            </TabsTrigger>
            <TabsTrigger value="guides" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Local Guides
            </TabsTrigger>
          </TabsList>

          {/* Attractions Tab */}
          <TabsContent value="attractions">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Top Attractions in Jaipur</h2>
              
              {/* Categories Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                  >
                    <span>{category.icon}</span>
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* Attractions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAttractions.map((attraction) => (
                  <Card key={attraction.id} className="group hover:shadow-lg transition-all duration-200">
                    <div className="aspect-video bg-gradient-to-br from-pink-100 to-orange-100 rounded-t-lg flex items-center justify-center">
                      {attraction.image_url ? (
                        <img
                          src={attraction.image_url}
                          alt={attraction.name}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="text-4xl">🏛️</div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline">{attraction.category}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{attraction.rating}</span>
                          <span className="text-gray-500 text-sm">({attraction.reviews_count})</span>
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2 group-hover:text-pink-600 transition-colors">
                        {attraction.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{attraction.description}</p>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{attraction.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{attraction.opening_hours}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          <span>{attraction.entry_fee}</span>
                        </div>
                      </div>

                      {attraction.nearby_deals > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                          <p className="text-green-700 text-sm">
                            🎯 {attraction.nearby_deals} deals available nearby
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tours Tab */}
          <TabsContent value="tours">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Curated Tours & Experiences</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tours.map((tour) => (
                  <Card key={tour.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{tour.title}</CardTitle>
                          <CardDescription className="text-base">{tour.description}</CardDescription>
                        </div>
                        <Badge className={getDifficultyColor(tour.difficulty)}>
                          {tour.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{tour.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{tour.group_size}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Highlights</h4>
                        <div className="flex flex-wrap gap-1">
                          {tour.highlights.map((highlight, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Includes</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {tour.includes.map((item, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <span className="text-2xl font-bold text-pink-600">₹{tour.price}</span>
                          <span className="text-gray-500 text-sm"> per person</span>
                        </div>
                        <Button className="bg-gradient-to-r from-pink-500 to-orange-400">
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Local Guides Tab */}
          <TabsContent value="guides">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Expert Local Guides</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localGuides.map((guide) => (
                  <Card key={guide.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {guide.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{guide.name}</h3>
                          <p className="text-gray-600 text-sm">{guide.specialty}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{guide.rating}</span>
                            </div>
                            <span className="text-gray-500 text-sm">• {guide.experience}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Languages</h4>
                          <div className="flex flex-wrap gap-1">
                            {guide.languages.map((language, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {language}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Availability</span>
                          <Badge className="bg-green-100 text-green-700">{guide.availability}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <span className="text-lg font-bold text-pink-600">₹{guide.price_per_hour}</span>
                          <span className="text-gray-500 text-sm">/hour</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button size="sm">Book Guide</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-pink-500 to-orange-400 text-white mt-12">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Plan Your Perfect Jaipur Experience</h3>
            <p className="text-lg opacity-90 mb-6">
              Combine attractions, tours, and local guides for an unforgettable journey
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="bg-white text-pink-600 border-white hover:bg-gray-100">
                <Map className="w-4 h-4 mr-2" />
                View Interactive Map
              </Button>
              <Link to="/deals">
                <Button variant="outline" className="bg-white text-pink-600 border-white hover:bg-gray-100">
                  <Compass className="w-4 h-4 mr-2" />
                  Find Nearby Deals
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExplorePage;
