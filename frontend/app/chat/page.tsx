"use client";

import { MessageSquareDashed } from "lucide-react";

export default function ChatEmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto">
          <MessageSquareDashed className="w-10 h-10 text-slate-600" />
        </div>
        <p className="text-slate-500 text-sm font-medium">Select a chat to start messaging</p>
      </div>
    </div>
  );
}
