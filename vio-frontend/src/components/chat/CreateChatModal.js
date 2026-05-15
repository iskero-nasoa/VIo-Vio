"use client";

import { useState } from 'react';
import api from '../../utils/api';
import { useChatStore } from '../../store/chatStore';
import { X, Search, Loader2 } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

export default function CreateChatModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const { chats, setChats, setActiveChat } = useChatStore();

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await api.get(`/users/search?q=${query}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearching(false);
    }
  };

  const startChat = async (recipientId) => {
    setCreating(true);
    try {
      const response = await api.post('/chats/direct', { recipientId });
      const newChat = response.data;
      
      // Add to store if not exists
      if (!chats.find(c => c._id === newChat._id)) {
        setChats([newChat, ...chats]);
      }
      
      setActiveChat(newChat);
      onClose();
    } catch (err) {
      console.error('Create chat failed', err);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">New Direct Chat</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {searching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-1">
              {searchResults.map(user => (
                <div 
                  key={user._id} 
                  className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{user.username}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => startChat(user._id)}
                    disabled={creating}
                    className="text-sm py-1 px-3"
                  >
                    Message
                  </Button>
                </div>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <p className="text-center py-8 text-slate-500">No users found.</p>
          ) : (
            <p className="text-center py-8 text-slate-500 text-sm">Type at least 2 characters to search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
