'use client';

import { Box, Typography } from '@mui/material';
import { formatMessageTime } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 1,
        px: 2,
      }}
    >
      <Box
        className="chat-bubble"
        sx={{
          bgcolor: isOwnMessage ? 'chat-outgoing' : 'chat-incoming',
          borderRadius: isOwnMessage
            ? '12px 12px 4px 12px'
            : '12px 12px 12px 4px',
        }}
      >
        <Typography variant="body1" sx={{ color: isOwnMessage ? '#111b21' : 'inherit' }}>
          {message.content}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: isOwnMessage ? 'rgba(0,0,0,0.45)' : 'text.secondary',
            display: 'block',
            textAlign: 'right',
            mt: 0.5,
          }}
        >
          {formatMessageTime(message.createdAt)}
        </Typography>
      </Box>
    </Box>
  );
}
