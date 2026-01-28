import { useState } from 'react';
import { sendMessage as sendSocketMessage, getChatSocket } from '@/lib/chatSocket';
import { chatApi } from '@/api/chat';

export function useSendMessage(conversationId: string, jobId: string, recipientId: string) {
  const [sending, setSending] = useState(false);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return false;

    setSending(true);
    try {
      const socket = getChatSocket();
      
      if (socket?.connected) {
        // Use WebSocket if connected
        const success = sendSocketMessage({
          jobId,
          recipientId,
          content: content.trim(),
        });
        
        if (success) {
          return true;
        }
      }
      
      // Fallback to HTTP API only if WebSocket fails
      await chatApi.sendMessage({
        jobId,
        recipientId,
        content: content.trim(),
      });
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    } finally {
      setSending(false);
    }
  };

  return { sendMessage, sending };
}
