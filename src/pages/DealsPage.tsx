import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import DealsSEO from "@/components/seo/DealsSEO";
import { PillarSchema } from "@/components/seo/SchemaInjector";
import DealCard, { type DealCardData } from "@/components/deals/DealCard";
import DealFilters, { type DealFilterCategory } from "@/components/deals/DealFilters";
import {
  Search, X, Store, Star, ChevronRight, Sparkles, Flame, TrendingUp,
} from "lucide-react";

interface Merchant {
  id: string;
  business_name: string;
  business_type: string | null;
  address: string | null;
  logo_url: string | null;
  average_rating: number | null;
  total_reviews: number | null;
  is_verified: boolean | null;
}

const categories: DealFilterCategory[] = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "Food & Dining", label: "Food", emoji: "🍽️" },
  { id: "Beauty & Wellness", label: "Beauty", emoji: "💆" },
  { id: "Fashion", label: "Fashion", emoji: "👗" },
  { id: "Electronics", label: "Electronics", emoji: "📱" },
  { id: "Health & Fitness", label: "Fitness", emoji: "💪" },
  { id: "Home & Garden", label: "Home", emoji: "🏠" },
];

const sortOptions = [
  { id: "discount", label: "Top discount" },
  { id: "ending", label: "Ending soon" },
  { id: "popular", label: "Most popular" },
  { id: "new", label: "Newest" },
];

const businessTypeEmojis: Record<string, string> = {
  Restaurant: "🍽️",
  "Beauty & Wellness": "💆",
  Electronics: "📱",
  "Health & Fitness": "💪",
  Retail: "🛍️",
  Technology: "💻",
  Education: "📚",
  Automotive: "🚗",
  Recreation: "🎮",
  "Pet Services": "🐕",
};

const DealsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deals, setDeals] = useState<DealCardData[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [selectedLocality, setSelectedLocality] = useState<string>("all");
  const [sortBy, setSortBy] = useState("discount");
  const [showSearch, setShowSearch] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let dealsQuery = supabase
          .from("deals")
          .select(
            `id, slug, title, description, category, discount_percentage,
             original_price, discounted_price, location, image_url, end_date,
             is_featured, inventory_count, max_redemptions, current_redemptions,
             merchants (business_name, is_verified, average_rating)`
          )
          .eq("status", "published")
          .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`);

        if (selectedCategory !== "all") {
          dealsQuery = dealsQuery.eq("category", selectedCategory);
        }
        if (searchQuery) {
          dealsQuery = dealsQuery.ilike("title", `%${searchQuery}%`);
        }

        // Sort
        if (sortBy === "discount") {
          dealsQuery = dealsQuery.order("discount_percentage", {
            ascending: false,
            nullsFirst: false,
          });
        } else if (sortBy === "ending") {
          dealsQuery = dealsQuery.order("end_date", { ascending: true });
        } else if (sortBy === "popular") {
          dealsQuery = dealsQuery.order("current_redemptions", {
            ascending: false,
            nullsFirst: false,
          });
        } else {
          dealsQuery = dealsQuery.order("created_at", { ascending: false });
        }

        const merchantsQuery = supabase
          .from("merchants")
          .select(
            "id, business_name, business_type, address, logo_url, average_rating, total_reviews, is_verified"
          )
          .eq("is_active", true)
          .order("average_rating", { ascending: false })
          .limit(10);

        const [dealsResult, merchantsResult] = await Promise.all([
          dealsQuery.limit(60),
          merchantsQuery,
        ]);
        if (cancelled) return;
        if (dealsResult.error) throw dealsResult.error;
        if (merchantsResult.error) throw merchantsResult.error;

        setDeals((dealsResult.data as unknown as DealCardData[]) || []);
        setMerchants(merchantsResult.data || []);
      } catch (err) {
        console.error("Error fetching deals:", err);
        if (!cancelled) {
          setDeals([]);
          setMerchants([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, searchQuery, sortBy]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchParams(categoryId !== "all" ? { category: categoryId } : {});
  };

  const localityOptions = useMemo(() => {
    const set = new Set<string>();
    deals.forEach((d) => d.location && set.add(d.location));
    return ["all", ...Array.from(set).sort()];
  }, [deals]);

  const filteredDeals = useMemo(() => {
    if (selectedLocality === "all") return deals;
    return deals.filter((d) => d.location === selectedLocality);
  }, [deals, selectedLocality]);

  const handleSave = (dealId: string) => {
    toast({ title: "Saved", description: "Deal added to favorites" });
  };

  return (
    <AppLayout
      title="Deals"
      subtitle="Exclusive offers in Jaipur"
      showBackButton
      backPath="/"
      showHeader
      headerRightAction={
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => setShowSearch((s) => !s)}
        >
          {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        </Button>
      }
    >
      <DealsSEO category={selectedCategory} />
      <PillarSchema
        title="Best Deals in Jaipur"
        description="Discover exclusive offers, discounts and deals from local businesses in Jaipur."
        items={deals.map((d) => ({
          url: `https://www.jaipurcircle.com/deal/${d.id}`,
          name: d.title,
        }))}
      />

      {showSearch && (
        <div className="animate-fade-in border-b bg-background px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search deals..."
              className="border-0 bg-muted/50 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}

      <div className="sticky top-14 z-40">
        <DealFilters
          categories={categories}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
          sortOptions={sortOptions}
          selectedSort={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      {/* Locality filter chips */}
      {localityOptions.length > 1 && (
        <div className="border-b bg-background">
          <ScrollArea className="w-full">
            <div className="flex gap-2 px-4 py-2">
              {localityOptions.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setSelectedLocality(loc)}
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedLocality === loc
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {loc === "all" ? "All localities" : loc}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>
      )}

      {/* Top Merchants */}
      {!searchQuery && selectedCategory === "all" && merchants.length > 0 && (
        <div className="border-b px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Top Merchants</h2>
            </div>
            <Link
              to="/merchants"
              className="flex items-center gap-0.5 text-xs text-primary"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <ScrollArea className="-mx-4 w-full px-4">
            <div className="flex gap-3">
              {merchants.map((merchant) => (
                <Link
                  key={merchant.id}
                  to={`/merchant/${merchant.id}`}
                  className="group w-28 shrink-0 text-center"
                >
                  <div className="relative mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 transition-transform group-hover:scale-105">
                    {merchant.logo_url ? (
                      <img
                        src={merchant.logo_url}
                        alt={merchant.business_name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">
                        {businessTypeEmojis[merchant.business_type || ""] || "🏪"}
                      </span>
                    )}
                    {merchant.is_verified && (
                      <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-primary p-0.5">
                        <Sparkles className="h-2.5 w-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="line-clamp-1 text-xs font-medium">
                    {merchant.business_name}
                  </p>
                  <div className="mt-0.5 flex items-center justify-center gap-0.5">
                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] text-muted-foreground">
                      {merchant.average_rating?.toFixed(1) || "New"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>
      )}

      {/* Results header */}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Flame className="h-4 w-4 text-orange-500" />
          {isLoading ? "Loading..." : `${filteredDeals.length} deals available`}
        </p>
      </div>

      {/* Grid */}
      <div className="px-4 pb-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="space-y-2 p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mb-4 text-5xl">🔍</div>
            <h3 className="mb-1 text-lg font-semibold">No deals found</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Try a different category, locality, or search term
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {selectedCategory !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCategorySelect("all")}
                >
                  Clear category
                </Button>
              )}
              {selectedLocality !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLocality("all")}
                >
                  Clear locality
                </Button>
              )}
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              )}
              <Link to="/merchants">
                <Button size="sm" className="gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" /> Browse merchants
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} onSave={handleSave} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DealsPage;