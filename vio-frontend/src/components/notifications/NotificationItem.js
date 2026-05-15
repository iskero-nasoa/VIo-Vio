"use client";

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NotificationIcon from './NotificationIcon';
import { formatNotificationTime } from '../../utils/notificationFormatters';

export default function NotificationItem({ notification, onMarkAsRead, onDelete }) {
  const router = useRouter();

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onDelete(notification._id);
  };

  return (
    <div 
      onClick={handleClick}
      className={`relative p-4 rounded-2xl flex gap-4 transition-all cursor-pointer group ${
        notification.isRead 
          ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30' 
          : 'bg-primary/5 hover:bg-primary/10 border-l-4 border-primary'
      }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
        notification.isRead 
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
          : 'bg-primary/20 text-primary shadow-inner shadow-primary/20'
      }`}>
        <NotificationIcon type={notification.type} size={24} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <h4 className={`text-sm leading-tight truncate pr-4 ${notification.isRead ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-black text-slate-900 dark:text-slate-100'}`}>
            {notification.title}
          </h4>
          <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap mt-0.5">
            {formatNotificationTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{notification.body}</p>
      </div>

      <button 
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
      >
        <X size={14} />
      </button>

      {!notification.isRead && (
        <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-primary rounded-full shadow-sm shadow-primary/50"></span>
      )}
    </div>
  );
}
