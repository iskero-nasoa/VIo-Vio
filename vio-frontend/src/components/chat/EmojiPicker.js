"use client";

import { useState } from 'react';
import { Smile } from 'lucide-react';

export default function EmojiPicker({ onEmojiSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  // Common emojis for curriculum demo
  const emojis = [
    '😀', '😂', '😍', '👍', '🎉', '❤️', '😢', '😡', '🔥', '✨',
    '🤔', '🙌', '👏', '🙏', '😎', '😴', '🤯', '🥳', '👀', '💯'
  ];

  return (
    <div className="relative">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 text-slate-400 hover:text-yellow-500 transition-colors"
        title="Add emoji"
      >
        <Smile size={20} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 rounded-2xl p-4 z-40">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Common Emojis</h4>
            <div className="grid grid-cols-5 gap-2">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onEmojiSelect(emoji);
                    setIsOpen(false);
                  }}
                  className="w-10 h-10 flex items-center justify-center text-xl hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-transform hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
