'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function ChatPage() {
  // State
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({}); // { [chatId]: [message, ...] }
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // New Chat Modal State
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  
  const messagesEndRef = useRef(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  // --- ADDED: Helper to get active chat messages safely ---
  const currentChatId = activeChat?._id || activeChat?.id || activeChat;
  const activeChatMessages = Array.isArray(messages[currentChatId]) ? messages[currentChatId] : [];

  // Debugging
  useEffect(() => {
    console.log('activeChat:', activeChat);
    console.log('currentChatId:', currentChatId);
    console.log('messages state:', messages);
    console.log('activeChatMessages:', activeChatMessages);
  }, [activeChat, messages, currentChatId, activeChatMessages]);

  // Format timestamp helper
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      return '';
    }
  };

  // Auth Check and Initial Load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user');
    
    if (!token || !userData) {
      window.location.href = '/login';
      return;
    }

    try {
      setUser(JSON.parse(userData));
      fetchChats(token);
    } catch (e) {
      console.error('Failed to parse user data');
      window.location.href = '/login';
    }
  }, []);

  // Scroll to bottom when active chat messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatMessages]);

  // Fetch messages when activeChat changes
  useEffect(() => {
    if (activeChat) {
      const chatId = activeChat._id || activeChat.id || activeChat;
      fetchMessages(chatId);
    }
  }, [activeChat]);

  // Search users when userSearchQuery changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (userSearchQuery.trim().length >= 2) {
        searchUsers(userSearchQuery);
      } else {
        setUserSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [userSearchQuery]);

  const fetchChats = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/chats`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('auth_token')}` }
      });
      setChats(res.data.data || res.data);
    } catch (err) {
      console.error('Fetch chats error:', err);
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    if (!chatId) return;
    if (!messages[chatId]) setMsgLoading(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`${API_URL}/messages/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const rawData = res.data.data || res.data;
      const data = Array.isArray(rawData) ? rawData : [];
      
      setMessages(prev => ({
        ...prev,
        [chatId]: data
      }));
    } catch (err) {
      console.error('Fetch messages error:', err);
      // setError('Failed to load messages');
    } finally {
      setMsgLoading(false);
    }
  };

  const searchUsers = async (query) => {
    setSearchingUsers(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`${API_URL}/users/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserSearchResults(res.data.data || res.data);
    } catch (err) {
      console.error('Search users error:', err);
    } finally {
      setSearchingUsers(false);
    }
  };

  const createDirectChat = async (recipientId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.post(`${API_URL}/chats/direct`, { recipientId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newChat = res.data.data || res.data;
      
      // Check if chat already exists in list
      const existing = chats.find(c => c._id === newChat._id);
      if (!existing) {
        setChats(prev => [newChat, ...prev]);
      }
      
      setActiveChat(newChat);
      setShowNewChatModal(false);
      setUserSearchQuery('');
    } catch (err) {
      console.error('Create chat error:', err);
      alert(err.response?.data?.message || 'Failed to create chat');
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeChat || sending) return;

    const chatId = activeChat._id || activeChat.id || activeChat;
    const content = newMessage;
    setSending(true);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.post(`${API_URL}/messages`, {
        chatId,
        content,
        messageType: 'text'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const sentMsg = res.data.data || res.data;
      
      // Add to messages state object
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), sentMsg]
      }));
      
      setNewMessage('');
      
      // Update last message in chat list
      setChats(prev => prev.map(c => 
        (c._id === chatId || c.id === chatId) ? { ...c, lastMessage: sentMsg } : c
      ));
    } catch (err) {
      console.error('Send message error:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
  };

  const filteredChats = chats.filter(chat => {
    const name = chat.chatName || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans text-gray-900">
      
      {/* Sidebar (280px) */}
      <div className="w-[280px] h-full bg-white border-r border-gray-200 flex flex-col flex-shrink-0 shadow-sm z-20">
        
        {/* User Profile */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-100">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold truncate text-sm text-gray-800">{user?.username}</p>
              <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">Online</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-300 hover:text-red-500 transition-all hover:bg-red-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all placeholder-gray-400 font-medium"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-2 flex gap-2">
          <button 
            onClick={() => setShowNewChatModal(true)}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            New Chat
          </button>
          <button className="flex-1 bg-gray-50 text-gray-600 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-gray-100 transition-all active:scale-95 border border-gray-100">
            Group
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto mt-2 custom-scrollbar">
          {filteredChats.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs font-bold uppercase tracking-widest px-4">No active chats</div>
          ) : (
            filteredChats.map(chat => (
              <div
                key={chat._id}
                onClick={() => setActiveChat(chat)}
                className={`px-4 py-4 cursor-pointer transition-all flex gap-3 items-center hover:bg-blue-50/30 ${currentChatId === (chat._id || chat.id) ? 'bg-blue-50/50 border-r-4 border-blue-600' : ''}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex-shrink-0 flex items-center justify-center font-black text-indigo-500 text-xl shadow-inner border border-white">
                  {chat.chatName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-black text-sm truncate text-gray-800 tracking-tight">{chat.chatName}</p>
                    <span className="text-[9px] text-gray-400 font-black">{chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : ''}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5 font-medium leading-relaxed">
                    {chat.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="bg-blue-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-blue-200 ring-2 ring-white">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="h-20 border-b border-gray-100 flex items-center justify-between px-8 bg-white/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-white flex items-center justify-center font-black text-indigo-500 text-xl shadow-sm">
                  {activeChat.chatName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-lg leading-tight text-gray-900 tracking-tight">{activeChat.chatName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                      {activeChat.members?.length || 2} Members
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-300">
                <button className="p-3 hover:bg-gray-50 rounded-2xl transition-all hover:text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></button>
                <button className="p-3 hover:bg-gray-50 rounded-2xl transition-all hover:text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#fcfcfd] custom-scrollbar">
              {msgLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Fetching History</span>
                </div>
              ) : activeChatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400 opacity-50">
                  <div className="w-20 h-20 bg-gray-100 rounded-[32px] flex items-center justify-center shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <p className="font-black text-xs uppercase tracking-widest">Say hi to start the conversation!</p>
                </div>
              ) : (
                activeChatMessages.map((msg, i) => {
                  const senderId = msg.senderId?._id || msg.senderId;
                  const currentUserId = user?.userId || user?.id;
                  const isOwn = senderId === currentUserId;
                  
                  return (
                    <div key={msg._id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`flex gap-3 max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isOwn && (
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex-shrink-0 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-indigo-100 border border-white">
                            {msg.senderId?.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className={isOwn ? 'items-end' : 'items-start'}>
                          <div className={`px-5 py-3.5 rounded-[24px] text-sm shadow-sm transition-all hover:shadow-md ${isOwn ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                            {!isOwn && <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1.5">{msg.senderId?.username || 'User'}</p>}
                            <p className="leading-relaxed font-medium">{msg.content}</p>
                            <div className={`flex items-center gap-1.5 justify-end mt-2 ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>
                              <span className="text-[9px] font-black tracking-widest">{formatTime(msg.createdAt)}</span>
                              {isOwn && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-gray-50">
              <form onSubmit={handleSendMessage} className="flex gap-4 items-end max-w-5xl mx-auto">
                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-[28px] px-6 py-1.5 flex items-end shadow-inner transition-all focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500/20">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Write a message..."
                    className="w-full bg-transparent border-none focus:ring-0 text-sm py-3 resize-none max-h-32 min-h-[48px] font-medium placeholder-gray-400"
                    rows={1}
                  />
                  <div className="flex items-center mb-2">
                    <button type="button" className="p-2 text-gray-300 hover:text-blue-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="w-[56px] h-[56px] bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95 disabled:bg-gray-200 shadow-xl shadow-blue-200 flex-shrink-0 group"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-90 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white">
            <div className="w-32 h-32 bg-indigo-50 rounded-[48px] flex items-center justify-center text-indigo-500 mb-8 animate-bounce duration-[4000ms] shadow-inner border border-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">VioApp Messenger</h2>
            <p className="text-gray-500 max-w-sm text-lg leading-relaxed font-medium">
              Real-time messaging for teams and friends. Select a conversation to start or find someone new.
            </p>
            <button 
              onClick={() => setShowNewChatModal(true)}
              className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-[28px] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95"
            >
              Start Conversation
            </button>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">New Chat</h3>
              <button 
                onClick={() => {
                  setShowNewChatModal(false);
                  setUserSearchQuery('');
                  setUserSearchResults([]);
                }}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-300 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-8">
              <div className="relative mb-8">
                <input
                  autoFocus
                  type="text"
                  placeholder="Find someone..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border-transparent rounded-[24px] px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all shadow-inner placeholder-gray-400"
                />
                {searchingUsers && (
                  <div className="absolute right-6 top-5">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <div className="max-h-[320px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {userSearchQuery.length < 2 ? (
                  <div className="text-center py-12 text-gray-300">
                    <p className="text-xs font-black uppercase tracking-widest">Type to search users</p>
                  </div>
                ) : userSearchResults.length === 0 && !searchingUsers ? (
                  <div className="text-center py-12 text-gray-300">
                    <p className="text-xs font-black uppercase tracking-widest">No users found</p>
                  </div>
                ) : (
                  userSearchResults.map(sUser => (
                    <div
                      key={sUser._id || sUser.userId}
                      onClick={() => createDirectChat(sUser._id || sUser.userId)}
                      className="p-5 rounded-[28px] hover:bg-blue-50 cursor-pointer transition-all flex items-center gap-4 group border border-transparent hover:border-blue-100"
                    >
                      <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center font-black text-blue-600 text-2xl group-hover:scale-110 transition-transform shadow-sm">
                        {sUser.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 truncate tracking-tight">{sUser.username}</p>
                        <p className="text-[11px] text-gray-400 truncate font-black uppercase tracking-wider">{sUser.email}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for scrollbars */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>

    </div>
  );
}
