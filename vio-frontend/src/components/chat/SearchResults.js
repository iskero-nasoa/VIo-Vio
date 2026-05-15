"use client";

import { Loader2, Search } from 'lucide-react';
import SearchResultItem from './SearchResultItem';

export default function SearchResults({ results = [], type, query, isLoading, onResultClick }) {
  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <span className="text-xs font-black uppercase tracking-[0.2em] animate-pulse">Searching VioApp...</span>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center px-10">
        <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-200 dark:text-slate-700 mb-6">
          <Search size={40} />
        </div>
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2">Start Searching</h3>
        <p className="text-sm text-slate-500 leading-relaxed max-w-[240px]">Find people, chats, or specific messages across your entire history.</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center px-10">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-1">No matches found</h3>
        <p className="text-sm text-slate-500">We couldn't find anything matching "{query}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-1">
      {results.map((result) => (
        <SearchResultItem 
          key={result._id || result.id} 
          result={result} 
          type={type} 
          query={query}
          onClick={onResultClick} 
        />
      ))}
    </div>
  );
}
