import { categories } from "@/data/categories";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, DollarSign, Image as ImageIcon } from "lucide-react";
import { JobDetails } from "./DetailsStep";
import { LocationDetails } from "./LocationStep";
import { getZipCoordinates } from "@/data/illinoisZips";
import { LocationMap } from "@/components/map/LocationMap";

interface PreviewStepProps {
  categoryId: number;
  details: JobDetails;
  location: LocationDetails;
}

export function PreviewStep({ categoryId, details, location }: PreviewStepProps) {
  const category = categories.find((c) => c.id === categoryId);
  const CategoryIcon = category?.icon;
  const coordinates = getZipCoordinates(location.zip);
  const featuredImage = details.images.find((img) => img.isFeatured) || details.images[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Preview your listing</h2>
        <p className="text-muted-foreground text-sm">
          Review how your job posting will appear to service providers
        </p>
      </div>

      {/* Preview card */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        {/* Featured image */}
        {featuredImage ? (
          <div className="aspect-[16/9] relative bg-muted">
            <img
              src={featuredImage.preview}
              alt="Featured"
              className="w-full h-full object-cover"
            />
            {details.images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-foreground/80 text-background text-sm px-3 py-1 rounded-full">
                +{details.images.length - 1} more
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-[16/9] bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No images added</p>
            </div>
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
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
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
                Approximate location: {location.city || "Chicago area"}, IL {location.zip}
              </p>
            )}
            <LocationMap
              lat={coordinates.lat}
              lng={coordinates.lng}
              showExactAddress={location.showExactAddress}
              className="h-48 rounded-lg overflow-hidden border border-border"
            />
          </div>
        </div>
      </div>

      {/* Image thumbnails */}
      {details.images.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">All Images ({details.images.length})</h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {details.images.map((image, index) => (
              <div
                key={image.id}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                  image.isFeatured ? "border-primary" : "border-transparent"
                }`}
              >
                <img
                  src={image.preview}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
