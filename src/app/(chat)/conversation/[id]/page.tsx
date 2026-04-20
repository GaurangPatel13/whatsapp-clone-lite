'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { getConversation } from '@/lib/api';
import { ConversationView } from '@/components/chat/ConversationView';

export default function ConversationPage() {
  const params = useParams();
  const { token } = useAuthStore();
  const { conversations, addConversation, setActiveConversation } = useChatStore();

  const conversationId = params.id as string;

  useEffect(() => {
    setActiveConversation(conversationId);
    return () => setActiveConversation(null);
  }, [conversationId, setActiveConversation]);

  const { data: conversation, isLoading } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => getConversation(token!, conversationId),
    enabled: !!token && !!conversationId,
  });

  useEffect(() => {
    if (conversation) {
      const exists = conversations.some((c) => c.id === conversation.id);
      if (!exists) {
        addConversation(conversation);
      }
    }
  }, [conversation, conversations, addConversation]);

  if (isLoading) {
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
        <CircularProgress />
      </Box>
    );
  }

  if (!conversation) {
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
          <Typography variant="h6" gutterBottom>
            Conversation not found
          </Typography>
        </Box>
      </Box>
    );
  }

  return <ConversationView conversation={conversation} />;
}
