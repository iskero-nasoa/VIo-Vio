"use client";

import { X, MessageSquare, Calendar, Info, Loader2 } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useRouter } from 'next/navigation';
import StatusIndicator from './StatusIndicator';
import { getStatusLabel } from '../../utils/statusMessages';
import Button from '../common/Button';
import api from '../../utils/api';

export default function PublicProfileModal({ userId, isOpen, onClose, onEditProfile }) {
  const { profile, isLoading, error } = useProfile(userId);
  const { user: currentUser } = useAuthStore();
  const { chats, setChats, setActiveChat } = useChatStore();
  const router = useRouter();

  if (!isOpen) return null;

  const isOwnProfile = currentUser && (currentUser.userId === userId || currentUser.id === userId);

  const handleStartChat = async () => {
    try {
      // Find existing chat
      let existingChat = chats.find(c => 
        c.chatType === 'direct' && c.members.some(m => m._id === userId)
      );

      if (!existingChat) {
        // Create new direct chat
        const response = await api.post('/chats/direct', { recipientId: userId });
        existingChat = response.data;
        setChats([existingChat, ...chats]);
      }

      setActiveChat(existingChat);
      onClose();
    } catch (err) {
      console.error('Failed to start chat', err);
      alert('Could not start chat');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden relative">
        
        {/* Close Button overlay */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-colors z-10 text-slate-800 dark:text-white"
        >
          <X size={20} />
        </button>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : error || !profile ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500">
            <Info size={32} className="mb-2 opacity-50" />
            <p>{error || 'User not found'}</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Header / Avatar block */}
            <div className="bg-slate-50 dark:bg-slate-800 pt-8 pb-6 px-6 flex flex-col items-center border-b border-slate-200 dark:border-slate-700">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-4xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-lg">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{profile.username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="absolute bottom-1 right-1">
                  <StatusIndicator status={profile.status} size="lg" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{profile.username}</h2>
              <p className="text-sm text-slate-500 font-medium">{getStatusLabel(profile.status)}</p>
            </div>

            {/* Info Body */}
            <div className="p-6 space-y-5">
              
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bio</h4>
                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium break-words">
                  {profile.statusMessage || <span className="text-slate-400 italic">No bio provided</span>}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar size={16} />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' })}</span>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                {isOwnProfile ? (
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    onClick={() => {
                      onClose();
                      if (onEditProfile) onEditProfile();
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button 
                    className="w-full flex items-center justify-center gap-2" 
                    onClick={handleStartChat}
                  >
                    <MessageSquare size={18} />
                    Message
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
