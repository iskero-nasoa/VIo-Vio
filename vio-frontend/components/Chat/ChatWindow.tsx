"use client";

import React from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { useChat } from "../../hooks/useChat";
import { useCall } from "../../context/CallContext";
import { Phone, Video, Info } from "lucide-react";
import { UserAvatar } from "../Common/UserAvatar";
import Link from "next/link";

interface ChatWindowProps {
  chatId: string;
  currentUserId: string;
  recipient?: any;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, currentUserId, recipient }) => {
  const { messages, loading, sendMessage, emitTyping, typingUsers, deleteForMe, deleteForAll } = useChat(chatId);
  const { initiateCall } = useCall();

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between z-10 shadow-sm">
        <Link href={`/profile/${recipient?._id || recipient?.id || ""}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <UserAvatar user={recipient} />
          <div>
            <h2 className="text-sm font-semibold text-foreground leading-none mb-1">
              {recipient?.username || "Chat"}
            </h2>
            <p className={`text-xs font-medium ${recipient?.status === "online" ? "text-emerald-400" : "text-muted-foreground"}`}>
              {recipient?.status === "online" ? "● Online" : "● Offline"}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1 text-muted-foreground">
          <button
            onClick={() => recipient?._id && initiateCall(recipient._id, "audio")}
            className="p-2 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
            title="Voice call"
          >
            <Phone size={18} />
          </button>
          <button
            onClick={() => recipient?._id && initiateCall(recipient._id, "video")}
            className="p-2 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
            title="Video call"
          >
            <Video size={18} />
          </button>
          <button className="p-2 hover:text-foreground hover:bg-secondary rounded-xl transition-colors">
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          onDeleteForMe={deleteForMe}
          onDeleteForAll={deleteForAll}
        />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card">
        <TypingIndicator users={Array.from(typingUsers)} />
        <MessageInput
          onSendMessage={sendMessage}
          onTyping={emitTyping}
          disabled={loading}
        />
      </div>
    </div>
  );
};
