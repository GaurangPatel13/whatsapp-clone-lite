'use client';

import { Box, Typography, Badge } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { formatConversationTime, truncateText } from '@/lib/utils';
import type { Conversation } from '@/types';

interface ChatListItemProps {
  conversation: Conversation;
  isActive?: boolean;
}

export function ChatListItem({ conversation, isActive }: ChatListItemProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { onlineUsers } = usePresenceStore();

  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== user?.id
  )?.user;

  if (!otherParticipant) return null;

  const isOnline = onlineUsers.has(otherParticipant.id);
  const lastMessage = conversation.lastMessage;

  const handleClick = () => {
    router.push(`/conversation/${conversation.id}`);
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        cursor: 'pointer',
        bgcolor: isActive ? 'action.selected' : 'transparent',
        '&:hover': {
          bgcolor: 'action.hover',
        },
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Avatar
        name={otherParticipant.displayName}
        src={otherParticipant.avatarUrl}
        showOnlineIndicator
        isOnline={isOnline}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" noWrap>
            {otherParticipant.displayName}
          </Typography>
          {lastMessage && (
            <Typography variant="caption" color="text.secondary">
              {formatConversationTime(lastMessage.createdAt)}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ flex: 1, mr: 1 }}
          >
            {lastMessage
              ? truncateText(lastMessage.content, 40)
              : 'No messages yet'}
          </Typography>
          {isOnline && (
            <Badge
              variant="dot"
              color="success"
              sx={{
                '& .MuiBadge-dot': {
                  bgcolor: '#4caf50',
                },
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
