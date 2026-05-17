"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";
import { useAuth } from "./useAuth";

interface NotificationSettings {
  messagesEnabled: boolean;
  callsEnabled: boolean;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  messagesEnabled: true,
  callsEnabled: true,
  soundEnabled: true,
};

const STORAGE_KEY = "vioapp_notification_settings";

export const getNotificationSettings = (): NotificationSettings => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveNotificationSettings = (settings: NotificationSettings) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
};

const playNotificationSound = () => {
  try {
    const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1gYmpvcHJ0d3t5e3l7eXl3dXBrZV9ZVlVYXWJnam90eXyAhIeLjY+QkZCPjouJhoJ+enZybm1rbGxsbm1tbGtqaGViXlpXVVVXW19jZ2xxdn2ChoqOkZOVl5eXlpSRjouHg394dG9raWdnaGlqa2xtbW1sa2lnZGBcWVdWV1ldYWVpcHV8goiNkZSXmZqam5qYlZKPi4eDf3t2cm5raGhoaWprbG1ubm1samlnZGBcWVdXWFtfY2dscnZ9g4mOkpWYmpubnJuZl5SSjoqGgn56dnJubGppaWprbG1ubm9ubWxqaGVhXVpYV1hbX2NnaXB1fIKIjZKVmJqbm5ycm5mWk5CMiYWBfXl1cW5sa2pqa2xtbm5vb25ta2poZWJeW1lYWVxgZGhtcnl/hYuPk5eZm5ycnJybmZaTkIyIhIF9eXVxb2xramtsbW5vcHBvbm1raGViX1xaWVpcYGRobXJ4foSKj5OWmZucnJ2cm5qXlJGNioaBfXp2cm9tbGtra21ub3BwcG9ubWtpZmNgXVtaW11hZWludHp/hYuQk5eZm5ydnZ2cm5mWk5CNioaDf3x4dXJwbm1sbW1ub3BxcHBvbm1raWZjYF1bWltdYGRobXJ3fYOJjpKWmZucnZ2dnJualZOQjImGg398eXVycG5tbW1ubnBxcXFwcG5tamlnZGFfXFtcXmFlaW5zeX+FiY6SlZianJ2dnZ2bmpeTkI2JhoJ/fHl2c3Fvbm1tbm9wcXFxcHBvbWtpZ2RhXlxcXV5hZWludHl+hImOkpWYmpydnZ6dnJqXlJGNioeDf3x5dnRxb25tbm5vcHFxcnFwb25samlmY2BdXFxdX2JmaW5zeH2DiY2RlZianJ2enp2cm5iVko+LiIWCf3x5d3RycG9ubm5vcHFxcnFxcG9ta2lnZGJfXV1dXmBkZ2twd3x/");
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch {}
};

export const useNotifications = () => {
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const settingsRef = useRef<NotificationSettings>(getNotificationSettings());

  // Request permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  const showNotification = useCallback((title: string, body: string, icon?: string) => {
    const settings = getNotificationSettings();

    // Play sound
    if (settings.soundEnabled) {
      playNotificationSound();
    }

    // Desktop notification
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        const notification = new Notification(title, {
          body,
          icon: icon || "/favicon.ico",
          tag: `vioapp-${Date.now()}`,
          silent: true,
        });
        setTimeout(() => notification.close(), 5000);
      } catch {}
    }

    // Badge (if supported)
    if (typeof navigator !== "undefined" && "setAppBadge" in navigator) {
      (navigator as any).setAppBadge(1).catch(() => {});
    }
  }, []);

  // Listen for events
  useEffect(() => {
    if (!socket || !connected || !user) return;

    const handleDirectMessage = (message: any) => {
      const settings = getNotificationSettings();
      if (!settings.messagesEnabled) return;
      if (document.hasFocus()) return;

      const senderName = message.senderUsername || "New message";
      const text = message.text || "Sent an attachment";
      showNotification(senderName, text);
    };

    const handleGroupMessage = (message: any) => {
      const settings = getNotificationSettings();
      if (!settings.messagesEnabled) return;
      if (document.hasFocus()) return;

      const senderName = message.senderUsername || "Group message";
      const text = message.text || "Sent an attachment";
      showNotification(`${senderName}`, text);
    };

    const handleIncomingCall = (data: any) => {
      const settings = getNotificationSettings();
      if (!settings.callsEnabled) return;

      showNotification(
        "Incoming call",
        `${data.callerUsername} is calling you (${data.type})`
      );
    };

    socket.on("message_received", handleDirectMessage);
    socket.on("group_message_received", handleGroupMessage);
    socket.on("topic_message_received", handleGroupMessage);
    socket.on("call_incoming", handleIncomingCall);

    return () => {
      socket.off("message_received", handleDirectMessage);
      socket.off("group_message_received", handleGroupMessage);
      socket.off("topic_message_received", handleGroupMessage);
      socket.off("call_incoming", handleIncomingCall);
    };
  }, [socket, connected, user, showNotification]);

  // Clear badge when window is focused
  useEffect(() => {
    const handleFocus = () => {
      if (typeof navigator !== "undefined" && "clearAppBadge" in navigator) {
        (navigator as any).clearAppBadge().catch(() => {});
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return { showNotification };
};
