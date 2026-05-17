"use client";

import React from "react";
import { Phone, PhoneOff, Video, User } from "lucide-react";
import { UserAvatar } from "@/components/Common/UserAvatar";

interface CallNotificationProps {
  callerId: string;
  callerUsername: string;
  callerAvatar?: string;
  type: "audio" | "video";
  onAnswer: (accept: boolean) => void;
  onReject: () => void;
}

export const CallNotification: React.FC<CallNotificationProps> = ({
  callerUsername,
  callerAvatar,
  type,
  onAnswer,
  onReject,
}) => {
  return (
    <div className="fixed top-6 right-6 z-[9999] w-80 animate-in slide-in-from-right-8 duration-500">
      <div className="bg-card/90 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/10">
        <div className="p-6">
          <div className="flex flex-col items-center gap-4">
            {/* Avatar with Pulse Animation */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative">
                <UserAvatar user={{ username: callerUsername, avatar: callerAvatar }} size="xl" />
                <div className="absolute -bottom-1 -right-1 bg-primary text-white p-2 rounded-full shadow-lg">
                  {type === "video" ? <Video size={16} /> : <Phone size={16} />}
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground">{callerUsername}</h3>
              <p className="text-sm text-muted-foreground animate-pulse mt-1">
                Входящий {type === "video" ? "видеозвонок" : "аудиозвонок"}...
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-6 w-full mt-2">
              <button
                onClick={() => onReject()}
                className="flex-1 group flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30 group-hover:bg-red-600 transition-all active:scale-90">
                  <PhoneOff size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-red-500 transition-colors">
                  Отклонить
                </span>
              </button>

              <button
                onClick={() => onAnswer(true)}
                className="flex-1 group flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30 group-hover:bg-green-600 animate-bounce-slow transition-all active:scale-90">
                  <Phone size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-green-500 transition-colors">
                  Принять
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
