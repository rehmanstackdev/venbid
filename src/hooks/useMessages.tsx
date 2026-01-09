import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { chatApi } from '@/api/chat';
import { getChatSocket, initChatSocket, joinConversation, leaveConversation } from '@/lib/chatSocket';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  listing_id: string;
  customer_id: string;
  vendor_id: string;
  created_at: string;
  updated_at: string;
  listing?: {
    title: string;
    images: string[] | null;
    category_name: string;
  };
  customer?: {
    name: string;
  };
  vendor?: {
    name: string;
    documentVerified?: boolean;
  };
  lastMessage?: Message;
  unreadCount?: number;
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
          listing_id: room.jobId,
          customer_id: room.customerId,
          vendor_id: room.vendorId,
          created_at: room.createdAt,
          updated_at: room.updatedAt,
          listing: {
            title: room.job.title,
            images: null,
            category_name: '',
          },
          customer: {
            name: room.customer.name,
          },
          vendor: {
            name: room.vendor.name,
            documentVerified: room.vendor.documentVerified,
          },
          lastMessage: room.lastMessage ? {
            id: '',
            conversation_id: room.id,
            sender_id: '',
            content: room.lastMessage,
            created_at: room.lastMessageAt,
            read: unreadCount === 0,
          } : undefined,
          unreadCount,
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
        conversation_id: msg.conversationId,
        sender_id: msg.senderId,
        content: msg.content,
        created_at: msg.createdAt,
        read: msg.isRead,
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
    if (socket?.connected && conversationId) {
      socket.on('newMessage', (data: any) => {
        if (data.conversationId === conversationId) {
          const newMsg: Message = {
            id: data.message.id,
            conversation_id: data.message.conversationId,
            sender_id: data.message.senderId,
            content: data.message.content,
            created_at: data.message.createdAt,
            read: data.message.isRead,
          };
          setMessages(prev => [...prev, newMsg]);
          if (newMsg.sender_id !== user?.id) {
            markAsRead();
          }
        }
      });
      
      return () => {
        if (conversationId) {
          leaveConversation(conversationId);
        }
        socket.off('newMessage');
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
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return diffMins < 1 ? "Just now" : `${diffMins}m ago`;
  }
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatChatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", { 
    hour: "numeric", 
    minute: "2-digit",
    hour12: true 
  });
}
