import { create } from 'zustand';

export const useChatStore = create((set) => ({
  chats: [],
  activeChat: null,
  messages: {},
  isLoading: false,
  unreadCounts: {},

  setChats: (chats) => set({ chats }),
  
  setActiveChat: (chatId) => set({ activeChat: chatId }),
  
  addMessage: (chatId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [chatId]: [...(state.messages[chatId] || []), message],
    }
  })),
  
  setMessages: (chatId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [chatId]: messages,
    }
  })),
  
  clearChat: (chatId) => set((state) => {
    const newMessages = { ...state.messages };
    delete newMessages[chatId];
    return { messages: newMessages };
  }),
  
  setUnreadCount: (chatId, count) => set((state) => ({
    unreadCounts: {
      ...state.unreadCounts,
      [chatId]: count,
    }
  })),

  updateChat: (chatId, chatData) => set((state) => ({
    chats: state.chats.map(chat => chat._id === chatId ? { ...chat, ...chatData } : chat)
  })),

  addMember: (chatId, member) => set((state) => ({
    chats: state.chats.map(chat => 
      chat._id === chatId 
        ? { ...chat, participants: [...(chat.participants || []), member] } 
        : chat
    )
  })),

  removeMember: (chatId, memberId) => set((state) => ({
    chats: state.chats.map(chat => 
      chat._id === chatId 
        ? { ...chat, participants: (chat.participants || []).filter(p => p._id !== memberId) } 
        : chat
    )
  })),

  addTopic: (chatId, topic) => set((state) => ({
    chats: state.chats.map(chat => 
      chat._id === chatId 
        ? { ...chat, topics: [...(chat.topics || []), topic] } 
        : chat
    )
  })),

  updateTopic: (chatId, topicId, topicData) => set((state) => ({
    chats: state.chats.map(chat => 
      chat._id === chatId 
        ? { ...chat, topics: (chat.topics || []).map(t => t._id === topicId ? { ...t, ...topicData } : t) } 
        : chat
    )
  })),

  deleteTopic: (chatId, topicId) => set((state) => ({
    chats: state.chats.map(chat => 
      chat._id === chatId 
        ? { ...chat, topics: (chat.topics || []).filter(t => t._id !== topicId) } 
        : chat
    )
  })),

  setCurrentTopic: (chatId, topicId) => set((state) => ({
    chats: state.chats.map(chat => 
      chat._id === chatId ? { ...chat, currentTopicId: topicId } : chat
    )
  })),
}));
