"use client";

import { MessageSquare, Phone, PhoneMissed, UserPlus, User, Bell } from 'lucide-react';

export default function NotificationIcon({ type, size = 20, className = "" }) {
  const icons = {
    message: MessageSquare,
    call: Phone,
    call_missed: PhoneMissed,
    group_invite: UserPlus,
    status_change: User,
  };

  const IconComponent = icons[type] || Bell;

  return <IconComponent size={size} className={className} />;
}
