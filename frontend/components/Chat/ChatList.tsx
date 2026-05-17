"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Search, MessageSquarePlus, Users, X, Hash, Globe, MessageSquareOff } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../utils/api";
import { UserAvatar } from "../Common/UserAvatar";
import { formatDistanceToNow } from "date-fns";
import { NewChatModal } from "./NewChatModal";
import { CreateGroupModal } from "./CreateGroupModal";
import { CreateSupergroupModal } from "./CreateSupergroupModal";
import { useSocket } from "../../hooks/useSocket";

interface ChatListProps {
  currentUserId: string;
}

interface UnifiedItem {
  id: string;
  type: "direct" | "group" | "supergroup";
  name: string;
  avatar?: string;
  status?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  memberCount?: number;
  raw: any;
}

export const ChatList: React.FC<ChatListProps> = ({ currentUserId }) => {
  const [chats, setChats] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [supergroups, setSupergroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showCreateSupergroupModal, setShowCreateSupergroupModal] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { socket, connected } = useSocket();

  const fetchAll = useCallback(async () => {
    try {
      const [chatData, groupData, sgData] = await Promise.all([
        api.getChats(),
        api.getGroups(),
        api.getSupergroups(),
      ]);
      setChats(chatData);
      setGroups(groupData || []);
      setSupergroups(sgData || []);
    } catch (error) {
      console.error("Failed to fetch chats/groups", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!socket || !connected || loading) return;
    chats.forEach((chat) => socket.emit("join_chat", { chatId: chat._id, userId: currentUserId }));
    groups.forEach((group) => socket.emit("join_group", { groupId: group._id, userId: currentUserId }));
    socket.emit("join_user_room", currentUserId);
  }, [socket, connected, loading, chats.length, groups.length, currentUserId]);

  useEffect(() => {
    if (!socket || !connected) return;

    const handleMessageReceived = (message: any) => {
      setChats((prev) => {
        const idx = prev.findIndex((c) => c._id === message.chatId);
        if (idx === -1) { fetchAll(); return prev; }
        const updated = { ...prev[idx], messages: [message], updatedAt: message.createdAt };
        return [updated, ...prev.filter((_, i) => i !== idx)];
      });
    };

    const handleGroupMessage = (message: any) => {
      setGroups((prev) => {
        const idx = prev.findIndex((g) => g._id === (message.groupId || message.chatId));
        if (idx === -1) return prev;
        const updated = { ...prev[idx], messages: [message], updatedAt: message.createdAt };
        return [updated, ...prev.filter((_, i) => i !== idx)];
      });
    };

    const handleGroupCreated = (group: any) => {
      setGroups((prev) => prev.some((g) => g._id === group._id) ? prev : [group, ...prev]);
    };

    const handleSupergroupCreated = (sg: any) => {
      setSupergroups((prev) => prev.some((s) => s._id === sg._id) ? prev : [sg, ...prev]);
    };

    socket.on("message_received", handleMessageReceived);
    socket.on("group_message_received", handleGroupMessage);
    socket.on("group_created", handleGroupCreated);
    socket.on("supergroup_created", handleSupergroupCreated);
    return () => {
      socket.off("message_received", handleMessageReceived);
      socket.off("group_message_received", handleGroupMessage);
      socket.off("group_created", handleGroupCreated);
      socket.off("supergroup_created", handleSupergroupCreated);
    };
  }, [socket, connected, fetchAll]);

  const unifiedItems: UnifiedItem[] = [
    ...chats.map((chat) => {
      const other = chat.participants?.find((p: any) => (p._id || p.id) !== currentUserId);
      const lastMsg = chat.messages?.[0];
      return {
        id: chat._id || chat.id,
        type: "direct" as const,
        name: other?.username || "Chat",
        avatar: other?.avatar,
        status: other?.status,
        lastMessage: lastMsg?.text || "",
        lastMessageTime: chat.updatedAt,
        raw: chat,
      };
    }),
    ...groups.map((group) => {
      const lastMsg = group.messages?.[0];
      const sender = lastMsg?.senderUsername || lastMsg?.senderId?.username;
      return {
        id: group._id || group.id,
        type: "group" as const,
        name: group.name,
        avatar: group.avatar,
        lastMessage: lastMsg ? `${sender ? sender + ": " : ""}${lastMsg.text || "Attachment"}` : "",
        lastMessageTime: group.updatedAt,
        memberCount: group.members?.length || 0,
        raw: group,
      };
    }),
    ...supergroups.map((sg) => {
      const lastMsg = sg.lastMessage;
      return {
        id: sg._id || sg.id,
        type: "supergroup" as const,
        name: sg.name,
        avatar: sg.avatar,
        lastMessage: lastMsg?.text || "",
        lastMessageTime: sg.updatedAt,
        memberCount: sg.members?.length || 0,
        raw: sg,
      };
    }),
  ].sort((a, b) => {
    const tA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
    const tB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
    return tB - tA;
  });

  const filtered = unifiedItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || (item.lastMessage?.toLowerCase() || "").includes(q);
  });

  const fmtTime = (date?: string) => {
    if (!date) return "";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: false });
    } catch {
      return "";
    }
  };

  const handleClick = (item: UnifiedItem) => {
    if (item.type === "supergroup") router.push(`/chat/supergroup/${item.id}`);
    else if (item.type === "group") router.push(`/chat/group/${item.id}`);
    else router.push(`/chat/${item.id}`);
  };

  if (loading) {
    return (
      <div className="p-3 space-y-3 mt-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full shrink-0" style={{ background: "var(--secondary)" }} />
            <div className="flex-1 space-y-2">
              <div className="h-3 rounded w-2/5" style={{ background: "var(--secondary)" }} />
              <div className="h-2 rounded w-3/5" style={{ background: "var(--secondary)" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search + action buttons */}
      <div className="p-3 space-y-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
        {/* Search bar */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--muted-foreground)" }}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-2 rounded-full text-sm outline-none"
            style={{
              background: "var(--secondary)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted-foreground)" }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Pill buttons */}
        <div className="flex gap-2">
          <button onClick={() => setShowNewChatModal(true)} className="btn-action btn-chat">
            <MessageSquarePlus size={13} />
            + Chat
          </button>
          <button onClick={() => setShowCreateGroupModal(true)} className="btn-action btn-group">
            <Users size={13} />
            + Group
          </button>
          <button onClick={() => setShowCreateSupergroupModal(true)} className="btn-action btn-super">
            <Globe size={13} />
            + Super
          </button>
        </div>
      </div>

      {/* Modals */}
      {showNewChatModal && <NewChatModal onClose={() => setShowNewChatModal(false)} />}
      {showCreateGroupModal && <CreateGroupModal onClose={() => setShowCreateGroupModal(false)} />}
      {showCreateSupergroupModal && <CreateSupergroupModal onClose={() => setShowCreateSupergroupModal(false)} />}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-muted-foreground mb-3 border border-border">
              <MessageSquareOff size={22} />
            </div>
            <p className="text-sm font-semibold text-foreground">Nothing here yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start a new chat above</p>
          </div>
        ) : (
          filtered.map((item) => {
            const activeId = params?.id as string | undefined;
            const isActive = activeId === item.id;

            return (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleClick(item)}
                className="px-3 py-3 flex items-center gap-3 cursor-pointer transition-colors relative"
                style={{
                  borderLeft: isActive
                    ? "2px solid var(--primary)"
                    : "2px solid transparent",
                  background: isActive ? "rgba(6,182,212,0.08)" : "transparent",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--secondary)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {/* Avatar */}
                {item.type === "supergroup" ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0 shadow-lg">
                    <Globe size={18} className="text-white" />
                  </div>
                ) : item.type === "group" ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                    {item.avatar ? (
                      <img
                        src={`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api").replace("/api", "")}${item.avatar}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Hash size={18} className="text-white" />
                    )}
                  </div>
                ) : (
                  <UserAvatar
                    user={{ username: item.name, avatar: item.avatar, status: item.status as any }}
                  />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className={`text-sm font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                      {item.name}
                    </span>
                    {item.lastMessageTime && (
                      <span className="text-[10px] text-muted-foreground shrink-0">{fmtTime(item.lastMessageTime)}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {item.lastMessage || (item.type === "direct" ? "No messages yet" : `${item.memberCount} members`)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
