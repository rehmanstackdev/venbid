import { apiClient } from './client';

export enum JobCategory {
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  HVAC = 'hvac',
  CLEANING = 'cleaning',
  HANDYMAN = 'handyman',
  LANDSCAPING = 'landscaping',
  ROOFING = 'roofing',
  MOVING = 'moving',
  APPLIANCE = 'appliance',
  AUTOMOTIVE = 'automotive',
}

export interface CreateJobRequest {
  title: string;
  description: string;
  category: JobCategory;
  budget: number;
  city: string;
  zip: string;
  street: string;
  crossStreet: string;
  showExactAddress: boolean;
  images: File[];
  phone?: string;
  coordinates?: {
    lat: number;
    long: number;
  };
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: JobCategory | string;
  budget: number | string;
  city: string;
  zip: string;
  street: string;
  crossStreet: string;
  showExactAddress: boolean;
  images: string[];
  coordinates?: {
    lat: number;
    long: number;
  };
  status?: string;
  isComplete?: boolean;
  createdBy?: {
    id: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export const jobsApi = {
  getPublicJobs: async (): Promise<Job[]> => {
    try {
      const response = await apiClient.get('/jobs/public');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching public jobs:', error);
      return [];
    }
  },

  createJob: async (data: CreateJobRequest): Promise<Job> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('budget', data.budget.toString());
    formData.append('city', data.city);
    formData.append('zip', data.zip);
    formData.append('street', data.street);
    formData.append('crossStreet', data.crossStreet);
    formData.append('showExactAddress', data.showExactAddress.toString());
    if (data.phone) formData.append('phone', data.phone);
    if (data.coordinates) {
      formData.append('coordinates', JSON.stringify(data.coordinates));
    }
    
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
    }

    const response = await apiClient.post('/jobs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    
    const job = response.data.data || response.data;
    
    if (!job.images || job.images.length === 0) {
      console.warn('Job created but images array is empty. Backend may not have processed images.');
    }
    
    return job;
  },

  getAllJobs: async (params?: { category?: string; lat?: number; long?: number }): Promise<Job[]> => {
    const response = await apiClient.get('/jobs', { params });
    return response.data.data || response.data || [];
  },

  getMyJobs: async (): Promise<Job[]> => {
    const response = await apiClient.get('/jobs/my-jobs');
    return response.data.data || response.data || [];
  },

  getJobById: async (id: string): Promise<Job> => {
    const response = await apiClient.get(`/jobs/${id}`);
    return response.data.data || response.data;
  },

  updateJob: async (id: string, data: Partial<CreateJobRequest>): Promise<Job> => {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    if (data.budget) formData.append('budget', data.budget.toString());
    if (data.city) formData.append('city', data.city);
    if (data.zip) formData.append('zip', data.zip);
    if (data.street) formData.append('street', data.street);
    if (data.crossStreet) formData.append('crossStreet', data.crossStreet);
    if (data.showExactAddress !== undefined) formData.append('showExactAddress', data.showExactAddress.toString());
    if (data.phone) formData.append('phone', data.phone);
    
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
    }

    const response = await apiClient.patch(`/jobs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data || response.data;
  },

  deleteJob: async (id: string): Promise<void> => {
    await apiClient.delete(`/jobs/${id}`);
  },

  completeJob: async (id: string, isComplete: boolean): Promise<Job> => {
    const response = await apiClient.patch(`/jobs/${id}/complete-status`, { isComplete });
    return response.data.data || response.data;
  },
};
