import { create } from 'zustand';
import type { User, PresenceStatus } from '@/types';

interface PresenceState {
  onlineUsers: Set<string>;
  userPresence: Record<string, { status: PresenceStatus; lastSeen: string }>;
  setOnlineUsers: (users: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  setUserPresence: (userId: string, status: PresenceStatus, lastSeen: string) => void;
  clearUserPresence: (userId: string) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  onlineUsers: new Set<string>(),
  userPresence: {},

  setOnlineUsers: (users) => set({ onlineUsers: new Set(users) }),

  addOnlineUser: (userId) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.add(userId);
      return { onlineUsers: newSet };
    }),

  removeOnlineUser: (userId) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.delete(userId);
      return { onlineUsers: newSet };
    }),

  setUserPresence: (userId, status, lastSeen) =>
    set((state) => ({
      userPresence: {
        ...state.userPresence,
        [userId]: { status, lastSeen },
      },
    })),

  clearUserPresence: (userId) =>
    set((state) => {
      const { [userId]: _, ...rest } = state.userPresence;
      return { userPresence: rest };
    }),
}));
