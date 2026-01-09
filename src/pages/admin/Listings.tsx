import { useState, useEffect } from "react";
import { Search, Trash2, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { jobsApi, Job } from "@/api/jobs";
import { adminApi } from "@/api/admin";
import { categories } from "@/data/categories";

export default function AdminListings() {
  const { toast } = useToast();
  const [listings, setListings] = useState<Job[]>([]);
  const [completedListings, setCompletedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<Job | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const jobs = await jobsApi.getAllJobs();
      setListings(jobs);
      const completed = await adminApi.getCompletedJobs();
      setCompletedListings(completed);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load listings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompletedListings = completedListings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = (listing: Job, actionType: "delete" | "view") => {
    setSelectedListing(listing);
    if (actionType === "delete") {
      setDeleteDialogOpen(true);
    } else {
      setViewDialogOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedListing) return;

    setDeleting(true);
    try {
      await adminApi.deleteJob(selectedListing.id);
      setListings((prev) => prev.filter((l) => l.id !== selectedListing.id));
      toast({
        title: "Job Deleted",
        description: `"${selectedListing.title}" has been deleted.`,
      });
      setDeleteDialogOpen(false);
      setSelectedListing(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete job", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const pendingListings = filteredListings;

  const ListingCard = ({ listing }: { listing: Job }) => {
    const categoryName = categories.find(c => c.slug === listing.category)?.name || listing.category;
    
    return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate mb-2">{listing.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleAction(listing, "view")}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleAction(listing, "delete")}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {listing.images && listing.images.length > 0 && (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-40 object-cover rounded-lg"
          />
        )}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Category</p>
            <p className="font-medium">{categoryName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Budget</p>
            <p className="font-medium">${listing.budget}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Location</p>
            <p className="font-medium">{listing.city || listing.zip}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Posted</p>
            <p className="font-medium">{new Date(listing.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Listings Management</h1>
        <p className="text-muted-foreground">Manage job listings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle>
            <div className="text-2xl font-bold">{listings.length}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Jobs</CardTitle>
            <div className="text-2xl font-bold">{completedListings.length}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Filtered Results</CardTitle>
            <div className="text-2xl font-bold">
              {activeTab === "all" ? filteredListings.length : filteredCompletedListings.length}
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompletedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedListing?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              {selectedListing.images && selectedListing.images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedListing.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Job image ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setFullscreenImage(img)}
                    />
                  ))}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg break-words">{selectedListing.title}</h3>
                <Badge variant="secondary" className="mt-1">
                  {categories.find(c => c.slug === selectedListing.category)?.name || selectedListing.category}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm mt-1 break-words">{selectedListing.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget</p>
                <p className="text-sm mt-1">${selectedListing.budget}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-sm mt-1 break-words">
                  {selectedListing.showExactAddress
                    ? `${selectedListing.street}, ${selectedListing.city}, ${selectedListing.zip}`
                    : `${selectedListing.crossStreet}, ${selectedListing.city}, ${selectedListing.zip}`}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Posted</p>
                <p className="text-sm mt-1">{new Date(selectedListing.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setFullscreenImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            <img
              src={fullscreenImage || ""}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
