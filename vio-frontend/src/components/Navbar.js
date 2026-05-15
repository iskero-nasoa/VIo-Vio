"use client";

import { useState } from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';
import GlobalSearch from './chat/GlobalSearch';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './common/MobileMenu';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <span className="font-black text-xl">V</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight hidden sm:block">VioApp</h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl text-slate-400 transition-all group w-40 md:w-64"
          >
            <Search size={18} className="group-hover:text-primary transition-colors" />
            <span className="text-xs font-bold truncate">Search anything...</span>
            <div className="ml-auto flex items-center gap-1 opacity-0 md:opacity-100">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold">K</kbd>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <MobileMenu />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            Online
          </div>
        </div>
      </nav>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
