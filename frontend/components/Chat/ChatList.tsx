"use client";

import React, { useEffect, useState } from "react";
import { Search, UserPlus, X, MessageSquareOff } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../utils/api";
import { UserAvatar } from "../Common/UserAvatar";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { NewChatModal } from "./NewChatModal";

interface ChatListProps {
  currentUserId: string;
}

export const ChatList: React.FC<ChatListProps> = ({ currentUserId }) => {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await api.getChats();
        setChats(data);
      } catch (error) {
        console.error("Failed to fetch chats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const filteredChats = chats.filter(chat => {
    const otherParticipant = chat.participants.find((p: any) => p._id !== currentUserId);
    const username = otherParticipant?.username?.toLowerCase() || "";
    const lastMessageText = chat.lastMessage?.text?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    
    return username.includes(query) || lastMessageText.includes(query);
  });

  const formatMessageTime = (date: string) => {
    if (!date) return "";
    return formatDistanceToNow(new Date(date), { addSuffix: false, locale: ru });
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-secondary rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-secondary rounded w-1/2" />
              <div className="h-2 bg-secondary rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Search Area */}
      <div className="p-3 space-y-3 border-b border-border">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Поиск чатов или сообщений..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-secondary text-foreground rounded-xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm placeholder:text-muted-foreground transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted transition-all"
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        <button 
          onClick={() => setShowNewChatModal(true)}
          className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold flex items-center justify-center gap-2 text-xs transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
        >
          <UserPlus size={16} />
          НОВЫЙ ЧАТ
        </button>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal onClose={() => setShowNewChatModal(false)} />
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 p-4 text-center">
            <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-muted-foreground mb-3">
              <MessageSquareOff size={24} />
            </div>
            <p className="text-sm font-bold">Ничего не найдено</p>
            <p className="text-xs text-muted-foreground mt-1">
              Попробуйте изменить запрос или <br /> начните новый чат
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const otherParticipant = chat.participants.find((p: any) => p._id !== currentUserId);
            const lastMessage = chat.lastMessage;
            const isActive = params.id === chat._id;

            return (
              <div
                key={chat._id}
                onClick={() => router.push(`/chat/${chat._id}`)}
                className={`px-4 py-3.5 border-b border-border/50 cursor-pointer transition-all ${
                  isActive ? "bg-secondary border-l-4 border-l-primary" : "border-l-4 border-l-transparent hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserAvatar user={otherParticipant} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className={`text-sm font-bold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                        {otherParticipant?.username}
                      </h3>
                      {lastMessage && (
                        <span className="text-muted-foreground text-[10px] font-medium">
                          {formatMessageTime(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${isActive ? "text-foreground/80" : "text-muted-foreground"}`}>
                      {lastMessage ? lastMessage.text : "Нет сообщений"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
