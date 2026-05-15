"use client";

import { useState } from 'react';
import { X, User, Settings as SettingsIcon } from 'lucide-react';
import ProfileTab from './ProfileTab';
import SettingsTab from './SettingsTab';

export default function ProfileModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('profile');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 p-2 gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'profile' 
                ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <User size={16} />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'settings' 
                ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <SettingsIcon size={16} />
            Preferences
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 flex-1 overflow-hidden">
          {activeTab === 'profile' ? <ProfileTab /> : <SettingsTab />}
        </div>
      </div>
    </div>
  );
}
