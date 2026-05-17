"use client";

import React, { useState } from "react";
import { Hash, Plus, MoreVertical, Edit3, Trash2, X, Check, Loader2, MessageSquare } from "lucide-react";
import { Topic } from "../../types/chat";
import { api } from "../../utils/api";

interface TopicSidebarProps {
  groupId: string;
  topics: Topic[];
  activeTopicId: string | null;
  onSelectTopic: (topicId: string) => void;
  isAdmin: boolean;
  onTopicsChanged: () => void;
  isSupergroup?: boolean;
}

export const TopicSidebar: React.FC<TopicSidebarProps> = ({
  groupId,
  topics,
  activeTopicId,
  onSelectTopic,
  isAdmin,
  onTopicsChanged,
  isSupergroup,
}) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newTopicName.trim()) return;
    setCreating(true);
    try {
      let topic;
      if (isSupergroup) {
        topic = await api.createSupergroupTopic(groupId, newTopicName.trim());
      } else {
        topic = await api.createTopic(groupId, newTopicName.trim());
      }
      onTopicsChanged();
      setNewTopicName("");
      setShowCreate(false);
      onSelectTopic(topic._id);
    } catch (error) {
      console.error("Failed to create topic", error);
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (topicId: string) => {
    if (!editName.trim()) return;
    try {
      if (isSupergroup) {
        await api.updateSupergroupTopic(groupId, topicId, { name: editName.trim() });
      } else {
        await api.updateTopic(groupId, topicId, { name: editName.trim() });
      }
      onTopicsChanged();
      setEditingId(null);
    } catch (error) {
      console.error("Failed to rename topic", error);
    }
  };

  const handleDelete = async (topicId: string) => {
    if (!window.confirm("Удалить топик? Все сообщения будут удалены.")) return;
    try {
      if (isSupergroup) {
        await api.deleteSupergroupTopic(groupId, topicId);
      } else {
        await api.deleteTopic(groupId, topicId);
      }
      onTopicsChanged();
      if (activeTopicId === topicId && topics.length > 1) {
        const remaining = topics.filter((t) => t._id !== topicId);
        if (remaining.length > 0) onSelectTopic(remaining[0]._id);
      }
    } catch (error) {
      console.error("Failed to delete topic", error);
    }
  };

  return (
    <div className="w-56 border-r border-border bg-card/50 flex flex-col shrink-0 h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Топики</h3>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="text-muted-foreground hover:text-primary p-1 transition-colors"
          >
            {showCreate ? <X size={16} /> : <Plus size={16} />}
          </button>
        )}
      </div>

      {/* Create topic form */}
      {showCreate && (
        <div className="p-2 border-b border-border space-y-2">
          <input
            type="text"
            placeholder="Название топика..."
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            maxLength={50}
            className="w-full px-3 py-2 bg-secondary text-foreground rounded-lg border border-border focus:border-primary outline-none text-xs transition-all"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newTopicName.trim()}
            className="w-full px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-1"
          >
            {creating ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Создать
          </button>
        </div>
      )}

      {/* Topic list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {topics.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <MessageSquare size={20} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">Нет топиков</p>
          </div>
        ) : (
          topics.map((topic) => {
            const isActive = topic._id === activeTopicId;
            const lastMsg = topic.messages?.[topic.messages.length - 1];

            return (
              <div key={topic._id} className="relative group">
                {editingId === topic._id ? (
                  <div className="flex items-center gap-1 p-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 bg-secondary text-foreground rounded-lg border border-border focus:border-primary outline-none text-xs"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleRename(topic._id)}
                    />
                    <button onClick={() => handleRename(topic._id)} className="text-primary p-1">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-muted-foreground p-1">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => onSelectTopic(topic._id)}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary/10 text-primary border-l-2 border-l-primary"
                        : "hover:bg-secondary/50 border-l-2 border-l-transparent"
                    }`}
                  >
                    <Hash size={14} className={isActive ? "text-primary" : "text-muted-foreground"} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{topic.name}</p>
                      {lastMsg && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {lastMsg.text || "Вложение"}
                        </p>
                      )}
                    </div>

                    {/* Admin menu trigger */}
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuId(menuId === topic._id ? null : topic._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground p-0.5 transition-all"
                      >
                        <MoreVertical size={12} />
                      </button>
                    )}
                  </div>
                )}

                {/* Dropdown menu */}
                {menuId === topic._id && (
                  <div className="absolute right-2 top-full z-50 bg-card border border-border rounded-xl shadow-xl py-1 w-36 animate-fadeIn">
                    <button
                      onClick={() => {
                        setEditingId(topic._id);
                        setEditName(topic.name);
                        setMenuId(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-secondary flex items-center gap-2 transition-colors"
                    >
                      <Edit3 size={12} />
                      Переименовать
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(topic._id);
                        setMenuId(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-red-500/10 text-red-500 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 size={12} />
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
