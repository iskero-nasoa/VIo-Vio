"use client";

export default function TypingIndicator({ typingUsers = [] }) {
  if (typingUsers.length === 0) return null;

  let text = '';
  if (typingUsers.length === 1) {
    text = `${typingUsers[0]} is typing`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0]} and ${typingUsers[1]} are typing`;
  } else {
    text = `${typingUsers[0]} and ${typingUsers.length - 1} others are typing`;
  }

  return (
    <div className="absolute -top-6 left-6 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 animate-slide-in">
      <span className="mr-1">{text}</span>
      <span className="flex space-x-0.5 ml-1">
        <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </span>
    </div>
  );
}
