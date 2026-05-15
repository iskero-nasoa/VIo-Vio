"use client";

export default function UnreadBadge({ count, className = "" }) {
  if (!count || count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count;

  return (
    <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white dark:border-slate-900 shadow-sm ${className}`}>
      {displayCount}
    </span>
  );
}
