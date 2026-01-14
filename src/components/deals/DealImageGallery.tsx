import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DealImageGalleryProps {
  mainImage: string | null;
  galleryImages: string[] | null;
  title: string;
}

export const DealImageGallery = ({ mainImage, galleryImages, title }: DealImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Combine main image with gallery images
  const allImages = [
    ...(mainImage ? [mainImage] : []),
    ...(galleryImages || [])
  ].filter(Boolean);

  const hasMultipleImages = allImages.length > 1;
  const currentImage = allImages[selectedIndex] || null;

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  if (!currentImage) {
    return (
      <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
            <ZoomIn className="w-8 h-8" />
          </div>
          <p>No image available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div 
          className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted cursor-zoom-in group"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={currentImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Navigation arrows for multiple images */}
          {hasMultipleImages && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full opacity-80 hover:opacity-100 shadow-lg"
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full opacity-80 hover:opacity-100 shadow-lg"
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}

          {/* Image counter */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
              {selectedIndex + 1} / {allImages.length}
            </div>
          )}

          {/* Zoom indicator */}
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-3.5 h-3.5" />
            Tap to zoom
          </div>
        </div>

        {/* Thumbnail strip */}
        {hasMultipleImages && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                  selectedIndex === index 
                    ? "border-primary ring-2 ring-primary/20" 
                    : "border-transparent hover:border-muted-foreground/30"
                )}
              >
                <img
                  src={image}
                  alt={`${title} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black/95 border-none">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 text-white hover:bg-white/20"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            
            <div className="relative">
              <img
                src={currentImage}
                alt={title}
                className="w-full max-h-[80vh] object-contain"
              />
              
              {hasMultipleImages && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={goToNext}
                  >
                    <ChevronRight className="w-8 h-8" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnail strip in lightbox */}
            {hasMultipleImages && (
              <div className="flex justify-center gap-2 p-4">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all",
                      selectedIndex === index 
                        ? "border-white" 
                        : "border-transparent opacity-50 hover:opacity-100"
                    )}
                  >
                    <img
                      src={image}
                      alt={`${title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DealImageGallery;
