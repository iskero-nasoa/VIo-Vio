"use client";

import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', color = 'primary', overlay = false, text }) {
  const sizes = {
    sm: 16,
    md: 32,
    lg: 64
  };

  const colors = {
    primary: 'text-primary',
    white: 'text-white',
    slate: 'text-slate-400'
  };

  const spinner = (
    <Loader2 
      size={sizes[size]} 
      className={`${colors[color]} animate-spin`} 
    />
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm gap-4">
        {spinner}
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 animate-pulse">
          {text || 'Loading VioApp...'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-2">
      {spinner}
      {text && <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{text}</span>}
    </div>
  );
}
