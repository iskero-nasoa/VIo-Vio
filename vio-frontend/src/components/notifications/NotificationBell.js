"use client";

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import UnreadBadge from './UnreadBadge';
import { useNotifications } from '../../hooks/useNotifications';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-xl transition-all relative ${
          isOpen 
            ? 'bg-primary text-white shadow-lg shadow-primary/30' 
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Bell size={20} fill={unreadCount > 0 && !isOpen ? "currentColor" : "none"} />
        <UnreadBadge 
          count={unreadCount} 
          className="absolute -top-1 -right-1" 
        />
      </button>

      <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
