import { useState, useEffect } from "react";
import { Search, MoreVertical, CheckCircle, XCircle, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { categories } from "@/data/categories";

type JobWithStatus = Job & { adminStatus: "pending" | "approved" | "rejected" };

export default function AdminListings() {
  const { toast } = useToast();
  const [listings, setListings] = useState<JobWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<JobWithStatus | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "reject">("approve");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const jobs = await jobsApi.getAllJobs();
      setListings(jobs.map(job => ({ ...job, adminStatus: "approved" as const })));
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

  const handleAction = (listing: JobWithStatus, actionType: "approve" | "reject") => {
    setSelectedListing(listing);
    setAction(actionType);
    setActionDialogOpen(true);
  };

  const handleSubmitAction = () => {
    if (!selectedListing) return;

    setListings((prev) =>
      prev.map((l) =>
        l.id === selectedListing.id ? { ...l, adminStatus: action === "approve" ? "approved" : "rejected" } : l
      )
    );

    toast({
      title: action === "approve" ? "Listing Approved" : "Listing Rejected",
      description: `"${selectedListing.title}" has been ${action === "approve" ? "approved" : "rejected"}.`,
    });

    setActionDialogOpen(false);
    setAdminNotes("");
    setSelectedListing(null);
  };

  const pendingListings = filteredListings.filter((l) => l.adminStatus === "pending");
  const approvedListings = filteredListings.filter((l) => l.adminStatus === "approved");
  const rejectedListings = filteredListings.filter((l) => l.adminStatus === "rejected");

  const ListingCard = ({ listing }: { listing: JobWithStatus }) => {
    const categoryName = categories.find(c => c.slug === listing.category)?.name || listing.category;
    
    return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-base truncate">{listing.title}</CardTitle>
              <Badge
                variant={
                  listing.adminStatus === "approved"
                    ? "default"
                    : listing.adminStatus === "rejected"
                    ? "destructive"
                    : "secondary"
                }
              >
                {listing.adminStatus}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {listing.adminStatus === "pending" && (
                <>
                  <DropdownMenuItem onClick={() => handleAction(listing, "approve")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction(listing, "reject")}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
        <p className="text-muted-foreground">Approve, reject, or modify job listings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <div className="text-2xl font-bold">{pendingListings.length}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <div className="text-2xl font-bold text-green-600">{approvedListings.length}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            <div className="text-2xl font-bold text-red-600">{rejectedListings.length}</div>
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

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({filteredListings.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingListings.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedListings.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedListings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Listing" : "Reject Listing"}
            </DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? `Approve "${selectedListing?.title}"?`
                : `Reject "${selectedListing?.title}"?`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this decision..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              onClick={handleSubmitAction}
            >
              {action === "approve" ? "Approve Listing" : "Reject Listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
