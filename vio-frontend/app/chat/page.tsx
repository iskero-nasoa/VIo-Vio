"use client";

import { MessageSquare } from "lucide-react";

export default function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 select-none">
      {/* Icon bubble */}
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}
      >
        <MessageSquare
          size={36}
          style={{ color: "var(--muted-foreground)", opacity: 0.6 }}
        />
      </div>

      <div className="text-center space-y-1.5">
        <h2 className="text-xl font-bold text-foreground">VioApp Messenger</h2>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Select a conversation to start messaging
        </p>
      </div>
    </div>
  );
}
