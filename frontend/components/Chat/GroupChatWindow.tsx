"use client";

import React, { useState, useEffect } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { useGroupChat } from "../../hooks/useGroupChat";
import { useTopicChat } from "../../hooks/useTopicChat";
import { Settings, Users, Hash, ChevronRight, ChevronLeft } from "lucide-react";
import { UserAvatar } from "../Common/UserAvatar";
import { Message } from "../../types/chat";
import { GroupSettingsModal } from "./GroupSettingsModal";
import { TopicSidebar } from "./TopicSidebar";

interface GroupChatWindowProps {
  groupId: string;
  currentUserId: string;
}

export const GroupChatWindow: React.FC<GroupChatWindowProps> = ({ groupId, currentUserId }) => {
  const {
    messages: groupMessages,
    group,
    loading: groupLoading,
    sendMessage: sendGroupMessage,
    emitTyping: emitGroupTyping,
    typingUsers: groupTypingUsers,
    deleteMessage: deleteGroupMessage,
    refreshGroup,
  } = useGroupChat(groupId);

  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [showTopics, setShowTopics] = useState(true);

  const {
    messages: topicMessages,
    topics,
    sendMessage: sendTopicMessage,
    emitTyping: emitTopicTyping,
    typingUsers: topicTypingUsers,
    deleteMessage: deleteTopicMessage,
    refreshTopics,
  } = useTopicChat(groupId, activeTopicId);

  const isAdmin = group
    ? (typeof group.admin === "string" ? group.admin : group.admin._id) === currentUserId
    : false;

  const hasTopics = topics.length > 0;

  // Auto-select first topic when topics load
  useEffect(() => {
    if (topics.length > 0 && !activeTopicId) {
      setActiveTopicId(topics[0]._id);
    }
  }, [topics, activeTopicId]);

  // Determine which message set to use
  const isTopicMode = hasTopics && activeTopicId;
  const messages = isTopicMode ? topicMessages : groupMessages;
  const sendMessage = isTopicMode ? sendTopicMessage : sendGroupMessage;
  const emitTyping = isTopicMode ? emitTopicTyping : emitGroupTyping;
  const typingUsers = isTopicMode ? topicTypingUsers : groupTypingUsers;
  const deleteMessage = isTopicMode ? deleteTopicMessage : deleteGroupMessage;
  const loading = groupLoading;

  const activeTopic = topics.find((t) => t._id === activeTopicId);

  return (
    <div className="flex-1 flex bg-background h-full">
      {/* Topic Sidebar */}
      {hasTopics && showTopics && (
        <TopicSidebar
          groupId={groupId}
          topics={topics}
          activeTopicId={activeTopicId}
          onSelectTopic={(id) => {
            setActiveTopicId(id);
            setReplyTo(null);
          }}
          isAdmin={isAdmin}
          onTopicsChanged={refreshTopics}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Group Chat Header */}
        <div className="p-4 border-b border-border bg-card flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Toggle topic sidebar */}
            {hasTopics && (
              <button
                onClick={() => setShowTopics(!showTopics)}
                className="text-muted-foreground hover:text-foreground p-1 transition-colors shrink-0"
                title={showTopics ? "Скрыть топики" : "Показать топики"}
              >
                {showTopics ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            )}

            {/* Group Avatar */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg overflow-hidden shrink-0">
              {group?.avatar ? (
                <img
                  src={`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace("/api", "")}${group.avatar}`}
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Hash size={20} />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-foreground font-medium leading-none mb-1 truncate">
                {group?.name || "Группа"}
                {activeTopic && (
                  <span className="text-muted-foreground font-normal text-xs ml-2">
                    / #{activeTopic.name}
                  </span>
                )}
              </h2>
              <p className="text-muted-foreground text-xs">
                {group?.members.length || 0} участников
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5 text-muted-foreground shrink-0">
            <button
              onClick={() => setShowSettings(true)}
              className="hover:text-foreground transition-colors p-1 flex items-center gap-1.5"
            >
              <Users size={20} />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="hover:text-foreground transition-colors p-1"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            onDeleteMessage={deleteMessage}
            onReply={(msg) => setReplyTo(msg)}
          />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-card shrink-0">
          <TypingIndicator users={Array.from(typingUsers)} />
          <MessageInput
            onSendMessage={sendMessage}
            onTyping={emitTyping}
            disabled={loading}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
          />
        </div>

        {/* Group Settings Modal */}
        {showSettings && group && (
          <GroupSettingsModal
            group={group}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onClose={() => setShowSettings(false)}
            onGroupUpdated={refreshGroup}
          />
        )}
      </div>
    </div>
  );
};
