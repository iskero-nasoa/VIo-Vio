"use client";

import { useState } from 'react';
import { Menu, X, Settings, User, LogOut, Shield, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuthStore();

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="sm:hidden">
      <button 
        onClick={toggle}
        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary transition-all active:scale-90"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[140] bg-black/40 backdrop-blur-sm" onClick={toggle}></div>
          <div className="absolute top-full right-4 mt-2 w-56 bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-[150] animate-slide-down">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{user?.username}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="p-3 space-y-1">
              {[
                { label: 'Profile', icon: User, color: 'text-blue-500' },
                { label: 'Privacy', icon: Shield, color: 'text-emerald-500' },
                { label: 'Notifications', icon: Bell, color: 'text-amber-500' },
                { label: 'Settings', icon: Settings, color: 'text-slate-500' },
              ].map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group"
                >
                  <div className={`p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform ${item.color}`}>
                    <item.icon size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/50">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              >
                <LogOut size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
