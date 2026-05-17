"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";
import { useAuth } from "./useAuth";
import { api } from "../utils/api";
import { Message, Topic } from "../types/chat";

export const useTopicChat = (groupId: string | null, topicId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const LIMIT = 50;

  // Fetch topics for the group
  useEffect(() => {
    if (!groupId) {
      setTopics([]);
      return;
    }
    const fetchTopics = async () => {
      try {
        const data = await api.getTopics(groupId);
        setTopics(data);
      } catch (error) {
        console.error("Failed to load topics", error);
      }
    };
    fetchTopics();
  }, [groupId]);

  // Fetch messages for the active topic
  useEffect(() => {
    if (!groupId || !topicId || !user) {
      setMessages([]);
      setSkip(0);
      setHasMore(true);
      return;
    }

    const fetchInitialMessages = async () => {
      setLoading(true);
      try {
        const data = await api.getTopicMessages(groupId, topicId, 0, LIMIT);
        setMessages(data);
        setSkip(data.length);
        setHasMore(data.length === LIMIT);
      } catch (error) {
        console.error("Failed to load topic messages", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialMessages();
  }, [groupId, topicId, user]);

  // Load more
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !groupId || !topicId) return;
    setLoading(true);
    try {
      const data = await api.getTopicMessages(groupId, topicId, skip, LIMIT);
      if (data.length > 0) {
        setMessages((prev) => [...data, ...prev]);
        setSkip((prev) => prev + data.length);
      }
      setHasMore(data.length === LIMIT);
    } catch (error) {
      console.error("Failed to load more topic messages", error);
    } finally {
      setLoading(false);
    }
  }, [groupId, topicId, loading, hasMore, skip]);

  // Socket setup
  useEffect(() => {
    if (!socket || !connected || !topicId || !user) return;

    socket.emit("join_topic", { topicId, groupId });

    const handleMessage = (message: any) => {
      // Update messages if this is the active topic
      if (message.topicId === topicId) {
        setMessages((prev) => {
          // Replace optimistic message
          if (message.tempId) {
            const index = prev.findIndex((m) => m._id === message.tempId);
            if (index !== -1) {
              const newMessages = [...prev];
              newMessages[index] = message;
              return newMessages;
            }
          }
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }

      // Update topics list with the last message preview
      setTopics((prev) => 
        prev.map((t) => {
          if (t._id === message.topicId) {
            return {
              ...t,
              messages: [...(t.messages || []), message],
              updatedAt: message.createdAt
            };
          }
          return t;
        })
      );
    };

    const handleTyping = (data: { topicId: string; userId: string; username: string; isTyping: boolean }) => {
      if (data.topicId !== topicId || data.userId === user.id) return;
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isTyping) newSet.add(data.username);
        else newSet.delete(data.username);
        return newSet;
      });
    };

    const handleTopicCreated = (data: { groupId: string; topic: Topic }) => {
      if (data.groupId === groupId) {
        setTopics((prev) => [...prev, data.topic]);
      }
    };

    const handleTopicUpdated = (data: { groupId: string; topic: Topic }) => {
      if (data.groupId === groupId) {
        setTopics((prev) => prev.map((t) => (t._id === data.topic._id ? data.topic : t)));
      }
    };

    const handleTopicDeleted = (data: { groupId: string; topicId: string }) => {
      if (data.groupId === groupId) {
        setTopics((prev) => prev.filter((t) => t._id !== data.topicId));
      }
    };

    socket.on("topic_message_received", handleMessage);
    socket.on("topic_user_typing", handleTyping);
    socket.on("topic_created", handleTopicCreated);
    socket.on("topic_updated", handleTopicUpdated);
    socket.on("topic_deleted", handleTopicDeleted);

    return () => {
      socket.off("topic_message_received", handleMessage);
      socket.off("topic_user_typing", handleTyping);
      socket.off("topic_created", handleTopicCreated);
      socket.off("topic_updated", handleTopicUpdated);
      socket.off("topic_deleted", handleTopicDeleted);
      socket.emit("leave_topic", topicId);
    };
  }, [socket, connected, topicId, groupId, user]);

  const sendMessage = useCallback(
    async (text: string, attachments?: any[]) => {
      if (!groupId || !topicId || !socket || !user) return;
      if (!text.trim() && (!attachments || attachments.length === 0)) return;

      try {
        // Optimistic message
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: any = {
          _id: tempId,
          topicId,
          groupId,
          text,
          senderId: user.id,
          senderUsername: user.username,
          senderAvatar: user.avatar,
          attachments: attachments || [],
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        socket.emit("send_topic_message", {
          topicId,
          groupId,
          text,
          senderId: user.id,
          attachments,
          tempId,
        });

        socket.emit("topic_typing", { topicId, userId: user.id, isTyping: false });
      } catch (error) {
        console.error("Failed to send topic message", error);
      }
    },
    [groupId, topicId, socket, user]
  );

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!topicId || !socket || !user) return;
      socket.emit("topic_typing", { topicId, userId: user.id, isTyping });
      if (isTyping) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit("topic_typing", { topicId, userId: user.id, isTyping: false });
        }, 3000);
      }
    },
    [topicId, socket, user]
  );

  const deleteMessage = useCallback(async (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    try {
      await api.deleteMessage(messageId);
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  }, []);

  const refreshTopics = useCallback(async () => {
    if (!groupId) return;
    try {
      const data = await api.getTopics(groupId);
      setTopics(data);
    } catch (error) {
      console.error("Failed to refresh topics", error);
    }
  }, [groupId]);

  return {
    messages,
    topics,
    sendMessage,
    loading,
    hasMore,
    loadMore,
    typingUsers,
    emitTyping,
    deleteMessage,
    refreshTopics,
  };
};
