import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, User, Heart, Share2, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useListings, formatTimeAgo } from "@/hooks/useListings";
import { categories } from "@/data/categories";
import { ImageGallery } from "@/components/listings/ImageGallery";
import { LocationMap } from "@/components/map/LocationMap";
import { MessageButton } from "@/components/listings/MessageButton";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listings, loading } = useListings();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const isListingFavorite = id ? isFavorite(id) : false;

  const listing = listings.find((l) => l.id === id);
  const isOwner = user && listing && user.id === listing.userId;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Listing not found</h1>
          <p className="text-muted-foreground mb-4">
            This listing may have been removed or expired.
          </p>
          <Link to="/">
            <Button>Back to listings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const category = categories.find((c) => c.id === listing.categoryId);
  const CategoryIcon = category?.icon;

  return (
    <div className="min-h-screen bg-background">

      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-nav">
        <div className="container flex h-14 items-center gap-2 px-3 sm:gap-4 sm:px-4">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate text-sm sm:text-base">{listing.title}</h1>
          </div>
          <div className="flex gap-0.5 sm:gap-1">
            {isOwner && (
              <Link to={`/edit-listing/${id}`}>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-9 w-9", isListingFavorite && "text-primary")}
              onClick={() => id && toggleFavorite(id)}
            >
              <Heart className={cn("h-4 w-4 sm:h-5 sm:w-5", isListingFavorite && "fill-current")} />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleCopyLink}>
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </header>


      <main className="container max-w-7xl py-4 sm:py-6 px-4 sm:px-6">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Main Content - Always first on mobile */}
          <div className="w-full lg:col-span-2 space-y-4 sm:space-y-6">

            <ImageGallery images={listing.images} title={listing.title} />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="gap-1.5 text-xs sm:text-sm">
                  {CategoryIcon && <CategoryIcon className="h-3.5 w-3.5" />}
                  {listing.categoryName}
                </Badge>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">{listing.title}</h2>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">{listing.city}, IL {listing.zip}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>Posted {formatTimeAgo(listing.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">{listing.userName}</span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Description</h3>
              <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap break-words">
                {listing.description}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Location</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Approximate location shown. Exact address will be shared after contact.
              </p>
              <LocationMap
                lat={listing.lat}
                lng={listing.lng}
                showExactAddress={false}
                className="w-full h-48 sm:h-64 lg:h-80 rounded-lg overflow-hidden border border-border"
              />
            </div>
          </div>

          {/* Sidebar - Moves below main content on mobile */}
          <div className="w-full lg:sticky lg:top-20 lg:self-start space-y-4">

            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Budget</p>
                <p className="text-3xl sm:text-4xl font-bold text-primary">${listing.budget}</p>
              </div>

              <MessageButton 
                listingId={listing.id}
                listingTitle={listing.title} 
                customerId={listing.userId} 
              />

              <p className="text-xs text-muted-foreground text-center mt-3">
                Service providers can message to discuss this job
              </p>

              <Separator className="my-4" />

              {/* Posted by */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate">{listing.userName}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Customer</p>
                </div>
              </div>
            </div>

            {/* Safety tips */}
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">Safety tips</h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5">
                <li>• Meet in a public place first</li>
                <li>• Verify credentials before hiring</li>
                <li>• Never pay upfront for work not done</li>
                <li>• Get a written estimate</li>
              </ul>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
};

export default ListingDetail;
