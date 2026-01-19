import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Tag, Calendar, Home, Car, ChevronLeft, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  icon: React.ElementType;
  bgImage: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
}

const slides: HeroSlide[] = [
  {
    id: "deals",
    title: "Exclusive Deals",
    subtitle: "Save up to 70% in Jaipur",
    description: "Discover handpicked offers from top local businesses",
    ctaText: "Explore Deals",
    ctaLink: "/deals",
    icon: Tag,
    bgImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80",
    accentColor: "rose",
    gradientFrom: "from-rose-600/90",
    gradientTo: "to-orange-500/80",
  },
  {
    id: "events",
    title: "Live Events",
    subtitle: "Concerts • Shows • Workshops",
    description: "Never miss what's happening in the Pink City",
    ctaText: "View Events",
    ctaLink: "/events",
    icon: Calendar,
    bgImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
    accentColor: "violet",
    gradientFrom: "from-violet-600/90",
    gradientTo: "to-purple-500/80",
  },
  {
    id: "property",
    title: "Find Your Home",
    subtitle: "Premium Properties in Jaipur",
    description: "Rent, buy or sell with trusted listings",
    ctaText: "Browse Properties",
    ctaLink: "/properties",
    icon: Home,
    bgImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    accentColor: "emerald",
    gradientFrom: "from-emerald-600/90",
    gradientTo: "to-teal-500/80",
  },
  {
    id: "automobile",
    title: "Dream Cars",
    subtitle: "New & Certified Pre-owned",
    description: "Compare prices, find dealers near you",
    ctaText: "Explore Cars",
    ctaLink: "/cars",
    icon: Car,
    bgImage: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80",
    accentColor: "blue",
    gradientFrom: "from-blue-600/90",
    gradientTo: "to-cyan-500/80",
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 6000);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) nextSlide();
    if (touchStart - touchEnd < -50) prevSlide();
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  const slide = slides[currentSlide];
  const IconComponent = slide.icon;

  return (
    <section 
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Hero Container */}
      <div className="relative h-[340px] sm:h-[420px]">
        {/* Background Images with Ken Burns effect */}
        {slides.map((s, index) => (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-all duration-1000",
              index === currentSlide 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-105"
            )}
            style={{ 
              backgroundImage: `url('${s.bgImage}')`,
              animation: index === currentSlide ? 'ken-burns 20s ease-in-out infinite' : 'none'
            }}
          />
        ))}

        {/* Premium Gradient Overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-t transition-all duration-700",
            slide.gradientFrom,
            slide.gradientTo
          )} 
        />
        
        {/* Additional vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Content */}
        <div className="relative h-full px-5 pt-6 pb-14 flex flex-col justify-between">
          {/* Top: Category Pill */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md",
              "bg-white/15 border border-white/20 text-white"
            )}>
              <IconComponent className="w-4 h-4" />
              <span className="text-sm font-medium">{slide.id.charAt(0).toUpperCase() + slide.id.slice(1)}</span>
            </div>
          </div>

          {/* Center: Main Content */}
          <div className="flex-1 flex flex-col justify-center py-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight font-display tracking-tight">
              {slide.title}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mt-2 font-medium">
              {slide.subtitle}
            </p>
            <p className="text-sm sm:text-base text-white/70 mt-2 max-w-md">
              {slide.description}
            </p>
          </div>

          {/* Bottom: CTA Button */}
          <div className="flex items-center gap-4">
            <Link to={slide.ctaLink}>
              <Button
                className={cn(
                  "bg-white text-gray-900 hover:bg-white/95 font-semibold rounded-full shadow-2xl",
                  "group px-6 py-6 text-base transition-all duration-300 hover:shadow-white/30"
                )}
                size="lg"
              >
                {slide.ctaText}
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            
            {/* Quick Stats */}
            <div className="hidden sm:flex items-center gap-3 text-white/80 text-sm">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>100+ active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows - Hidden on mobile, visible on hover */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hidden sm:flex items-center justify-center text-white hover:bg-white/20 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hidden sm:flex items-center justify-center text-white hover:bg-white/20 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Premium Slide Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((s, index) => (
            <button
              key={s.id}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/40 w-1.5 hover:bg-white/60"
              )}
              aria-label={`Go to ${s.title}`}
            />
          ))}
        </div>
      </div>

      {/* Ken Burns Animation */}
      <style>{`
        @keyframes ken-burns {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </section>
  );
};

export default HeroCarousel;
