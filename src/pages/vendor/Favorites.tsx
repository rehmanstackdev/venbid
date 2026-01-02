import { Link } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useListings } from "@/hooks/useListings";
import { Skeleton } from "@/components/ui/skeleton";

const Favorites = () => {
  const { favorites, loading: favoritesLoading } = useFavorites();
  const { listings } = useListings();

  const favoriteListings = listings.filter((listing) =>
    favorites.includes(listing.id)
  );

  if (favoritesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-nav">
          <div className="container flex h-14 items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-semibold">Favorites</h1>
          </div>
        </header>
        <main className="container py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-nav">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-semibold">Favorites</h1>
          <span className="text-sm text-muted-foreground">
            ({favoriteListings.length})
          </span>
        </div>
      </header>

      <main className="container py-6">
        {favoriteListings.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-4">
              Browse listings and click the heart icon to save them here
            </p>
            <Link to="/">
              <Button>Browse Listings</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoriteListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;
