"use client";

import { useChatStore } from '../../store/chatStore';
import ChatWindow from './ChatWindow';

export default function MainContent() {
  const { activeChat } = useChatStore();

  if (!activeChat) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a chat</h2>
          <p className="text-gray-600">Choose a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return <ChatWindow chatId={activeChat} />;
}
