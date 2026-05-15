import { create } from 'zustand';

export const useCallStore = create((set) => ({
  activeCall: null,
  incomingCall: null,
  callHistory: [],
  ongoingCalls: [],
  isMuted: false,
  isSpeakerOn: true,

  setActiveCall: (call) => set({ activeCall: call }),
  setIncomingCall: (call) => set({ incomingCall: call }),
  clearActiveCall: () => set({ activeCall: null }),
  clearIncomingCall: () => set({ incomingCall: null }),
  setCallHistory: (calls) => set({ callHistory: calls }),
  setOngoingCalls: (calls) => set({ ongoingCalls: calls }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleSpeaker: () => set((state) => ({ isSpeakerOn: !state.isSpeakerOn })),
  addToCallHistory: (call) => set((state) => ({ 
    callHistory: [call, ...state.callHistory] 
  })),
}));
