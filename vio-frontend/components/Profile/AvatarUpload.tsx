import React, { useState, useRef } from "react";
import { Camera, Loader2, Upload } from "lucide-react";

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (file: File) => Promise<any>;
  loading?: boolean;
  error?: string | null;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentAvatar, onUpload, loading, error }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File too large (max 5MB)");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        await onUpload(file);
      } catch (err) {
        setPreview(null);
      }
    }
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const fileBaseUrl = apiUrl.replace(/\/api$/, "");
  const displayUrl = preview || (currentAvatar ? `${fileBaseUrl}${currentAvatar}` : null);

  return (
    <div className="relative group w-32 h-32 mx-auto">
      <div className="w-full h-full rounded-3xl overflow-hidden bg-slate-800 border-4 border-slate-900 shadow-xl relative">
        {displayUrl ? (
          <img src={displayUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <Upload size={32} />
          </div>
        )}
        
        {loading && (
          <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="absolute -bottom-2 -right-2 p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl shadow-lg transition-all active:scale-90 group-hover:scale-110"
      >
        <Camera size={20} />
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      {error && <p className="text-red-500 text-xs mt-2 text-center font-medium animate-pulse">{error}</p>}
    </div>
  );
};
