"use client";

import { useState } from 'react';
import { X, Settings, Users, Hash, Trash2, Camera, Loader2, Save } from 'lucide-react';
import { useGroupManagement } from '../../hooks/useGroupManagement';
import { useAuthStore } from '../../store/authStore';
import MembersList from './MembersList';
import TopicsList from './TopicsList';
import MembersSearch from './MembersSearch';

export default function GroupSettingsModal({ chat, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('general');
  const [name, setName] = useState(chat?.name || '');
  const [description, setDescription] = useState(chat?.description || '');
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useAuthStore();
  const { updateGroup, removeMember, addMembers, deleteTopic, updateTopic, addTopic } = useGroupManagement();

  if (!isOpen || !chat) return null;

  const isAdmin = chat.participants.find(p => p._id === user?.userId)?.role === 'admin';

  const handleUpdateGeneral = async () => {
    setIsSaving(true);
    await updateGroup(chat._id, { name, description });
    setIsSaving(false);
  };

  const handleAddMembers = async (memberIds) => {
    await addMembers(chat._id, memberIds);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl animate-pop-in flex flex-col h-[80vh]">
        
        {/* Sidebar Tabs */}
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Group Settings</h3>
            {[
              { id: 'general', label: 'General', icon: Settings },
              { id: 'members', label: 'Members', icon: Users },
              ...(chat.isSupergroup ? [{ id: 'topics', label: 'Topics', icon: Hash }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}

            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
              <button className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all w-full">
                <Trash2 size={18} />
                Delete Group
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h4 className="font-black text-xl text-slate-800 dark:text-slate-100 capitalize">{activeTab} Settings</h4>
              <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
              {activeTab === 'general' && (
                <div className="space-y-8 max-w-lg">
                  <div className="flex items-center gap-8">
                    <div className="relative group cursor-pointer">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden">
                        {chat.avatar ? <img src={chat.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Camera size={48} /></div>}
                      </div>
                      <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-black text-slate-800 dark:text-slate-100">Group Image</h5>
                      <p className="text-xs text-slate-500 mt-1">Recommended: 500x500px JPG/PNG</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        disabled={!isAdmin}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-primary/30 outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                      <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={!isAdmin}
                        rows="4"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-primary/30 outline-none text-sm resize-none"
                      />
                    </div>
                  </div>

                  {isAdmin && (
                    <button 
                      onClick={handleUpdateGeneral}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                    >
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Save Changes
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'members' && (
                <div className="space-y-8">
                  {isAdmin && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Add New Members</h5>
                      <MembersSearch currentMembers={chat.participants} onMembersSelected={handleAddMembers} />
                    </div>
                  )}
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-2">Current Members ({chat.participants.length})</h5>
                    <MembersList 
                      members={chat.participants} 
                      isAdmin={isAdmin} 
                      onRemoveMember={(id) => removeMember(chat._id, id)} 
                    />
                  </div>
                </div>
              )}

              {activeTab === 'topics' && chat.isSupergroup && (
                <div className="space-y-8">
                   <div className="flex justify-between items-center px-2">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Supergroup Topics</h5>
                    {isAdmin && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors">
                        <Plus size={14} /> Add Topic
                      </button>
                    )}
                  </div>
                  <TopicsList 
                    topics={chat.topics} 
                    isAdmin={isAdmin}
                    currentTopicId={chat.currentTopicId}
                    onTopicSwitch={(id) => updateGroup(chat._id, { currentTopicId: id })}
                    onDelete={(id) => deleteTopic(chat._id, id)}
                  />
                </div>
              )}
            </div>
          </div>
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
