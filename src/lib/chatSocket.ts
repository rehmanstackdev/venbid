import { io, Socket } from 'socket.io-client';

const SOCKET_URL = `${import.meta.env.VITE_API_BASE_URL}/chat`;

let socket: Socket | null = null;
let connectionAttempted = false;

export const initChatSocket = (token: string): Socket | null => {
  if (socket?.connected) return socket;
  if (connectionAttempted && !socket) return null;

  try {
    connectionAttempted = true;
    
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ WebSocket connection failed (app will work without real-time updates):', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    socket.on('error', (data) => {
      console.error('Chat socket error:', data);
    });

    return socket;
  } catch (error) {
    console.warn('WebSocket initialization failed:', error);
    return null;
  }
};

export const getChatSocket = (): Socket | null => socket;

export const disconnectChatSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const sendMessage = (data: { jobId: string; recipientId: string; content: string }) => {
  if (socket?.connected) {
    socket.emit('sendMessage', data);
    return true;
  }
  console.warn('WebSocket not connected, cannot send message');
  return false;
};

export const joinConversation = (conversationId: string) => {
  socket?.emit('joinConversation', { conversationId });
};

export const leaveConversation = (conversationId: string) => {
  socket?.emit('leaveConversation', { conversationId });
};

export const markAsRead = (conversationId: string) => {
  socket?.emit('markAsRead', { conversationId });
};

export const emitTyping = (conversationId: string, recipientId: string) => {
  socket?.emit('typing', { conversationId, recipientId });
};

export const emitStopTyping = (conversationId: string, recipientId: string) => {
  socket?.emit('stopTyping', { conversationId, recipientId });
};
