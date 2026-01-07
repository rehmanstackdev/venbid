import { apiClient } from './client';
import { Job } from './jobs';

export interface FavoriteItem {
  id: string;
  job: Job;
  jobId: string;
  isFavorite: boolean;
  favoritedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface FavoritesResponse {
  status: number;
  response: string;
  message: string;
  data: FavoriteItem[];
}

export const favoritesApi = {
  toggleFavorite: async (jobId: string): Promise<void> => {
    await apiClient.post('/favorites/toggle', { jobId });
  },

  getFavorites: async (): Promise<Job[]> => {
    const response = await apiClient.get<FavoritesResponse>('/favorites');
    return (response.data.data || []).map(item => item.job);
  },

  removeFavorite: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/favorites/${jobId}`);
  },
};
