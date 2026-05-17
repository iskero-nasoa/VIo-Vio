"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProfile } from "../../../hooks/useProfile";
import { ProfileCard } from "../../../components/Profile/ProfileCard";
import { Loader2, ArrowLeft } from "lucide-react";
import { api } from "../../../utils/api";

export default function UserProfilePage() {
  const { userId } = useParams();
  const { profile, loading, getProfile } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      getProfile(userId as string);
    }
  }, [userId, getProfile]);

  const handleSendMessage = async () => {
    if (!profile) return;
    try {
      const chat = await api.createDirectChat(profile._id);
      router.push(`/chat/${chat._id}`);
    } catch (error) {
      console.error("Failed to start chat", error);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-500">
        <p className="text-xl">User not found</p>
        <button onClick={() => router.back()} className="mt-4 text-indigo-400 hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 custom-scrollbar p-6 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group mb-4"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        <ProfileCard 
          user={profile} 
          isOwnProfile={false} 
          onSendMessage={handleSendMessage} 
        />
      </div>
    </div>
  );
}
