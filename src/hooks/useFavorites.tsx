import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

let mockFavoritesStore: string[] = [];

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
      setFavorites([...mockFavoritesStore]);
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

      if (isCurrentlyFavorite) {
        setFavorites((prev) => prev.filter((id) => id !== listingId));
        mockFavoritesStore = mockFavoritesStore.filter((id) => id !== listingId);
      } else {
        setFavorites((prev) => [...prev, listingId]);
        mockFavoritesStore.push(listingId);
      }

      console.log('Mock favorite toggled:', { listingId, isCurrentlyFavorite });
      return true;
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
