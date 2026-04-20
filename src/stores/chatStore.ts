import { create } from 'zustand';
import type { Message, Conversation, User } from '@/types';

interface ChatState {
  activeConversationId: string | null;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
  setActiveConversation: (id: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  markMessageRead: (conversationId: string, messageId: string) => void;
  setTypingUser: (conversationId: string, userId: string) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
  clearTypingUsers: (conversationId: string) => void;
  getOtherParticipant: (conversation: Conversation, currentUserId: string) => User | null;
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeConversationId: null,
  conversations: [],
  messages: {},
  typingUsers: {},

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),

  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      },
    })),

  markMessageRead: (conversationId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, read: true } : msg
        ),
      },
    })),

  setTypingUser: (conversationId, userId) =>
    set((state) => {
      const currentTyping = state.typingUsers[conversationId] || [];
      if (currentTyping.includes(userId)) return state;
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...currentTyping, userId],
        },
      };
    }),

  removeTypingUser: (conversationId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: (state.typingUsers[conversationId] || []).filter((id) => id !== userId),
      },
    })),

  clearTypingUsers: (conversationId) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [conversationId]: [] },
    })),

  getOtherParticipant: (conversation, currentUserId) => {
    const participant = conversation.participants.find((p) => p.userId !== currentUserId);
    return participant?.user || null;
  },
}));
