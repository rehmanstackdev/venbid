import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, User, Heart, Share2, Flag, Loader2, Pencil } from "lucide-react";
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
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { listings, loading } = useListings();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const isListingFavorite = id ? isFavorite(id) : false;
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const listing = listings.find((l) => l.id === id);
  const isOwner = user && listing && user.id === listing.userId;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  const handleReport = async () => {
    if (!user) {
      toast.error("Please sign in to report this listing");
      return;
    }
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting");
      return;
    }
    setIsSubmittingReport(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmittingReport(false);
    setReportDialogOpen(false);
    setReportReason("");
    toast.success("Report submitted. We'll review this listing.");
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
        <div className="container flex h-14 items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{listing.title}</h1>
          </div>
          <div className="flex gap-1">
            {isOwner && (
              <Link to={`/edit-listing/${id}`}>
                <Button variant="ghost" size="icon">
                  <Pencil className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn(isListingFavorite && "text-primary")}
              onClick={() => id && toggleFavorite(id)}
            >
              <Heart className={cn("h-5 w-5", isListingFavorite && "fill-current")} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCopyLink}>
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setReportDialogOpen(true)}>
              <Flag className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>


      <main className="container py-6">
        <div className="grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">

            <ImageGallery images={listing.images} title={listing.title} />


            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="gap-1.5">
                  {CategoryIcon && <CategoryIcon className="h-3.5 w-3.5" />}
                  {listing.categoryName}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-foreground">{listing.title}</h2>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{listing.city}, IL {listing.zip}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Posted {formatTimeAgo(listing.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{listing.userName}</span>
              </div>
            </div>

            <Separator />

        
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            <Separator />


            <div>
              <h3 className="text-lg font-semibold mb-3">Location</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Approximate location shown. Exact address will be shared after contact.
              </p>
              <LocationMap
                lat={listing.lat}
                lng={listing.lng}
                showExactAddress={false}
                className="h-64 rounded-lg overflow-hidden border border-border"
              />
            </div>
          </div>


          <div className="space-y-4">

            <div className="bg-card border border-border rounded-lg p-5 sticky top-20">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Budget</p>
                <p className="text-3xl font-bold text-primary">${listing.budget}</p>
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
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{listing.userName}</p>
                  <p className="text-xs text-muted-foreground">Customer</p>
                </div>
              </div>
            </div>

            {/* Safety tips */}
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">Safety tips</h4>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>• Meet in a public place first</li>
                <li>• Verify credentials before hiring</li>
                <li>• Never pay upfront for work not done</li>
                <li>• Get a written estimate</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report this listing</DialogTitle>
            <DialogDescription>
              Help us keep Venbid safe by reporting suspicious or inappropriate content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="report-reason">Why are you reporting this listing?</Label>
              <Textarea
                id="report-reason"
                placeholder="Please describe the issue..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReport} disabled={isSubmittingReport}>
                {isSubmittingReport ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListingDetail;
