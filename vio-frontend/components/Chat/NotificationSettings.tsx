"use client";

import React, { useState, useEffect } from "react";
import { X, Bell, BellOff, Phone, Volume2, VolumeX } from "lucide-react";
import { getNotificationSettings, saveNotificationSettings } from "../../hooks/useNotifications";

interface NotificationSettingsProps {
  onClose: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState(getNotificationSettings());
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermissionState(result);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-card border border-border shadow-2xl rounded-3xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Bell size={20} />
            </div>
            <h2 className="text-lg font-bold">Уведомления</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Permission status */}
          {permissionState !== "granted" && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <p className="text-xs text-yellow-500 font-medium mb-2">
                Уведомления не разрешены в браузере
              </p>
              <button
                onClick={requestPermission}
                className="px-3 py-1.5 bg-yellow-500 text-black rounded-lg text-xs font-bold hover:bg-yellow-400 transition-all"
              >
                Разрешить
              </button>
            </div>
          )}

          {/* Message notifications */}
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
            <div className="flex items-center gap-3">
              {settings.messagesEnabled ? (
                <Bell size={18} className="text-primary" />
              ) : (
                <BellOff size={18} className="text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-bold">Сообщения</p>
                <p className="text-[10px] text-muted-foreground">Новые сообщения в чатах</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("messagesEnabled")}
              className={`w-12 h-6 rounded-full transition-all ${
                settings.messagesEnabled ? "bg-primary" : "bg-secondary"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-all ${
                settings.messagesEnabled ? "ml-[26px]" : "ml-[2px]"
              }`} />
            </button>
          </div>

          {/* Call notifications */}
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
            <div className="flex items-center gap-3">
              <Phone size={18} className={settings.callsEnabled ? "text-primary" : "text-muted-foreground"} />
              <div>
                <p className="text-sm font-bold">Звонки</p>
                <p className="text-[10px] text-muted-foreground">Входящие звонки</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("callsEnabled")}
              className={`w-12 h-6 rounded-full transition-all ${
                settings.callsEnabled ? "bg-primary" : "bg-secondary"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-all ${
                settings.callsEnabled ? "ml-[26px]" : "ml-[2px]"
              }`} />
            </button>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 size={18} className="text-primary" />
              ) : (
                <VolumeX size={18} className="text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-bold">Звук</p>
                <p className="text-[10px] text-muted-foreground">Звуковой сигнал</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("soundEnabled")}
              className={`w-12 h-6 rounded-full transition-all ${
                settings.soundEnabled ? "bg-primary" : "bg-secondary"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-all ${
                settings.soundEnabled ? "ml-[26px]" : "ml-[2px]"
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
