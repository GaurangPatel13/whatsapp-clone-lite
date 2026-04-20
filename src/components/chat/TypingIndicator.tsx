'use client';

import { Box, Typography } from '@mui/material';

interface TypingIndicatorProps {
  userName: string;
}

export function TypingIndicator({ userName }: TypingIndicatorProps) {
  return (
    <Box sx={{ px: 2, py: 1 }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          bgcolor: 'background.paper',
          borderRadius: 2,
          px: 2,
          py: 1,
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: 'text.secondary',
              animation: 'bounce 1.4s infinite ease-in-out',
              '&:nth-of-type(1)': { animationDelay: '0s' },
              '&:nth-of-type(2)': { animationDelay: '0.2s' },
              '&:nth-of-type(3)': { animationDelay: '0.4s' },
            }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {userName} is typing...
        </Typography>
      </Box>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </Box>
  );
}
