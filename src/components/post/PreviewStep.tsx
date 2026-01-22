import { categories } from "@/data/categories";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, DollarSign, Star, X, ChevronLeft, ChevronRight } from "lucide-react";
import { JobDetails } from "./DetailsStep";
import { LocationDetails } from "./LocationStep";
import { LocationMap } from "@/components/map/LocationMap";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface PreviewStepProps {
  categoryId: number;
  details: JobDetails;
  location: LocationDetails;
  coordinates?: { lat: number; lng: number } | null;
  onUpdateImages?: (images: JobDetails['images']) => void;
}

export function PreviewStep({ categoryId, details, location, coordinates, onUpdateImages }: PreviewStepProps) {
  const category = categories.find((c) => c.id === categoryId);
  const CategoryIcon = category?.icon;
  const featuredImageIndex = details.images.findIndex((img) => img.isFeatured);
  const [currentImageIndex, setCurrentImageIndex] = useState(featuredImageIndex >= 0 ? featuredImageIndex : 0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);

  useEffect(() => {
    const newFeaturedIndex = details.images.findIndex((img) => img.isFeatured);
    if (newFeaturedIndex >= 0) {
      setCurrentImageIndex(newFeaturedIndex);
    }
  }, [details.images]);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? details.images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === details.images.length - 1 ? 0 : prev + 1));
  };

  const removeImage = (id: string) => {
    const updated = details.images.filter((img) => img.id !== id);
    if (updated.length > 0 && !updated.some((img) => img.isFeatured)) {
      updated[0].isFeatured = true;
    }
    onUpdateImages?.(updated);
  };

  const setFeatured = (id: string) => {
    const updated = details.images.map((img) => ({
      ...img,
      isFeatured: img.id === id,
    }));
    onUpdateImages?.(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Preview your listing</h2>
        <p className="text-muted-foreground text-sm">
          Review how your job posting will appear to service providers
        </p>
      </div>

      {/* Preview card */}
      <div className="">
        {/* Main Image with Navigation */}
        {details.images.length > 0 && (
          <div className="relative rounded-lg overflow-hidden bg-muted group mb-4 h-96">
            <img
              src={details.images[currentImageIndex].preview}
              alt={`Image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain cursor-pointer"
              onClick={() => {
                setFullscreenImage(details.images[currentImageIndex].preview);
                setFullscreenImageIndex(currentImageIndex);
              }}
            />
            
            {/* Featured badge on main image */}
            {details.images[currentImageIndex].isFeatured && (
              <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-sm px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 shadow-lg">
                <Star className="h-4 w-4 fill-current" />
                Featured
              </div>
            )}
            
            {/* Navigation arrows */}
            {details.images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Image counter */}
            {details.images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-foreground/80 text-background text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                {currentImageIndex + 1} / {details.images.length}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Category */}
          <Badge variant="secondary" className="gap-1.5">
            {CategoryIcon && <CategoryIcon className="h-3.5 w-3.5" />}
            {category?.name}
          </Badge>

          {/* Title */}
          <h3 className="text-xl font-semibold text-foreground">
            {details.title || "Untitled Job"}
          </h3>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold text-primary">${details.budget}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>
                {location.city || "City"}, IL {location.zip}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Just now</span>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-muted-foreground whitespace-pre-wrap break-words break-all max-w-full overflow-hidden">
              {details.description || "No description provided"}
            </p>
          </div>

          <Separator />

        
          <div>
            <h4 className="font-medium mb-2">Location</h4>
            {location.showExactAddress && location.street ? (
              <p className="text-muted-foreground text-sm mb-3">
                {location.street}
                {location.crossStreet && ` (near ${location.crossStreet})`}
                <br />
                {location.city && `${location.city}, `}IL {location.zip}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm mb-3">
                Approximate location: {location.city || "Area"}, {location.zip}
              </p>
            )}
            {coordinates && (
              <LocationMap
                lat={coordinates.lat}
                lng={coordinates.lng}
                showExactAddress={location.showExactAddress}
                className="h-48 rounded-lg overflow-hidden border border-border"
              />
            )}
          </div>

          <Separator />


          {details.images.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">All Images ({details.images.length})</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {details.images.map((image, index) => (
                  <div
                    key={image.id}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 hover:border-primary transition-colors group",
                      index === currentImageIndex ? "border-primary" : "border-border"
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image.preview}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-contain bg-muted"
                    />
                    {index === currentImageIndex && (
                      <div className="absolute inset-0 bg-primary/10" />
                    )}
                    {image.isFeatured && (
                      <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 fill-current" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                      {!image.isFeatured && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 text-[10px] w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFeatured(image.id);
                          }}
                        >
                          <Star className="h-2.5 w-2.5 mr-1" />
                          Set Featured
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(image.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen image dialog */}
      {fullscreenImage && (
        <Dialog open={true} onOpenChange={() => setFullscreenImage(null)}>
          <DialogContent className="max-w-fit max-h-fit p-0 bg-transparent border-none shadow-none [&>button]:hidden">
            <div className="flex items-center gap-4">
              {details.images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIndex = (fullscreenImageIndex - 1 + details.images.length) % details.images.length;
                    setFullscreenImageIndex(newIndex);
                    setFullscreenImage(details.images[newIndex].preview);
                  }}
                  className="bg-black/70 text-white rounded-full p-2 hover:bg-black/90 transition-colors z-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <div className="relative">
                <img
                  src={fullscreenImage}
                  alt="Full size"
                  className="max-h-[70vh] max-w-[70vw] object-contain rounded-lg"
                />
                <button
                  onClick={() => setFullscreenImage(null)}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              {details.images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIndex = (fullscreenImageIndex + 1) % details.images.length;
                    setFullscreenImageIndex(newIndex);
                    setFullscreenImage(details.images[newIndex].preview);
                  }}
                  className="bg-black/70 text-white rounded-full p-2 hover:bg-black/90 transition-colors z-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
