import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import FloatingHeader from "@/components/layout/FloatingHeader";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, Star, BadgeCheck, Search, ChevronRight, MapPin } from "lucide-react";

const MerchantsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: merchants = [], isLoading } = useQuery({
    queryKey: ['all-merchants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('is_active', true)
        .order('average_rating', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const categories = [
    { id: 'all', label: 'All', emoji: '🏪' },
    { id: 'Food & Dining', label: 'Food', emoji: '🍽️' },
    { id: 'Beauty & Wellness', label: 'Beauty', emoji: '💅' },
    { id: 'Shopping', label: 'Shopping', emoji: '🛍️' },
    { id: 'Electronics', label: 'Electronics', emoji: '📱' },
    { id: 'Health & Fitness', label: 'Fitness', emoji: '💪' },
    { id: 'Services', label: 'Services', emoji: '🔧' },
  ];

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || merchant.business_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryEmojis: Record<string, string> = {
    'Food & Dining': '🍽️',
    'Beauty & Wellness': '💅',
    'Shopping': '🛍️',
    'Electronics': '📱',
    'Health & Fitness': '💪',
    'Automotive': '🚗',
    'Services': '🔧',
    'Travel': '✈️',
    'Education': '📚',
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>Top Merchants in Jaipur - Local Businesses & Shops | JaipurCircle</title>
        <meta name="description" content="Discover the best local merchants, shops, and businesses in Jaipur. Find verified sellers with exclusive deals and offers on JaipurCircle." />
        <link rel="canonical" href="https://jaipurcircle.com/merchants" />
      </Helmet>

      <FloatingHeader title="Merchants" showBackButton />

      <main className="pt-16 px-4 space-y-4 max-w-2xl mx-auto">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search merchants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filteredMerchants.length} merchants found</span>
        </div>

        {/* Merchants List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredMerchants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Store className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No merchants found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMerchants.map((merchant) => (
              <Link key={merchant.id} to={`/merchant/${merchant.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {merchant.logo_url ? (
                        <img 
                          src={merchant.logo_url} 
                          alt={merchant.business_name}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-2xl">{categoryEmojis[merchant.business_type || ''] || '🏪'}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm line-clamp-1">{merchant.business_name}</h3>
                          {merchant.is_verified && (
                            <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                          )}
                        </div>
                        {merchant.business_type && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {merchant.business_type}
                          </Badge>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {merchant.average_rating?.toFixed(1) || '4.5'}
                          </span>
                          {merchant.address && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3" />
                              {merchant.address.split(',')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <NativeBottomNav />
    </div>
  );
};

export default MerchantsPage;
