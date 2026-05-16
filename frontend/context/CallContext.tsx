"use client";

import React, { createContext, useContext } from "react";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";

interface CallContextType {
  callState: any;
  incomingCall: any;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  initiateCall: (receiverId: string, type: "audio" | "video") => Promise<void>;
  answerCall: (accept: boolean) => Promise<void>;
  endCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  
  const webrtc = useWebRTC(socket, user?.id || null);

  return (
    <CallContext.Provider value={webrtc}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};
