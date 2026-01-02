import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Plus, Calendar, MapPin, DollarSign, Trash2, Eye, Pencil, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useUserListings } from "@/hooks/useListings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MyPosts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { listings, loading } = useUserListings();

  // Commented out Supabase fetch
  // useEffect(() => {
  //   if (user) {
  //     fetchMyListings();
  //   } else {
  //     setLoading(false);
  //   }
  // }, [user]);

  // const fetchMyListings = async () => {
  //   if (!user) return;
  //   const { data, error } = await supabase
  //     .from("listings")
  //     .select("*")
  //     .eq("user_id", user.id)
  //     .order("created_at", { ascending: false });
  //   if (error) {
  //     console.error("Error fetching listings:", error);
  //     toast({ title: "Error", description: "Failed to load your posts", variant: "destructive" });
  //   } else {
  //     setListings(data || []);
  //   }
  //   setLoading(false);
  // };

  const handleDelete = async (listingId: string) => {
    // Mock delete - just show success
    toast({
      title: "Deleted",
      description: "Your post has been removed",
    });
    
    // Commented out Supabase delete
    // const { error } = await supabase
    //   .from("listings")
    //   .delete()
    //   .eq("id", listingId)
    //   .eq("user_id", user?.id);
    // if (error) {
    //   toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    // } else {
    //   toast({ title: "Deleted", description: "Your post has been removed" });
    //   setListings(listings.filter((l) => l.id !== listingId));
    // }
  };

  const formatDate = (dateString: string | Date) => {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = (expiresAt: string | Date) => {
    const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
    return date < new Date();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Sign in to view your posts</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to see your job postings.
            </p>
            <Link to="/auth?tab=login&redirect=/my-posts">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">My Posts</h1>
              <p className="text-muted-foreground">
                Manage your job postings ({listings.length} total)
              </p>
            </div>
          </div>
          <Link to="/post">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Post a Job
            </Button>
          </Link>
        </div>

        {listings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No posts yet</h2>
              <p className="text-muted-foreground text-center mb-6">
                You haven't posted any jobs yet. Create your first posting to get started!
              </p>
              <Link to="/post">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Post Your First Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {listing.images && listing.images[0] && (
                    <div className="sm:w-48 h-32 sm:h-auto shrink-0">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">{listing.categoryName}</Badge>
                          {listing.status === "active" ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="outline">{listing.status}</Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          <Link
                            to={`/listing/${listing.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {listing.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {listing.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {listing.budget}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {listing.city || listing.zip}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Posted {formatDate(listing.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link to={`/listing/${listing.id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </Link>
                        <Link to={`/edit-listing/${listing.id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="gap-1">
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                job posting and remove all associated messages.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(listing.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
