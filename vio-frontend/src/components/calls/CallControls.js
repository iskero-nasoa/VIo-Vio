"use client";

import { Mic, MicOff, Volume2, VolumeX, PhoneOff } from 'lucide-react';

export default function CallControls({ 
  onMuteToggle, 
  onSpeakerToggle, 
  onEndCall, 
  isMuted, 
  isSpeakerOn 
}) {
  return (
    <div className="flex items-center justify-center space-x-6 py-8">
      {/* Mute Button */}
      <button
        onClick={onMuteToggle}
        className={`p-4 rounded-full transition-all ${
          isMuted 
            ? 'bg-slate-200 text-slate-800' 
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
      </button>

      {/* End Call Button */}
      <button
        onClick={onEndCall}
        className="p-6 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all transform hover:scale-110"
      >
        <PhoneOff size={32} />
      </button>

      {/* Speaker Button */}
      <button
        onClick={onSpeakerToggle}
        className={`p-4 rounded-full transition-all ${
          !isSpeakerOn 
            ? 'bg-slate-200 text-slate-800' 
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>
    </div>
  );
}
