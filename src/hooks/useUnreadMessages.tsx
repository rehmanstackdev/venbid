import { useState, useEffect } from 'react';
import { chatApi } from '@/api/chat';
import { getChatSocket, initChatSocket } from '@/lib/chatSocket';
import { toast } from 'sonner';

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      const count = await chatApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    
    // Listen for new messages via WebSocket
    const token = localStorage.getItem('access_token');
    if (token) {
      const socket = initChatSocket(token);
      
      if (socket?.connected) {
        socket.on('newMessage', (data: any) => {
          fetchUnreadCount();
          toast.info('New message received', {
            description: data.message.content.substring(0, 50) + (data.message.content.length > 50 ? '...' : ''),
          });
        });
        
        return () => {
          clearInterval(interval);
          socket.off('newMessage');
        };
      }
    }
    
    return () => clearInterval(interval);
  }, []);

  return { unreadCount, isLoading, refetch: fetchUnreadCount };
}
