"use client";

import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { validateFileSize, validateFileType } from '../../utils/fileHandlers';

export default function AvatarUpload({ currentAvatar, username, size = 'lg', onAvatarChanged }) {
  const fileInputRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const { uploadAvatar, isLoading } = useProfile(); // No userId means own profile

  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
    xl: 'w-32 h-32 text-5xl'
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type (images only)
    const typeValidation = validateFileType(file, ['image/jpeg', 'image/png', 'image/webp']);
    if (!typeValidation.valid) {
      alert(typeValidation.error);
      return;
    }

    // Validate size (max 5MB)
    const sizeValidation = validateFileSize(file, 5);
    if (!sizeValidation.valid) {
      alert(sizeValidation.error);
      return;
    }

    const newAvatarUrl = await uploadAvatar(file);
    if (newAvatarUrl && onAvatarChanged) {
      onAvatarChanged(newAvatarUrl);
    }
  };

  return (
    <div className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg, image/png, image/webp"
      />
      
      <div className={`${sizeClasses[size]} rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold overflow-hidden border-2 border-white dark:border-slate-800 shadow-md transition-transform ${isHovered && !isLoading ? 'scale-105' : ''}`}>
        {currentAvatar ? (
           <img src={currentAvatar} alt="avatar" className="w-full h-full object-cover" />
        ) : (
           <span>{username?.charAt(0).toUpperCase() || '?'}</span>
        )}
      </div>

      {/* Hover Overlay */}
      {isHovered && !isLoading && (
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center text-white transition-opacity"
          title="Change avatar"
        >
          <Camera size={size === 'sm' || size === 'md' ? 16 : 24} />
          {size !== 'sm' && size !== 'md' && <span className="text-[10px] uppercase font-bold mt-1">Change</span>}
        </button>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center text-white backdrop-blur-[1px]">
          <Loader2 className="animate-spin" size={24} />
        </div>
      )}
    </div>
  );
}
