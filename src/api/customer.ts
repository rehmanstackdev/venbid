import { apiClient } from './client';

export interface CreateListingRequest {
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  images?: string[];
}

export interface UpdateListingRequest extends Partial<CreateListingRequest> {
  id: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  images?: string[];
  customerId: string;
  customerName: string;
  createdAt: string;
  status: 'active' | 'closed' | 'completed';
}

export interface UserProfile {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    long: number;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  coordinates?: {
    lat: number;
    long: number;
  };
}

export const customerApi = {
  // Create new job listing
  createListing: async (data: CreateListingRequest): Promise<Listing> => {
    const response = await apiClient.post('/customer/listings', data);
    return response.data;
  },

  // Get customer's own listings
  getMyListings: async (): Promise<Listing[]> => {
    const response = await apiClient.get('/customer/listings');
    return response.data;
  },

  // Get single listing by ID
  getListing: async (id: string): Promise<Listing> => {
    const response = await apiClient.get(`/customer/listings/${id}`);
    return response.data;
  },

  // Update listing
  updateListing: async (data: UpdateListingRequest): Promise<Listing> => {
    const response = await apiClient.put(`/customer/listings/${data.id}`, data);
    return response.data;
  },

  // Delete listing
  deleteListing: async (id: string): Promise<void> => {
    await apiClient.delete(`/customer/listings/${id}`);
  },

  // Upload listing images
  uploadImages: async (files: File[]): Promise<{ urls: string[] }> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const response = await apiClient.post('/customer/listings/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get messages/conversations
  getConversations: async (): Promise<any[]> => {
    const response = await apiClient.get('/customer/conversations');
    return response.data;
  },

  // Get messages in a conversation
  getMessages: async (conversationId: string): Promise<any[]> => {
    const response = await apiClient.get(`/customer/conversations/${conversationId}/messages`);
    return response.data;
  },

  // Send message
  sendMessage: async (conversationId: string, content: string): Promise<any> => {
    const response = await apiClient.post(`/customer/conversations/${conversationId}/messages`, {
      content,
    });
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/users/profile');
    return response.data.data || response.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.put('/users/profile', data);
    return response.data.data || response.data;
  },
};
