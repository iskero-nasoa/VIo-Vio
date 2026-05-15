"use client";

import { X, Play, Music, FileText } from 'lucide-react';
import { getFileType, formatFileSize } from '../../utils/fileHelpers';

export default function AttachmentPreviewGrid({ attachments = [], onRemove }) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mb-4 animate-fade-in">
      {attachments.map((att, idx) => {
        const type = getFileType(att.filename || att.name);
        const isImage = type === 'image';
        const isVideo = type === 'video';
        
        return (
          <div 
            key={att.id || idx} 
            className="relative group w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
            {/* Thumbnail Preview */}
            {isImage ? (
              <img 
                src={att.url || URL.createObjectURL(att)} 
                alt="preview" 
                className="w-full h-full object-cover" 
              />
            ) : isVideo ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white relative">
                <Play size={20} fill="currentColor" />
                <span className="absolute bottom-1 right-1 text-[8px] bg-black/50 px-1 rounded uppercase font-bold">Video</span>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                {type === 'audio' ? <Music size={24} className="text-primary" /> : <FileText size={24} className="text-indigo-500" />}
                <span className="text-[10px] text-slate-500 mt-1 truncate w-full px-1">{att.filename || att.name}</span>
              </div>
            )}

            {/* Remove Overlay */}
            <button 
              onClick={() => onRemove(idx)}
              className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
            >
              <X size={12} />
            </button>

            {/* Size Badge */}
            {att.size && (
              <div className="absolute bottom-0 inset-x-0 bg-black/20 backdrop-blur-[2px] text-white text-[8px] py-0.5 px-1 text-center font-medium">
                {formatFileSize(att.size)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
