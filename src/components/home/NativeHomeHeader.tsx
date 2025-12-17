import { useState, useEffect } from "react";
import { Search, MapPin, Coins, LogIn, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import JaipurCircleLogo from "@/components/ui/JaipurCircleLogo";

interface NativeHomeHeaderProps {
  userLocality?: string;
  userName?: string;
  jaiCoins?: number;
  isAuthenticated?: boolean;
  onSearch: (query: string) => void;
  onSignIn?: () => void;
}

const NativeHomeHeader = ({ 
  userLocality, 
  userName, 
  jaiCoins = 0, 
  isAuthenticated = false,
  onSearch,
  onSignIn
}: NativeHomeHeaderProps) => {
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
    <header className="bg-background border-b border-border/50 safe-area-pt">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <Link to="/">
            <JaipurCircleLogo size="md" />
          </Link>
          
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-foreground hover:bg-muted"
                  onClick={() => navigate('/account?tab=wallet')}
                >
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      {jaiCoins.toLocaleString()}
                    </span>
                  </div>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-foreground hover:bg-muted"
                  onClick={() => navigate('/account')}
                >
                  <User className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Button 
                onClick={onSignIn}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Sign In
              </Button>
            )}
          </div>
        </div>

        {isAuthenticated && userName && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-sm text-muted-foreground">
              Hey, {userName.split(' ')[0]}!
            </span>
            <span className="text-muted-foreground">•</span>
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{userLocality || 'Jaipur'}</span>
          </div>
        )}
      </div>

      <div className="px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <div 
            className={`flex items-center bg-muted/50 rounded-xl transition-all duration-200 ${
              searchFocused ? 'ring-2 ring-primary/20 bg-background' : ''
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
              <Button type="submit" size="sm" className="mr-2">
                Search
              </Button>
            )}
          </div>
        </form>
      </div>
    </header>
  );
};

export default NativeHomeHeader;
