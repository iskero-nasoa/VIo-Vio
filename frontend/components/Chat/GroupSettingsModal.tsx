"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Search,
  UserPlus,
  Loader2,
  Shield,
  LogOut,
  Trash2,
  Edit3,
  Check,
  UserMinus,
  Hash,
  Plus,
  MessageSquare,
} from "lucide-react";
import { api } from "../../utils/api";
import { UserAvatar } from "../Common/UserAvatar";
import { Group, Topic } from "../../types/chat";
import { useRouter } from "next/navigation";

interface GroupSettingsModalProps {
  group: Group;
  currentUserId: string;
  isAdmin: boolean;
  onClose: () => void;
  onGroupUpdated: () => void;
}

export const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  group,
  currentUserId,
  isAdmin,
  onClose,
  onGroupUpdated,
}) => {
  const [tab, setTab] = useState<"info" | "members" | "add" | "topics">("info");
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [saving, setSaving] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [creatingTopic, setCreatingTopic] = useState(false);
  const router = useRouter();

  const adminId = typeof group.admin === "string" ? group.admin : group.admin._id;

  // Fetch users for "add member" tab
  useEffect(() => {
    if (tab === "add") {
      const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
          const data = await api.getUsers();
          const memberIds = new Set(group.members.map((m) => m._id));
          setAllUsers(data.filter((u: any) => !memberIds.has(u._id)));
        } catch (error) {
          console.error("Failed to fetch users", error);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [tab, group.members]);

  // Fetch topics
  useEffect(() => {
    if (tab === "topics") {
      const fetchTopics = async () => {
        setLoadingTopics(true);
        try {
          const data = await api.getTopics(group._id);
          setTopics(data);
        } catch (error) {
          console.error("Failed to fetch topics", error);
        } finally {
          setLoadingTopics(false);
        }
      };
      fetchTopics();
    }
  }, [tab, group._id]);

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) return;
    setCreatingTopic(true);
    try {
      await api.createTopic(group._id, newTopicName.trim());
      const data = await api.getTopics(group._id);
      setTopics(data);
      setNewTopicName("");
    } catch (error) {
      console.error("Failed to create topic", error);
    } finally {
      setCreatingTopic(false);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!window.confirm("Удалить топик и все его сообщения?")) return;
    try {
      await api.deleteTopic(group._id, topicId);
      setTopics((prev) => prev.filter((t) => t._id !== topicId));
    } catch (error) {
      console.error("Failed to delete topic", error);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim() || name === group.name) {
      setEditingName(false);
      return;
    }
    setSaving(true);
    try {
      await api.updateGroup(group._id, { name: name.trim() });
      onGroupUpdated();
      setEditingName(false);
    } catch (error) {
      console.error("Failed to update group name", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDescription = async () => {
    if (description === (group.description || "")) {
      setEditingDesc(false);
      return;
    }
    setSaving(true);
    try {
      await api.updateGroup(group._id, { description: description.trim() });
      onGroupUpdated();
      setEditingDesc(false);
    } catch (error) {
      console.error("Failed to update group description", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.addGroupMember(group._id, userId);
      onGroupUpdated();
      // Remove from available users list
      setAllUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("Failed to add member", error);
      alert("Не удалось добавить участника");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm("Удалить участника из группы?")) return;
    setActionLoading(memberId);
    try {
      await api.removeGroupMember(group._id, memberId);
      onGroupUpdated();
    } catch (error) {
      console.error("Failed to remove member", error);
      alert("Не удалось удалить участника");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Вы уверены, что хотите выйти из группы?")) return;
    try {
      await api.leaveGroup(group._id);
      router.push("/chat");
      onClose();
    } catch (error: any) {
      alert(error.message || "Не удалось выйти из группы");
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("Вы уверены? Все сообщения будут удалены навсегда!")) return;
    try {
      await api.deleteGroup(group._id);
      router.push("/chat");
      onClose();
    } catch (error) {
      console.error("Failed to delete group", error);
      alert("Не удалось удалить группу");
    }
  };

  const filteredUsers = allUsers.filter((u) =>
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
      <div className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-3xl overflow-hidden animate-fadeIn max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-border bg-secondary/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shrink-0">
              <Hash size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-none">{group.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {group.members.length} участников
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
          {(["info", "members", "topics", ...(isAdmin ? ["add"] : [])] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
                tab === t
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "info" && "Инфо"}
              {t === "members" && "Участники"}
              {t === "topics" && "Топики"}
              {t === "add" && "Добавить"}
              {tab === t && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* ─── Info Tab ─── */}
          {tab === "info" && (
            <div className="p-5 space-y-5">
              {/* Group Name */}
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
                  Название группы
                </label>
                {editingName && isAdmin ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={50}
                      className="flex-1 px-3 py-2 bg-secondary text-foreground rounded-xl border border-border focus:border-primary outline-none text-sm transition-all"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={saving}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    </button>
                    <button
                      onClick={() => { setEditingName(false); setName(group.name); }}
                      className="px-3 py-2 bg-secondary text-foreground rounded-xl hover:bg-muted transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-secondary/50 px-4 py-3 rounded-xl">
                    <span className="text-sm font-medium">{group.name}</span>
                    {isAdmin && (
                      <button
                        onClick={() => setEditingName(true)}
                        className="text-muted-foreground hover:text-primary p-1 transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
                  Описание
                </label>
                {editingDesc && isAdmin ? (
                  <div className="space-y-2">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={200}
                      rows={3}
                      className="w-full px-3 py-2 bg-secondary text-foreground rounded-xl border border-border focus:border-primary outline-none text-sm transition-all resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setEditingDesc(false); setDescription(group.description || ""); }}
                        className="px-3 py-1.5 bg-secondary text-foreground rounded-lg text-xs hover:bg-muted transition-all"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleSaveDescription}
                        disabled={saving}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs hover:bg-primary/90 transition-all"
                      >
                        {saving ? "Сохранение..." : "Сохранить"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between bg-secondary/50 px-4 py-3 rounded-xl">
                    <span className="text-sm text-muted-foreground">
                      {group.description || "Нет описания"}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => setEditingDesc(true)}
                        className="text-muted-foreground hover:text-primary p-1 transition-colors shrink-0 ml-2"
                      >
                        <Edit3 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Created date */}
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
                  Создана
                </label>
                <div className="bg-secondary/50 px-4 py-3 rounded-xl">
                  <span className="text-sm text-muted-foreground">
                    {new Date(group.createdAt).toLocaleDateString("ru-RU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-3 space-y-2 border-t border-border">
                {!isAdmin && (
                  <button
                    onClick={handleLeaveGroup}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all text-sm font-bold"
                  >
                    <LogOut size={18} />
                    Выйти из группы
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={handleDeleteGroup}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all text-sm font-bold"
                  >
                    <Trash2 size={18} />
                    Удалить группу
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ─── Members Tab ─── */}
          {tab === "members" && (
            <div className="p-2 space-y-1">
              {group.members.map((member) => {
                const isMemberAdmin = member._id === adminId;
                const isCurrentUser = member._id === currentUserId;

                return (
                  <div
                    key={member._id}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary/50 transition-all group"
                  >
                    <UserAvatar user={member} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm truncate">
                          {member.username}
                          {isCurrentUser && (
                            <span className="text-muted-foreground font-normal ml-1">(вы)</span>
                          )}
                        </p>
                        {isMemberAdmin && (
                          <span className="flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold shrink-0">
                            <Shield size={10} />
                            Админ
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.status === "online" ? "Online" : "Offline"}
                      </p>
                    </div>

                    {/* Remove button (admin only, can't remove self/admin) */}
                    {isAdmin && !isMemberAdmin && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        disabled={actionLoading === member._id}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 p-2 transition-all"
                        title="Удалить из группы"
                      >
                        {actionLoading === member._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <UserMinus size={16} />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── Add Members Tab (Admin only) ─── */}
          {tab === "add" && (
            <>
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

              <div className="p-2 space-y-1">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <p className="text-sm font-medium">
                      {searchQuery ? "Никого не найдено" : "Все пользователи уже в группе"}
                    </p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary/50 transition-all"
                    >
                      <UserAvatar user={user} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{user.username}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.statusText || user.status || "Нет статуса"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddMember(user._id)}
                        disabled={actionLoading === user._id}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {actionLoading === user._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <UserPlus size={14} />
                            Добавить
                          </>
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* ─── Topics Tab ─── */}
          {tab === "topics" && (
            <div className="p-4 space-y-3">
              {/* Create topic form (admin only) */}
              {isAdmin && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Название нового топика..."
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    maxLength={50}
                    className="flex-1 px-3 py-2 bg-secondary text-foreground rounded-xl border border-border focus:border-primary outline-none text-sm transition-all"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateTopic()}
                  />
                  <button
                    onClick={handleCreateTopic}
                    disabled={creatingTopic || !newTopicName.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center gap-1.5"
                  >
                    {creatingTopic ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Создать
                  </button>
                </div>
              )}

              {loadingTopics ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : topics.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <MessageSquare size={28} className="mb-2 opacity-50" />
                  <p className="text-sm font-medium">Нет топиков</p>
                  <p className="text-xs mt-1">
                    {isAdmin ? "Создайте первый топик выше" : "Администратор пока не создал топики"}
                  </p>
                </div>
              ) : (
                topics.map((topic) => (
                  <div
                    key={topic._id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Hash size={14} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{topic.name}</p>
                      {topic.description && (
                        <p className="text-[10px] text-muted-foreground truncate">{topic.description}</p>
                      )}
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteTopic(topic._id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 p-2 transition-all"
                        title="Удалить топик"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
