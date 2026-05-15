"use client";

import { Hash, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function TopicSwitcher({ topics = [], currentTopicId, onSwitch, isDropdown = false }) {
  const currentTopic = topics.find(t => t._id === currentTopicId) || topics[0];
  const [isOpen, setIsOpen] = useState(false);

  if (isDropdown) {
    return (
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent active:scale-95"
        >
          <Hash size={14} className="text-primary" />
          <span className="truncate max-w-[120px]">{currentTopic?.name || 'Topics'}</span>
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-pop-in">
              <div className="p-2 space-y-1">
                {topics.map(topic => (
                  <button
                    key={topic._id}
                    onClick={() => {
                      onSwitch(topic._id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-left transition-all ${
                      currentTopicId === topic._id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Hash size={14} className={currentTopicId === topic._id ? 'text-white' : 'text-primary'} />
                    <span className="text-xs font-bold truncate">{topic.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-2 p-2 overflow-x-auto scrollbar-hide no-scrollbar">
      {topics.map(topic => (
        <button
          key={topic._id}
          onClick={() => onSwitch(topic._id)}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            currentTopicId === topic._id 
              ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
              : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-100 dark:border-slate-800'
          }`}
        >
          <Hash size={14} />
          <span>{topic.name}</span>
        </button>
      ))}
    </div>
  );
}
