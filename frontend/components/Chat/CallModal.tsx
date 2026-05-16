"use client";

import React, { useState, useEffect } from "react";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, Minimize2 } from "lucide-react";
import { format } from "date-fns";

interface CallModalProps {
  callState: {
    status: string;
    type: "audio" | "video";
    startTime: number | null;
    isMuted: boolean;
    isVideoOff: boolean;
    isPeerMuted: boolean;
    isPeerVideoOff: boolean;
  };
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  onEndCall: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  callState,
  localVideoRef,
  remoteVideoRef,
  onEndCall,
  onToggleAudio,
  onToggleVideo,
}) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState.status === "active" && callState.startTime) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - callState.startTime!) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState.status, callState.startTime]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative w-full h-full max-w-5xl max-height-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Remote Video (Main) */}
        <div className="relative flex-1 bg-black overflow-hidden group">
          {callState.type === "video" && !callState.isPeerVideoOff ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800">
              <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4 animate-pulse">
                <Video size={64} />
              </div>
              <p className="text-slate-400">
                {callState.isPeerVideoOff ? "Камера собеседника выключена" : "Ожидание видео..."}
              </p>
            </div>
          )}

          {/* Peer Muted Overlay */}
          {callState.isPeerMuted && (
            <div className="absolute top-4 left-4 bg-red-500/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1.5 shadow-lg">
              <MicOff size={12} /> СОБЕСЕДНИК ВЫКЛЮЧИЛ МИКРОФОН
            </div>
          )}

          {/* Local Video (Small Overlay) */}
          <div className="absolute top-6 right-6 w-48 h-32 bg-slate-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10 transition-all hover:scale-105">
            {callState.type === "video" && !callState.isVideoOff ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <VideoOff size={24} />
              </div>
            )}
          </div>

          {/* Call Info Overlay */}
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <div className="bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-xl">
              <span className="text-white font-mono text-lg tracking-widest">
                {formatDuration(duration)}
              </span>
            </div>
            {callState.status === "calling" && (
              <p className="text-primary font-bold text-sm uppercase tracking-widest animate-pulse">
                Вызов...
              </p>
            )}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="h-28 bg-slate-900 border-t border-white/5 flex items-center justify-center gap-8 px-10">
          <button
            onClick={onToggleAudio}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              callState.isMuted ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/10 text-white hover:bg-white/20"
            }`}
            title={callState.isMuted ? "Включить микрофон" : "Выключить микрофон"}
          >
            {callState.isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <button
            onClick={onEndCall}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-500/40 transition-all transform hover:scale-110 active:scale-95"
            title="Завершить звонок"
          >
            <PhoneOff size={32} />
          </button>

          <button
            onClick={onToggleVideo}
            disabled={callState.type === "audio"}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              callState.type === "audio" ? "opacity-20 cursor-not-allowed" :
              callState.isVideoOff ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/10 text-white hover:bg-white/20"
            }`}
            title={callState.isVideoOff ? "Включить камеру" : "Выключить камеру"}
          >
            {callState.isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
        </div>
      </div>

      <style jsx>{`
        .mirror {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};
