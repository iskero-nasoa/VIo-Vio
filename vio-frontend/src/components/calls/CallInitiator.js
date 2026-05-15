"use client";

import { useEffect } from 'react';
import { User, X } from 'lucide-react';
import { useCall } from '../../hooks/useCall';
import { useCallStore } from '../../store/callStore';

export default function CallInitiator({ recipientId, recipientName, recipientAvatar }) {
  const { endCall } = useCall();
  const { activeCall } = useCallStore();

  useEffect(() => {
    // Auto-cancel if no answer after 30 seconds
    const timeout = setTimeout(() => {
      if (activeCall && activeCall.status === 'ringing') {
        endCall(activeCall._id);
      }
    }, 30000);
    return () => clearTimeout(timeout);
  }, [activeCall]);

  return (
    <div className="fixed inset-0 z-[90] bg-slate-900 flex flex-col text-white animate-fade-in">
      <div className="p-6 flex justify-end">
        <button 
          onClick={() => activeCall && endCall(activeCall._id)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse scale-110"></div>
          <div className="w-48 h-48 rounded-full bg-slate-800 flex items-center justify-center text-primary border-4 border-slate-700 shadow-2xl relative overflow-hidden">
            {recipientAvatar ? (
              <img src={recipientAvatar} className="w-full h-full object-cover" />
            ) : (
              <User size={96} />
            )}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-black mb-2">{recipientName}</h2>
          <p className="text-primary font-bold uppercase tracking-widest animate-pulse">Calling...</p>
        </div>
      </div>

      <div className="pb-24 flex justify-center">
        <button
          onClick={() => activeCall && endCall(activeCall._id)}
          className="p-6 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all transform hover:scale-110"
        >
          <X size={32} />
        </button>
      </div>
    </div>
  );
}
