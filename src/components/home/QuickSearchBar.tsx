import { useState } from "react";
import { Search, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const QuickSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/deals?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const quickTags = ["Food", "Spa", "Shopping", "Events"];

  return (
    <div className="px-4 -mt-6 relative z-10">
      <form onSubmit={handleSearch}>
        <div 
          className={`bg-card rounded-2xl shadow-lg border transition-all duration-300 ${
            isFocused 
              ? "border-primary shadow-heritage" 
              : "border-border/50"
          }`}
        >
          <div className="flex items-center px-4 py-3 gap-3">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              type="text"
              placeholder="Search deals, events, places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="flex-1 border-0 p-0 h-auto text-base focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/70"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery("")}
                className="p-1.5 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/jaipur')}
              className="flex items-center gap-1 px-3 py-1.5 bg-secondary rounded-lg text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Jaipur</span>
            </button>
          </div>
          
          {/* Quick tags */}
          {!searchQuery && (
            <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    navigate(`/deals?search=${encodeURIComponent(tag)}`);
                  }}
                  className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors whitespace-nowrap"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default QuickSearchBar;
