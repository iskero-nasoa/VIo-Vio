"use client";

import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Search, User, Check } from 'lucide-react';

export default function MembersSearch({ onMembersSelected, currentMembers = [] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        searchUsers();
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const searchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/users/search?q=${query}`);
      // Filter out current members
      const filtered = response.data.filter(u => !currentMembers.some(cm => cm._id === u._id));
      setResults(filtered);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (userId) => {
    setSelectedIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search users to add..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm"
        />
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {results.map(user => (
          <div 
            key={user._id}
            onClick={() => toggleSelect(user._id)}
            className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all border ${
              selectedIds.includes(user._id) 
                ? 'bg-primary/10 border-primary' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-bold truncate">{user.username}</h5>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
            {selectedIds.includes(user._id) && (
              <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                <Check size={12} />
              </div>
            )}
          </div>
        ))}
        {query && results.length === 0 && !isLoading && (
          <div className="py-8 text-center text-slate-500 text-xs">No users found</div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <button 
          onClick={() => onMembersSelected(selectedIds)}
          className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Add {selectedIds.length} Selected
        </button>
      )}
    </div>
  );
}
