import { Link } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import { useFavorites } from "@/hooks/useFavorites";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { favoritesApi } from "@/api/favorites";
import { categories } from "@/data/categories";
import { getZipCoordinates } from "@/data/illinoisZips";
import { Listing } from "@/hooks/useListings";

export default function CustomerFavorites() {
  const { loading: favoritesLoading, refetch } = useFavorites();
  const [favoriteJobs, setFavoriteJobs] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const jobs = await favoritesApi.getFavorites();
      const mappedListings: Listing[] = jobs.map(job => {
        const category = categories.find(c => c.slug === job.category);
        const coords = job.coordinates?.lat && job.coordinates?.long 
          ? { lat: job.coordinates.lat, lng: job.coordinates.long }
          : getZipCoordinates(job.zip);
        return {
          id: job.id,
          title: job.title,
          description: job.description,
          categoryId: category?.id || 1,
          categoryName: category?.name || job.category,
          budget: typeof job.budget === 'string' ? job.budget : job.budget.toString(),
          city: job.city,
          zip: job.zip,
          lat: coords.lat,
          lng: coords.lng,
          createdAt: new Date(job.createdAt),
          images: job.images || [],
          jobImages: job.jobImages,
          userId: job.createdById || job.createdBy?.id || '',
          userName: job.createdBy?.name || '',
          status: 'active',
        };
      });
      setFavoriteJobs(mappedListings);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (jobId: string) => {
    setFavoriteJobs((prev) => prev.filter((job) => job.id !== jobId));
    
    try {
      await favoritesApi.toggleFavorite(jobId);
    } catch (error) {
      console.error('Error removing favorite:', error);
      fetchFavorites();
    }
  };

  if (loading) {
    return (
      <div className="container py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Favorites</h1>
        <span className="text-sm text-muted-foreground">
          ({favoriteJobs.length})
        </span>
      </div>
        {favoriteJobs.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-4">
              Browse listings and click the heart icon to save them here
            </p>
            <Link to="/customer/my-posts">
              <Button>Browse Listings</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
            {favoriteJobs.map((listing) => (
              <div key={listing.id} className="relative">
                <ListingCard listing={listing} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card hover:scale-110 transition-all text-red-500 z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveFavorite(listing.id);
                  }}
                >
                  <Heart className="h-4 w-4 fill-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
