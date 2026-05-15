import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

export const connectSocket = () => {
  const token = useAuthStore.getState().token;
  
  const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const socket = io(socketURL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
  });

  return socket;
};
