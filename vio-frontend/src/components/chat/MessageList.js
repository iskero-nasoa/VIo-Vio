"use client";

import { useChatStore } from '../../store/chatStore';
import MessageBubble from './MessageBubble';

export default function MessageList({ chatId }) {
  const { messages } = useChatStore();
  const chatMessages = messages[chatId] || [];

  return (
    <div className="space-y-4">
      {chatMessages.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>No messages yet</p>
        </div>
      ) : (
        chatMessages.map((msg) => (
          <MessageBubble key={msg._id || msg.messageId} message={msg} />
        ))
      )}
    </div>
  );
}
