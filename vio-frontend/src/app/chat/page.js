'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getSocket } from '../../utils/socket';
import io from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [callState, setCallState] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: '', status: 'online', statusMessage: '' });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [showReactionPickerFor, setShowReactionPickerFor] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingStatus, setTypingStatus] = useState('');
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const activeChatRef = useRef(null);

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
        const fetchedChats = res.data.data || res.data;
        setChats(fetchedChats);

        const counts = {};
        fetchedChats.forEach(c => counts[c._id] = c.unreadCount || 0);
        setUnreadCounts(counts);
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

  // 3. Socket Initialization & Listeners
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const socket = io('http://localhost:5000', {
      auth: { token }
    });
    socketRef.current = socket;

    // Call Listeners
    const handleIncomingCall = (data) => setCallState({ status: 'incoming', call: data, duration: 0 });
    const handleCallAccepted = () => setCallState(prev => prev ? { ...prev, status: 'active' } : null);
    const handleCallRejected = () => { setCallState(null); alert('Call was rejected'); };
    const handleCallEnded = () => setCallState(null);

    // Message Listener
    const handleNewMessage = (msg) => {
      setChats(prev => {
        const chatExists = prev.find(c => c._id === msg.chatId);
        if (chatExists) {
          const updatedChats = prev.map(c => c._id === msg.chatId ? { ...c, lastMessage: msg } : c);
          return [updatedChats.find(c => c._id === msg.chatId), ...updatedChats.filter(c => c._id !== msg.chatId)];
        }
        return prev;
      });

      if (activeChatRef.current?._id !== msg.chatId) {
        setUnreadCounts(prev => ({ ...prev, [msg.chatId]: (prev[msg.chatId] || 0) + 1 }));
      }

      setMessages(prev => {
        if (prev[msg.chatId]) {
          if (prev[msg.chatId].find(m => m._id === msg._id)) return prev;
          return { ...prev, [msg.chatId]: [...prev[msg.chatId], msg] };
        }
        return prev;
      });
    };

    // Typing Listener
    const handleUserTyping = (data) => {
      if (data.chatId === activeChatRef.current?._id) {
        setTypingStatus(`${data.username || 'Someone'} is typing...`);
        setTimeout(() => setTypingStatus(''), 3000);
      }
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-accepted', handleCallAccepted);
    socket.on('call-rejected', handleCallRejected);
    socket.on('call-ended', handleCallEnded);
    socket.on('receive-message', handleNewMessage);
    socket.on('user-typing', handleUserTyping);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // 4. Active Chat Handling
  useEffect(() => {
    activeChatRef.current = activeChat;
    if (activeChat && socketRef.current) {
      socketRef.current.emit('join-chat', activeChat._id);
    }
  }, [activeChat]);

  useEffect(() => {
    let interval;
    if (callState?.status === 'active') {
      interval = setInterval(() => {
        setCallState(prev => prev ? { ...prev, duration: prev.duration + 1 } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState?.status]);

  const initiateCall = async () => {
    if (!activeChat) return;
    try {
      const token = localStorage.getItem('auth_token');
      const recipientId = activeChat.members?.find(m => m !== user?.userId && m !== user?.id);
      if (!recipientId && activeChat.chatType === 'direct') return alert('Cannot find recipient');

      const payload = recipientId ? { recipientId, callType: 'audio' } : { chatId: activeChat._id, callType: 'audio' };
      const res = await axios.post(`${API_URL}/calls/initiate`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setCallState({ status: 'calling', call: res.data, duration: 0 });
    } catch (err) {
      alert('Failed to initiate call');
    }
  };

  const acceptCall = async () => {
    if (!callState?.call?.callId) return;
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${API_URL}/calls/${callState.call.callId}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setCallState(prev => ({ ...prev, status: 'active' }));
    } catch (err) {
      alert('Failed to accept call');
      setCallState(null);
    }
  };

  const rejectCall = async () => {
    if (!callState?.call?.callId) return;
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${API_URL}/calls/${callState.call.callId}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setCallState(null);
    } catch (err) { }
  };

  const endCall = async () => {
    const callId = callState?.call?.callId || callState?.call?._id;
    if (!callId) return;
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${API_URL}/calls/${callId}/end`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setCallState(null);
    } catch (err) { }
  };

  // 5. Methods
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

  const openProfile = () => {
    setProfileForm({
      username: user?.username || '',
      status: user?.status || 'online',
      statusMessage: user?.statusMessage || ''
    });
    setShowProfileModal(true);
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(`${API_URL}/users/profile`, {
        username: profileForm.username,
        status: profileForm.status,
        statusMessage: profileForm.statusMessage
      }, { headers: { Authorization: `Bearer ${token}` } });
      const updated = { ...user, ...profileForm };
      setUser(updated);
      localStorage.setItem('auth_user', JSON.stringify(updated));
      setShowProfileModal(false);
    } catch (err) {
      alert('Failed to save profile');
    }
  };

  const searchUsers = async (query) => {
    if (query.trim().length < 2) { setSearchResults([]); return; }
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) {
      console.error('Search users error', err);
    }
  };

  const createDirectChat = async (recipientId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.post(`${API_URL}/chats/direct`, { recipientId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newChat = res.data.data || res.data;
      setChats(prev => {
        const exists = prev.find(c => c._id === newChat._id);
        return exists ? prev : [newChat, ...prev];
      });
      setActiveChat(newChat);
      setShowNewChatModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      alert('Failed to create chat');
    }
  };

  const selectChat = async (chat) => {
    setActiveChat(chat);
    setUnreadCounts(prev => ({ ...prev, [chat._id]: 0 }));

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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = files.filter(f => {
      if (f.size > 25 * 1024 * 1024) {
        alert(`${f.name} is too large. Max size is 25MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (e, directAttachments = null) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() && !directAttachments && selectedFiles.length === 0) return;
    if (!activeChat) return;

    const chatId = activeChat._id || activeChat.id;
    const content = messageInput.trim();
    let finalAttachments = directAttachments || [];

    // Upload selected files first
    if (selectedFiles.length > 0) {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        const token = localStorage.getItem('auth_token');

        for (let i = 0; i < selectedFiles.length; i++) {
          const formData = new FormData();
          formData.append('file', selectedFiles[i]);

          const res = await axios.post(`${API_URL}/files/upload`, formData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (ev) => setUploadProgress(Math.round(((i + (ev.loaded / ev.total)) / selectedFiles.length) * 100))
          });

          const uploaded = res.data.data || res.data;
          finalAttachments.push({
            url: uploaded.url,
            filename: uploaded.filename || selectedFiles[i].name,
            type: uploaded.type || 'file',
            size: uploaded.size || selectedFiles[i].size
          });
        }
        setSelectedFiles([]);
      } catch (err) {
        alert('File upload failed. Please try again.');
        setIsUploading(false);
        setUploadProgress(0);
        return;
      }
    }

    try {
      const token = localStorage.getItem('auth_token');
      const body = { chatId, content, messageType: finalAttachments.length > 0 ? 'file' : 'text' };
      if (finalAttachments.length > 0) body.attachments = finalAttachments;
      const res = await axios.post(`${API_URL}/messages`, body, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newMsg = res.data.data || res.data;

      if (socketRef.current) {
        socketRef.current.emit('new-message', newMsg);
      }

      setMessages(prev => {
        const chatMsgs = prev[chatId] ? [...prev[chatId]] : [];
        if (!chatMsgs.find(m => m._id === newMsg._id)) {
          chatMsgs.push(newMsg);
        }
        return { ...prev, [chatId]: chatMsgs };
      });
      setChats(prev => prev.map(c => c._id === chatId ? { ...c, lastMessage: newMsg } : c));
      setMessageInput('');
      setIsUploading(false);
      setUploadProgress(0);
    } catch (err) {
      alert('Failed to send');
    }
  };

  // Emoji
  const emojis = ['😊', '😂', '❤️', '👍', '🔥', '😢', '😡', '🎉', '✨', '👏', '🥰', '😎', '🤔', '💯', '🙏', '😍'];
  const insertEmoji = (emoji) => {
    setMessageInput(prev => prev + emoji);
  };

  const handleAddReaction = (messageId, emoji) => {
    if (!activeChat) return;
    const chatId = activeChat._id || activeChat.id;
    socketRef.current.emit('reaction-added', { messageId, emoji, chatId });
    setShowReactionPickerFor(null);
  };

  const handleDeleteMessage = (messageId) => {
    if (!activeChat) return;
    const chatId = activeChat._id || activeChat.id;
    socketRef.current.emit('message-deleted', { messageId, chatId });
  };


  // Voice Recording
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'voice.webm', { type: 'audio/webm' });
        try {
          setIsUploading(true);
          setUploadProgress(0);
          const token = localStorage.getItem('auth_token');
          const formData = new FormData();
          formData.append('file', file);
          const res = await axios.post(`${API_URL}/files/upload`, formData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          });
          const uploaded = res.data.data || res.data;
          await sendMessage(null, [{ url: uploaded.url, filename: 'Voice Message', type: 'audio', size: blob.size }]);
        } catch (err) {
          if (err.code === 'ECONNABORTED') alert('Voice upload timed out. Please try again.');
          else alert('Voice upload failed. Please try again.');
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied');
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
              <div onClick={openProfile} className="w-12 h-12 bg-[#007AFF] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md cursor-pointer hover:ring-2 hover:ring-[#007AFF]/50 transition-all">
                {user?.username?.[0].toUpperCase()}
              </div>
              <div className="flex flex-col cursor-pointer" onClick={openProfile}>
                <span className="font-bold truncate max-w-[120px]">{user?.username}</span>
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.status || 'Online'}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-2xl transition-all font-semibold text-sm">
              Logout
            </button>
          </div>
          <button onClick={() => setShowNewChatModal(true)} className="w-full py-3 bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF] hover:text-white rounded-2xl font-bold transition-all text-sm">
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
                {(unreadCounts[chat._id] || 0) > 0 && (
                  <div className="absolute top-4 right-4 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold shadow-sm">
                    {unreadCounts[chat._id]}
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
              <div className="flex items-center gap-3">
                <button onClick={initiateCall} className={`p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center ${isDarkMode ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400' : 'bg-green-50 hover:bg-green-100 text-green-600'}`} title="Audio Call">
                  ☎️
                </button>
                <button onClick={toggleTheme} className={`p-3 rounded-2xl transition-all shadow-sm ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {isDarkMode ? '🌞' : '🌙'}
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {Array.isArray(messages[activeChat._id]) && messages[activeChat._id].map((msg, i) => {
                const isOwn = (msg.senderId?._id || msg.senderId) === (user?.userId || user?.id);
                return (
                  <div key={msg._id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300 mb-2`}>
                    <div className="relative group max-w-[75%] md:max-w-[60%] flex flex-col">

                      {/* Message Hover Actions */}
                      <div className={`absolute top-0 ${isOwn ? '-left-20' : '-right-10'} opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 z-10 px-2 py-1`}>
                        <button type="button" onClick={() => setShowReactionPickerFor(msg._id || msg.messageId)} className="w-8 h-8 rounded-full flex items-center justify-center text-lg hover:scale-125 transition-transform drop-shadow-md bg-white/90 dark:bg-black/50" title="React">
                          👍
                        </button>
                        {isOwn && (
                          <button type="button" onClick={() => handleDeleteMessage(msg._id || msg.messageId)} className="w-8 h-8 rounded-full flex items-center justify-center text-sm hover:scale-125 transition-transform drop-shadow-md bg-white/90 dark:bg-black/50 text-red-500" title="Delete Message">
                            🗑️
                          </button>
                        )}
                      </div>

                      {showReactionPickerFor === (msg._id || msg.messageId) && (
                        <div className={`absolute -top-10 ${isOwn ? 'right-0' : 'left-0'} flex gap-1 p-2 rounded-2xl shadow-xl z-50 ${isDarkMode ? 'bg-[#1a4939]' : 'bg-white'}`}>
                          {['👍', '❤️', '😂', '😢', '😡'].map(e => (
                            <button key={e} type="button" onClick={() => handleAddReaction(msg._id || msg.messageId, e)} className="hover:scale-125 transition-transform text-xl">{e}</button>
                          ))}
                        </div>
                      )}

                      <div className={`px-5 py-3 rounded-2xl text-[15px] shadow-md transition-all ${isOwn ? 'bg-[#007AFF] text-white rounded-tr-sm' : (isDarkMode ? 'bg-white/10 text-white rounded-tl-sm' : 'bg-[#E5E5EA] text-black rounded-tl-sm')}`}>
                        {/* Attachments */}
                        {msg.attachments?.map((att, idx) => (
                          <div key={idx} className="mb-2">
                            {att.type === 'image' && <img src={att.url?.startsWith('/') ? `${API_URL.replace('/api', '')}${att.url}` : att.url} className="rounded-xl max-w-full" />}
                            {att.type === 'audio' && <audio controls src={att.url?.startsWith('/') ? `${API_URL.replace('/api', '')}${att.url}` : att.url} className="w-full h-10" />}
                            {att.type === 'file' && <a href={att.url?.startsWith('/') ? `${API_URL.replace('/api', '')}${att.url}` : att.url} target="_blank" className="underline text-sm font-semibold">{att.filename}</a>}
                            {att.type === 'video' && <video controls src={att.url?.startsWith('/') ? `${API_URL.replace('/api', '')}${att.url}` : att.url} className="rounded-xl max-w-full" />}
                          </div>
                        ))}
                        {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}

                        {/* Reactions Display */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(msg.reactions).map(([emoji, users]) => (
                              <span key={emoji} className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-black/30' : 'bg-white/50 text-black'}`}>
                                {emoji} {users.length}
                              </span>
                            ))}
                          </div>
                        )}

                        <span className={`text-[10px] block mt-1.5 text-right font-medium ${isOwn ? 'text-blue-200' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {typingStatus && (
                <div className="flex justify-start animate-in fade-in duration-300 mb-2">
                  <div className={`px-4 py-2 rounded-2xl text-[13px] italic shadow-sm ${isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-[#E5E5EA]/50 text-gray-500'}`}>
                    {typingStatus}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={`p-4 sm:p-6 border-t transition-colors relative ${isDarkMode ? 'bg-[#1a4939] border-white/5' : 'bg-white border-gray-100'}`}>
              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full"></span> Recording...
                </div>
              )}

              {/* Upload Progress indicator */}
              {isUploading && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#007AFF] text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-3 shadow-lg w-64 z-50">
                  <div className="flex-1 bg-white/30 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-white h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <span>{uploadProgress}%</span>
                </div>
              )}

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className={`absolute bottom-full left-6 mb-2 p-3 rounded-2xl shadow-2xl border grid grid-cols-8 gap-1 z-50 ${isDarkMode ? 'bg-[#1a4939] border-white/10' : 'bg-white border-gray-200'}`}>
                  {emojis.map(e => (
                    <button key={e} type="button" onClick={() => insertEmoji(e)} className="text-2xl p-1 hover:scale-125 transition-transform rounded-lg hover:bg-black/5">{e}</button>
                  ))}
                </div>
              )}

              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" />

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="flex gap-3 px-4 py-3 overflow-x-auto mb-2">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className={`relative flex items-center gap-2 p-2 rounded-xl shadow-sm border whitespace-nowrap ${isDarkMode ? 'bg-white/10 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                      <span className="text-xl">{file.type.startsWith('image/') ? '🖼️' : file.type.startsWith('video/') ? '🎥' : '📄'}</span>
                      <span className="text-sm font-medium truncate max-w-[150px]">{file.name}</span>
                      <button type="button" onClick={() => removeSelectedFile(idx)} className="ml-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600">×</button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={sendMessage} className="flex gap-2 sm:gap-4 items-end max-w-4xl mx-auto">
                <div className={`flex-1 rounded-2xl shadow-sm transition-all flex items-end focus-within:ring-2 focus-within:ring-[#007AFF]/50 ${isDarkMode ? 'bg-white/5' : 'bg-[#F2F2F7]'}`}>

                  {/* Left Action Buttons */}
                  <div className="flex items-center gap-1 px-2 pb-3">
                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2 text-xl rounded-xl transition-all hover:scale-110 active:scale-95 ${showEmojiPicker ? 'bg-[#007AFF]/20 text-[#007AFF]' : (isDarkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-500')}`} title="Emoji">
                      😊
                    </button>
                    <button type="button" onClick={toggleRecording} className={`p-2 text-xl rounded-xl transition-all hover:scale-110 active:scale-95 ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : (isDarkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-500')}`} title="Voice Message">
                      🎤
                    </button>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className={`p-2 text-xl rounded-xl transition-all hover:scale-110 active:scale-95 ${isDarkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-500'}`} title="Attach File">
                      📎
                    </button>
                  </div>

                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={isRecording ? 'Recording...' : (isUploading ? 'Uploading...' : 'Type a message...')}
                    disabled={isRecording || isUploading}
                    rows={1}
                    className={`flex-1 bg-transparent border-none focus:ring-0 px-2 sm:px-4 py-4 resize-none max-h-32 min-h-[56px] text-[15px] ${isDarkMode ? 'text-white placeholder-gray-400' : 'text-black placeholder-gray-500'}`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!messageInput.trim() || isUploading}
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden transition-colors ${isDarkMode ? 'bg-[#1a4939] text-white border border-white/10' : 'bg-white text-black'}`}>
            <div className={`p-6 flex items-center justify-between border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
              <h3 className="text-xl font-bold">Profile Settings</h3>
              <button onClick={() => setShowProfileModal(false)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all">✕</button>
            </div>
            <div className="p-6 space-y-5">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-[#007AFF] rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                  {profileForm.username?.[0]?.toUpperCase() || '?'}
                </div>
              </div>

              {/* Username */}
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Username</label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm(p => ({ ...p, username: e.target.value }))}
                  className={`w-full px-5 py-3 rounded-2xl border-none focus:ring-2 focus:ring-[#007AFF]/50 text-[15px] ${isDarkMode ? 'bg-white/5 text-white' : 'bg-[#F2F2F7] text-black'}`}
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</label>
                <input
                  type="text"
                  value={user?.email || ''}
                  readOnly
                  className={`w-full px-5 py-3 rounded-2xl border-none text-[15px] opacity-60 cursor-not-allowed ${isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-[#F2F2F7] text-gray-500'}`}
                />
              </div>

              {/* Status */}
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</label>
                <select
                  value={profileForm.status}
                  onChange={(e) => setProfileForm(p => ({ ...p, status: e.target.value }))}
                  className={`w-full px-5 py-3 rounded-2xl border-none focus:ring-2 focus:ring-[#007AFF]/50 text-[15px] ${isDarkMode ? 'bg-white/5 text-white' : 'bg-[#F2F2F7] text-black'}`}
                >
                  <option value="online">🟢 Online</option>
                  <option value="away">🟡 Away</option>
                  <option value="offline">⚫ Offline</option>
                </select>
              </div>

              {/* Bio */}
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bio <span className="opacity-50">({profileForm.statusMessage.length}/150)</span></label>
                <textarea
                  value={profileForm.statusMessage}
                  onChange={(e) => { if (e.target.value.length <= 150) setProfileForm(p => ({ ...p, statusMessage: e.target.value })); }}
                  placeholder="Tell people about yourself..."
                  rows={3}
                  className={`w-full px-5 py-3 rounded-2xl border-none focus:ring-2 focus:ring-[#007AFF]/50 text-[15px] resize-none ${isDarkMode ? 'bg-white/5 text-white placeholder-gray-500' : 'bg-[#F2F2F7] text-black placeholder-gray-400'}`}
                />
              </div>

              {/* Save */}
              <button
                onClick={saveProfile}
                className="w-full py-3 bg-[#007AFF] text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-md text-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden transition-colors ${isDarkMode ? 'bg-[#1a4939] text-white border border-white/10' : 'bg-white text-black'}`}>
            <div className={`p-6 flex items-center justify-between border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
              <h3 className="text-xl font-bold">New Chat</h3>
              <button onClick={() => { setShowNewChatModal(false); setSearchQuery(''); setSearchResults([]); }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all">✕</button>
            </div>
            <div className="p-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); searchUsers(e.target.value); }}
                placeholder="Search by name or email..."
                autoFocus
                className={`w-full px-5 py-3 rounded-2xl border-none focus:ring-2 focus:ring-[#007AFF]/50 text-[15px] ${isDarkMode ? 'bg-white/5 text-white placeholder-gray-400' : 'bg-[#F2F2F7] text-black placeholder-gray-500'}`}
              />
            </div>
            <div className="max-h-72 overflow-y-auto px-6 pb-6 space-y-2">
              {searchResults.length === 0 && searchQuery.length >= 2 && (
                <p className={`text-center py-8 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No users found</p>
              )}
              {searchResults.map(u => (
                <div
                  key={u._id || u.userId}
                  onClick={() => createDirectChat(u._id || u.userId)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-blue-50'}`}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold shadow-sm ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {u.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{u.username}</p>
                    <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{u.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Call Overlay */}
      {callState && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`p-8 rounded-[32px] shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full transition-colors ${isDarkMode ? 'bg-[#1a4939] text-white border border-white/10' : 'bg-white text-black'}`}>
            <div className="w-24 h-24 bg-[#007AFF] rounded-full flex items-center justify-center text-4xl text-white shadow-lg animate-pulse">
              {callState.call?.initiator?.username?.[0]?.toUpperCase() || callState.call?.initiatorId?.username?.[0]?.toUpperCase() || '📞'}
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold mb-1">{callState.call?.initiator?.username || callState.call?.initiatorId?.username || 'Voice Call'}</h3>
              <p className={`text-sm font-medium uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {callState.status === 'calling' && 'Calling...'}
                {callState.status === 'incoming' && 'Incoming Call...'}
                {callState.status === 'active' && `${Math.floor(callState.duration / 60)}:${(callState.duration % 60).toString().padStart(2, '0')}`}
              </p>
            </div>

            <div className="flex gap-6 w-full justify-center mt-4">
              {callState.status === 'incoming' && (
                <button onClick={acceptCall} className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-110 transition-transform">
                  ✅
                </button>
              )}
              {callState.status === 'incoming' && (
                <button onClick={rejectCall} className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-110 transition-transform">
                  ❌
                </button>
              )}
              {(callState.status === 'calling' || callState.status === 'active') && (
                <button onClick={endCall} className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-110 transition-transform">
                  ⛔
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
