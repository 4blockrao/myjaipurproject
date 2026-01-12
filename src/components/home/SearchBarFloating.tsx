import { useState } from "react";
import { Search, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "@/contexts/AnalyticsContext";

const SearchBarFloating = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const { trackSearch } = useAnalytics();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Track the search
      trackSearch(searchQuery.trim(), 'homepage_search');
      navigate(`/deals?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="px-4 -mt-7 relative z-10">
      <form onSubmit={handleSearch}>
        <div 
          className={`bg-card rounded-full shadow-lg border transition-all duration-300 ${
            isFocused 
              ? "border-primary shadow-xl" 
              : "border-border/30"
          }`}
        >
          <div className="flex items-center px-4 py-3 gap-3">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              type="text"
              placeholder="Search deals, events, places."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="flex-1 border-0 p-0 h-auto text-base focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/60"
            />
            {searchQuery ? (
              <button 
                type="button" 
                onClick={() => setSearchQuery("")}
                className="p-1.5 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/jaipur')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                Jaipur
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBarFloating;
