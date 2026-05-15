"use client";

import { useAuthStore } from '../../store/authStore';

export default function UserProfile() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div 
      className="flex items-center space-x-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
      onClick={() => {
        // Open Profile Modal logic here
        console.log('Open profile modal');
      }}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
          {user.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            user.username?.charAt(0).toUpperCase() || '?'
          )}
        </div>
        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
          user.status === 'online' ? 'bg-green-500' :
          user.status === 'away' ? 'bg-yellow-500' : 'bg-slate-400'
        }`}></div>
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 truncate">
          {user.username}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {user.statusMessage || 'Available'}
        </p>
      </div>
    </div>
  );
}
