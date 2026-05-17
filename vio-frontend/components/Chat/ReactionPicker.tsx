"use client";

import React, { useEffect, useRef } from "react";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  isMe: boolean;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({ onSelect, onClose, isMe }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={`absolute z-50 bottom-full mb-2 ${isMe ? "right-0" : "left-0"}`}
      style={{ animation: "reactionPickerIn 0.15s ease-out" }}
    >
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-full shadow-xl border"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        }}
      >
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => { onSelect(emoji); onClose(); }}
            className="text-xl w-9 h-9 flex items-center justify-center rounded-full transition-all hover:scale-125 hover:bg-secondary active:scale-110"
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes reactionPickerIn {
          from { opacity: 0; transform: scale(0.85) translateY(4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};
