'use client';

import { useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { getMessages } from '@/lib/api';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { ConversationHeader } from './ConversationHeader';
import type { Conversation } from '@/types';

interface ConversationViewProps {
  conversation: Conversation;
}

export function ConversationView({ conversation }: ConversationViewProps) {
  const { token, user } = useAuthStore();
  const { messages, setMessages, typingUsers } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== user?.id
  )?.user;

  const conversationMessages = messages[conversation.id] || [];

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['messages', conversation.id],
    queryFn: () => getMessages(token!, conversation.id),
    enabled: !!token,
  });

  useEffect(() => {
    if (messagesData) {
      setMessages(conversation.id, messagesData);
    }
  }, [messagesData, conversation.id, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  if (!otherParticipant) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="text.secondary">Select a conversation</Typography>
      </Box>
    );
  }

  const typingUserIds = typingUsers[conversation.id] || [];
  const otherUserTyping = typingUserIds.some((id) => id !== user?.id);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ConversationHeader user={otherParticipant} />

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {conversationMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.senderId === user?.id}
              />
            ))}
            {otherUserTyping && <TypingIndicator userName={otherParticipant.displayName} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      <MessageInput conversationId={conversation.id} />
    </Box>
  );
}
