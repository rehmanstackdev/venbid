import { apiClient } from './client';

export interface JobConversation {
  id: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  vendorId: string;
  vendor: {
    id: string;
    name: string;
    email: string;
  };
  jobId: string;
  messages: {
    id: string;
    senderId: string;
    content: string;
    type: string;
    isRead: boolean;
    createdAt: string;
  }[];
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface AdminVendor {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  companyName: string;
  serviceCategory: string;
  documentVerified: boolean;
  verificationDocuments: string[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
}

export const getVendors = async (): Promise<AdminVendor[]> => {
  const response = await apiClient.get('/admin/vendors');
  return response.data.data || [];
};

export const adminApi = {
  getJobConversations: async (jobId: string): Promise<JobConversation[]> => {
    const response = await apiClient.get(`/admin/jobs/${jobId}/conversation`);
    return response.data.data || [];
  },

  getCompletedJobs: async (): Promise<any[]> => {
    const response = await apiClient.get('/admin/jobs/completed');
    return response.data.data || [];
  },

  deleteJob: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/admin/jobs/${jobId}`);
  },

  updateVendorDocumentVerification: async (vendorId: string, verified: boolean): Promise<void> => {
    await apiClient.patch(`/admin/vendors/${vendorId}/verify`, { documentVerified: verified });
  },

  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/admin/users');
    return response.data.data || [];
  },

  updateUserApproval: async (userId: string, isApproved: boolean): Promise<void> => {
    await apiClient.patch(`/admin/users/${userId}/approval`, { isApproved });
  },
};
