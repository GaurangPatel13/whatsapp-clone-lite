'use client';

import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Box
          component="svg"
          viewBox="0 0 24 24"
          sx={{ width: 120, height: 120, mb: 2, color: 'primary.main', opacity: 0.8 }}
        >
          <path
            fill="currentColor"
            d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9-2-2V4c0-1.1.9-2 2-2zm0 14H6l-2 2V4h16v12z"
          />
        </Box>
        <Typography variant="h5" color="text.primary" gutterBottom>
          WhatsApp Clone
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a conversation to start messaging
        </Typography>
      </Box>
    </Box>
  );
}
