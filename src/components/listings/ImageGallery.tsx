import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const hasMultiple = images.length > 1;
  const displayImages = images.length > 0 ? images : ["/placeholder.svg"];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div 
          className="relative rounded-lg overflow-hidden bg-muted cursor-pointer group h-96"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={displayImages[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Navigation arrows */}
          {hasMultiple && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/90 backdrop-blur-sm shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/90 backdrop-blur-sm shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Image counter */}
          {hasMultiple && (
            <div className="absolute bottom-3 right-3 bg-foreground/80 text-background text-sm px-3 py-1 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {hasMultiple && (
          <div className="flex gap-2 overflow-x-auto my-5 p-2">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "flex-shrink-0 w-20 h-20 rounded-md overflow-hidden transition-all",
                  index === currentIndex
                    ? "ring-2 ring-primary ring-offset-1"
                    : "opacity-70 hover:opacity-100"
                )}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="h-full w-full object-contain bg-muted"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-fit max-h-fit p-0 bg-transparent border-none shadow-none [&>button]:hidden">
          <div className="relative">
            <img
              src={displayImages[currentIndex]}
              alt={`${title} - Image ${currentIndex + 1}`}
              className="max-h-[70vh] max-w-[70vw] object-contain rounded-lg"
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
