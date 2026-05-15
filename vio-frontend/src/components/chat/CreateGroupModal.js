"use client";

import { useState, useRef } from 'react';
import { X, Camera, User, Search, Loader2 } from 'lucide-react';
import { useGroupManagement } from '../../hooks/useGroupManagement';
import { validateGroupName, validateGroupDescription, validateGroupMembers } from '../../utils/groupValidators';
import MembersSearch from './MembersSearch';
import { useRouter } from 'next/navigation';

export default function CreateGroupModal({ isOpen, onClose }) {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [memberIds, setMemberIds] = useState([]);
  const [formError, setFormError] = useState(null);
  
  const router = useRouter();
  const { createGroup, isLoading } = useGroupManagement();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const nameCheck = validateGroupName(groupName);
    const descCheck = validateGroupDescription(description);
    const membersCheck = validateGroupMembers(memberIds);

    if (!nameCheck.valid) return setFormError(nameCheck.error);
    if (!descCheck.valid) return setFormError(descCheck.error);
    if (!membersCheck.valid) return setFormError(membersCheck.error);

    const result = await createGroup({
      name: groupName,
      description,
      participants: memberIds,
      avatar
    });

    if (result) {
      onClose();
      router.push(`/chat/${result._id}`);
    }
  };

  const handleMembersSelected = (ids) => {
    setMemberIds(ids);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-pop-in flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">New Group</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Create a community</p>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin">
          {formError && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-500 text-xs font-bold flex items-center gap-2 animate-shake">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              {formError}
            </div>
          )}

          {/* Avatar & Name Row */}
          <div className="flex gap-6 items-start">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-[2rem] bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center overflow-hidden transition-all group-hover:scale-105">
                {avatar ? (
                  <img src={avatar} className="w-full h-full object-cover" />
                ) : (
                  <Camera size={32} className="text-slate-300" />
                )}
              </div>
              <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg border-2 border-white dark:border-slate-900 hover:scale-110 transition-transform">
                <Plus size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Group Name</label>
                <input
                  type="text"
                  placeholder="The Cool Squad"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-primary/30 outline-none transition-all font-bold text-slate-800 dark:text-slate-100"
                />
                <div className="flex justify-end text-[10px] text-slate-400 font-bold px-1">
                  {groupName.length}/50
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Description (Optional)</label>
            <textarea
              placeholder="What's this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-primary/30 outline-none transition-all text-sm resize-none scrollbar-thin"
            />
            <div className="flex justify-end text-[10px] text-slate-400 font-bold px-1">
              {description.length}/150
            </div>
          </div>

          {/* Members Search */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Add Members</label>
            <MembersSearch onMembersSelected={handleMembersSelected} />
            <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User size={12} />
              {memberIds.length} members selected
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-8 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !groupName.trim() || memberIds.length === 0}
            className="w-full py-4 bg-primary text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Plus({ size, className }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
