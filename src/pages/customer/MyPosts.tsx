import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, FileText, Trash2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/data/categories";
import { Skeleton } from "@/components/ui/skeleton";
import { JobDetailsDialog } from "@/components/customer/JobDetailsDialog";
import { jobsApi, Job } from "@/api/jobs";
import { toast } from "sonner";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CustomerMyPosts() {
  const [listings, setListings] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedListing, setSelectedListing] = useState<Job | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const jobs = await jobsApi.getMyJobs();
      setListings(jobs);
    } catch (error) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setJobToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;

    try {
      await jobsApi.deleteJob(jobToDelete);
      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (error) {
      toast.error("Failed to delete job");
    } finally {
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

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

  const filteredListings = listings
    .filter((listing) => {
      const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || listing.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "budget-high") return b.budget - a.budget;
      if (sortBy === "budget-low") return a.budget - b.budget;
      return 0;
    });

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Posts</h1>
          <p className="text-muted-foreground">Manage your job listings</p>
        </div>
        <Link to="/post-job">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="budget-high">Budget: High to Low</SelectItem>
            <SelectItem value="budget-low">Budget: Low to High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Try adjusting your filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredListings.map((listing) => (
            <Card
              key={listing.id}
              className="hover:shadow-md transition-shadow overflow-hidden cursor-pointer relative flex flex-col"
              onClick={() => {
                setSelectedListing(listing);
                setDialogOpen(true);
              }}
            >
                {/* Thumbnail */}
                {listing.images && listing.images.length > 0 && (
                  <div className="w-full h-40 bg-muted relative">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Favorite button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm",
                        "hover:bg-card hover:scale-110 transition-all z-10",
                        isFavorite(listing.id) && "text-red-500"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(listing.id);
                      }}
                    >
                      <Heart className={cn("h-4 w-4", isFavorite(listing.id) && "fill-red-500")} />
                    </Button>
                  </div>
                )}
                
                <CardContent className="p-4 flex flex-col flex-1">
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{getCategoryName(listing.category)}</Badge>
                    <Badge
                      variant={
                        listing.status === "active"
                          ? "default"
                          : listing.status === "completed"
                          ? "outline"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {listing.status}
                    </Badge>
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-semibold text-base mb-2 line-clamp-1">{listing.title}</h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground text-sm line-clamp-1 mb-3">
                    {listing.description}
                  </p>
                  
                  {/* Budget */}
                  <div className="text-lg font-bold text-primary mb-3">${listing.budget}</div>
                  
                  {/* Location & Time */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className="truncate">{listing.city || listing.zip}</span>
                    <span>•</span>
                    <span className="whitespace-nowrap">{formatTimeAgo(listing.createdAt)}</span>
                  </div>
                  
                  {/* Actions - at bottom */}
                  <div className="flex gap-2 mt-auto">
                    <Link to={`/customer/edit-job/${listing.id}`} onClick={(e) => e.stopPropagation()} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => handleDelete(listing.id, e)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
      )}

      <JobDetailsDialog
        listing={selectedListing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
