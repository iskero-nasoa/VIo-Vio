"use client";

import { useState, useEffect } from 'react';
import { User, Maximize2, Minimize2 } from 'lucide-react';
import { useCall } from '../../hooks/useCall';
import { useCallStore } from '../../store/callStore';
import CallTimer from './CallTimer';
import CallControls from './CallControls';
import { useRouter } from 'next/navigation';

export default function ActiveCallScreen({ callId }) {
  const { activeCall, isMuted, isSpeakerOn, toggleMute, toggleSpeaker } = useCallStore();
  const { endCall } = useCall();
  const router = useRouter();

  if (!activeCall) return null;

  const otherParticipant = activeCall.participantIds?.[0]; // Simplified for 1-on-1

  return (
    <div className="fixed inset-0 z-[90] bg-slate-900 flex flex-col text-white animate-fade-in">
      {/* Header */}
      <div className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Secure Call</span>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Minimize2 size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-48 h-48 rounded-full bg-slate-800 flex items-center justify-center text-primary border-4 border-slate-700 shadow-2xl relative overflow-hidden">
            {otherParticipant?.avatar ? (
              <img src={otherParticipant.avatar} className="w-full h-full object-cover" />
            ) : (
              <User size={96} />
            )}
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 rounded-full text-xs font-bold uppercase">
            Connected
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-black mb-2">{otherParticipant?.username || 'User'}</h2>
          <CallTimer startTime={activeCall.startTime} />
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pb-12 bg-gradient-to-t from-black/40 to-transparent">
        <CallControls 
          onMuteToggle={toggleMute}
          onSpeakerToggle={toggleSpeaker}
          onEndCall={() => endCall(activeCall._id)}
          isMuted={isMuted}
          isSpeakerOn={isSpeakerOn}
        />
      </div>
    </div>
  );
}
