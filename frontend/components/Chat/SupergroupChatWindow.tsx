"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { TopicSidebar } from "./TopicSidebar";
import { Settings, Hash, Plus, Globe, Loader2 } from "lucide-react";
import { Topic, Supergroup } from "../../types/chat";
import { api } from "../../utils/api";
import { useTopicChat } from "../../hooks/useTopicChat";
import { useAuth } from "../../hooks/useAuth";

interface SupergroupChatWindowProps {
  supergroupId: string;
  currentUserId: string;
}

export const SupergroupChatWindow: React.FC<SupergroupChatWindowProps> = ({
  supergroupId,
  currentUserId,
}) => {
  const [supergroup, setSupergroup] = useState<Supergroup | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { 
    messages, 
    topics, 
    sendMessage, 
    emitTyping, 
    typingUsers, 
    deleteMessage,
    refreshTopics,
    loading: messagesLoading 
  } = useTopicChat(supergroupId, activeTopicId);

  const { user } = useAuth();

  const isAdmin = supergroup
    ? (typeof supergroup.admin === "string" ? supergroup.admin : supergroup.admin._id) === currentUserId
    : false;

  // Fetch supergroup only
  useEffect(() => {
    const fetchSupergroup = async () => {
      setLoading(true);
      try {
        const sgData = await api.getSupergroup(supergroupId);
        setSupergroup(sgData);
      } catch (error) {
        console.error("Failed to load supergroup", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSupergroup();
  }, [supergroupId]);

  // Set initial active topic when topics are loaded
  useEffect(() => {
    if (topics.length > 0 && !activeTopicId) {
      setActiveTopicId(topics[0]._id);
    }
  }, [topics, activeTopicId]);

  const activeTopic = topics.find((t) => t._id === activeTopicId);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-background h-full">
      {/* Topic Sidebar */}
      <TopicSidebar
        groupId={supergroupId}
        topics={topics}
        activeTopicId={activeTopicId}
        onSelectTopic={(id) => {
          setActiveTopicId(id);
        }}
        isAdmin={isAdmin}
        onTopicsChanged={refreshTopics}
        isSupergroup={true}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/80 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0">
              <Globe size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-foreground font-medium leading-none mb-1 truncate">
                {supergroup?.name || "Супергруппа"}
                {activeTopic && (
                  <span className="text-muted-foreground font-normal text-xs ml-2">
                    / #{activeTopic.name}
                  </span>
                )}
              </h2>
              <p className="text-muted-foreground text-xs">
                {supergroup?.members.length || 0} участников · {topics.length} топиков
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {activeTopicId ? (
          <>
            <div className="flex-1 overflow-hidden flex flex-col relative">
              <MessageList
                messages={messages}
                currentUserId={currentUserId}
                onDeleteMessage={deleteMessage}
              />
            </div>

            <div className="p-4 border-t border-border bg-card shrink-0">
              <TypingIndicator users={Array.from(typingUsers)} />
              <MessageInput
                onSendMessage={sendMessage}
                onTyping={emitTyping}
                disabled={messagesLoading}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Hash size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Выберите топик</p>
              <p className="text-xs mt-1 opacity-60">
                {topics.length === 0
                  ? "Создайте первый топик в боковой панели"
                  : "Нажмите на топик слева"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
