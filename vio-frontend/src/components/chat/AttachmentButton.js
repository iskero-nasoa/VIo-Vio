"use client";

import { useState, useRef } from 'react';
import { Paperclip, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import { validateFileSize, validateFileType } from '../../utils/fileHandlers';

export default function AttachmentButton({ onAttachmentsSelected }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Allowed types for the picker
    const allowedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt'];
    const maxSizeMB = 50; // max size in MB for general files
    
    const validFiles = [];
    for (const file of files) {
      const sizeValidation = validateFileSize(file, maxSizeMB);
      if (!sizeValidation.valid) {
        alert(`${file.name}: ${sizeValidation.error}`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    const uploadedAttachments = [];

    try {
      // For this curriculum, we simulate or execute actual upload
      // Promise.all to upload concurrently
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const res = await api.post('/messages/attachment/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          return res.data.attachment; // assuming backend returns { attachment: { url, type, filename, size } }
        } catch (err) {
          console.error('Upload failed for', file.name, err);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      results.forEach(res => {
        if (res) uploadedAttachments.push(res);
      });

      if (uploadedAttachments.length > 0) {
        onAttachmentsSelected(uploadedAttachments);
      }
    } catch (error) {
      console.error('Upload process failed', error);
      alert('Failed to upload some files');
    } finally {
      setUploading(false);
      // reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
      <button 
        type="button" 
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="p-3 text-slate-400 hover:text-primary transition-colors disabled:opacity-50"
        title="Attach file"
      >
        {uploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
      </button>
    </div>
  );
}
