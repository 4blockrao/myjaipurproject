import { useState } from "react";
import { Gift, X, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FloatingReferralCTAProps {
  isAuthenticated: boolean;
  onSignUp?: () => void;
}

/**
 * Floating CTA for referral program - appears for authenticated users
 * Shows a subtle reminder to invite friends
 */
const FloatingReferralCTA = ({ isAuthenticated, onSignUp }: FloatingReferralCTAProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    // Check if user dismissed it recently (within 24 hours)
    const dismissed = localStorage.getItem('referralCTADismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      // Show again after 24 hours
      return (now - dismissedTime) < 24 * 60 * 60 * 1000;
    }
    return false;
  });
  
  const navigate = useNavigate();

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('referralCTADismissed', Date.now().toString());
  };

  const handleAction = () => {
    if (isAuthenticated) {
      navigate('/referral');
    } else if (onSignUp) {
      onSignUp();
    }
  };

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {isExpanded ? (
        <div className="bg-card border border-border rounded-2xl shadow-xl p-4 w-64 animate-in slide-in-from-right-5 duration-300">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Refer & Earn</p>
              <p className="text-xs text-muted-foreground">₹100 per friend</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-lg">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-foreground">
              {isAuthenticated 
                ? "Invite friends & earn JAICoins!" 
                : "Sign up & get 30 JAICoins free!"}
            </span>
          </div>
          
          <Button 
            onClick={handleAction}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            size="sm"
          >
            {isAuthenticated ? "Invite Friends" : "Get Started"}
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-3.5 rounded-full shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-105 transition-all duration-200 animate-bounce"
          style={{ animationDuration: '2s' }}
        >
          <Gift className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default FloatingReferralCTA;
