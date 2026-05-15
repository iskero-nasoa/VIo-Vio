"use client";

import { useAuthStore } from '../../store/authStore';

export default function EmojiReactions({ reactions = [], onReact }) {
  const { user } = useAuthStore();
  const currentUserId = user?.userId || user?.id;

  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="reactions-container">
      {reactions.map((reaction, idx) => {
        const hasReacted = reaction.userIds.some(id => id === currentUserId || id._id === currentUserId);
        
        return (
          <button
            key={idx}
            onClick={() => onReact && onReact(reaction.emoji)}
            className={`reaction-badge ${hasReacted ? 'active' : ''}`}
            title={reaction.userIds.map(u => u.username || u).join(', ')} // Simple hover tooltip
          >
            <span>{reaction.emoji}</span>
            <span className={`font-semibold ${hasReacted ? 'text-primary' : 'text-slate-500'}`}>
              {reaction.userIds.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}
