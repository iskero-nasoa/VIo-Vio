"use client";

import { Check, Trash2, X, BellOff } from 'lucide-react';
import NotificationItem from './NotificationItem';
import { useNotifications } from '../../hooks/useNotifications';

export default function NotificationPanel({ isOpen, onClose }) {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications 
  } = useNotifications();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[140]" onClick={onClose}></div>
      <div className="absolute top-full right-0 mt-3 w-96 bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden z-[150] flex flex-col max-h-[85vh] animate-pop-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
          <div>
            <h3 className="font-black text-lg text-slate-800 dark:text-slate-100 leading-none">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-black uppercase tracking-widest text-primary mt-1 block">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {notifications.length > 0 && (
              <button 
                onClick={markAllAsRead}
                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                title="Mark all as read"
              >
                <Check size={18} />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-2 scrollbar-thin">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold uppercase tracking-widest">Loading...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center px-8">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                <BellOff size={32} />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">All caught up!</h4>
              <p className="text-xs text-slate-500">You don't have any notifications at the moment.</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.map(notification => (
                <NotificationItem 
                  key={notification._id} 
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
            <button 
              onClick={clearAllNotifications}
              className="w-full py-3 rounded-2xl text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={14} />
              Clear all notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
}
