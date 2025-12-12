import { useState } from "react";
import { Search, MapPin, Bell, Coins } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NativeHomeHeaderProps {
  userLocality?: string;
  userName?: string;
  jaiCoins?: number;
  onSearch: (query: string) => void;
}

const NativeHomeHeader = ({ userLocality, userName, jaiCoins = 0, onSearch }: NativeHomeHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      navigate(`/deals?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground safe-area-pt">
      {/* Top bar with greeting and coins */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/70 text-sm">
              {userName ? `Hey, ${userName.split(' ')[0]}! 👋` : 'Welcome to JaipurCircle'}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-primary-foreground/80" />
              <span className="text-sm font-medium">{userLocality || 'Jaipur'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary-foreground hover:bg-primary-foreground/10 relative"
              onClick={() => navigate('/wallet')}
            >
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary-foreground/10">
                <Coins className="w-4 h-4 text-yellow-300" />
                <span className="text-xs font-semibold">{jaiCoins.toLocaleString()}</span>
              </div>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 pb-4">
        <form onSubmit={handleSearch} className="relative">
          <div 
            className={`flex items-center bg-primary-foreground rounded-xl transition-all duration-200 ${
              searchFocused ? 'ring-2 ring-primary-foreground/50 shadow-lg' : 'shadow-md'
            }`}
          >
            <Search className="w-5 h-5 text-muted-foreground ml-4" />
            <Input
              type="text"
              placeholder="Search restaurants, spas, deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="flex-1 border-0 focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground py-3"
            />
            {searchQuery && (
              <Button 
                type="submit" 
                size="sm" 
                className="mr-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Search
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default NativeHomeHeader;
