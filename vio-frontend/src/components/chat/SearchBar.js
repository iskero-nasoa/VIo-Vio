"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { SEARCH_DEBOUNCE_TIME } from '../../constants/searchConstants';

export default function SearchBar({ onSearch, placeholder = "Search...", className = "" }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, SEARCH_DEBOUNCE_TIME);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative group ${className}`}>
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${query ? 'text-primary' : 'text-slate-400'}`} size={18} />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-12 pr-12 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all font-bold text-slate-800 dark:text-slate-100 shadow-inner shadow-black/[0.02]"
      />
      {query && (
        <button 
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
