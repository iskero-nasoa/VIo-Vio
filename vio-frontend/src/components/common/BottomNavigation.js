"use client";

import { MessageSquare, Phone, User, Settings } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useChatStore } from '../../store/chatStore';

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { chats } = useChatStore();

  const unreadCount = chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);

  const navItems = [
    { id: 'chats', label: 'Chats', icon: MessageSquare, path: '/', badge: unreadCount },
    { id: 'calls', label: 'Calls', icon: Phone, path: '/calls' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex items-center justify-around px-4 z-[100] sm:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.path || (item.id === 'chats' && pathname.startsWith('/chat/'));
        return (
          <button
            key={item.id}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center gap-1 relative group transition-all ${
              isActive ? 'text-primary scale-110' : 'text-slate-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary/10' : 'group-active:bg-slate-100 dark:group-active:bg-slate-800'}`}>
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-0'}`}>
              {item.label}
            </span>
            {item.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-bounce">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
