"use client";

import { useState, useEffect } from 'react';
import { X, Search, User, MessageSquare, Hash, Command } from 'lucide-react';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import { useSearch } from '../../hooks/useSearch';
import { useRouter } from 'next/navigation';
import { useChatStore } from '../../store/chatStore';

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { results, isLoading, globalSearch, clearResults } = useSearch();
  const router = useRouter();
  const { setActiveChat } = useChatStore();

  useEffect(() => {
    if (query.length >= 2) {
      globalSearch(query);
    } else {
      clearResults();
    }
  }, [query, globalSearch, clearResults]);

  if (!isOpen) return null;

  const handleResultClick = (result, type) => {
    if (type === 'user') {
      // Logic for user click (e.g. open profile or start chat)
      onClose();
    } else if (type === 'chat') {
      setActiveChat(result._id);
      router.push(`/chat/${result._id}`);
      onClose();
    } else if (type === 'message') {
      setActiveChat(result.chat._id);
      router.push(`/chat/${result.chat._id}?messageId=${result._id}`);
      onClose();
    }
  };

  const tabs = [
    { id: 'all', label: 'All', icon: Command },
    { id: 'users', label: 'Users', icon: User },
    { id: 'chats', label: 'Chats', icon: Hash },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  const getFilteredResults = () => {
    if (activeTab === 'all') {
      // Mixed results handled in render
      return [];
    }
    return results[activeTab] || [];
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl animate-pop-in flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="p-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <Search size={32} className="text-primary" />
              Global Search
            </h2>
            <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
              <X size={24} />
            </button>
          </div>
          
          <SearchBar onSearch={setQuery} placeholder="Search anything on VioApp..." className="mb-6" />

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          {activeTab === 'all' ? (
            <div className="space-y-10">
              {Object.entries(results).map(([key, list]) => {
                if (list.length === 0) return null;
                const type = key.slice(0, -1); // users -> user
                return (
                  <div key={key} className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 px-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      {key}
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {list.slice(0, 5).map(item => (
                        <SearchResults 
                          key={item._id} 
                          results={[item]} 
                          type={type} 
                          query={query} 
                          onResultClick={(res) => handleResultClick(res, type)} 
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              {!isLoading && !query && <SearchResults query="" />}
              {isLoading && <SearchResults isLoading={true} query={query} />}
              {!isLoading && query && Object.values(results).every(l => l.length === 0) && <SearchResults results={[]} query={query} />}
            </div>
          ) : (
            <SearchResults 
              results={getFilteredResults()} 
              type={activeTab.slice(0, -1)} 
              query={query} 
              isLoading={isLoading}
              onResultClick={(res) => handleResultClick(res, activeTab.slice(0, -1))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
