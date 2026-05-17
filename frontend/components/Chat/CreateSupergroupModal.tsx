"use client";

import React, { useEffect, useState } from "react";
import { X, Search, Loader2, Check, Users, Globe } from "lucide-react";
import { api } from "../../utils/api";
import { UserAvatar } from "../Common/UserAvatar";
import { useRouter } from "next/navigation";

interface CreateSupergroupModalProps {
  onClose: () => void;
}

export const CreateSupergroupModal: React.FC<CreateSupergroupModalProps> = ({ onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await api.getUsers();
        setAllUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = allUsers.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const sg = await api.createSupergroup(name.trim(), description.trim(), selectedIds);
      router.push(`/chat/supergroup/${sg._id}`);
      onClose();
    } catch (error: any) {
      alert(error.message || "Не удалось создать супергруппу");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl overflow-hidden animate-fadeIn max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-border bg-secondary/30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 rounded-xl">
              <Globe size={20} />
            </div>
            <h2 className="text-lg font-bold">Новая супергруппа</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
              Название
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Проект Alpha"
              maxLength={60}
              className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl border border-border focus:border-primary outline-none text-sm transition-all"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="О чём эта супергруппа?"
              maxLength={300}
              rows={2}
              className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl border border-border focus:border-primary outline-none text-sm transition-all resize-none"
            />
          </div>

          {/* Members */}
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
              Участники ({selectedIds.length})
            </label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск..."
                className="w-full pl-10 pr-4 py-2.5 bg-secondary text-foreground rounded-xl border border-border focus:border-primary outline-none text-sm transition-all"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const selected = selectedIds.includes(user._id);
                  return (
                    <button
                      key={user._id}
                      onClick={() => toggleUser(user._id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                        selected ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/50"
                      }`}
                    >
                      <UserAvatar user={user} size="sm" />
                      <span className="text-sm font-medium flex-1 text-left truncate">{user.username}</span>
                      {selected && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check size={12} className="text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border shrink-0">
          <button
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {creating ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
            Создать супергруппу
          </button>
        </div>
      </div>
    </div>
  );
};
