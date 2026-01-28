import { useState } from 'react';
import { sendMessage as sendSocketMessage } from '@/lib/chatSocket';
import { chatApi } from '@/api/chat';

export function useSendMessage(conversationId: string, jobId: string, recipientId: string) {
  const [sending, setSending] = useState(false);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return false;

    setSending(true);
    try {
      // Try WebSocket first for real-time updates
      sendSocketMessage({
        jobId,
        recipientId,
        content: content.trim(),
      });
      
      // Fallback to HTTP API if WebSocket fails
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
