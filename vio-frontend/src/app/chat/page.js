'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. Setup App
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');
      if (!token) return window.location.href = '/login';
      if (savedUser) setUser(JSON.parse(savedUser));

      try {
        const res = await axios.get(`${API_URL}/chats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChats(res.data.data || res.data);
      } catch (err) {
        console.error('Fetch chats error', err);
      } finally {
        setLoading(false);
      }
    };
    init();

    if (localStorage.getItem('theme') === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // 2. Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  // 3. Methods
  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const selectChat = async (chat) => {
    setActiveChat(chat);
    if (!messages[chat._id]) {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await axios.get(`${API_URL}/messages/${chat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = Array.isArray(res.data.data) ? res.data.data : (res.data.messages || res.data || []);
        setMessages(prev => ({ ...prev, [chat._id]: data }));
      } catch (err) {
        console.error('Fetch messages error', err);
      }
    }
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;

    const chatId = activeChat._id;
    const content = messageInput;
    setMessageInput('');

    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.post(`${API_URL}/messages`, { chatId, content, messageType: 'text' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newMsg = res.data.data || res.data;
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(Array.isArray(prev[chatId]) ? prev[chatId] : []), newMsg]
      }));
      setChats(prev => prev.map(c => c._id === chatId ? { ...c, lastMessage: newMsg } : c));
    } catch (err) {
      alert('Failed to send');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#173f35] text-gray-400">Loading VioApp...</div>;

  return (
    <div className={`h-screen flex font-sans transition-colors duration-300 ${isDarkMode ? 'dark bg-[#173f35] text-white' : 'bg-gray-50 text-black'}`}>
      
      {/* Sidebar */}
      <div className={`w-80 flex flex-col border-r transition-colors shadow-lg z-10 ${isDarkMode ? 'bg-[#1a4939] border-white/5' : 'bg-white border-gray-100'}`}>
        {/* User Profile Header */}
        <div className={`p-6 flex flex-col gap-4 border-b transition-colors ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#007AFF] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                {user?.username?.[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-bold truncate max-w-[120px]">{user?.username}</span>
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Online</span>
              </div>
            </div>
            <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-2xl transition-all font-semibold text-sm">
              Logout
            </button>
          </div>
          <button className="w-full py-3 bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF] hover:text-white rounded-2xl font-bold transition-all text-sm">
            + New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chats.map(chat => {
            const isActive = activeChat?._id === chat._id;
            return (
              <div 
                key={chat._id} 
                onClick={() => selectChat(chat)} 
                className={`p-4 cursor-pointer transition-all rounded-2xl flex gap-4 relative group ${isActive ? (isDarkMode ? 'bg-white/10 shadow-md' : 'bg-blue-50 shadow-md') : (isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50')}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0 ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {chat.chatName?.[0] || 'C'}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold truncate text-[15px]">{chat.chatName || 'Direct Chat'}</h4>
                  </div>
                  <p className={`text-sm truncate ${isDarkMode ? 'text-[#CCCCCC]' : 'text-[#999999]'}`}>
                    {chat.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="absolute top-4 right-4 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold shadow-sm">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col transition-colors ${isDarkMode ? 'bg-[#173f35]' : 'bg-[#FFFFFF]'}`}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className={`px-8 py-5 flex items-center justify-between border-b shadow-sm transition-colors z-10 ${isDarkMode ? 'bg-[#1a4939] border-white/5' : 'bg-white border-gray-100'}`}>
              <div>
                <h3 className="font-bold text-lg">{activeChat.chatName || 'Conversation'}</h3>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {activeChat.members?.length || 2} members
                </p>
              </div>
              <button onClick={toggleTheme} className={`p-3 rounded-2xl transition-all shadow-sm ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}>
                {isDarkMode ? '🌞' : '🌙'}
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {Array.isArray(messages[activeChat._id]) && messages[activeChat._id].map((msg, i) => {
                const isOwn = (msg.senderId?._id || msg.senderId) === (user?.userId || user?.id);
                return (
                  <div key={msg._id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                    <div className={`max-w-[75%] md:max-w-[60%] px-5 py-3 rounded-2xl text-[15px] shadow-md transition-all ${isOwn ? 'bg-[#007AFF] text-white rounded-tr-sm' : (isDarkMode ? 'bg-white/10 text-white rounded-tl-sm' : 'bg-[#E5E5EA] text-black rounded-tl-sm')}`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <span className={`text-[10px] block mt-1.5 text-right font-medium ${isOwn ? 'text-blue-200' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-6 border-t transition-colors ${isDarkMode ? 'bg-[#1a4939] border-white/5' : 'bg-white border-gray-100'}`}>
              <form onSubmit={sendMessage} className="flex gap-4 items-end max-w-4xl mx-auto">
                <div className={`flex-1 rounded-2xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#007AFF]/50 ${isDarkMode ? 'bg-white/5' : 'bg-[#F2F2F7]'}`}>
                  <textarea 
                    value={messageInput} 
                    onChange={(e) => setMessageInput(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                    placeholder="Type a message..." 
                    rows={1}
                    className="w-full bg-transparent border-none focus:ring-0 px-6 py-4 resize-none max-h-32 min-h-[56px] text-[15px]" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={!messageInput.trim()} 
                  className="w-14 h-14 bg-[#007AFF] text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 transition-all shadow-md flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-90 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-50 select-none">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">VioApp Messenger</h2>
            <p className="text-sm">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
