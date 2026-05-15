"use client";

import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import ChatList from './ChatList';

export default function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{user?.username}</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Search chats..."
          className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none"
        />
      </div>

      {/* Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        <button className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-600">
          New Chat
        </button>
        <button className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">
          Group
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <ChatList />
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
