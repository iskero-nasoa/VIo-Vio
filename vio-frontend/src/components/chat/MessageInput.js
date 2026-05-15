"use client";

import { useState } from 'react';
import api from '../../utils/api';
import { useChatStore } from '../../store/chatStore';

export default function MessageInput({ chatId }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { addMessage } = useChatStore();

  const handleSend = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      const response = await api.post('/messages', {
        chatId,
        content,
        messageType: 'text',
      });

      addMessage(chatId, response.data.data || response.data);
      setContent('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="1"
      />
      <button
        onClick={handleSend}
        disabled={loading || !content.trim()}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400"
      >
        Send
      </button>
    </div>
  );
}
