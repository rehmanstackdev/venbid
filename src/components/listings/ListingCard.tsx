import { Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Listing, formatTimeAgo } from "@/hooks/useListings";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { LoginReminderDialog } from "@/components/auth/LoginReminderDialog";

interface ListingCardProps {
  listing: Listing;
  compact?: boolean;
}

export function ListingCard({ listing, compact = false }: ListingCardProps) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isListingFavorite = isFavorite(listing.id);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const featuredImage = listing.jobImages?.find(img => img.isFeatured)?.image || listing.jobImages?.[0]?.image || listing.images?.[0];

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    
    toggleFavorite(listing.id);
  };

  if (compact) {
    return (
      <Link to={`/listing/${listing.id}`}>
        <Card className="group overflow-hidden transition-all duration-200 hover:shadow-card-hover animate-fade-in">
          <div className="flex">
            {/* Image */}
            <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden bg-muted">
              <img
                src={featuredImage || "/placeholder.svg"}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Content */}
            <CardContent className="flex-1 p-3">
              <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              <p className="text-sm font-semibold text-primary mb-1">
                ${listing.budget}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{listing.city}</span>
                <span className="mx-1">•</span>
                <span className="whitespace-nowrap">{formatTimeAgo(listing.createdAt)}</span>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/listing/${listing.id}`}>
      <Card className="group overflow-hidden transition-all duration-200 hover:shadow-card-hover animate-fade-in h-[380px] flex flex-col">
        <div className="relative">
          {/* Image */}
          <div className="relative h-60 overflow-hidden bg-muted">
            <img
              src={featuredImage || "/placeholder.svg"}
              alt={listing.title}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Category badge */}
            <Badge 
              variant="secondary" 
              className="absolute bottom-2 left-2 bg-card/90 backdrop-blur-sm text-foreground text-xs"
            >
              {listing.categoryName}
            </Badge>
          </div>

          {/* Favorite button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm",
              "hover:bg-card hover:scale-110 transition-all",
              isListingFavorite && "text-red-500"
            )}
            onClick={handleFavoriteClick}
          >
            <Heart className={cn("h-4 w-4", isListingFavorite && "fill-red-500")} />
          </Button>
        </div>

        {/* Content */}
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>

          {/* Budget */}
          <p className="text-lg font-semibold text-primary mb-2">
            ${listing.budget}
          </p>

          {/* Location and time */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{listing.city} – {listing.zip}</span>
            </div>
            <span className="whitespace-nowrap ml-2">{formatTimeAgo(listing.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      <LoginReminderDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </Link>
  );
}
