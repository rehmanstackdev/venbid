import { apiClient } from './client';
import { Listing } from './customer';

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'verification' | 'listing';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export const commonApi = {
  // Get all public listings (no auth required)
  getPublicListings: async (filters?: {
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    zipCode?: string;
    search?: string;
  }): Promise<Listing[]> => {
    const response = await apiClient.get('/listings', { params: filters });
    return response.data;
  },

  // Get single public listing (no auth required)
  getPublicListing: async (id: string): Promise<Listing> => {
    const response = await apiClient.get(`/listings/${id}`);
    return response.data;
  },

  // Get user notifications
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  // Mark notification as read
  markNotificationRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  // Mark all notifications as read
  markAllNotificationsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  // Block user
  blockUser: async (userId: string): Promise<void> => {
    await apiClient.post('/users/block', { userId });
  },

  // Unblock user
  unblockUser: async (userId: string): Promise<void> => {
    await apiClient.post('/users/unblock', { userId });
  },

  // Get blocked users
  getBlockedUsers: async (): Promise<string[]> => {
    const response = await apiClient.get('/users/blocked');
    return response.data;
  },
};
