import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { chatApi } from '@/api/chat';
import { getChatSocket, initChatSocket, joinConversation, leaveConversation } from '@/lib/chatSocket';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    name?: string;
  };
}

export interface Conversation {
  id: string;
  jobId: string;
  customerId: string;
  vendorId: string;
  createdAt: string;
  updatedAt: string;
  job?: {
    id: string;
    title: string;
    category?: string;
    jobImages?: Array<{ image: string; isFeatured: boolean }>;
  };
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    name?: string;
  };
  vendor?: {
    id: string;
    firstName: string;
    lastName: string;
    name?: string;
    documentVerified?: boolean;
  };
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  customerUnreadCount?: number;
  vendorUnreadCount?: number;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchConversations = async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      const rooms = await chatApi.getChatRooms();
      const transformedConversations: Conversation[] = rooms.map(room => {
        const isCustomer = user.id === room.customerId;
        const unreadCount = isCustomer ? room.customerUnreadCount : room.vendorUnreadCount;
        
        return {
          id: room.id,
          jobId: room.jobId,
          customerId: room.customerId,
          vendorId: room.vendorId,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
          job: {
            id: room.job.id,
            title: room.job.title,
            category: room.job.category,
          },
          customer: {
            id: room.customer.id,
            firstName: room.customer.firstName,
            lastName: room.customer.lastName,
            name: room.customer.name || `${room.customer.firstName} ${room.customer.lastName}`.trim(),
          },
          vendor: {
            id: room.vendor.id,
            firstName: room.vendor.firstName,
            lastName: room.vendor.lastName,
            name: room.vendor.name || `${room.vendor.firstName} ${room.vendor.lastName}`.trim(),
            documentVerified: room.vendor.documentVerified,
          },
          lastMessage: room.lastMessage,
          lastMessageAt: room.lastMessageAt,
          customerUnreadCount: room.customerUnreadCount,
          vendorUnreadCount: room.vendorUnreadCount,
        };
      });
      
      setConversations(transformedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    
    // Initialize WebSocket
    const token = localStorage.getItem('access_token');
    if (user && token) {
      const socket = initChatSocket(token);
      
      if (socket) {
        socket.on('newMessage', () => {
          fetchConversations();
        });
        
        return () => {
          socket.off('newMessage');
        };
      }
    }
  }, [user]);

  return { conversations, loading, refetch: fetchConversations };
}

export function useConversationMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const markAsRead = async () => {
    if (!conversationId || !user) return;
    
    try {
      await chatApi.markAsRead(conversationId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const fetchMessages = async () => {
    if (!conversationId || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      const apiMessages = await chatApi.getMessages(conversationId);
      
      const transformedMessages: Message[] = apiMessages.map(msg => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        content: msg.content,
        createdAt: msg.createdAt,
        isRead: msg.isRead,
        sender: msg.sender ? {
          id: msg.sender.id,
          firstName: msg.sender.firstName,
          lastName: msg.sender.lastName,
          name: msg.sender.name || `${msg.sender.firstName} ${msg.sender.lastName}`.trim(),
        } : undefined,
      }));
      
      setMessages(transformedMessages);
      markAsRead();
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    if (conversationId) {
      joinConversation(conversationId);
    }
    
    const socket = getChatSocket();
    if (socket && conversationId) {
      const handleNewMessage = (data: any) => {
        if (data.conversationId === conversationId) {
          const newMsg: Message = {
            id: data.message.id,
            conversationId: data.message.conversationId,
            senderId: data.message.senderId,
            content: data.message.content,
            createdAt: data.message.createdAt,
            isRead: data.message.isRead,
            sender: data.message.sender,
          };
          setMessages(prev => {
            if (prev.some(msg => msg.id === newMsg.id)) {
              return prev;
            }
            return [...prev, newMsg];
          });
          if (newMsg.senderId !== user?.id) {
            markAsRead();
          }
        }
      };
      
      const handleMessageSent = (data: any) => {
        if (data.success && data.message.conversationId === conversationId) {
          const newMsg: Message = {
            id: data.message.id,
            conversationId: data.message.conversationId,
            senderId: data.message.senderId,
            content: data.message.content,
            createdAt: data.message.createdAt,
            isRead: data.message.isRead,
            sender: data.message.sender,
          };
          setMessages(prev => {
            if (prev.some(msg => msg.id === newMsg.id)) {
              return prev;
            }
            return [...prev, newMsg];
          });
        }
      };
      
      socket.on('newMessage', handleNewMessage);
      socket.on('messageSent', handleMessageSent);
      
      return () => {
        if (conversationId) {
          leaveConversation(conversationId);
        }
        socket.off('newMessage', handleNewMessage);
        socket.off('messageSent', handleMessageSent);
      };
    }
  }, [conversationId, user]);

  return { messages, loading, refetch: fetchMessages };
}

export function useStartConversation() {
  const { user } = useAuth();

  const startConversation = async (listingId: string, customerId: string, initialMessage: string = 'Hi, I\'m interested in this job.') => {
    if (!user) return null;

    try {
      const message = await chatApi.sendMessage({
        jobId: listingId,
        recipientId: customerId,
        content: initialMessage,
      });
      return message.conversationId;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return null;
    }
  };

  return { startConversation };
}

export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  // Fix invalid future dates by using current time
  if (date.getFullYear() > now.getFullYear() || date > now) {
    return "Just now";
  }
  
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatChatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  // Fix invalid future dates by using current time
  if (date.getFullYear() > now.getFullYear() || date > now) {
    return now.toLocaleTimeString('en-US', { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true
    });
  }
  
  return date.toLocaleTimeString('en-US', { 
    hour: "numeric", 
    minute: "2-digit",
    hour12: true
  });
}
