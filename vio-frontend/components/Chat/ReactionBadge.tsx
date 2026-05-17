"use client";

import React from "react";
import { Reaction } from "../../types/chat";

interface ReactionBadgeProps {
  reaction: Reaction;
  currentUserId: string;
  onToggle: (emoji: string) => void;
}

export const ReactionBadge: React.FC<ReactionBadgeProps> = ({ reaction, currentUserId, onToggle }) => {
  const iReacted = reaction.userIds.includes(currentUserId);

  return (
    <button
      onClick={() => onToggle(reaction.emoji)}
      title={iReacted ? "Remove reaction" : `React with ${reaction.emoji}`}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95"
      style={{
        background: iReacted ? "rgba(6,182,212,0.15)" : "var(--secondary)",
        border: `1.5px solid ${iReacted ? "rgba(6,182,212,0.5)" : "var(--border)"}`,
        color: "var(--foreground)",
        animation: "reactionBadgeIn 0.2s ease-out",
      }}
    >
      <span style={{ fontSize: "14px", lineHeight: 1 }}>{reaction.emoji}</span>
      {reaction.count > 1 && (
        <span style={{ color: iReacted ? "var(--primary)" : "var(--muted-foreground)", fontSize: "11px" }}>
          {reaction.count}
        </span>
      )}
    </button>
  );
};
