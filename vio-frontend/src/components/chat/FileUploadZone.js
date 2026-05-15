"use client";

import { useState, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

export default function FileUploadZone({ onFilesSelected, acceptedTypes = '*', maxSize = 50 * 1024 * 1024 }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFilesSelected(Array.from(files));
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      onFilesSelected(Array.from(files));
      // Reset input so the same file can be picked again
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
        isDragging 
          ? 'border-primary bg-primary/5 scale-[1.02]' 
          : 'border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/30'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
        accept={acceptedTypes}
      />
      
      <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
        <Upload size={32} />
      </div>
      
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
        {isDragging ? 'Drop files now' : 'Drag files here or click to select'}
      </p>
      <p className="text-xs text-slate-500">
        Max size {maxSize / (1024 * 1024)}MB per file
      </p>
    </div>
  );
}
