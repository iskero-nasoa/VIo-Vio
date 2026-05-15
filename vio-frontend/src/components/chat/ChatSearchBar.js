"use client";

import { useState } from 'react';
import { Search, X, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { useChatSearch } from '../../hooks/useChatSearch';

export default function ChatSearchBar({ chatId, onMessageFound, onClose }) {
  const [query, setQuery] = useState('');
  const { results, currentIndex, isLoading, searchMessages, nextResult, prevResult } = useChatSearch(chatId);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      searchMessages(query);
    }
  };

  const handleNext = () => {
    nextResult();
    if (results[currentIndex]) onMessageFound(results[currentIndex]);
  };

  const handlePrev = () => {
    prevResult();
    if (results[currentIndex]) onMessageFound(results[currentIndex]);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 animate-slide-down shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search in chat..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          autoFocus
          className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold"
        />
      </div>

      {results.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {currentIndex + 1} / {results.length}
          </span>
          <div className="flex gap-1">
            <button onClick={handlePrev} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
              <ChevronUp size={16} />
            </button>
            <button onClick={handleNext} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      )}

      {isLoading && <Loader2 size={18} className="animate-spin text-primary mx-2" />}

      <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
        <X size={18} />
      </button>
    </div>
  );
}
