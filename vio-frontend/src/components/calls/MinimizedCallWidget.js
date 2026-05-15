"use client";

import { Maximize2, PhoneOff, User } from 'lucide-react';
import CallTimer from './CallTimer';

export default function MinimizedCallWidget({ call, onExpand, onEnd }) {
  if (!call) return null;

  const otherParticipant = call.participantIds?.[0];

  return (
    <div className="fixed bottom-6 right-6 z-[100] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 flex items-center space-x-4 animate-slide-in">
      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden">
        {otherParticipant?.avatar ? (
          <img src={otherParticipant.avatar} className="w-full h-full object-cover" />
        ) : (
          <User size={20} />
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate w-24">
          {otherParticipant?.username || 'Call'}
        </span>
        <div className="text-[10px] text-slate-500 font-medium">
          <CallTimer startTime={call.startTime} />
        </div>
      </div>

      <div className="flex items-center space-x-1 pl-2 border-l border-slate-100 dark:border-slate-800">
        <button 
          onClick={onExpand}
          className="p-2 text-slate-400 hover:text-primary transition-colors"
        >
          <Maximize2 size={16} />
        </button>
        <button 
          onClick={onEnd}
          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <PhoneOff size={16} />
        </button>
      </div>
    </div>
  );
}
