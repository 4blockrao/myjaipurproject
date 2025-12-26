import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Sparkles, Tag, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  bgGradient: string;
  icon: React.ReactNode;
  badge?: string;
}

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides: HeroSlide[] = [
    {
      id: 1,
      title: "Discover Jaipur's Best Deals",
      subtitle: "Save up to 70% on local restaurants, spas & shopping",
      cta: "Explore Deals",
      ctaLink: "/deals",
      bgGradient: "from-primary via-primary/90 to-jaipur-terracotta",
      icon: <Tag className="w-6 h-6" />,
      badge: "🔥 Hot Deals"
    },
    {
      id: 2,
      title: "Events This Week",
      subtitle: "Concerts, exhibitions & cultural experiences",
      cta: "Browse Events",
      ctaLink: "/events",
      bgGradient: "from-jaipur-heritage via-jaipur-deep to-primary",
      icon: <CalendarDays className="w-6 h-6" />,
      badge: "📅 What's On"
    },
    {
      id: 3,
      title: "Explore Your Locality",
      subtitle: "Find the best of your neighborhood",
      cta: "Find Nearby",
      ctaLink: "/jaipur",
      bgGradient: "from-jaipur-terracotta via-primary to-jaipur-gold/80",
      icon: <MapPin className="w-6 h-6" />,
      badge: "📍 Near You"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, slides.length]);

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume autoplay after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Main carousel container */}
      <div className="relative h-[200px] sm:h-[220px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              index === currentSlide 
                ? "opacity-100 translate-x-0" 
                : index < currentSlide 
                  ? "opacity-0 -translate-x-full" 
                  : "opacity-0 translate-x-full"
            }`}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient}`} />
            
            {/* Decorative pattern overlay */}
            <div className="absolute inset-0 bg-heritage-pattern opacity-30" />
            
            {/* Decorative shapes */}
            <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />
            
            {/* Content */}
            <div className="relative h-full px-5 py-6 flex flex-col justify-between">
              {/* Badge */}
              {slide.badge && (
                <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                  {slide.badge}
                </div>
              )}
              
              {/* Main content */}
              <div className="flex-1 flex flex-col justify-center mt-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2 font-display">
                  {slide.title}
                </h2>
                <p className="text-white/90 text-sm sm:text-base max-w-xs">
                  {slide.subtitle}
                </p>
              </div>
              
              {/* CTA Button */}
              <Link to={slide.ctaLink} className="self-start">
                <Button 
                  className="bg-white text-primary hover:bg-white/90 font-semibold rounded-xl shadow-lg group"
                  size="lg"
                >
                  <span className="flex items-center gap-2">
                    {slide.icon}
                    {slide.cta}
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide 
                ? "w-6 h-2 bg-white" 
                : "w-2 h-2 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
