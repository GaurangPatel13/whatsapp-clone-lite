import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';
import type { Message, PresenceStatus, Call } from '@/types';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function initSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Messaging
export function emitSendMessage(conversationId: string, content: string): void {
  socket?.emit('send_message', { conversationId, content });
}

export function emitTypingStart(conversationId: string): void {
  socket?.emit('typing_start', conversationId);
}

export function emitTypingStop(conversationId: string): void {
  socket?.emit('typing_stop', conversationId);
}

// Presence
export function emitPresenceUpdate(status: PresenceStatus): void {
  socket?.emit('presence_update', status);
}

export function emitJoin(): void {
  const token = useAuthStore.getState().token;
  if (token) {
    socket?.emit('join', token);
  }
}

// Call signaling
export function emitCallOffer(calleeId: string, offer: RTCSessionDescriptionInit): void {
  socket?.emit('call_offer', { calleeId, offer });
}

export function emitCallAnswer(callerId: string, answer: RTCSessionDescriptionInit): void {
  socket?.emit('call_answer', { callerId, answer });
}

export function emitCallIceCandidate(peerId: string, candidate: RTCIceCandidateInit): void {
  socket?.emit('call_ice_candidate', { peerId, candidate });
}

export function emitCallEnd(callId: string): void {
  socket?.emit('call_end', callId);
}

// Event listeners
export function onNewMessage(callback: (message: Message) => void): void {
  socket?.on('new_message', callback);
}

export function offNewMessage(callback?: (message: Message) => void): void {
  if (callback) {
    socket?.off('new_message', callback);
  } else {
    socket?.off('new_message');
  }
}

export function onUserTyping(callback: (data: { conversationId: string; userId: string }) => void): void {
  socket?.on('user_typing', callback);
}

export function offUserTyping(callback?: (data: { conversationId: string; userId: string }) => void): void {
  if (callback) {
    socket?.off('user_typing', callback);
  } else {
    socket?.off('user_typing');
  }
}

export function onUserStopTyping(callback: (data: { conversationId: string; userId: string }) => void): void {
  socket?.on('user_stop_typing', callback);
}

export function offUserStopTyping(callback?: (data: { conversationId: string; userId: string }) => void): void {
  if (callback) {
    socket?.off('user_stop_typing', callback);
  } else {
    socket?.off('user_stop_typing');
  }
}

export function onPresenceChanged(callback: (presence: { userId: string; status: PresenceStatus; lastSeen: string }) => void): void {
  socket?.on('presence_changed', callback);
}

export function offPresenceChanged(callback?: (presence: { userId: string; status: PresenceStatus; lastSeen: string }) => void): void {
  if (callback) {
    socket?.off('presence_changed', callback);
  } else {
    socket?.off('presence_changed');
  }
}

export function onIncomingCall(callback: (call: Call) => void): void {
  socket?.on('incoming_call', callback);
}

export function offIncomingCall(callback?: (call: Call) => void): void {
  if (callback) {
    socket?.off('incoming_call', callback);
  } else {
    socket?.off('incoming_call');
  }
}

export function onCallOfferReceived(callback: (data: { callerId: string; offer: RTCSessionDescriptionInit; callId: string }) => void): void {
  socket?.on('call_offer_received', callback);
}

export function offCallOfferReceived(callback?: (data: { callerId: string; offer: RTCSessionDescriptionInit; callId: string }) => void): void {
  if (callback) {
    socket?.off('call_offer_received', callback);
  } else {
    socket?.off('call_offer_received');
  }
}

export function onCallAnswerReceived(callback: (data: { answer: RTCSessionDescriptionInit }) => void): void {
  socket?.on('call_answer_received', callback);
}

export function offCallAnswerReceived(callback?: (data: { answer: RTCSessionDescriptionInit }) => void): void {
  if (callback) {
    socket?.off('call_answer_received', callback);
  } else {
    socket?.off('call_answer_received');
  }
}

export function onCallIceCandidateReceived(callback: (data: { candidate: RTCIceCandidateInit }) => void): void {
  socket?.on('call_ice_candidate_received', callback);
}

export function offCallIceCandidateReceived(callback?: (data: { candidate: RTCIceCandidateInit }) => void): void {
  if (callback) {
    socket?.off('call_ice_candidate_received', callback);
  } else {
    socket?.off('call_ice_candidate_received');
  }
}

export function onCallEnded(callback: (callId: string) => void): void {
  socket?.on('call_ended', callback);
}

export function offCallEnded(callback?: (callId: string) => void): void {
  if (callback) {
    socket?.off('call_ended', callback);
  } else {
    socket?.off('call_ended');
  }
}
