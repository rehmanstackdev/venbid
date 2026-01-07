import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { favoritesApi } from "@/api/favorites";

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const jobs = await favoritesApi.getFavorites();
      setFavorites(jobs.map(job => job.id));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (listingId: string) => {
      return favorites.includes(listingId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (listingId: string) => {
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to save favorites",
          variant: "destructive",
        });
        return false;
      }

      const isCurrentlyFavorite = favorites.includes(listingId);
      
      // Optimistic update
      if (isCurrentlyFavorite) {
        setFavorites((prev) => prev.filter((id) => id !== listingId));
      } else {
        setFavorites((prev) => [...prev, listingId]);
      }

      try {
        await favoritesApi.toggleFavorite(listingId);
        return true;
      } catch (error) {
        // Revert on error
        if (isCurrentlyFavorite) {
          setFavorites((prev) => [...prev, listingId]);
        } else {
          setFavorites((prev) => prev.filter((id) => id !== listingId));
        }
        console.error('Error toggling favorite:', error);
        toast({
          title: "Error",
          description: "Failed to update favorite",
          variant: "destructive",
        });
        return false;
      }
    },
    [user, favorites, toast]
  );

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
}
