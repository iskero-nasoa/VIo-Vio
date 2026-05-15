import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useRouter } from 'next/navigation';

const DEFAULT_SETTINGS = {
  allowGroupInvites: true,
  showOnlineStatus: true,
  showLastSeen: true,
  desktopNotifications: true,
  soundNotifications: true,
  messageNotifications: true,
  callNotifications: true,
  autoAwayTimeout: 15 // minutes
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const { logout: authLogout } = useAuthStore();
  const { setChats, setActiveChat } = useChatStore();
  const router = useRouter();

  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem('vio-settings');
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse settings');
      }
    }
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    // Auto-save on change
    localStorage.setItem('vio-settings', JSON.stringify(newSettings));
  };

  const saveSettings = async () => {
    // In the future, this might push certain privacy settings to the backend
    localStorage.setItem('vio-settings', JSON.stringify(settings));
    return true;
  };

  const logout = async () => {
    // Clear stores
    authLogout();
    setChats([]);
    setActiveChat(null);
    
    // Redirect
    router.push('/login');
  };

  return {
    settings,
    updateSetting,
    saveSettings,
    logout
  };
}
