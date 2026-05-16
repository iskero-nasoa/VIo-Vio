"use client";

import React, { useEffect, useState } from "react";
import { X, Search, Users, Loader2, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { api } from "../../utils/api";
import { UserAvatar } from "../Common/UserAvatar";
import { useRouter } from "next/navigation";

interface CreateGroupModalProps {
  onClose: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
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

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUserIds.size === 0) return;
    setCreating(true);
    try {
      const group = await api.createGroup(
        groupName.trim(),
        groupDescription.trim(),
        Array.from(selectedUserIds)
      );
      router.push(`/chat/group/${group._id}`);
      onClose();
    } catch (error) {
      console.error("Failed to create group", error);
      alert("Не удалось создать группу");
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUsers = users.filter((u) => selectedUserIds.has(u._id));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="text-muted-foreground hover:text-foreground p-1 transition-colors mr-1"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Users size={20} />
            </div>
            <h2 className="text-lg font-bold">
              {step === 1 ? "Новая группа" : "Добавить участников"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {step === 1 ? (
          /* ─── Step 1: Group Info ─── */
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Название группы *
              </label>
              <input
                type="text"
                placeholder="Введите название..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={50}
                className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl border border-border focus:border-primary outline-none text-sm transition-all"
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                {groupName.length}/50
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Описание
              </label>
              <textarea
                placeholder="Описание группы (необязательно)..."
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                maxLength={200}
                rows={3}
                className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl border border-border focus:border-primary outline-none text-sm transition-all resize-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                {groupDescription.length}/200
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!groupName.trim()}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Далее
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* ─── Step 2: Select Members ─── */
          <>
            {/* Selected members preview */}
            {selectedUsers.length > 0 && (
              <div className="px-4 pt-3 pb-1 flex gap-2 flex-wrap">
                {selectedUsers.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => toggleUser(u._id)}
                    className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-bold hover:bg-primary/20 transition-all group"
                  >
                    <span>{u.username}</span>
                    <X size={12} className="opacity-50 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}

            {/* Search */}
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

            {/* User List */}
            <div className="h-64 overflow-y-auto custom-scrollbar">
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
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUserIds.has(user._id);
                    return (
                      <button
                        key={user._id}
                        onClick={() => toggleUser(user._id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group active:scale-[0.98] ${
                          isSelected
                            ? "bg-primary/10 border border-primary/30"
                            : "hover:bg-secondary border border-transparent"
                        }`}
                      >
                        <UserAvatar user={user} size="md" />
                        <div className="flex-1 text-left">
                          <p className={`font-bold text-sm transition-colors ${isSelected ? "text-primary" : "group-hover:text-primary"}`}>
                            {user.username}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.statusText || user.status || "Нет статуса"}
                          </p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-border"
                          }`}
                        >
                          {isSelected && <Check size={14} className="text-primary-foreground" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Create Button */}
            <div className="p-4 border-t border-border">
              <button
                onClick={handleCreate}
                disabled={selectedUserIds.size === 0 || creating}
                className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Users size={18} />
                    Создать группу ({selectedUserIds.size} участников)
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Creating overlay */}
        {creating && (
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex items-center justify-center z-20">
            <div className="bg-card p-4 rounded-2xl shadow-xl border border-border flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm font-bold">Создание группы...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
