"use client";

import React, { useEffect, useState } from "react";
import { X, Search, UserPlus, Loader2 } from "lucide-react";
import { api } from "../../utils/api";
import { UserAvatar } from "../Common/UserAvatar";
import { useRouter } from "next/navigation";

interface NewChatModalProps {
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ onClose }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateChat = async (targetUserId: string) => {
    setCreating(true);
    try {
      const chat = await api.createDirectChat(targetUserId);
      router.push(`/chat/${chat._id}`);
      onClose();
    } catch (error) {
      console.error("Failed to create chat", error);
      alert("Не удалось создать чат");
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl overflow-hidden animate-fadeIn">
        <div className="flex justify-between items-center p-5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <UserPlus size={20} />
            </div>
            <h2 className="text-lg font-bold">Начать новый чат</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              placeholder="Поиск пользователей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-10 py-2.5 bg-secondary text-foreground rounded-xl border border-border focus:border-primary outline-none text-sm transition-all"
              autoFocus
            />
          </div>
        </div>

        <div className="h-80 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
              <p className="text-sm font-medium">Пользователи не найдены</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleCreateChat(user._id)}
                  disabled={creating}
                  className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-2xl transition-all group active:scale-[0.98] disabled:opacity-50"
                >
                  <UserAvatar user={user} size="md" />
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{user.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.statusText || user.status || "Нет статуса"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {creating && (
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex items-center justify-center z-20">
            <div className="bg-card p-4 rounded-2xl shadow-xl border border-border flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm font-bold">Создание чата...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
