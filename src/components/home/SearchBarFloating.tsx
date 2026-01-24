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
    <div className="px-4 -mt-6 relative z-10">
      <form onSubmit={handleSearch}>
        <div 
          className={`bg-card rounded-2xl shadow-lg border transition-all duration-300 ${
            isFocused 
              ? "border-primary/50 shadow-xl ring-2 ring-primary/10" 
              : "border-border/40"
          }`}
        >
          <div className="flex items-center px-4 py-2.5 gap-2">
            {/* Search icon - only show when not typing */}
            {!searchQuery && (
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            <Input
              type="text"
              placeholder="Search deals, events, places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="flex-1 border-0 p-0 h-auto text-sm focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50"
            />
            {searchQuery ? (
              <div className="flex items-center gap-1.5">
                <button 
                  type="button" 
                  onClick={() => setSearchQuery("")}
                  className="p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  Search
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/jaipur')}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-muted/80 rounded-full text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <MapPin className="w-3 h-3" />
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
