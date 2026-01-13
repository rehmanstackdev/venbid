import { categories } from "@/data/categories";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, DollarSign, Star, X } from "lucide-react";
import { JobDetails } from "./DetailsStep";
import { LocationDetails } from "./LocationStep";
import { LocationMap } from "@/components/map/LocationMap";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  const featuredImage = details.images.find((img) => img.isFeatured) || details.images[0];

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

      {/* Image Management */}
      {details.images.length > 0 && (
        <div className="space-y-4 border border-border rounded-lg p-4 bg-card">
          {/* Featured Image */}
          {featuredImage && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Featured Image</Label>
              <div className="relative aspect-video rounded-lg overflow-hidden group border-2 border-primary">
                <img
                  src={featuredImage.preview}
                  alt="Featured"
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Featured
                </div>
                <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(featuredImage.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* All Images */}
          <div>
            <Label className="text-sm font-medium mb-2 block">All Images ({details.images.length})</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {details.images.map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden group border-2",
                    image.isFeatured ? "border-primary" : "border-border"
                  )}
                >
                  <img
                    src={image.preview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
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
                        onClick={() => setFeatured(image.id)}
                      >
                        <Star className="h-2.5 w-2.5 mr-1" />
                        Set Featured
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview card */}
      <div className="">
        {/* Featured image */}
        {featuredImage ? (
          <div className="">
            {/* <img
              src={featuredImage.preview}
              alt="Featured"
              className="w-full h-full object-cover"
            /> */}
            {/* {details.images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-foreground/80 text-background text-sm px-3 py-1 rounded-full">
                +{details.images.length - 1} more
              </div>
            )} */}
          </div>
        ) : (
          <div className="">
            {/* <div className="text-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No images added</p>
            </div> */}
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

          {/* Description */}
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-muted-foreground whitespace-pre-wrap break-words break-all max-w-full overflow-hidden">
              {details.description || "No description provided"}
            </p>
          </div>

          <Separator />

          {/* Location */}
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
        </div>
      </div>


    </div>
  );
}
