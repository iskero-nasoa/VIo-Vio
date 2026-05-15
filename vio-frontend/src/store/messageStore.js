import { create } from 'zustand';
import api from '../utils/api';

export const useMessageStore = create((set, get) => ({
  messages: {}, // chatId -> [messages]
  isLoading: false,
  error: null,

  fetchMessages: async (chatId) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/messages/${chatId}`);
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: response.data
        },
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch messages', isLoading: false });
    }
  },

  addMessage: (chatId, message) => {
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      // Prevent duplicates
      if (chatMessages.find(m => m._id === message._id)) return state;
      
      return {
        messages: {
          ...state.messages,
          [chatId]: [...chatMessages, message]
        }
      };
    });
  },

  sendMessage: async (chatId, content, messageType = 'text', file = null) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('messageType', messageType);
      if (file) {
        formData.append('message_attachment', file);
      }

      const response = await api.post(`/messages/${chatId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newMessage = response.data;
      get().addMessage(chatId, newMessage);
      return newMessage;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to send message' });
    }
  },

  updateReaction: (chatId, messageId, reactions) => {
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      return {
        messages: {
          ...state.messages,
          [chatId]: chatMessages.map(m => 
            m._id === messageId ? { ...m, reactions } : m
          )
        }
      };
    });
  }
}));
