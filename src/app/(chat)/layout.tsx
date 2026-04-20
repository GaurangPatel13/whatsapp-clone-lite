'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import { useAuthStore } from '@/stores/authStore';
import { SocketProvider } from '@/components/providers/SocketProvider';
import { ChatList } from '@/components/chat/ChatList';
import { CallOverlay } from '@/components/call/CallOverlay';
import { IncomingCallDialog } from '@/components/call/IncomingCallDialog';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SocketProvider>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Box
          sx={{
            width: 360,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <ChatList />
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {children}
        </Box>
        <CallOverlay />
        <IncomingCallDialog />
      </Box>
    </SocketProvider>
  );
}
