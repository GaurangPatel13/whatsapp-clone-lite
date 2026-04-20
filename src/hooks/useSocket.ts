'use client';

import { useSocket } from '@/components/providers/SocketProvider';

export function useSocketConnection() {
  const { socket, isConnected } = useSocket();

  return {
    socket,
    isConnected,
  };
}
