import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Tag, Calendar, Home, Car, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  icon: React.ElementType;
  bgImage: string;
  gradientFrom: string;
  gradientTo: string;
}

const slides: HeroSlide[] = [
  {
    id: "deals",
    title: "Today's Top Deals",
    subtitle: "in Jaipur",
    ctaText: "Browse Deals",
    ctaLink: "/deals",
    icon: Tag,
    bgImage: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80",
    gradientFrom: "from-rose-500/20",
    gradientTo: "to-orange-500/30",
  },
  {
    id: "events",
    title: "Upcoming Events",
    subtitle: "in Jaipur",
    ctaText: "Explore Events",
    ctaLink: "/events",
    icon: Calendar,
    bgImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    gradientFrom: "from-purple-500/20",
    gradientTo: "to-indigo-500/30",
  },
  {
    id: "property",
    title: "Find Property",
    subtitle: "in Jaipur",
    ctaText: "Explore Property",
    ctaLink: "/categories/property",
    icon: Home,
    bgImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    gradientFrom: "from-emerald-500/20",
    gradientTo: "to-teal-500/30",
  },
  {
    id: "automobile",
    title: "Cars & Vehicles",
    subtitle: "in Jaipur",
    ctaText: "Browse Cars",
    ctaLink: "/categories/automobile",
    icon: Car,
    bgImage: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
    gradientFrom: "from-blue-500/20",
    gradientTo: "to-cyan-500/30",
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 5 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  const slide = slides[currentSlide];
  const IconComponent = slide.icon;

  return (
    <section className="relative overflow-hidden">
      {/* Hero Image Container */}
      <div className="relative h-[320px] sm:h-[380px]">
        {/* Background Images - all preloaded */}
        {slides.map((s, index) => (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-opacity duration-700",
              index === currentSlide ? "opacity-100" : "opacity-0"
            )}
            style={{ backgroundImage: `url('${s.bgImage}')` }}
          />
        ))}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

        {/* Category-specific gradient */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t transition-opacity duration-700",
            slide.gradientFrom,
            slide.gradientTo
          )}
        />

        {/* Content */}
        <div className="relative h-full px-5 pt-8 pb-16 flex flex-col">
          {/* Main Heading */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight font-display drop-shadow-lg">
              {slide.title}
              <br />
              <span className="text-white/90">{slide.subtitle}</span>
            </h1>
          </div>

          {/* CTA Button - positioned at bottom */}
          <Link to={slide.ctaLink} className="self-start">
            <Button
              className="bg-white/95 text-foreground hover:bg-white font-semibold rounded-full shadow-xl group px-6 py-5 text-base"
              size="lg"
            >
              <IconComponent className="w-5 h-5 mr-2" />
              {slide.ctaText}
              <ChevronRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((s, index) => (
            <button
              key={s.id}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/70"
              )}
              aria-label={`Go to ${s.title}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
