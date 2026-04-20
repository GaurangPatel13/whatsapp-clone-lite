'use client';

import { Box, Typography, IconButton } from '@mui/material';
import { MoreVert as MoreVertIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { CallButtons } from './CallButtons';
import { usePresenceStore } from '@/stores/presenceStore';
import { formatLastSeen } from '@/lib/date';
import type { User } from '@/types';

interface ConversationHeaderProps {
  user: User;
  lastSeen?: string;
}

export function ConversationHeader({ user, lastSeen }: ConversationHeaderProps) {
  const router = useRouter();
  const { onlineUsers, userPresence } = usePresenceStore();

  const isOnline = onlineUsers.has(user.id);
  const presence = userPresence[user.id];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <IconButton onClick={() => router.push('/chat')}>
        <ArrowBackIcon />
      </IconButton>
      <Avatar name={user.displayName} src={user.avatarUrl} showOnlineIndicator isOnline={isOnline} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1">{user.displayName}</Typography>
        <Typography variant="caption" color="text.secondary">
          {isOnline ? 'Online' : presence ? formatLastSeen(presence.lastSeen) : lastSeen ? formatLastSeen(lastSeen) : 'Offline'}
        </Typography>
      </Box>
      <CallButtons user={user} />
      <IconButton>
        <MoreVertIcon />
      </IconButton>
    </Box>
  );
}
