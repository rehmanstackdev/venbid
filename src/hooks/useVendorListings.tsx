import { useState, useEffect, useCallback } from 'react';
import { getZipCoordinates } from '@/data/illinoisZips';
import { categories } from '@/data/categories';
import { jobsApi } from '@/api/jobs';

export interface VendorListing {
  id: string;
  title: string;
  description: string;
  categoryId: number;
  categoryName: string;
  budget: string;
  city: string | null;
  zip: string;
  lat: number;
  lng: number;
  createdAt: Date;
  images: string[];
  userId: string;
  userName: string;
  status: string;
}

export function useVendorListings(nearMeOnly: boolean = false) {
  const [listings, setListings] = useState<VendorListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const params: { lat?: number; long?: number } = {};
      
      // Only send coordinates if "Near Me" filter is active
      if (nearMeOnly) {
        const userStr = localStorage.getItem('user_data');
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (userData.coordinates) {
            params.lat = userData.coordinates.lat;
            params.long = userData.coordinates.long;
          }
        }
      }
      
      const jobs = await jobsApi.getAllJobs(params);
      
      const mappedListings: VendorListing[] = jobs.map(job => {
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
          zip: job.zip,
          lat: coords.lat,
          lng: coords.lng,
          createdAt: new Date(job.createdAt),
          images: job.images || [],
          userId: job.createdById || job.createdBy?.id || '',
          userName: job.createdBy?.name || '',
          status: 'active',
        };
      });
      
      setListings(mappedListings);
    } catch (err) {
      console.error('Error fetching vendor listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  }, [nearMeOnly]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, loading, error, refetch: fetchListings };
}
