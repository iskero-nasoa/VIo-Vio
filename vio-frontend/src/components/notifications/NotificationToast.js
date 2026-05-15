"use client";

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NotificationIcon from './NotificationIcon';
import { NOTIFICATION_COLORS } from '../../constants/notificationConstants';

export default function NotificationToast({ toast, onClose }) {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const handleClick = () => {
    if (toast.actionUrl) {
      router.push(toast.actionUrl);
    }
    onClose();
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsExiting(true);
    setTimeout(onClose, 300); // Wait for animation
  };

  const colorClass = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    gray: 'bg-slate-500'
  }[NOTIFICATION_COLORS[toast.type]] || 'bg-primary';

  return (
    <div 
      onClick={handleClick}
      className={`pointer-events-auto w-full bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex cursor-pointer transition-all ${
        isExiting ? 'animate-slide-out opacity-0 translate-x-10' : 'animate-slide-in'
      }`}
    >
      <div className={`w-1.5 ${colorClass}`}></div>
      <div className="p-4 flex gap-3 flex-1">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${colorClass} shadow-lg shadow-black/10`}>
          <NotificationIcon type={toast.type} size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{toast.title}</h4>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{toast.message || toast.body}</p>
        </div>

        <button 
          onClick={handleClose}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
