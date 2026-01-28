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
      console.log('✅ Frontend: WebSocket connected to', SOCKET_URL);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ Frontend: WebSocket connection failed:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Frontend: WebSocket disconnected:', reason);
    });

    socket.on('error', (data) => {
      console.error('❌ Frontend: Chat socket error:', data);
    });

    socket.on('messageSent', (data) => {
      console.log('📤 Frontend: Message sent confirmation:', data);
    });

    socket.on('newMessage', (data) => {
      console.log('📥 Frontend: New message received:', data);
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
  console.log('🚀 Frontend: Attempting to send message via WebSocket:', data);
  console.log('🔌 Frontend: Socket connected?', socket?.connected);
  console.log('🔌 Frontend: Socket exists?', !!socket);
  
  if (socket?.connected) {
    console.log('✅ Frontend: Emitting sendMessage event');
    socket.emit('sendMessage', data);
    return true;
  }
  console.warn('❌ Frontend: WebSocket not connected, cannot send message');
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
