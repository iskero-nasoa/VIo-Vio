import { create } from 'zustand';
import api from '../utils/api';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  toasts: [],

  setNotifications: (notifications) => {
    set({ 
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length
    });
  },

  addNotification: (notification) => {
    set((state) => {
      // Prevent duplicates
      if (state.notifications.some(n => n._id === notification._id)) return state;
      
      const newNotifications = [notification, ...state.notifications];
      return {
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.isRead).length
      };
    });
  },

  markAsRead: async (notificationId) => {
    // Optimistic update
    set((state) => {
      const newNotifications = state.notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      );
      return {
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.isRead).length
      };
    });

    try {
      await api.put(`/notifications/${notificationId}/read`);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0
    }));

    try {
      await api.put('/notifications/read/all');
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  },

  removeNotification: async (notificationId) => {
    set((state) => {
      const newNotifications = state.notifications.filter(n => n._id !== notificationId);
      return {
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.isRead).length
      };
    });

    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  },

  fetchNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      set({ 
        notifications: response.data,
        unreadCount: response.data.filter(n => !n.isRead).length
      });
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  },

  clearAllNotifications: async () => {
    set({ notifications: [], unreadCount: 0 });
    try {
      await api.delete('/notifications');
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  },

  addToast: (toast) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    set((state) => ({
      toasts: [...state.toasts, newToast].slice(-3) // Max 3 toasts
    }));

    // Auto remove after duration
    setTimeout(() => {
      get().removeToast(id);
    }, toast.duration || 4000);
    
    return id;
  },

  removeToast: (toastId) => {
    set((state) => ({
      toasts: state.toasts.filter(t => t.id !== toastId)
    }));
  }
}));
