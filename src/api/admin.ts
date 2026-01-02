import { apiClient } from './client';

export interface AdminVendor {
  id: string;
  userId: string;
  serviceCategory: string;
  companyName: string;
  verificationDocuments: string[];
  documentVerified: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface AdminVendorsResponse {
  success: boolean;
  message: string;
  data: AdminVendor[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
}

export const adminApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/admin/users');
    return response.data.data || [];
  },
};

export const getVendors = async (): Promise<AdminVendor[]> => {
  const response = await apiClient.get<AdminVendorsResponse>('/admin/vendors');
  return response.data.data;
};
