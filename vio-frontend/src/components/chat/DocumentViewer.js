"use client";

import { FileText, Download, ExternalLink } from 'lucide-react';
import { formatFileSize } from '../../utils/fileHelpers';

export default function DocumentViewer({ documentUrl, filename, size }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm group hover:border-primary/30 transition-colors shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
        <FileText size={24} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate mb-0.5">{filename}</h4>
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
          {size ? formatFileSize(size) : 'Document'}
        </p>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a 
          href={documentUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors"
          title="Open in new tab"
        >
          <ExternalLink size={18} />
        </a>
        <a 
          href={documentUrl} 
          download={filename}
          className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors"
          title="Download"
        >
          <Download size={18} />
        </a>
      </div>
    </div>
  );
}
