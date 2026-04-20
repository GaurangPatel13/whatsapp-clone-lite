import { create } from 'zustand';
import type { Call, CallType } from '@/types';

interface CallState {
  activeCall: Call | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isCalling: boolean;
  isReceivingCall: boolean;
  callType: CallType | null;
  startCall: (call: Call, localStream: MediaStream) => void;
  setRemoteStream: (stream: MediaStream) => void;
  endCall: () => void;
  setReceivingCall: (call: Call | null) => void;
  reset: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  activeCall: null,
  localStream: null,
  remoteStream: null,
  isCalling: false,
  isReceivingCall: false,
  callType: null,

  startCall: (call, localStream) =>
    set({
      activeCall: call,
      localStream,
      isCalling: true,
      isReceivingCall: false,
      callType: call.type as CallType,
    }),

  setRemoteStream: (stream) => set({ remoteStream: stream }),

  endCall: () =>
    set({
      activeCall: null,
      localStream: null,
      remoteStream: null,
      isCalling: false,
      isReceivingCall: false,
      callType: null,
    }),

  setReceivingCall: (call) =>
    set({
      activeCall: call,
      isReceivingCall: call !== null,
      callType: call?.type as CallType | null,
    }),

  reset: () =>
    set({
      activeCall: null,
      localStream: null,
      remoteStream: null,
      isCalling: false,
      isReceivingCall: false,
      callType: null,
    }),
}));
