"use client";

import { useChatStore } from '../../store/chatStore';
import ChatListItem from './ChatListItem';

export default function ChatList() {
  const { chats, activeChat, setActiveChat } = useChatStore();

  if (!chats || chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No chats yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {chats.map((chat) => (
        <ChatListItem
          key={chat._id || chat.chatId}
          chat={chat}
          isActive={activeChat === (chat._id || chat.chatId)}
          onClick={() => setActiveChat(chat._id || chat.chatId)}
        />
      ))}
    </div>
  );
}
