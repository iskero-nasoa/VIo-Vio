"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useProfile } from '../../hooks/useProfile';
import AvatarUpload from './AvatarUpload';
import StatusIndicator from './StatusIndicator';
import { Mail, Phone, Calendar, Clock, Edit2, Check, Loader2, Info } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

export default function ProfileTab() {
  const { user } = useAuthStore();
  const { updateProfile, isLoading, error } = useProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync state with user data
  useEffect(() => {
    if (user) {
      setPhoneNumber(user.phoneNumber || '');
      setStatusMessage(user.statusMessage || '');
    }
  }, [user, isEditing]);

  const handleSave = async () => {
    if (statusMessage.length > 150) {
      alert('Status message must be under 150 characters');
      return;
    }

    const success = await updateProfile({ phoneNumber, statusMessage });
    if (success) {
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in p-1">
      
      {/* Header / Avatar */}
      <div className="flex flex-col items-center justify-center space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="relative">
          <AvatarUpload currentAvatar={user.avatar} username={user.username} size="xl" />
          <div className="absolute bottom-1 right-1">
            <StatusIndicator status={user.status} size="lg" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{user.username}</h2>
          <p className="text-sm text-slate-500">{getStatusLabel(user.status)}</p>
        </div>
      </div>

      {/* Error / Success Messages */}
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
      {successMsg && <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">{successMsg}</div>}

      {/* Info Fields */}
      <div className="space-y-4">
        
        {/* Email (Read-only) */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0">
            <Mail size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Email Address</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user.email}</p>
          </div>
        </div>

        {/* Status Message / Bio */}
        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl group transition-colors">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0 mt-1">
            <Info size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-0.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bio / Status</p>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 size={14} />
                </button>
              )}
            </div>
            {isEditing ? (
              <div>
                <textarea 
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                  rows="2"
                  maxLength={150}
                  placeholder="Hey there! I am using VioApp."
                />
                <div className="text-right text-[10px] text-slate-400 mt-1">{statusMessage.length}/150</div>
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 break-words">
                {user.statusMessage || <span className="text-slate-400 italic">No bio set</span>}
              </p>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl group transition-colors">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0">
            <Phone size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-0.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</p>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 size={14} />
                </button>
              )}
            </div>
            {isEditing ? (
              <input 
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-1.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="+1 (555) 000-0000"
              />
            ) : (
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {user.phoneNumber || <span className="text-slate-400 italic">Not set</span>}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Read-only Meta */}
      <div className="flex justify-between px-2 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar size={14} />
          <span>Joined {new Date(user.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Actions */}
      {isEditing && (
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => {
            setIsEditing(false);
            setPhoneNumber(user.phoneNumber || '');
            setStatusMessage(user.statusMessage || '');
          }}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}

// Local helper to avoid importing from statusMessages just for label
function getStatusLabel(status) {
  if (!status) return 'Offline';
  const labels = { online: 'Online', offline: 'Offline', away: 'Away' };
  return labels[status.toLowerCase()] || 'Offline';
}
