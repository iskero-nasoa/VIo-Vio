import { create } from 'zustand';

export const useUserStore = create((set) => ({
  onlineUsers: {},
  userProfiles: {},

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  setUserProfile: (userId, profile) => set((state) => ({
    userProfiles: {
      ...state.userProfiles,
      [userId]: profile,
    }
  })),

  updateUserStatus: (userId, status) => set((state) => ({
    onlineUsers: {
      ...state.onlineUsers,
      [userId]: status,
    }
  })),
}));
