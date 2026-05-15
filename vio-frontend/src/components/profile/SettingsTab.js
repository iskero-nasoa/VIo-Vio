"use client";

import { useSettings } from '../../hooks/useSettings';
import { useProfile } from '../../hooks/useProfile';
import { useAuthStore } from '../../store/authStore';
import { Bell, Volume2, Monitor, Shield, LogOut, ChevronDown, UserCheck } from 'lucide-react';
import { STATUS_OPTIONS, getStatusLabel } from '../../utils/statusMessages';
import StatusIndicator from './StatusIndicator';
import ThemeSettings from '../settings/ThemeSettings';

export default function SettingsTab() {
  const { settings, updateSetting, logout } = useSettings();
  const { updateStatus } = useProfile();
  const { user } = useAuthStore();

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    await updateStatus(newStatus);
  };

  const Toggle = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <button 
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
          checked ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-4.5' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );

  const Section = ({ title, icon: Icon, children }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-primary" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h3>
      </div>
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-2 border border-slate-100 dark:border-slate-800">
        {children}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in p-1 h-[60vh] overflow-y-auto scrollbar-thin">
      
      {/* Account Status */}
      <Section title="Account Status" icon={UserCheck}>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Status</span>
          <div className="relative">
            <select 
              value={user?.status || 'online'} 
              onChange={handleStatusChange}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{getStatusLabel(opt)}</option>
              ))}
            </select>
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <StatusIndicator status={user?.status} size="sm" />
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-away timeout (min)</span>
          <select 
            value={settings.autoAwayTimeout}
            onChange={(e) => updateSetting('autoAwayTimeout', parseInt(e.target.value))}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300"
          >
            <option value={5}>5</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={60}>60</option>
          </select>
        </div>
      </Section>

      {/* Privacy */}
      <Section title="Privacy" icon={Shield}>
        <Toggle 
          label="Allow group invites" 
          checked={settings.allowGroupInvites} 
          onChange={(v) => updateSetting('allowGroupInvites', v)} 
        />
        <Toggle 
          label="Show online status" 
          checked={settings.showOnlineStatus} 
          onChange={(v) => updateSetting('showOnlineStatus', v)} 
        />
        <Toggle 
          label="Show last seen time" 
          checked={settings.showLastSeen} 
          onChange={(v) => updateSetting('showLastSeen', v)} 
        />
      </Section>

      {/* Theme & Customization */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Monitor size={16} className="text-primary" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Theme & Appearance</h3>
        </div>
        <ThemeSettings />
      </div>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <Toggle 
          label="Desktop notifications" 
          checked={settings.desktopNotifications} 
          onChange={(v) => updateSetting('desktopNotifications', v)} 
        />
        <Toggle 
          label="Play sounds" 
          checked={settings.soundNotifications} 
          onChange={(v) => updateSetting('soundNotifications', v)} 
        />
        <Toggle 
          label="Message previews" 
          checked={settings.messageNotifications} 
          onChange={(v) => updateSetting('messageNotifications', v)} 
        />
      </Section>

      {/* Danger Zone */}
      <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-3 text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-colors font-bold"
        >
          <LogOut size={18} />
          Log Out of VioApp
        </button>
      </div>

    </div>
  );
}
