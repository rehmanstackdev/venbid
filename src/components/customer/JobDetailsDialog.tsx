import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
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
    jobImages?: Array<{
      id: string;
      jobId: string;
      image: string;
      isFeatured: boolean;
      createdAt: string;
    }>;
    status: string;
    isComplete?: boolean;
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

  const images = listing.jobImages?.map(img => img.image) || listing.images || [];
  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    if (hasImages) setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (hasImages) setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[92vh] overflow-y-auto p-3 sm:p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg md:text-xl pr-8 break-words">
            {listing.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          {/* LEFT: Image Viewer */}
          {hasImages && (
            <div>
              <div className="relative w-full bg-black rounded-xl overflow-hidden h-96">
                <img
                  src={images[currentImageIndex]}
                  alt={`${listing.title} ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />

                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur text-white rounded-full p-2 sm:p-3 shadow-lg"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur text-white rounded-full p-2 sm:p-3 shadow-lg"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {hasMultipleImages && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all ${
                        idx === currentImageIndex
                          ? "border-primary"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RIGHT: Job Details */}
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">{getCategoryName(listing.category)}</Badge>
              <Badge>{listing.status}</Badge>
            </div>

            <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-primary">
              <DollarSign className="h-5 w-5" />
              {listing.budget}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap break-words break-all max-w-full overflow-hidden">
                {listing.description}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </h3>
              <div className="text-muted-foreground space-y-1">
                {listing.street && <p>{listing.street}</p>}
                {listing.crossStreet && <p>Near {listing.crossStreet}</p>}
                <p>{listing.city ? `${listing.city}, ` : ""}IL {listing.zip}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Posted {formatTimeAgo(listing.createdAt)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
