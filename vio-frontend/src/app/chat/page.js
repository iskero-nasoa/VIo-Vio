'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// --- Sub-components for better UI ---

const VoicePlayer = ({ url, isDarkMode, isOwn, senderName, timestamp }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;
    setProgress((current / total) * 100);
  };

  const onLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col gap-1 min-w-[240px] p-2 rounded-2xl ${isOwn ? 'text-white' : (isDarkMode ? 'text-white' : 'text-black')}`}>
      {!isOwn && <span className="text-[11px] font-bold opacity-70 ml-10">{senderName}</span>}
      <div className="flex items-center gap-3">
        <button 
          onClick={togglePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm ${isOwn ? 'bg-white/20 text-white' : 'bg-[#007AFF] text-white'}`}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M6 4h4v16H6V4zm8 0h4v16h4V4z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        
        <div className="flex-1 flex flex-col gap-1">
          {/* Simulated Waveform */}
          <div className="relative h-6 flex items-center gap-[2px]">
            {[...Array(25)].map((_, i) => (
              <div 
                key={i} 
                className={`flex-1 rounded-full transition-all duration-300 ${progress > (i / 25) * 100 ? (isOwn ? 'bg-white' : 'bg-[#007AFF]') : (isOwn ? 'bg-white/30' : 'bg-gray-300')}`}
                style={{ height: `${20 + Math.sin(i * 0.5) * 40 + Math.random() * 20}%` }}
              />
            ))}
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={progress} 
              onChange={(e) => {
                const newTime = (e.target.value / 100) * audioRef.current.duration;
                audioRef.current.currentTime = newTime;
                setProgress(e.target.value);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-medium opacity-70">
            <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="relative">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOwn ? 'bg-white/10' : 'bg-gray-100'}`}>
            <span className="text-lg">🎤</span>
          </div>
        </div>
      </div>
      <audio 
        ref={audioRef} 
        src={url} 
        onTimeUpdate={onTimeUpdate} 
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="hidden" 
      />
    </div>
  );
};

const FileAttachment = ({ att, isDarkMode, isOwn, API_URL }) => {
  const fullUrl = att.url?.startsWith('/') ? `${API_URL.replace('/api', '')}${att.url}` : att.url;
  
  if (att.type === 'image') {
    return (
      <div className="relative group overflow-hidden rounded-xl bg-black/5 mb-1">
        <img src={fullUrl} alt={att.filename} className="max-w-full max-h-[300px] object-cover transition-transform group-hover:scale-105" />
        <a href={fullUrl} target="_blank" download className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
          <span className="bg-white text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">Download</span>
        </a>
      </div>
    );
  }

  if (att.type === 'video') {
    return (
      <div className="relative rounded-xl overflow-hidden bg-black/5 mb-1 max-w-[300px]">
        <video controls src={fullUrl} className="w-full" />
      </div>
    );
  }

  return (
    <a 
      href={fullUrl} 
      target="_blank" 
      className={`flex items-center gap-3 p-3 rounded-xl transition-all mb-1 border ${isOwn ? 'bg-white/10 border-white/10 hover:bg-white/20' : (isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-gray-100')}`}
    >
      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-xl shadow-sm">
        {att.type === 'audio' ? '🎵' : att.filename?.endsWith('.pdf') ? '📄' : '📎'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{att.filename}</p>
        <p className="text-[10px] opacity-60 uppercase font-bold">{att.type} • {Math.round(att.size / 1024)} KB</p>
      </div>
      <div className="text-xs opacity-50">⬇️</div>
    </a>
  );
};

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
  const [deleteDropdown, setDeleteDropdown] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showSupergroupModal, setShowSupergroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [topics, setTopics] = useState([{ name: 'General', description: 'General discussion' }]);
  const [newTopic, setNewTopic] = useState({ name: '', description: '' });
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
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
      
      if (savedUser) {
        try {
          const data = JSON.parse(savedUser);
          if (data) setUser(data);
        } catch (e) {
          console.error('Local storage parse error (auth_user):', e);
          localStorage.removeItem('auth_user');
        }
      }

      try {
        const res = await axios.get(`${API_URL}/chats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Chats Response:', res);
        console.log('Chats Type:', typeof res.data);
        
        const fetchedChats = (res.data?.data || res.data) || [];
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

    const socket = io('http://localhost:5001', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket CONNECTED:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket DISCONNECTED');
    });

    socket.on('error', (error) => {
      console.error('Socket ERROR:', error);
    });

    // Test emit
    socket.emit('test-event', { hello: 'world' });
    console.log('Emitted test event');

    socket.on('receive-message', (message) => {
      console.log('Received message:', message);
      setMessages(prev => {
        const chatMsgs = prev[message.chatId] || [];
        // Prevent duplicates
        if (chatMsgs.find(m => (m._id || m.messageId) === (message._id || message.messageId))) return prev;
        return {
          ...prev,
          [message.chatId]: [...chatMsgs, message]
        };
      });
    });

    socket.on('message-deleted', (data) => {
      const { messageId, chatId } = typeof data === 'object' ? data : { messageId: data, chatId: activeChatRef.current?._id };
      setMessages(prev => {
        const chatMsgs = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: chatMsgs.filter(m => (m._id || m.messageId) !== messageId)
        };
      });
    });

    socket.on('reaction-update', (data) => {
      setMessages(prev => {
        const chatMsgs = prev[data.chatId];
        if (!chatMsgs) return prev;
        const updated = chatMsgs.map(m => (m._id === data.messageId || m.messageId === data.messageId) ? { ...m, reactions: data.reactions } : m);
        return { ...prev, [data.chatId]: updated };
      });
    });

    socket.on('message-removed', (data) => {
      setMessages(prev => {
        const chatMsgs = prev[data.chatId];
        if (!chatMsgs) return prev;
        return { ...prev, [data.chatId]: chatMsgs.filter(m => m._id !== data.messageId && m.messageId !== data.messageId) };
      });
    });

    socket.on('chat-cleared', (data) => {
      setMessages(prev => ({ ...prev, [data.chatId]: [] }));
    });

    // Call Listeners
    socket.on('incoming-call', (data) => setCallState({ status: 'incoming', call: data, duration: 0 }));
    socket.on('call-accepted', () => setCallState(prev => prev ? { ...prev, status: 'active' } : null));
    socket.on('call-rejected', () => { setCallState(null); alert('Call was rejected'); });
    socket.on('call-ended', () => setCallState(null));

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // 4. Active Chat Handling
  useEffect(() => {
    activeChatRef.current = activeChat;
    if (activeChat?._id && socketRef.current) {
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
      alert('Profile updated successfully! ✨');
      setShowProfileModal(false);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.post(`${API_URL}/users/avatar`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      const updated = { ...user, avatar: res.data.avatarUrl };
      setUser(updated);
      localStorage.setItem('auth_user', JSON.stringify(updated));
      alert('Avatar updated! ✨');
    } catch (err) {
      alert('Avatar upload failed');
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
      console.log('Create Chat Response:', res);
      console.log('Create Chat Type:', typeof res.data);
      const newChat = (res.data?.data || res.data) || null;
      if (!newChat) return alert('Invalid chat data received');
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
    const isAttachmentOnly = (directAttachments && directAttachments.length > 0) || selectedFiles.length > 0;
    if (!messageInput.trim() && !isAttachmentOnly) return;
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
            onUploadProgress: (ev) => {
              const filePercent = Math.round((ev.loaded * 100) / ev.total);
              setUploadProgress(Math.round(((i + (ev.loaded / ev.total)) / selectedFiles.length) * 100));
            }
          });

          const uploaded = res.data.data || res.data;
          finalAttachments.push({
            url: uploaded.url,
            filename: uploaded.filename || selectedFiles[i].name,
            type: uploaded.type || (selectedFiles[i].type.startsWith('image/') ? 'image' : selectedFiles[i].type.startsWith('video/') ? 'video' : selectedFiles[i].type.startsWith('audio/') ? 'audio' : 'file'),
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
      if (finalAttachments.length > 0) {
        // If there are audio attachments, mark messageType as audio for better sorting/filtering if needed
        const hasAudio = finalAttachments.some(a => a.type === 'audio');
        if (hasAudio && !content) body.messageType = 'audio';
        body.attachments = finalAttachments;
      }
      
      const res = await axios.post(`${API_URL}/messages`, body, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Send Message Response:', res);
      console.log('Send Message Type:', typeof res.data);
      
      const savedMsg = res.data?.data || res.data;

      if (socketRef.current) {
        socketRef.current.emit('new-message', savedMsg);
      }

      setMessages(prev => {
        const chatMsgs = prev[chatId] ? [...prev[chatId]] : [];
        if (!chatMsgs.find(m => m._id === savedMsg._id)) {
          chatMsgs.push(savedMsg);
        }
        return { ...prev, [chatId]: chatMsgs };
      });
      setChats(prev => prev.map(c => c._id === chatId ? { ...c, lastMessage: savedMsg } : c));
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

  const handleAddReaction = async (messageId, emoji) => {
    if (!activeChat) return;
    const chatId = activeChat._id || activeChat.id;
    
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.post(`${API_URL}/messages/${messageId}/react`, { emoji }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Reaction Response:', res);
      console.log('Reaction Type:', typeof res.data);

      const updatedReactions = (res.data?.data || res.data) || [];
      
      // Update locally immediately (optimistic)
      setMessages(prev => {
        const chatMsgs = prev[chatId];
        if (!chatMsgs) return prev;
        const updated = chatMsgs.map(m => (m._id === messageId || m.messageId === messageId) ? { ...m, reactions: updatedReactions } : m);
        return { ...prev, [chatId]: updated };
      });

      if (socketRef.current) {
        socketRef.current.emit('reaction-added', { messageId, emoji, chatId, reactions: res.data });
      }
    } catch (err) {
      console.error('Reaction error', err);
    } finally {
      setShowReactionPickerFor(null);
    }
  };

  const handleDeleteLocally = (messageId) => {
    if (!activeChat) return;
    setMessages(prev => ({
      ...prev,
      [activeChat._id]: (prev[activeChat._id] || []).filter(m => (m._id || m.messageId) !== messageId)
    }));
  };

  const handleDeleteForEveryone = async (messageId) => {
    if (!activeChat) return;
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`${API_URL}/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      handleDeleteLocally(messageId);
      
      const chatId = activeChat._id || activeChat.id;
      if (socketRef.current) {
        socketRef.current.emit('message-deleted', { messageId, chatId });
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed');
    }
  };

  const handleClearChat = async () => {
    if (!activeChat) return;
    const chatId = activeChat._id || activeChat.id;
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`${API_URL}/chats/${chatId}/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages(prev => ({ 
        ...prev, 
        [chatId]: [{
          _id: 'cleared-' + Date.now(),
          content: '✨ Chat history cleared',
          messageType: 'system',
          createdAt: new Date().toISOString()
        }] 
      }));
      
      if (socketRef.current) {
        socketRef.current.emit('chat-cleared', { chatId });
      }
      setShowClearConfirm(false);
      setShowChatMenu(false);
    } catch (err) {
      alert('Failed to clear chat');
    }
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
              <div onClick={openProfile} className="w-12 h-12 bg-[#007AFF] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md cursor-pointer hover:ring-2 hover:ring-[#007AFF]/50 transition-all overflow-hidden">
                {user?.avatar ? (
                  <img src={`${API_URL.replace('/api', '')}${user.avatar}`} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  user?.username?.[0].toUpperCase()
                )}
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
          <div className="flex gap-2">
            <button onClick={() => setShowNewChatModal(true)} className="flex-1 py-3 bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF] hover:text-white rounded-2xl font-bold transition-all text-sm">
              + Chat
            </button>
            <button onClick={() => setShowGroupModal(true)} className="flex-1 py-3 bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759] hover:text-white rounded-2xl font-bold transition-all text-sm">
              + Group
            </button>
            <button onClick={() => setShowSupergroupModal(true)} className="flex-1 py-3 bg-[#5856D6]/10 text-[#5856D6] hover:bg-[#5856D6] hover:text-white rounded-2xl font-bold transition-all text-sm">
              + Super
            </button>
          </div>
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
                    <h4 className="font-bold truncate text-[15px] flex items-center gap-1.5">
                      {chat.chatType === 'group' && <span className="text-[10px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded-md">👥</span>}
                      {chat.chatType === 'supergroup' && <span className="text-[10px] bg-purple-500/20 text-purple-500 px-1.5 py-0.5 rounded-md">📋</span>}
                      {chat.chatName || 'Direct Chat'}
                    </h4>
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
                <div className="relative">
                  <button 
                    onClick={() => setShowChatMenu(!showChatMenu)} 
                    className={`p-3 rounded-2xl transition-all shadow-sm ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    ⋮
                  </button>
                  {showChatMenu && (
                    <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl z-50 border py-2 animate-in fade-in zoom-in duration-200 ${isDarkMode ? 'bg-[#1a4939] border-white/10' : 'bg-white border-gray-100'}`}>
                      <button 
                        onClick={() => setShowClearConfirm(true)}
                        className="w-full px-4 py-3 text-left text-red-500 hover:bg-red-500/10 font-bold transition-all flex items-center gap-2"
                      >
                        🗑️ Clear Chat History
                      </button>
                      <button 
                        onClick={() => setShowChatMenu(false)}
                        className={`w-full px-4 py-3 text-left hover:bg-black/5 transition-all text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {Array.isArray(messages[activeChat._id]) && messages[activeChat._id].map((msg, i) => {
                const isOwn = (msg.senderId?._id || msg.senderId) === (user?.userId || user?.id);
                return (
                  <div key={msg._id || i} className={`flex ${msg.messageType === 'system' ? 'justify-center' : (isOwn ? 'justify-end' : 'justify-start')} animate-in fade-in duration-300 mb-2`}>
                    {msg.messageType === 'system' ? (
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                        {msg.content}
                      </div>
                    ) : (
                      <div className="relative group max-w-[75%] md:max-w-[60%] flex flex-col">

                      {/* Message Hover Actions */}
                      <div className={`absolute top-0 ${isOwn ? '-left-16' : '-right-10'} opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 z-10 px-2 py-1`}>
                        <button type="button" onClick={() => setShowReactionPickerFor(msg._id || msg.messageId)} className="w-8 h-8 rounded-full flex items-center justify-center text-lg hover:scale-125 transition-transform drop-shadow-md bg-white/90 dark:bg-black/50" title="React">
                          👍
                        </button>
                        
                        <div className="relative">
                          <button 
                            type="button" 
                            onClick={() => setDeleteDropdown(deleteDropdown === (msg._id || msg.messageId) ? null : (msg._id || msg.messageId))} 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm hover:scale-125 transition-transform drop-shadow-md bg-white/90 dark:bg-black/50 text-red-500" 
                            title="Delete Options"
                          >
                            🗑️
                          </button>

                          {deleteDropdown === (msg._id || msg.messageId) && (
                            <div className={`absolute bottom-full ${isOwn ? 'right-0' : 'left-0'} mb-2 w-48 rounded-2xl shadow-2xl border p-1 z-[100] animate-in fade-in zoom-in duration-200 ${isDarkMode ? 'bg-[#1a4939] border-white/10' : 'bg-white border-gray-100'}`}>
                              <button 
                                onClick={() => {
                                  handleDeleteLocally(msg._id || msg.messageId);
                                  setDeleteDropdown(null);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-xs font-bold rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                              >
                                {isOwn ? 'Delete for me' : 'Delete for me only'}
                              </button>
                              
                              {isOwn && (
                                <button 
                                  onClick={() => {
                                    handleDeleteForEveryone(msg._id || msg.messageId);
                                    setDeleteDropdown(null);
                                  }}
                                  className={`w-full px-4 py-2.5 text-left text-xs font-bold rounded-xl transition-all text-red-500 ${isDarkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}
                                >
                                  Delete for everyone
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {showReactionPickerFor === (msg._id || msg.messageId) && (
                        <div className={`absolute -top-12 ${isOwn ? 'right-0' : 'left-0'} flex gap-1.5 p-2.5 rounded-full shadow-2xl z-50 animate-in zoom-in duration-200 border ${isDarkMode ? 'bg-[#1a4939] border-white/20' : 'bg-white border-gray-100'}`}>
                          {['👍', '❤️', '😂', '😢', '😡', '🔥', '✨', '🎉'].map(e => (
                            <button 
                              key={e} 
                              type="button" 
                              onClick={() => handleAddReaction(msg._id || msg.messageId, e)} 
                              className="hover:scale-150 transition-transform text-2xl active:scale-95 p-1"
                              title={e}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className={`px-5 py-3 rounded-2xl text-[15px] shadow-md transition-all ${isOwn ? 'bg-[#007AFF] text-white rounded-tr-sm' : (isDarkMode ? 'bg-white/10 text-white rounded-tl-sm' : 'bg-[#E5E5EA] text-black rounded-tl-sm')}`}>
                        {/* Attachments */}
                        {msg.attachments?.map((att, idx) => {
                          if (att.type === 'audio' || att.messageType === 'audio') {
                            return (
                              <VoicePlayer 
                                key={idx} 
                                url={att.url?.startsWith('/') ? `${API_URL.replace('/api', '')}${att.url}` : att.url} 
                                isDarkMode={isDarkMode}
                                isOwn={isOwn}
                                senderName={msg.senderId?.username || 'User'}
                                timestamp={msg.createdAt}
                              />
                            );
                          }
                          return <FileAttachment key={idx} att={att} isDarkMode={isDarkMode} isOwn={isOwn} API_URL={API_URL} />;
                        })}
                        
                        {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}

                        {/* Reactions Display */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {msg.reactions.map((r, idx) => {
                              const hasReacted = r.userIds.some(uid => uid.toString() === (user?.userId || user?.id)?.toString());
                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleAddReaction(msg._id || msg.messageId, r.emoji)}
                                  className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full transition-all border ${hasReacted 
                                    ? (isDarkMode ? 'bg-blue-500/30 border-blue-500 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-600') 
                                    : (isDarkMode ? 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10' : 'bg-black/5 border-transparent text-gray-600 hover:bg-black/10')}`}
                                >
                                  <span>{r.emoji}</span>
                                  <span className="font-bold">{r.userIds.length}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        <span className={`text-[10px] block mt-1.5 text-right font-medium ${isOwn ? 'text-blue-200' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )}
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
                <div className="flex gap-3 px-4 py-3 overflow-x-auto mb-2 bg-black/5 rounded-2xl mx-4">
                  {selectedFiles.map((file, idx) => {
                    const isImage = file.type.startsWith('image/');
                    const previewUrl = isImage ? URL.createObjectURL(file) : null;
                    return (
                      <div key={idx} className={`relative group flex flex-col items-center gap-1 p-2 rounded-xl shadow-sm border min-w-[80px] max-w-[120px] ${isDarkMode ? 'bg-white/10 border-white/5' : 'bg-white border-gray-200'}`}>
                        {isImage ? (
                          <img src={previewUrl} className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center text-3xl bg-blue-500/10 rounded-lg">
                            {file.type.startsWith('video/') ? '🎥' : file.type.startsWith('audio/') ? '🎵' : '📄'}
                          </div>
                        )}
                        <span className="text-[10px] font-bold truncate w-full text-center px-1">{file.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeSelectedFile(idx)} 
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-md border-2 border-white transition-all scale-0 group-hover:scale-100"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
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
                  disabled={(!messageInput.trim() && selectedFiles.length === 0) || isUploading}
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
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <div className="w-24 h-24 bg-[#007AFF] rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg overflow-hidden">
                    {user?.avatar ? (
                      <img src={`${API_URL.replace('/api', '')}${user.avatar}`} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      profileForm.username?.[0]?.toUpperCase() || '?'
                    )}
                  </div>
                  <button 
                    onClick={() => document.getElementById('avatarInput').click()}
                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-xs font-bold"
                  >
                    Change
                  </button>
                </div>
                <input id="avatarInput" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Click to change avatar</p>
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

      {/* Group Creation Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden transition-colors ${isDarkMode ? 'bg-[#1a4939] text-white border border-white/10' : 'bg-white text-black'}`}>
            <div className={`p-6 flex items-center justify-between border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
              <h3 className="text-xl font-bold">New Group</h3>
              <button onClick={() => setShowGroupModal(false)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group Name"
                className={`w-full px-5 py-3 rounded-2xl border-none focus:ring-2 focus:ring-[#007AFF]/50 text-[15px] ${isDarkMode ? 'bg-white/5 text-white placeholder-gray-400' : 'bg-[#F2F2F7] text-black placeholder-gray-500'}`}
              />
              <textarea
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className={`w-full px-5 py-3 rounded-2xl border-none focus:ring-2 focus:ring-[#007AFF]/50 text-[15px] resize-none ${isDarkMode ? 'bg-white/5 text-white placeholder-gray-400' : 'bg-[#F2F2F7] text-black placeholder-gray-500'}`}
              />
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-60">Add Members</label>
                <input
                  type="text"
                  onChange={(e) => searchUsers(e.target.value)}
                  placeholder="Search users..."
                  className={`w-full px-5 py-2 rounded-xl border-none focus:ring-2 focus:ring-[#007AFF]/50 text-xs ${isDarkMode ? 'bg-white/5 text-white' : 'bg-[#F2F2F7] text-black'}`}
                />
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {searchResults.map(u => (
                    <div key={u._id} onClick={() => {
                      if (!groupMembers.find(m => m._id === u._id)) setGroupMembers([...groupMembers, u]);
                    }} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#007AFF] rounded-full text-[10px] flex items-center justify-center text-white">{u.username?.[0]}</div>
                      <span className="text-sm">{u.username}</span>
                    </div>
                  ))}
                </div>
                {groupMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {groupMembers.map(m => (
                      <span key={m._id} className="text-[10px] bg-[#007AFF] text-white px-2 py-1 rounded-full flex items-center gap-1">
                        {m.username}
                        <button onClick={() => setGroupMembers(groupMembers.filter(gm => gm._id !== m._id))}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('auth_token');
                    const res = await axios.post(`${API_URL}/groups/group`, {
                      groupName, description: groupDesc, memberIds: groupMembers.map(m => m._id)
                    }, { headers: { Authorization: `Bearer ${token}` } });
                    setChats(prev => [res.data.data, ...prev]);
                    setShowGroupModal(false);
                    setGroupName(''); setGroupDesc(''); setGroupMembers([]);
                    alert('Group created! ✨');
                  } catch (err) { alert('Failed to create group'); }
                }}
                disabled={!groupName.trim() || groupMembers.length === 0}
                className="w-full py-3 bg-[#34C759] text-white rounded-2xl font-bold hover:bg-green-600 disabled:opacity-50 transition-all shadow-md text-sm"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supergroup Creation Modal */}
      {showSupergroupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden transition-colors ${isDarkMode ? 'bg-[#1a4939] text-white border border-white/10' : 'bg-white text-black'}`}>
            <div className={`p-6 flex items-center justify-between border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
              <h3 className="text-xl font-bold">New Supergroup</h3>
              <button onClick={() => setShowSupergroupModal(false)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all">✕</button>
            </div>
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Supergroup Name"
                className={`w-full px-5 py-3 rounded-2xl border-none focus:ring-2 focus:ring-[#007AFF]/50 text-[15px] ${isDarkMode ? 'bg-white/5 text-white placeholder-gray-400' : 'bg-[#F2F2F7] text-black placeholder-gray-500'}`}
              />
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-60">Topics</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTopic.name}
                    onChange={(e) => setNewTopic({...newTopic, name: e.target.value})}
                    placeholder="Topic Name"
                    className={`flex-1 px-4 py-2 rounded-xl border-none text-xs ${isDarkMode ? 'bg-white/5 text-white' : 'bg-[#F2F2F7] text-black'}`}
                  />
                  <button onClick={() => {
                    if (newTopic.name.trim()) {
                      setTopics([...topics, newTopic]);
                      setNewTopic({ name: '', description: '' });
                    }
                  }} className="px-4 py-2 bg-[#5856D6] text-white rounded-xl text-xs font-bold">Add</button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {topics.map((t, i) => (
                    <span key={i} className="text-[10px] bg-[#5856D6] text-white px-2 py-1 rounded-full flex items-center gap-1">
                      #{t.name}
                      {i > 0 && <button onClick={() => setTopics(topics.filter((_, idx) => idx !== i))}>×</button>}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-60">Add Members</label>
                <input
                  type="text"
                  onChange={(e) => searchUsers(e.target.value)}
                  placeholder="Search users..."
                  className={`w-full px-5 py-2 rounded-xl border-none focus:ring-2 focus:ring-[#007AFF]/50 text-xs ${isDarkMode ? 'bg-white/5 text-white' : 'bg-[#F2F2F7] text-black'}`}
                />
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {searchResults.map(u => (
                    <div key={u._id} onClick={() => {
                      if (!groupMembers.find(m => m._id === u._id)) setGroupMembers([...groupMembers, u]);
                    }} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#007AFF] rounded-full text-[10px] flex items-center justify-center text-white">{u.username?.[0]}</div>
                      <span className="text-sm">{u.username}</span>
                    </div>
                  ))}
                </div>
                {groupMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {groupMembers.map(m => (
                      <span key={m._id} className="text-[10px] bg-[#007AFF] text-white px-2 py-1 rounded-full flex items-center gap-1">
                        {m.username}
                        <button onClick={() => setGroupMembers(groupMembers.filter(gm => gm._id !== m._id))}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('auth_token');
                    const res = await axios.post(`${API_URL}/groups/supergroup`, {
                      groupName, description: groupDesc, memberIds: groupMembers.map(m => m._id), topics
                    }, { headers: { Authorization: `Bearer ${token}` } });
                    setChats(prev => [res.data.data, ...prev]);
                    setShowSupergroupModal(false);
                    setGroupName(''); setTopics([{ name: 'General', description: 'General discussion' }]); setGroupMembers([]);
                    alert('Supergroup created! ✨');
                  } catch (err) { alert('Failed to create supergroup'); }
                }}
                disabled={!groupName.trim() || groupMembers.length === 0 || topics.length === 0}
                className="w-full py-4 bg-[#5856D6] text-white rounded-2xl font-bold hover:bg-purple-600 disabled:opacity-50 transition-all shadow-md text-sm"
              >
                Create Supergroup
              </button>
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

      {/* Clear Chat Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ${isDarkMode ? 'bg-[#1a4939] text-white border border-white/10' : 'bg-white text-black'}`}>
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-3xl mb-4 shadow-lg">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Clear History?</h3>
              <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Are you sure you want to delete ALL messages in this chat? This cannot be undone.</p>
              
              <div className="w-full flex flex-col gap-2">
                <button 
                  onClick={handleClearChat}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg"
                >
                  Yes, clear everything
                </button>
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className={`w-full py-4 rounded-2xl font-bold transition-all ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  No, keep messages
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
