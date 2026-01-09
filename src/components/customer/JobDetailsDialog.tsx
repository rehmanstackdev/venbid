import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, DollarSign, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "@/data/categories";
import { useState } from "react";

interface JobDetailsDialogProps {
  listing: {
    id: string;
    title: string;
    description: string;
    budget: number;
    category: string;
    city?: string;
    zip: string;
    street?: string;
    crossStreet?: string;
    images?: string[];
    status: string;
    createdAt: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobDetailsDialog({ listing, open, onOpenChange }: JobDetailsDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!listing) return null;

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getCategoryName = (slug: string) => {
    return categories.find(c => c.slug === slug)?.name || slug;
  };

  const hasImages = listing.images && listing.images.length > 0;
  const hasMultipleImages = hasImages && listing.images!.length > 1;

  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images!.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images!.length) % listing.images!.length);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg md:text-xl pr-8 break-words">{listing.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Images Carousel */}
          {hasImages && (
            <div className="relative">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={listing.images![currentImageIndex]}
                  alt={`${listing.title} ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 sm:p-2 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 sm:p-2 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {currentImageIndex + 1} / {listing.images!.length}
                    </div>
                  </>
                )}
              </div>
              
              {hasMultipleImages && (
                <div className="flex gap-1.5 sm:gap-2 mt-2 overflow-x-auto pb-2">
                  {listing.images!.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded border-2 overflow-hidden transition-all ${
                        idx === currentImageIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{getCategoryName(listing.category)}</Badge>
            <Badge
              variant={
                listing.status === "active"
                  ? "default"
                  : listing.status === "completed"
                  ? "outline"
                  : "secondary"
              }
            >
              {listing.status}
            </Badge>
          </div>

          {/* Budget */}
          <div className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl font-bold text-primary">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            {listing.budget}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base break-words">{listing.description}</p>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            <div className="text-muted-foreground space-y-1 text-sm sm:text-base break-words">
              {listing.street && <p>{listing.street}</p>}
              {listing.crossStreet && <p>Near {listing.crossStreet}</p>}
              <p>{listing.city ? `${listing.city}, ` : ""}IL {listing.zip}</p>
            </div>
          </div>

          {/* Posted Date */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Posted {formatTimeAgo(listing.createdAt)}
          </div>

          {/* Edit Button */}
          <Link to={`/customer/edit-job/${listing.id}`}>
            <Button className="w-full gap-2 text-sm sm:text-base">
              <Edit className="h-4 w-4" />
              Edit Job Post
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
