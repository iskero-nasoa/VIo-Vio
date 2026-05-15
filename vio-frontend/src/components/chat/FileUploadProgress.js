"use client";

import { X, FileText, Loader2 } from 'lucide-react';
import { formatFileSize, getFileIcon } from '../../utils/fileHelpers';

export default function FileUploadProgress({ uploadingFiles = [], onCancel }) {
  if (uploadingFiles.length === 0) return null;

  return (
    <div className="space-y-3 mb-4 animate-slide-in">
      {uploadingFiles.map((file, idx) => {
        const Icon = getFileIcon(file.name);
        return (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Icon size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate pr-4">
                  {file.name}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {file.progress}%
                </span>
              </div>
              
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${file.progress}%` }}
                />
              </div>
            </div>

            <button 
              onClick={() => onCancel(file.name)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
