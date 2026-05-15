"use client";

import { File, PlayCircle, Download } from 'lucide-react';

export default function AttachmentPreview({ attachments = [] }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((attachment, idx) => {
        const { type, url, filename, size } = attachment;

        if (type.startsWith('image/')) {
          return (
            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block w-48 h-48 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-90 transition-opacity">
              <img src={url} alt={filename} className="w-full h-full object-cover" />
            </a>
          );
        }

        if (type.startsWith('video/')) {
          return (
            <div key={idx} className="relative w-48 h-48 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900">
              <video src={url} className="w-full h-full object-cover opacity-70" />
              <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center text-white hover:text-primary transition-colors">
                <PlayCircle size={48} />
              </a>
            </div>
          );
        }

        if (type.startsWith('audio/')) {
          return (
            <div key={idx} className="w-full max-w-sm bg-white/10 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <audio controls src={url} className="w-full h-10" />
            </div>
          );
        }

        // Generic File
        return (
          <a 
            key={idx} 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary/50 transition-colors w-full max-w-xs"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <File size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">{filename}</p>
              <p className="text-xs text-slate-500">{size ? (size / 1024).toFixed(1) + ' KB' : 'File'}</p>
            </div>
            <Download size={16} className="text-slate-400" />
          </a>
        );
      })}
    </div>
  );
}
