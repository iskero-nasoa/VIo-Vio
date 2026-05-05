"use client";

import React, { useState, useRef } from "react";
import { User } from "../../types/chat";
import { Save, X, Loader2, Camera, Upload } from "lucide-react";

interface EditProfileModalProps {
  user: User;
  onSave: (data: any) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<any>;
  onClose: () => void;
  loading: boolean;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
  user, 
  onSave, 
  onUploadAvatar,
  onClose, 
  loading 
}) => {
  const [formData, setFormData] = useState({
    description: user.description || "",
    statusText: user.statusText || "",
    phone: user.phone || "",
    status: user.status || "online",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File too large (max 5MB)");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);

      setIsUploading(true);
      try {
        await onUploadAvatar(file);
      } catch (err) {
        setAvatarPreview(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const fileBaseUrl = apiUrl.replace(/\/api$/, "");
  const currentAvatarUrl = avatarPreview || (user.avatar ? `${fileBaseUrl}${user.avatar}` : null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-3xl overflow-hidden animate-fadeIn">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group w-24 h-24 sm:w-32 sm:h-32">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-secondary border border-border shadow-md relative">
                {currentAvatarUrl ? (
                  <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Upload size={32} />
                  </div>
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg hover:bg-primary/90 transition-all active:scale-95 z-10"
              >
                <Camera size={20} />
              </button>

              {user.avatar && !avatarPreview && (
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm("Удалить фото профиля?")) {
                      await onSave({ ...formData, avatar: null });
                      onClose();
                    }
                  }}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all active:scale-95 z-10"
                  title="Удалить аватар"
                >
                  <X size={14} />
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
              Upload New Avatar
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm"
              >
                <option value="online">Online</option>
                <option value="away">Away</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                Status Message
              </label>
              <input
                type="text"
                value={formData.statusText}
                onChange={(e) => setFormData({ ...formData, statusText: e.target.value })}
                placeholder="What's happening?"
                maxLength={64}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm placeholder:text-muted-foreground"
              />
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-muted-foreground">{formData.statusText.length}/64</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                Bio
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                maxLength={200}
                placeholder="Tell us about yourself..."
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm placeholder:text-muted-foreground resize-none"
              />
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-muted-foreground">{formData.description.length}/200</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </form>

        <div className="p-6 bg-secondary/50 border-t border-border flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-muted text-foreground hover:bg-muted/80 rounded-xl transition-all font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || isUploading}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all font-semibold text-sm shadow-lg shadow-primary/20"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
