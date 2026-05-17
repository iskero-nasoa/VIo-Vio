import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";
import { useSocket } from "./useSocket";
import { Chat, Message } from "../types/chat";

export const useChatList = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, connected } = useSocket();

  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getChats();
      // Sort by updatedAt descending initially
      const sorted = data.sort((a: Chat, b: Chat) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setChats(sorted);
    } catch (err: any) {
      setError(err.message || "Failed to fetch chats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewMessage = (message: Message) => {
      setChats((prev) => {
        // Find if the chat exists in the list
        const chatIndex = prev.findIndex((c) => c._id === message.chatId);
        
        if (chatIndex === -1) {
          // If the chat isn't in the list (e.g., first message in a new chat),
          // it's safer to re-fetch chats or we could potentially build it if we have participant info.
          // For now, let's re-fetch to ensure data consistency for new chats.
          fetchChats();
          return prev;
        }

        const updatedChat = {
          ...prev[chatIndex],
          messages: [message], // Update last message preview
          updatedAt: message.createdAt,
        };

        const otherChats = prev.filter((_, i) => i !== chatIndex);
        
        // Return new list with updated chat at the top
        return [updatedChat, ...otherChats];
      });
    };

    socket.on("message_received", handleNewMessage);

    return () => {
      socket.off("message_received", handleNewMessage);
    };
  }, [socket, connected, fetchChats]);

  return { chats, loading, error, refresh: fetchChats };
};
