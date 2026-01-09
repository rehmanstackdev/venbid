import { apiClient } from './client';
import { Listing } from './customer';

export interface VendorProfile {
  name: string;
  phone: string;
  serviceCategory: string;
  city?: string;
  state?: string;
  zipCode?: string;
  address?: string;
  companyName?: string;
  coordinates?: {
    lat: number;
    long: number;
  };
}

export interface UpdateVendorProfileRequest {
  name: string;
  phone: string;
  serviceCategory: string;
  city?: string;
  state?: string;
  zipCode?: string;
  address?: string;
  companyName?: string;
  coordinates?: {
    lat: number;
    long: number;
  };
  verificationDocument?: File[];
}

export interface VerificationDocumentUpload {
  documentType: 'government_id' | 'business_license';
  file: File;
}

export interface VerificationDocument {
  id: string;
  documentType: string;
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  adminNotes?: string;
}

export const vendorApi = {
  // Browse all available job listings
  getListings: async (filters?: {
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    zipCode?: string;
  }): Promise<Listing[]> => {
    const response = await apiClient.get('/vendor/listings', { params: filters });
    return response.data;
  },

  // Get single listing details
  getListing: async (id: string): Promise<Listing> => {
    const response = await apiClient.get(`/vendor/listings/${id}`);
    return response.data;
  },

  // Start conversation with customer about a listing
  startConversation: async (listingId: string, customerId: string): Promise<{ conversationId: string }> => {
    const response = await apiClient.post('/vendor/conversations', {
      listingId,
      customerId,
    });
    return response.data;
  },

  // Get vendor's conversations
  getConversations: async (): Promise<any[]> => {
    const response = await apiClient.get('/vendor/conversations');
    return response.data;
  },

  // Get messages in a conversation
  getMessages: async (conversationId: string): Promise<any[]> => {
    const response = await apiClient.get(`/vendor/conversations/${conversationId}/messages`);
    return response.data;
  },

  // Send message
  sendMessage: async (conversationId: string, content: string): Promise<any> => {
    const response = await apiClient.post(`/vendor/conversations/${conversationId}/messages`, {
      content,
    });
    return response.data;
  },

  // Upload verification document
  uploadVerificationDocument: async (data: VerificationDocumentUpload): Promise<VerificationDocument> => {
    const formData = new FormData();
    formData.append('documentType', data.documentType);
    formData.append('document', data.file);
    const response = await apiClient.post('/vendor/verification', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get verification status
  getVerificationStatus: async (): Promise<{
    status: 'unverified' | 'pending' | 'verified' | 'rejected';
    documents: VerificationDocument[];
  }> => {
    const response = await apiClient.get('/vendor/verification');
    return response.data;
  },

  // Get favorites
  getFavorites: async (): Promise<string[]> => {
    const response = await apiClient.get('/vendor/favorites');
    return response.data;
  },

  // Add to favorites
  addFavorite: async (listingId: string): Promise<void> => {
    await apiClient.post('/vendor/favorites', { listingId });
  },

  // Remove from favorites
  removeFavorite: async (listingId: string): Promise<void> => {
    await apiClient.delete(`/vendor/favorites/${listingId}`);
  },

  // Get vendor profile
  getProfile: async (): Promise<any> => {
    const response = await apiClient.get('/vendors/profile');
    return response.data;
  },

  // Update vendor profile
  updateProfile: async (data: UpdateVendorProfileRequest): Promise<VendorProfile> => {
    if (data.verificationDocument && data.verificationDocument.length > 0) {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('phone', data.phone);
      formData.append('serviceCategory', data.serviceCategory);
      if (data.city) formData.append('city', data.city);
      if (data.state) formData.append('state', data.state);
      if (data.zipCode) formData.append('zipCode', data.zipCode);
      if (data.address) formData.append('address', data.address);
      if (data.companyName) formData.append('companyName', data.companyName);
      data.verificationDocument.forEach(file => {
        formData.append('verificationDocument', file);
      });
      const response = await apiClient.patch('/vendors/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data || response.data;
    } else {
      const payload: any = {
        name: data.name,
        phone: data.phone,
        serviceCategory: data.serviceCategory,
      };
      if (data.city) payload.city = data.city;
      if (data.state) payload.state = data.state;
      if (data.zipCode) payload.zipCode = data.zipCode;
      if (data.address) payload.address = data.address;
      if (data.companyName) payload.companyName = data.companyName;
      if (data.coordinates && data.coordinates.lat !== 0) {
        payload.coordinates = {
          lat: data.coordinates.lat,
          long: data.coordinates.long,
        };
      }
      const response = await apiClient.patch('/vendors/profile', payload);
      return response.data.data || response.data;
    }
  },
};
