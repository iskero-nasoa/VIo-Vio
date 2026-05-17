"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";
import { useAuth } from "./useAuth";
import { api } from "../utils/api";
import { Message, Group } from "../types/chat";

export const useGroupChat = (groupId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const LIMIT = 50;

  // Fetch group info
  useEffect(() => {
    if (!groupId) {
      setGroup(null);
      return;
    }

    const fetchGroup = async () => {
      try {
        const data = await api.getGroup(groupId);
        setGroup(data);
      } catch (error) {
        console.error("Failed to load group info", error);
      }
    };

    fetchGroup();
  }, [groupId]);

  // Initial message load
  useEffect(() => {
    if (!groupId || !user) {
      setMessages([]);
      setSkip(0);
      setHasMore(true);
      return;
    }

    const fetchInitialMessages = async () => {
      setLoading(true);
      try {
        const data = await api.getGroupMessages(groupId, 0, LIMIT);
        setMessages(data);
        setSkip(data.length);
        setHasMore(data.length === LIMIT);
      } catch (error) {
        console.error("Failed to load initial group messages", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialMessages();
  }, [groupId, user]);

  // Load more (pagination)
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !groupId) return;

    setLoading(true);
    try {
      const data = await api.getGroupMessages(groupId, skip, LIMIT);
      if (data.length > 0) {
        setMessages((prev) => [...data, ...prev]);
        setSkip((prev) => prev + data.length);
      }
      setHasMore(data.length === LIMIT);
    } catch (error) {
      console.error("Failed to load more group messages", error);
    } finally {
      setLoading(false);
    }
  }, [groupId, loading, hasMore, skip]);

  // Socket setup
  useEffect(() => {
    if (!socket || !connected || !groupId || !user) return;

    socket.emit("join_group", { groupId, userId: user.id });

    const handleMessage = (message: any) => {
      if (message.groupId === groupId || message.chatId === groupId) {
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
    };

    const handleTyping = (data: { groupId: string; userId: string; username: string; isTyping: boolean }) => {
      if (data.groupId !== groupId || data.userId === user.id) return;

      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.username);
        } else {
          newSet.delete(data.username);
        }
        return newSet;
      });
    };

    const handleMessageDeleted = (deletedMessageId: string) => {
      setMessages((prev) => prev.filter((m) => m._id !== deletedMessageId));
    };

    const handleGroupUpdated = (updatedGroup: Group) => {
      setGroup(updatedGroup);
    };

    const handleMemberAdded = (data: { groupId: string; group: Group }) => {
      if (data.groupId === groupId) {
        setGroup(data.group);
      }
    };

    const handleMemberRemoved = (data: { groupId: string; memberId: string; group: Group }) => {
      if (data.groupId === groupId) {
        setGroup(data.group);
      }
    };

    socket.on("group_message_received", handleMessage);
    socket.on("group_user_typing", handleTyping);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("group_updated", handleGroupUpdated);
    socket.on("group_member_added", handleMemberAdded);
    socket.on("group_member_removed", handleMemberRemoved);

    return () => {
      socket.off("group_message_received", handleMessage);
      socket.off("group_user_typing", handleTyping);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("group_updated", handleGroupUpdated);
      socket.off("group_member_added", handleMemberAdded);
      socket.off("group_member_removed", handleMemberRemoved);
      socket.emit("leave_group", groupId);
    };
  }, [socket, connected, groupId, user]);

  const sendMessage = useCallback(
    async (text: string, attachments?: any[]) => {
      if (!groupId || !socket || !user) return;
      if (!text.trim() && (!attachments || attachments.length === 0)) return;

      try {
        // Optimistic message
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: any = {
          _id: tempId,
          groupId,
          chatId: groupId,
          text,
          senderId: user.id,
          senderUsername: user.username,
          senderAvatar: user.avatar,
          attachments: attachments || [],
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        socket.emit("send_group_message", {
          groupId,
          text,
          senderId: user.id,
          attachments,
          tempId,
        });

        // Clear typing status
        socket.emit("group_typing", { groupId, userId: user.id, isTyping: false });
      } catch (error) {
        console.error("Failed to send group message", error);
      }
    },
    [groupId, socket, user]
  );

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!groupId || !socket || !user) return;

      socket.emit("group_typing", { groupId, userId: user.id, isTyping });

      if (isTyping) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit("group_typing", { groupId, userId: user.id, isTyping: false });
        }, 3000);
      }
    },
    [groupId, socket, user]
  );

  const deleteMessage = useCallback(async (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    try {
      await api.deleteMessage(messageId);
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  }, []);

  const refreshGroup = useCallback(async () => {
    if (!groupId) return;
    try {
      const data = await api.getGroup(groupId);
      setGroup(data);
    } catch (error) {
      console.error("Failed to refresh group", error);
    }
  }, [groupId]);

  return {
    messages,
    group,
    sendMessage,
    loading,
    hasMore,
    loadMore,
    typingUsers,
    emitTyping,
    deleteMessage,
    refreshGroup,
  };
};
