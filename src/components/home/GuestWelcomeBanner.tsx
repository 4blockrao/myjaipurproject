import { useState } from "react";
import { Gift, Coins, Users, ArrowRight, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GuestWelcomeBannerProps {
  onSignUp: () => void;
}

/**
 * A prominent banner for guests to encourage sign up
 * Highlights the gamification and referral program benefits
 */
const GuestWelcomeBanner = ({ onSignUp }: GuestWelcomeBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const benefits = [
    { icon: Coins, text: "30 JAICoins welcome bonus", color: "text-yellow-500" },
    { icon: Gift, text: "₹100 per friend referred", color: "text-green-500" },
    { icon: Users, text: "Win prizes on leaderboard", color: "text-purple-500" },
  ];

  return (
    <div className="px-4 py-3 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-muted transition-colors z-10"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 pr-6">
              <h3 className="font-bold text-foreground text-lg">
                Join JaipurCircle & Earn!
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Sign up free & start earning rewards today
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg bg-muted/50`}>
                  <benefit.icon className={`w-4 h-4 ${benefit.color}`} />
                </div>
                <span className="text-sm font-medium text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button 
            onClick={onSignUp}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
            size="lg"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            No credit card required • Takes 30 seconds
          </p>
        </div>
      </Card>
    </div>
  );
};

export default GuestWelcomeBanner;
