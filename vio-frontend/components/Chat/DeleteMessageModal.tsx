"use client";

import React from "react";
import { Trash2, X } from "lucide-react";

interface DeleteMessageModalProps {
  isOpen: boolean;
  isOwner: boolean;
  loading?: boolean;
  onClose: () => void;
  onDeleteForMe: () => void;
  onDeleteForAll: () => void;
}

export const DeleteMessageModal: React.FC<DeleteMessageModalProps> = ({
  isOpen,
  isOwner,
  loading = false,
  onClose,
  onDeleteForMe,
  onDeleteForAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 w-80 mx-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-xl shrink-0">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <h2 className="font-semibold text-foreground text-sm">Delete message</h2>
          <button
            onClick={onClose}
            className="ml-auto p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          {isOwner
            ? "Choose how to delete this message:"
            : "This will hide the message from your view only."}
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onDeleteForMe}
            disabled={loading}
            className="w-full py-3 px-4 text-left rounded-xl border border-border hover:bg-secondary transition-colors disabled:opacity-50 group"
          >
            <span className="block text-sm font-medium text-foreground">Delete for me</span>
            <span className="block text-xs text-muted-foreground mt-0.5">
              Only you won't see this message
            </span>
          </button>

          {isOwner && (
            <button
              onClick={onDeleteForAll}
              disabled={loading}
              className="w-full py-3 px-4 text-left rounded-xl border border-red-500/30 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <span className="block text-sm font-medium text-red-500">Delete for everyone</span>
              <span className="block text-xs text-red-400/70 mt-0.5">
                Permanently removes for all participants
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
