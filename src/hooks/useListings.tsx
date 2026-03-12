import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getZipCoordinates } from '@/data/illinoisZips';
import { categories } from '@/data/categories';
import { UploadedImage } from '@/components/post/ImageUpload';
import { jobsApi } from '@/api/jobs';

export interface Listing {
  id: string;
  title: string;
  description: string;
  categoryId: number;
  categoryName: string;
  budget: string;
  city: string | null;
  state: string | null;
  zip: string;
  lat: number;
  lng: number;
  createdAt: Date;
  images: string[];
  jobImages?: Array<{
    id: string;
    jobId: string;
    image: string;
    isFeatured: boolean;
    createdAt: string;
  }>;
  userId: string;
  userName: string;
  status: string;
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export function getListingsInBounds(
  listings: Listing[],
  bounds: { north: number; south: number; east: number; west: number }
): Listing[] {
  return listings.filter(
    (listing) =>
      listing.lat >= bounds.south &&
      listing.lat <= bounds.north &&
      listing.lng >= bounds.west &&
      listing.lng <= bounds.east
  );
}

export interface CreateListingData {
  title: string;
  description: string;
  categoryId: number;
  budget: string;
  city?: string;
  zip: string;
  street?: string;
  crossStreet?: string;
  showExactAddress?: boolean;
  images?: UploadedImage[];
}

export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const jobs = await jobsApi.getPublicJobs();
      
      const mappedListings: Listing[] = jobs.map(job => {
        const category = categories.find(c => c.slug === job.category);
        
        // Use job coordinates if available, otherwise fallback to ZIP lookup
        let coords = { lat: 0, lng: 0 };
        if (job.coordinates?.lat && job.coordinates?.long) {
          coords = { lat: job.coordinates.lat, lng: job.coordinates.long };
        } else {
          coords = getZipCoordinates(job.zip);
        }
        
        return {
          id: job.id,
          title: job.title,
          description: job.description,
          categoryId: category?.id || 1,
          categoryName: category?.name || job.category,
          budget: typeof job.budget === 'string' ? job.budget : job.budget.toString(),
          city: job.city,
          state: job.state || null,
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
      
      setListings(mappedListings);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, loading, error, refetch: fetchListings };
}

export function useCreateListing() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createListing = async (data: CreateListingData): Promise<string | null> => {
    if (!user) {
      setError('You must be logged in to create a listing');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const coords = getZipCoordinates(data.zip);
      const category = categories.find(c => c.id === data.categoryId);
      const imageUrls = data.images?.map(img => img.preview) || [];

      const newListing: Listing = {
        id: `listing-${Date.now()}`,
        userId: user.id,
        userName: user.user_metadata?.full_name || user.email,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        categoryName: category?.name || 'Unknown',
        budget: data.budget,
        city: data.city || null,
        zip: data.zip,
        lat: coords.lat,
        lng: coords.lng,
        images: imageUrls,
        status: 'active',
        createdAt: new Date(),
      };
      
      console.log('Mock listing created:', newListing);
      return newListing.id;
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to create listing');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createListing, loading, error };
}

export function useUserListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setListings([]);
      setLoading(false);
      return;
    }

    const fetchUserListings = async () => {
      try {
        setLoading(true);
        setListings([]);
      } catch (err) {
        console.error('Error fetching user listings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch your listings');
      } finally {
        setLoading(false);
      }
    };

    fetchUserListings();
  }, [user]);

  return { listings, loading, error };
}
