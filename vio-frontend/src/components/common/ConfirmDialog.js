"use client";

import { X, AlertCircle } from 'lucide-react';

export default function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  dangerMode = false 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-pop-in border border-slate-100 dark:border-slate-800">
        <div className="p-8 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${dangerMode ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'}`}>
              <AlertCircle size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{title}</h2>
          </div>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-8">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 text-white rounded-2xl font-black text-sm shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                dangerMode ? 'bg-red-500 shadow-red-500/20' : 'bg-primary shadow-primary/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
