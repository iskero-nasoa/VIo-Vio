"use client";

import { useState, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatWindow({ chatId }) {
  const { chats } = useChatStore();
  const [chat, setChat] = useState(null);

  useEffect(() => {
    const currentChat = chats.find(c => (c._id || c.chatId) === chatId);
    setChat(currentChat);
  }, [chatId, chats]);

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="font-semibold text-lg">{chat.chatName}</h2>
        <p className="text-xs text-gray-500">
          {chat.members?.length || 0} members
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <MessageList chatId={chatId} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <MessageInput chatId={chatId} />
      </div>
    </div>
  );
}
