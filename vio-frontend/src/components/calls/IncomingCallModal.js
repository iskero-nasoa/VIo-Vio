"use client";

import { useEffect } from 'react';
import { Phone, PhoneOff, User } from 'lucide-react';
import { useCall } from '../../hooks/useCall';
import { useCallStore } from '../../store/callStore';

export default function IncomingCallModal() {
  const { incomingCall, clearIncomingCall } = useCallStore();
  const { acceptCall, rejectCall } = useCall();

  useEffect(() => {
    if (incomingCall) {
      // Auto-reject after 30 seconds
      const timeout = setTimeout(() => {
        rejectCall(incomingCall._id);
      }, 30000);
      return () => clearTimeout(timeout);
    }
  }, [incomingCall]);

  if (!incomingCall) return null;

  const caller = incomingCall.initiatorId;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-pop-in">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="relative mb-6">
            {/* Ringing Animation */}
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
            <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-primary font-bold text-4xl relative overflow-hidden border-4 border-white dark:border-slate-800">
              {caller?.avatar ? (
                <img src={caller.avatar} className="w-full h-full object-cover" />
              ) : (
                <User size={48} />
              )}
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-1">
            {caller?.username || 'Unknown Caller'}
          </h2>
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-8">
            Incoming Audio Call...
          </p>

          <div className="flex w-full gap-4">
            <button
              onClick={() => rejectCall(incomingCall._id)}
              className="flex-1 py-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex flex-col items-center gap-1 font-bold"
            >
              <div className="p-3 bg-red-500 text-white rounded-full">
                <PhoneOff size={24} />
              </div>
              <span className="mt-1">Decline</span>
            </button>
            
            <button
              onClick={() => acceptCall(incomingCall._id)}
              className="flex-1 py-4 rounded-2xl bg-green-50 text-green-500 hover:bg-green-100 transition-colors flex flex-col items-center gap-1 font-bold"
            >
              <div className="p-3 bg-green-500 text-white rounded-full animate-bounce">
                <Phone size={24} />
              </div>
              <span className="mt-1">Accept</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
