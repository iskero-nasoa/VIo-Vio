import { useEffect } from 'react';
import { useSocket } from './useSocket';
import { useMessageStore } from '../store/messageStore';
import { useChatStore } from '../store/chatStore';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'next/navigation';
import { useCallStore } from '../store/callStore';
import {
  handleReceiveMessage,
  handleUserJoined,
  handleUserStatusChange,
  handleIncomingCall,
  handleCallAccepted,
  handleCallEnded,
  handleMessageReaction,
  handleNotification
} from '../utils/socketHandlers';

export const useSocketListeners = (chatId = null, enabled = true) => {
  const { socket } = useSocket();
  const messageStore = useMessageStore();
  const chatStore = useChatStore();
  const notificationStore = useNotificationStore();
  const callStore = useCallStore();
  // userStore could be added if implemented globally
  const router = useRouter();

  useEffect(() => {
    if (!socket || !enabled) return;

    // --- Global Listeners ---
    socket.on('receive-message', (data) => handleReceiveMessage(data, messageStore, chatStore));
    socket.on('message-reaction-updated', (data) => handleMessageReaction(data, messageStore));
    
    socket.on('user-status-changed', (data) => handleUserStatusChange(data));
    socket.on('user-joined', (data) => handleUserJoined(data, null, notificationStore));
    
    socket.on('incoming-call', (data) => handleIncomingCall(data, notificationStore, callStore));
    socket.on('call-accepted', (data) => handleCallAccepted(data, router, callStore));
    socket.on('call-rejected', (data) => {
      notificationStore.addToast({ type: 'warning', title: 'Call Rejected', message: 'The user declined your call.' });
    });
    socket.on('call-ended', () => handleCallEnded(callStore));

    socket.on('notification', (data) => handleNotification(data, notificationStore));

    // --- Chat Specific Listeners ---
    if (chatId) {
      // Optional: bind events that only matter when viewing a specific chat
    }

    return () => {
      // Cleanup all registered listeners to prevent memory leaks or multiple fires
      socket.off('receive-message');
      socket.off('message-reaction-updated');
      socket.off('user-status-changed');
      socket.off('user-joined');
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('call-rejected');
      socket.off('call-ended');
      socket.off('notification');
    };
  }, [socket, enabled, chatId, messageStore, chatStore, notificationStore, router]);
};
