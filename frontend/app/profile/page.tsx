"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { ProfileCard } from "../../components/Profile/ProfileCard";
import { EditProfileModal } from "../../components/Profile/EditProfileModal";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MyProfilePage() {
  const { user, updateUser } = useAuth();
  const { profile, loading, error, getProfile, updateProfile, uploadAvatar } = useProfile();
  const [showEditModal, setShowEditModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // Fetch profile on mount
  useEffect(() => {
    if (user?.id) {
      getProfile(user.id);
    }
  }, [user?.id, getProfile]);

  const handleSaveProfile = async (data: any) => {
    try {
      const updated = await updateProfile(data);
      if (updated) {
        updateUser(updated); // Update global context
        setShowEditModal(false);
        setSuccessMessage("Профиль успешно обновлен!");
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const res = await uploadAvatar(file);
      if (res && res.avatar) {
        updateUser({ avatar: res.avatar });
        return res;
      }
    } catch (err) {
      console.error("Upload error:", err);
      throw err;
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-screen">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background min-h-screen p-4 text-center">
        <p className="text-muted-foreground mb-4">Не удалось загрузить профиль</p>
        <button onClick={() => router.push('/chat')} className="text-primary hover:underline font-bold">
          Вернуться в чат
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 lg:p-12 relative min-h-screen">
      <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
        {/* Navigation */}
        <button 
          onClick={() => router.push('/chat')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Назад к чатам</span>
        </button>

        {/* Success Alert */}
        {successMessage && (
          <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 text-primary px-5 py-4 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl shadow-primary/5">
            <CheckCircle2 size={22} />
            <span className="text-sm font-black uppercase tracking-wider">{successMessage}</span>
          </div>
        )}

        {/* Profile Info */}
        <ProfileCard 
          user={profile} 
          isOwnProfile={true} 
          onEdit={() => setShowEditModal(true)} 
        />

        <div className="text-center pt-8 opacity-20 select-none">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Isko-Gram System v2.0</p>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditModal && (
        <EditProfileModal 
          user={profile}
          onSave={handleSaveProfile}
          onUploadAvatar={handleAvatarUpload}
          onClose={() => setShowEditModal(false)}
          loading={loading}
        />
      )}
    </div>
  );
}
