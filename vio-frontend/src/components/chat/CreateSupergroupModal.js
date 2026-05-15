"use client";

import { useState } from 'react';
import { X, Hash, Plus, Loader2, Info } from 'lucide-react';
import { useGroupManagement } from '../../hooks/useGroupManagement';
import { validateGroupName, validateTopics } from '../../utils/groupValidators';
import MembersSearch from './MembersSearch';
import { useRouter } from 'next/navigation';

export default function CreateSupergroupModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberIds, setMemberIds] = useState([]);
  const [topics, setTopics] = useState([{ name: 'General', description: 'Main chat area' }]);
  const [newTopicName, setNewTopicName] = useState('');
  const [formError, setFormError] = useState(null);
  
  const router = useRouter();
  const { createSupergroup, isLoading } = useGroupManagement();

  if (!isOpen) return null;

  const handleAddTopic = () => {
    if (newTopicName.trim().length >= 2) {
      setTopics([...topics, { name: newTopicName, description: '' }]);
      setNewTopicName('');
    }
  };

  const removeTopic = (index) => {
    if (topics.length > 1) {
      setTopics(topics.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameCheck = validateGroupName(name);
    const topicsCheck = validateTopics(topics);

    if (!nameCheck.valid) return setFormError(nameCheck.error);
    if (!topicsCheck.valid) return setFormError(topicsCheck.error);

    const result = await createSupergroup({
      name,
      description,
      participants: memberIds,
      topics,
      isSupergroup: true
    });

    if (result) {
      onClose();
      router.push(`/chat/${result._id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-pop-in flex flex-col max-h-[90vh]">
        
        <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">Supergroup</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Organize by topics</p>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8 scrollbar-thin">
          {/* Left Column: Basic Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Supergroup Name</label>
                <input
                  type="text"
                  placeholder="Enterprise 2024"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-indigo-500/30 outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">About</label>
                <textarea
                  placeholder="The official group for our team..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-indigo-500/30 outline-none transition-all text-sm resize-none"
                />
              </div>
            </div>

            <div className="p-5 bg-indigo-50 dark:bg-indigo-500/5 rounded-3xl border border-indigo-100 dark:border-indigo-500/10">
              <div className="flex gap-3 text-indigo-600 dark:text-indigo-400 mb-2">
                <Info size={18} />
                <h4 className="text-xs font-black uppercase tracking-wider">How it works</h4>
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-700/70 dark:text-indigo-300/60 font-medium">
                Supergroups allow you to separate conversations into topics. Each topic has its own message history and members can choose which topics to follow.
              </p>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Invite Members</label>
              <MembersSearch onMembersSelected={setMemberIds} />
            </div>
          </div>

          {/* Right Column: Topics */}
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Initial Topics</label>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="e.g. Announcements"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 outline-none focus:border-indigo-500/30 text-sm font-bold"
                />
                <button 
                  type="button"
                  onClick={handleAddTopic}
                  disabled={newTopicName.trim().length < 2}
                  className="p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                {topics.map((topic, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Hash size={16} />
                      </div>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200">{topic.name}</span>
                    </div>
                    {topics.length > 1 && (
                      <button 
                        onClick={() => removeTopic(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !name.trim() || topics.length === 0}
            className="w-full py-4 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'Create Supergroup'}
          </button>
        </div>
      </div>
    </div>
  );
}
