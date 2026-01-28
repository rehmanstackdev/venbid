import { apiClient } from './client';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    name?: string;
  };
}

export interface ChatRoom {
  id: string;
  customerId: string;
  vendorId: string;
  jobId: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  customerUnreadCount: number;
  vendorUnreadCount: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    name?: string;
  };
  vendor: {
    id: string;
    firstName: string;
    lastName: string;
    name?: string;
    documentVerified?: boolean;
  };
  job: {
    id: string;
    title: string;
    category?: string;
  };
}

export interface SendMessageRequest {
  jobId: string;
  recipientId: string;
  content: string;
}

export const chatApi = {
  sendMessage: async (data: SendMessageRequest): Promise<ChatMessage> => {
    const response = await apiClient.post('/chat/send', data);
    return response.data.data;
  },

  getChatRooms: async (): Promise<ChatRoom[]> => {
    const response = await apiClient.get('/chat/rooms');
    return response.data.data || [];
  },

  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/chat/rooms/${conversationId}/messages`);
    return response.data.data || [];
  },

  markAsRead: async (conversationId: string): Promise<void> => {
    await apiClient.post(`/chat/rooms/${conversationId}/read`);
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/chat/unread-count');
    return response.data.data?.unreadCount || 0;
  },

  healthCheck: async (): Promise<any> => {
    const response = await apiClient.get('/chat/health');
    return response.data.data;
  },
};
