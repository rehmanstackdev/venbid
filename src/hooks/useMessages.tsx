import { useState, useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { mockConversations, mockMessages as initialMockMessages } from '@/data/mockMessages';

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
  lastMessage?: Message;
  unreadCount?: number;
}

// Mock messages storage
const mockMessagesStore: Record<string, Message[]> = {};

// Initialize mock messages
Object.keys(initialMockMessages).forEach(convId => {
  mockMessagesStore[convId] = initialMockMessages[convId].map(msg => ({
    id: msg.id,
    conversation_id: msg.conversationId,
    sender_id: msg.senderId,
    content: msg.content,
    created_at: msg.createdAt.toISOString(),
    read: msg.read,
  }));
});

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

    // Mock data - transform mock conversations
    const transformedConversations: Conversation[] = mockConversations.map(conv => {
      const messages = mockMessagesStore[conv.id] || [];
      const lastMsg = messages[messages.length - 1];
      const unreadCount = messages.filter(m => !m.read && m.sender_id !== user.id).length;
      
      return {
        id: conv.id,
        listing_id: conv.listingId,
        customer_id: conv.customerId,
        vendor_id: conv.vendorId,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: conv.lastMessageAt.toISOString(),
        listing: {
          title: conv.listingTitle,
          images: [conv.listingImage],
          category_name: conv.vendorCategory,
        },
        lastMessage: lastMsg,
        unreadCount,
      };
    });
    
    setConversations(transformedConversations);
    setLoading(false);

    // Commented out Supabase logic
    // const { data, error } = await supabase
    //   .from('conversations')
    //   .select(`*, listing:listings(title, images, category_name)`)
    //   .order('updated_at', { ascending: false });
    // if (error) {
    //   console.error('Error fetching conversations:', error);
    //   setLoading(false);
    //   return;
    // }
    // const conversationsWithMessages = await Promise.all(
    //   (data || []).map(async (conv) => {
    //     const { data: messages } = await supabase
    //       .from('messages')
    //       .select('*')
    //       .eq('conversation_id', conv.id)
    //       .order('created_at', { ascending: false })
    //       .limit(1);
    //     const { count } = await supabase
    //       .from('messages')
    //       .select('*', { count: 'exact', head: true })
    //       .eq('conversation_id', conv.id)
    //       .eq('read', false)
    //       .neq('sender_id', user.id);
    //     return { ...conv, lastMessage: messages?.[0], unreadCount: count || 0 };
    //   })
    // );
    // setConversations(conversationsWithMessages);
    // setLoading(false);
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return { conversations, loading, refetch: fetchConversations };
}

export function useConversationMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const markAsRead = async () => {
    if (!conversationId || !user) return;
    
    // Mock mark as read
    if (mockMessagesStore[conversationId]) {
      mockMessagesStore[conversationId] = mockMessagesStore[conversationId].map(msg => 
        msg.sender_id !== user.id ? { ...msg, read: true } : msg
      );
    }
    
    // Commented out Supabase logic
    // await supabase
    //   .from('messages')
    //   .update({ read: true })
    //   .eq('conversation_id', conversationId)
    //   .eq('read', false)
    //   .neq('sender_id', user.id);
  };

  useEffect(() => {
    if (!conversationId || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      // Mock data
      const msgs = mockMessagesStore[conversationId] || [];
      setMessages(msgs);
      markAsRead();
      setLoading(false);
      
      // Commented out Supabase logic
      // const { data, error } = await supabase
      //   .from('messages')
      //   .select('*')
      //   .eq('conversation_id', conversationId)
      //   .order('created_at', { ascending: true });
      // if (error) {
      //   console.error('Error fetching messages:', error);
      // } else {
      //   setMessages(data || []);
      //   markAsRead();
      // }
      // setLoading(false);
    };

    fetchMessages();

    // Commented out Supabase realtime subscription
    // const channel = supabase
    //   .channel(`messages:${conversationId}`)
    //   .on('postgres_changes', {
    //     event: 'INSERT',
    //     schema: 'public',
    //     table: 'messages',
    //     filter: `conversation_id=eq.${conversationId}`,
    //   }, (payload) => {
    //     setMessages((prev) => [...prev, payload.new as Message]);
    //     if ((payload.new as Message).sender_id !== user.id) {
    //       markAsRead();
    //     }
    //   })
    //   .subscribe();
    // return () => { supabase.removeChannel(channel); };
  }, [conversationId, user]);

  const sendMessage = async (content: string) => {
    if (!conversationId || !user || !content.trim()) return false;

    // Mock send message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
      created_at: new Date().toISOString(),
      read: true,
    };
    
    if (!mockMessagesStore[conversationId]) {
      mockMessagesStore[conversationId] = [];
    }
    mockMessagesStore[conversationId].push(newMessage);
    setMessages(prev => [...prev, newMessage]);
    
    console.log('Mock message sent:', newMessage);
    
    // Commented out Supabase logic
    // const { error } = await supabase.from('messages').insert({
    //   conversation_id: conversationId,
    //   sender_id: user.id,
    //   content: content.trim(),
    // });
    // if (error) {
    //   console.error('Error sending message:', error);
    //   return false;
    // }
    // await supabase
    //   .from('conversations')
    //   .update({ updated_at: new Date().toISOString() })
    //   .eq('id', conversationId);
    
    return true;
  };

  return { messages, loading, sendMessage, markAsRead };
}

export function useStartConversation() {
  const { user } = useAuth();

  const startConversation = async (listingId: string, customerId: string) => {
    if (!user) return null;

    // Mock - check if conversation exists
    const existing = mockConversations.find(
      c => c.listingId === listingId && c.vendorId === user.id
    );
    
    if (existing) {
      return existing.id;
    }

    // Mock - create new conversation
    const newConvId = `conv-${Date.now()}`;
    console.log('Mock conversation created:', { newConvId, listingId, customerId });
    
    // Commented out Supabase logic
    // const { data: existing } = await supabase
    //   .from('conversations')
    //   .select('id')
    //   .eq('listing_id', listingId)
    //   .eq('vendor_id', user.id)
    //   .single();
    // if (existing) return existing.id;
    // const { data, error } = await supabase
    //   .from('conversations')
    //   .insert({ listing_id: listingId, customer_id: customerId, vendor_id: user.id })
    //   .select('id')
    //   .single();
    // if (error) {
    //   console.error('Error creating conversation:', error);
    //   return null;
    // }
    // return data.id;
    
    return newConvId;
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
