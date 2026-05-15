"use client";

import { Reply, SmilePlus, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export default function MessageActions({ messageId, isOwn, onEdit, onDelete, onReply, onReact }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Example emojis for quick react
  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  return (
    <div className={`message-actions absolute top-1 flex items-center bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 rounded-lg p-1 z-10 transition-opacity ${
      isOwn ? '-left-2 -translate-x-full' : '-right-2 translate-x-full'
    }`}>
      <div className="flex items-center gap-1">
        
        {/* Quick Reactions - simple popover or expanded list */}
        <div className="relative group/emoji">
          <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
            <SmilePlus size={16} />
          </button>
          
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/emoji:flex items-center gap-1 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-full p-1.5 z-20">
            {quickEmojis.map(emoji => (
              <button 
                key={emoji}
                onClick={() => onReact(emoji)}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-lg transition-transform hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <button onClick={onReply} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title="Reply">
          <Reply size={16} />
        </button>

        {isOwn && (
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-green-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title="Edit">
            <Pencil size={16} />
          </button>
        )}

        {isOwn && (
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        )}

      </div>
    </div>
  );
}
