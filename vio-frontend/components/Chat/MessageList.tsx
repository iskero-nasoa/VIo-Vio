"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { format } from "date-fns";
import { Message } from "../../types/chat";
import { UserAvatar } from "../Common/UserAvatar";
import { Trash2, Smile } from "lucide-react";
import Link from "next/link";
import { AudioPlayer } from "./AudioPlayer";
import { ReactionPicker } from "./ReactionPicker";
import { ReactionBadge } from "./ReactionBadge";
import { DeleteMessageModal } from "./DeleteMessageModal";
import { useSocket } from "../../hooks/useSocket";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForAll: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onDeleteForMe,
  onDeleteForAll,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [pickerOpenFor, setPickerOpenFor] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ messageId: string; isOwner: boolean } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleToggleReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (!socket) return;
      socket.emit("toggle_reaction", { messageId, emoji, userId: currentUserId });
    },
    [socket, currentUserId]
  );

  const handleDeleteForMe = useCallback(async () => {
    if (!deleteModal) return;
    setDeleteLoading(true);
    try {
      await onDeleteForMe(deleteModal.messageId);
    } finally {
      setDeleteLoading(false);
      setDeleteModal(null);
    }
  }, [deleteModal, onDeleteForMe]);

  const handleDeleteForAll = useCallback(async () => {
    if (!deleteModal) return;
    setDeleteLoading(true);
    try {
      await onDeleteForAll(deleteModal.messageId);
    } finally {
      setDeleteLoading(false);
      setDeleteModal(null);
    }
  }, [deleteModal, onDeleteForAll]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-muted-foreground opacity-50 italic">
          No messages yet. Start the conversation!
        </div>
      ) : (
        messages.map((msg) => {
          const senderIdStr = typeof msg.senderId === "string" ? msg.senderId : (msg.senderId as any)?._id;
          const isMe = senderIdStr === currentUserId;

          const senderUsername = msg.senderUsername || (typeof msg.senderId !== "string" ? (msg.senderId as any).username : "?");
          const senderAvatar = msg.senderAvatar || (typeof msg.senderId !== "string" ? (msg.senderId as any).avatar : undefined);

          const hasReactions = msg.reactions && msg.reactions.length > 0;

          return (
            <div
              key={msg._id}
              id={`msg-${msg._id}`}
              className={`flex gap-3 group relative transition-colors duration-500 rounded-2xl ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Message Actions (Visible on hover) */}
              <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all self-center shrink-0 ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Reaction trigger */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setPickerOpenFor(pickerOpenFor === msg._id ? null : msg._id)
                    }
                    className="p-2 text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all"
                    title="Add reaction"
                  >
                    <Smile size={16} />
                  </button>
                  {pickerOpenFor === msg._id && (
                    <ReactionPicker
                      isMe={isMe}
                      onSelect={(emoji) => handleToggleReaction(msg._id, emoji)}
                      onClose={() => setPickerOpenFor(null)}
                    />
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => setDeleteModal({ messageId: msg._id, isOwner: isMe })}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Delete message"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Avatar next to EACH message */}
              <div className="flex-shrink-0 mt-1">
                <UserAvatar
                  user={{ username: senderUsername, avatar: senderAvatar }}
                  size="sm"
                />
              </div>

              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%] md:max-w-md`}>
                {/* Sender name (only for others) */}
                {!isMe && (
                  <p className="text-muted-foreground text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider">
                    {senderUsername}
                  </p>
                )}

                {/* Message Bubble */}
                <div
                  className={`px-4 py-2 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md relative overflow-hidden ${isMe
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-secondary text-foreground rounded-tl-none border border-border/50'
                    }`}
                >
                  {/* Attachments support */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2 space-y-2">
                      {msg.attachments.map((att, i) => {
                        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace("/api", "");
                        const fullUrl = `${baseUrl}${att.url}`;
                        return (
                          <div key={i} className="rounded-lg overflow-hidden border border-black/10">
                            {att.type === "image" ? (
                              <img src={fullUrl} alt={att.filename} className="max-w-full h-auto object-contain" />
                            ) : att.type === "video" ? (
                              <video src={fullUrl} controls className="max-w-full h-auto" />
                            ) : (
                              <AudioPlayer src={fullUrl} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {msg.text && (
                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  )}

                  {/* Internal time for "modern" look */}
                  <div className={`flex justify-end mt-1 text-[9px] opacity-60 font-medium`}>
                    {format(new Date(msg.createdAt), "HH:mm")}
                  </div>
                </div>

                {/* Reaction badges — below bubble */}
                {hasReactions && (
                  <div
                    className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}
                    style={{ animation: "reactionBadgeIn 0.2s ease-out" }}
                  >
                    {msg.reactions!.map((r) => (
                      <ReactionBadge
                        key={r.emoji}
                        reaction={r}
                        currentUserId={currentUserId}
                        onToggle={(emoji) => handleToggleReaction(msg._id, emoji)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />

      <DeleteMessageModal
        isOpen={deleteModal !== null}
        isOwner={deleteModal?.isOwner ?? false}
        loading={deleteLoading}
        onClose={() => setDeleteModal(null)}
        onDeleteForMe={handleDeleteForMe}
        onDeleteForAll={handleDeleteForAll}
      />

      <style>{`
        @keyframes reactionBadgeIn {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
