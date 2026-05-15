import { useState, useCallback } from 'react';
import { useNotificationStore } from '../store/notificationStore';

export function useNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const store = useNotificationStore();

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    await store.fetchNotifications();
    setIsLoading(false);
  }, [store]);

  const markAsRead = async (id) => {
    await store.markAsRead(id);
  };

  const markAllAsRead = async () => {
    await store.markAllAsRead();
  };

  const deleteNotification = async (id) => {
    await store.removeNotification(id);
  };

  const clearAllNotifications = async () => {
    await store.clearAllNotifications();
  };

  return {
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  };
}
