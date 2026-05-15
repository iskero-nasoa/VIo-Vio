"use client";

export default function ChatListItem({ chat, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
        isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold">
          {chat.chatName?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{chat.chatName}</p>
          <p className="text-xs text-gray-500 truncate">Last message preview</p>
        </div>
        {chat.unreadCount > 0 && (
          <div className="bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
            {chat.unreadCount}
          </div>
        )}
      </div>
    </div>
  );
}
