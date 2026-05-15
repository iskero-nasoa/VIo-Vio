"use client";

import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageViewer({ imageUrl, isOpen, onClose, filename }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      {/* Controls Overlay */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
        <h3 className="text-white font-bold text-sm truncate max-w-md">{filename || 'Image Preview'}</h3>
        <div className="flex gap-4">
          <a 
            href={imageUrl} 
            download={filename} 
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <Download size={20} />
          </a>
          <button 
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative max-w-full max-h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img 
          src={imageUrl} 
          alt="Full screen view" 
          className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-sm animate-zoom-in"
        />
      </div>
      
      {/* Navigation (Placeholder) */}
      <button className="absolute left-6 top-1/2 -translate-y-1/2 p-3 text-white/30 hover:text-white transition-all">
        <ChevronLeft size={48} />
      </button>
      <button className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-white/30 hover:text-white transition-all">
        <ChevronRight size={48} />
      </button>
    </div>
  );
}
