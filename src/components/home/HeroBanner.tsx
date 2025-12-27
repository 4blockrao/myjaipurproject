import { Link } from "react-router-dom";
import { ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Hero Image Container */}
      <div className="relative h-[320px] sm:h-[380px]">
        {/* Background Image - Hawa Mahal sunset */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80')`,
          }}
        />
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        
        {/* Sunset sky gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[hsl(var(--primary)/0.15)]" />
        
        {/* Content */}
        <div className="relative h-full px-5 pt-8 pb-16 flex flex-col">
          {/* Main Heading */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight font-display drop-shadow-lg">
              Today's Top<br />
              Deals in Jaipur
            </h1>
          </div>
          
          {/* CTA Button - positioned at bottom */}
          <Link to="/deals" className="self-start">
            <Button 
              className="bg-white/95 text-primary hover:bg-white font-semibold rounded-full shadow-xl group px-6 py-5 text-base"
              size="lg"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Browse Deals
              <ChevronRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
