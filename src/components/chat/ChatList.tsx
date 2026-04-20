'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, List, TextField, InputAdornment, IconButton } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { getConversations, createConversation, getUsers } from '@/lib/api';
import { ChatListItem } from './ChatListItem';
import { Avatar } from '@/components/ui/Avatar';
import type { User } from '@/types';

export function ChatList() {
  const { token } = useAuthStore();
  const { conversations, setConversations, activeConversationId } = useChatStore();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(token!),
    enabled: !!token && showNewChat,
  });

  const { data: conversationsData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(token!),
    enabled: !!token,
  });

  useEffect(() => {
    if (conversationsData) {
      setConversations(conversationsData);
    }
  }, [conversationsData, setConversations]);

  const createConversationMutation = useMutation({
    mutationFn: (participantId: string) => createConversation(token!, participantId),
    onSuccess: (newConversation) => {
      setConversations([newConversation, ...conversations]);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setShowNewChat(false);
    },
  });

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants.find((p) => p.userId !== useAuthStore.getState().user?.id);
    return otherParticipant?.user.displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredUsers = users?.filter((u) =>
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelect = (user: User) => {
    createConversationMutation.mutate(user.id);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Chats
          </Typography>
          <IconButton onClick={() => setShowNewChat(!showNewChat)}>
            <AddIcon />
          </IconButton>
        </Box>
        <TextField
          size="small"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {showNewChat ? (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Typography variant="subtitle2" sx={{ p: 2, color: 'text.secondary' }}>
            Start a new conversation
          </Typography>
          {filteredUsers?.map((user) => (
            <Box
              key={user.id}
              onClick={() => handleUserSelect(user)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Avatar name={user.displayName} src={user.avatarUrl} />
              <Typography>{user.displayName}</Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {filteredConversations.map((conversation) => (
            <ChatListItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
            />
          ))}
          {filteredConversations.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ p: 2, textAlign: 'center' }}
            >
              No conversations yet
            </Typography>
          )}
        </List>
      )}
    </Box>
  );
}
