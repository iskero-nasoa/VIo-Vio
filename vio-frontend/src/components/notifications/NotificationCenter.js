"use client";

import { useState } from 'react';
import { Bell, Check, Trash2, Settings } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationToast from './NotificationToast';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, toasts, markAsRead, markAllAsRead, removeNotification } = useNotificationStore();

  return (
    <>
      {/* Toast Container - Fixed globally */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <NotificationToast key={toast.id} toast={toast} />
        ))}
      </div>

      {/* Notification Bell Badge */}
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors relative"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
          )}
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden z-50 flex flex-col max-h-[80vh]">
              
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Notifications</h3>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markAllAsRead()}
                      className="text-xs font-semibold text-primary hover:text-primary-focus transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-sm">
                    No notifications yet.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map(notification => (
                      <div 
                        key={notification._id}
                        className={`p-3 rounded-xl flex gap-3 group transition-colors ${
                          notification.isRead 
                            ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' 
                            : 'bg-primary/5 hover:bg-primary/10'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm ${notification.isRead ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-slate-100'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.body}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(notification.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.isRead && (
                            <button 
                              onClick={() => markAsRead(notification._id)}
                              className="p-1 text-slate-400 hover:text-green-500 transition-colors"
                              title="Mark as read"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => removeNotification(notification._id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors mt-auto"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
