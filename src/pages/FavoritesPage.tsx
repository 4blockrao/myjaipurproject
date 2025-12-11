import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Clock, MapPin, Star, Share2, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import NativeDashboardLayout from "@/components/layout/NativeDashboardLayout";
import { NativeCard } from "@/components/ui/native-card";
import { cn } from "@/lib/utils";

interface SavedDeal {
  id: string;
  title: string;
  description: string;
  category: string;
  discount_percentage: number;
  original_price: number;
  discounted_price: number;
  location: string;
  end_date: string;
  merchants?: {
    business_name: string;
    average_rating: number;
  };
}

const FavoritesPage = () => {
  const [user, setUser] = useState<any>(null);
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSavedDeals();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
    setIsLoading(false);
  };

  const fetchSavedDeals = async () => {
    // Mock data - in real implementation, fetch from database
    const mockSavedDeals: SavedDeal[] = [
      {
        id: "1",
        title: "50% off at Rajasthani Thali House",
        description: "Traditional Rajasthani cuisine with authentic flavors",
        category: "Food & Dining",
        discount_percentage: 50,
        original_price: 800,
        discounted_price: 400,
        location: "C-Scheme, Jaipur",
        end_date: "2024-07-15",
        merchants: {
          business_name: "Rajasthani Thali House",
          average_rating: 4.5
        }
      },
      {
        id: "2",
        title: "30% off Spa Package",
        description: "Relaxing spa and wellness treatments",
        category: "Beauty & Wellness",
        discount_percentage: 30,
        original_price: 2000,
        discounted_price: 1400,
        location: "Malviya Nagar, Jaipur",
        end_date: "2024-07-20",
        merchants: {
          business_name: "Serenity Spa",
          average_rating: 4.8
        }
      }
    ];
    setSavedDeals(mockSavedDeals);
  };

  const removeSavedDeal = async (dealId: string) => {
    setSavedDeals(prev => prev.filter(deal => deal.id !== dealId));
    toast({
      title: "Removed from favorites",
      description: "Deal has been removed from your saved list"
    });
  };

  const shareDeal = (deal: SavedDeal) => {
    if (navigator.share) {
      navigator.share({
        title: deal.title,
        text: `Check out this amazing deal: ${deal.discount_percentage}% off!`,
        url: `${window.location.origin}/deal/${deal.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/deal/${deal.id}`);
      toast({
        title: "Link copied",
        description: "Deal link has been copied to clipboard"
      });
    }
  };

  if (isLoading) {
    return (
      <NativeDashboardLayout title="Favorites">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      </NativeDashboardLayout>
    );
  }

  if (!user) {
    return (
      <NativeDashboardLayout title="Favorites">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">Please sign in to view your favorites</p>
          <Button onClick={() => navigate('/')} className="rounded-xl">
            Go to Home
          </Button>
        </div>
      </NativeDashboardLayout>
    );
  }

  const DealCard = ({ deal }: { deal: SavedDeal }) => (
    <NativeCard variant="default" padding="none" className="overflow-hidden">
      {/* Deal Image Placeholder */}
      <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 relative">
        <Badge className="absolute top-3 left-3 bg-emerald-500 text-white rounded-full px-2.5 py-1">
          {deal.discount_percentage}% OFF
        </Badge>
        <div className="absolute top-3 right-3 flex gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/90 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              shareDeal(deal);
            }}
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/90 shadow-sm text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              removeSavedDeal(deal.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Deal Content */}
      <div className="p-4">
        <Badge variant="outline" className="text-xs mb-2 rounded-full">
          {deal.category}
        </Badge>
        
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{deal.title}</h3>
        
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{deal.location}</span>
          </div>
          {deal.merchants && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{deal.merchants.business_name}</span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium">{deal.merchants.average_rating?.toFixed(1)}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Ends {new Date(deal.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">₹{deal.discounted_price}</span>
            <span className="text-sm text-muted-foreground line-through">₹{deal.original_price}</span>
          </div>
          <Link to={`/deal/${deal.id}`}>
            <Button size="sm" className="rounded-xl h-9 px-4">
              View Deal
            </Button>
          </Link>
        </div>
      </div>
    </NativeCard>
  );

  return (
    <NativeDashboardLayout 
      title="Favorites" 
      subtitle={`${savedDeals.length} saved deals`}
      rightAction={
        <Link to="/deals">
          <Button variant="ghost" size="sm" className="text-xs rounded-lg">
            Browse
          </Button>
        </Link>
      }
    >
      {savedDeals.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Saved Deals</h3>
          <p className="text-muted-foreground mb-6">Start saving deals you love for easy access</p>
          <Link to="/deals">
            <Button className="rounded-xl">Browse Deals</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </NativeDashboardLayout>
  );
};

export default FavoritesPage;
