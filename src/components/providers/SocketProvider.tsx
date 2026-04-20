'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { initSocket, disconnectSocket, onNewMessage, offNewMessage, onPresenceChanged, offPresenceChanged, onIncomingCall, offIncomingCall, onCallOfferReceived, offCallOfferReceived, onCallAnswerReceived, offCallAnswerReceived, onCallIceCandidateReceived, offCallIceCandidateReceived, onCallEnded, offCallEnded, onUserTyping, offUserTyping, onUserStopTyping, offUserStopTyping } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { useCallStore } from '@/stores/callStore';
import type { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, user } = useAuthStore();
  const { addMessage, setTypingUser, removeTypingUser } = useChatStore();
  const { addOnlineUser, removeOnlineUser, setUserPresence } = usePresenceStore();
  const { setReceivingCall } = useCallStore();

  useEffect(() => {
    if (!token) return;

    const socketInstance = initSocket(token);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle new messages
    const handleNewMessage = (message: any) => {
      addMessage(message.conversationId, message);
    };
    onNewMessage(handleNewMessage);

    // Handle typing indicators
    const handleUserTyping = (data: { conversationId: string; userId: string }) => {
      setTypingUser(data.conversationId, data.userId);
    };
    onUserTyping(handleUserTyping);

    const handleUserStopTyping = (data: { conversationId: string; userId: string }) => {
      removeTypingUser(data.conversationId, data.userId);
    };
    onUserStopTyping(handleUserStopTyping);

    // Handle presence changes
    const handlePresenceChanged = (presence: { userId: string; status: string; lastSeen: string }) => {
      if (presence.status === 'ONLINE') {
        addOnlineUser(presence.userId);
      } else {
        removeOnlineUser(presence.userId);
      }
      setUserPresence(presence.userId, presence.status as any, presence.lastSeen);
    };
    onPresenceChanged(handlePresenceChanged);

    // Handle incoming calls
    const handleIncomingCall = (call: any) => {
      setReceivingCall(call);
    };
    onIncomingCall(handleIncomingCall);

    // Handle call signaling
    onCallOfferReceived(() => {});
    onCallAnswerReceived(() => {});
    onCallIceCandidateReceived(() => {});
    onCallEnded(() => {});

    setSocket(socketInstance);

    return () => {
      offNewMessage(handleNewMessage);
      offUserTyping(handleUserTyping);
      offUserStopTyping(handleUserStopTyping);
      offPresenceChanged(handlePresenceChanged);
      offIncomingCall(handleIncomingCall);
      disconnectSocket();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
