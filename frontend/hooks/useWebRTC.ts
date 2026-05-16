"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";

interface CallState {
  status: "idle" | "calling" | "incoming" | "active" | "ended";
  callId: string | null;
  remoteUserId: string | null;
  type: "audio" | "video";
  startTime: number | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isPeerMuted: boolean;
  isPeerVideoOff: boolean;
}

interface IncomingCall {
  callId: string;
  callerId: string;
  callerUsername: string;
  callerAvatar?: string;
  type: "audio" | "video";
  offer: any;
}

const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export const useWebRTC = (socket: Socket | null, currentUserId: string | null) => {
  const [callState, setCallState] = useState<CallState>({
    status: "idle",
    callId: null,
    remoteUserId: null,
    type: "audio",
    startTime: null,
    isMuted: false,
    isVideoOff: false,
    isPeerMuted: false,
    isPeerVideoOff: false,
  });

  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  
  const statusRef = useRef(callState.status);
  const currentCallIdRef = useRef<string | null>(null);

  useEffect(() => {
    statusRef.current = callState.status;
    currentCallIdRef.current = callState.callId;
  }, [callState.status, callState.callId]);

  const cleanupMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  const resetState = useCallback(() => {
    cleanupMedia();
    setCallState({
      status: "idle",
      callId: null,
      remoteUserId: null,
      type: "audio",
      startTime: null,
      isMuted: false,
      isVideoOff: false,
      isPeerMuted: false,
      isPeerVideoOff: false,
    });
    setIncomingCall(null);
  }, [cleanupMedia]);

  const createPC = useCallback((remoteId: string, callId: string) => {
    if (pcRef.current) pcRef.current.close();
    
    const pc = new RTCPeerConnection(configuration);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice_candidate", {
          callId,
          candidate: event.candidate,
          to: remoteId,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("🎥 Received remote track:", event.streams[0]);
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = event.streams[0];
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("📡 Connection state change:", pc.connectionState);
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        // Handle disconnection
      }
    };

    return pc;
  }, [socket]);

  const getMedia = useCallback(async (type: "audio" | "video") => {
    try {
      const constraints = {
        audio: true,
        video: type === "video" ? { width: 1280, height: 720 } : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error("❌ Failed to get user media:", error);
      throw error;
    }
  }, []);

  // Initiate a call
  const initiateCall = useCallback(async (receiverId: string, type: "audio" | "video") => {
    if (!socket || statusRef.current !== "idle") return;

    try {
      setCallState((prev) => ({ ...prev, status: "calling", type, remoteUserId: receiverId }));
      
      const stream = await getMedia(type);
      const pc = createPC(receiverId, "temporary"); // We'll update ID after initiate_call
      
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("initiate_call", { receiverId, type, offer });
    } catch (error) {
      console.error("Failed to initiate call:", error);
      resetState();
    }
  }, [socket, getMedia, createPC, resetState]);

  // Answer an incoming call
  const answerCall = useCallback(async (accept: boolean = true) => {
    if (!socket || !incomingCall) return;

    if (!accept) {
      socket.emit("answer_call", { callId: incomingCall.callId, accept: false });
      setIncomingCall(null);
      return;
    }

    try {
      setCallState({
        status: "active",
        callId: incomingCall.callId,
        remoteUserId: incomingCall.callerId,
        type: incomingCall.type,
        startTime: Date.now(),
        isMuted: false,
        isVideoOff: false,
        isPeerMuted: false,
        isPeerVideoOff: false,
      });

      const stream = await getMedia(incomingCall.type);
      const pc = createPC(incomingCall.callerId, incomingCall.callId);
      
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer_call", {
        callId: incomingCall.callId,
        answer,
        accept: true,
      });
      
      setIncomingCall(null);
    } catch (error) {
      console.error("Failed to answer call:", error);
      resetState();
    }
  }, [socket, incomingCall, getMedia, createPC, resetState]);

  const endCall = useCallback(() => {
    if (socket && currentCallIdRef.current) {
      socket.emit("end_call", { callId: currentCallIdRef.current });
    }
    resetState();
  }, [socket, resetState]);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState((prev) => ({ ...prev, isMuted: !audioTrack.enabled }));
        if (socket && currentCallIdRef.current) {
          socket.emit("toggle_audio", { callId: currentCallIdRef.current, muted: !audioTrack.enabled });
        }
      }
    }
  }, [socket]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState((prev) => ({ ...prev, isVideoOff: !videoTrack.enabled }));
        if (socket && currentCallIdRef.current) {
          socket.emit("toggle_video", { callId: currentCallIdRef.current, videoOff: !videoTrack.enabled });
        }
      }
    }
  }, [socket]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (data: IncomingCall) => {
      console.log("📥 Incoming call event:", data);
      if (statusRef.current === "idle") {
        setIncomingCall(data);
      } else {
        // Busy - auto-reject
        socket.emit("answer_call", { callId: data.callId, accept: false });
      }
    };

    const handleInitiated = (data: { callId: string }) => {
      setCallState((prev) => ({ ...prev, callId: data.callId }));
    };

    const handleAnswered = async (data: { callId: string; answer: any }) => {
      if (pcRef.current && data.callId === currentCallIdRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        setCallState((prev) => ({ ...prev, status: "active", startTime: Date.now() }));
      }
    };

    const handleCandidate = async (data: { callId: string; candidate: any }) => {
      if (pcRef.current && data.callId === currentCallIdRef.current) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error("Error adding ice candidate:", e);
        }
      }
    };

    const handleRejected = () => {
      resetState();
    };

    const handleEnded = () => {
      resetState();
    };

    const handlePeerAudio = (data: { muted: boolean }) => {
      setCallState((prev) => ({ ...prev, isPeerMuted: data.muted }));
    };

    const handlePeerVideo = (data: { videoOff: boolean }) => {
      setCallState((prev) => ({ ...prev, isPeerVideoOff: data.videoOff }));
    };

    socket.on("incoming_call", handleIncoming);
    socket.on("call_initiated", handleInitiated);
    socket.on("webrtc_answer", handleAnswered);
    socket.on("ice_candidate", handleCandidate);
    socket.on("call_rejected", handleRejected);
    socket.on("call_ended", handleEnded);
    socket.on("peer_toggle_audio", handlePeerAudio);
    socket.on("peer_toggle_video", handlePeerVideo);

    return () => {
      socket.off("incoming_call", handleIncoming);
      socket.off("call_initiated", handleInitiated);
      socket.off("webrtc_answer", handleAnswered);
      socket.off("ice_candidate", handleCandidate);
      socket.off("call_rejected", handleRejected);
      socket.off("call_ended", handleEnded);
      socket.off("peer_toggle_audio", handlePeerAudio);
      socket.off("peer_toggle_video", handlePeerVideo);
    };
  }, [socket, resetState]);

  return {
    callState,
    incomingCall,
    localVideoRef,
    remoteVideoRef,
    initiateCall,
    answerCall,
    endCall,
    toggleAudio,
    toggleVideo,
  };
};
