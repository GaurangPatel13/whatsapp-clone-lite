import { useChatStore } from '@/stores/chatStore';
import type { Message, Conversation, User } from '@/types';

describe('Chat Store', () => {
  beforeEach(() => {
    useChatStore.setState({
      activeConversationId: null,
      conversations: [],
      messages: {},
      typingUsers: {},
    });
  });

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    displayName: 'Test User',
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockMessage: Message = {
    id: 'msg1',
    conversationId: 'conv1',
    senderId: '1',
    content: 'Hello',
    createdAt: new Date().toISOString(),
    read: false,
  };

  const mockConversation: Conversation = {
    id: 'conv1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participants: [
      {
        id: 'p1',
        conversationId: 'conv1',
        userId: '1',
        joinedAt: new Date().toISOString(),
        user: mockUser,
      },
    ],
    messages: [],
  };

  it('should set active conversation', () => {
    useChatStore.getState().setActiveConversation('conv1');
    expect(useChatStore.getState().activeConversationId).toBe('conv1');
  });

  it('should set conversations', () => {
    useChatStore.getState().setConversations([mockConversation]);
    expect(useChatStore.getState().conversations).toHaveLength(1);
  });

  it('should add conversation', () => {
    useChatStore.setState({ conversations: [] });
    useChatStore.getState().addConversation(mockConversation);
    expect(useChatStore.getState().conversations).toHaveLength(1);
  });

  it('should set messages for conversation', () => {
    useChatStore.getState().setMessages('conv1', [mockMessage]);
    const messages = useChatStore.getState().messages['conv1'];
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe('Hello');
  });

  it('should add message to existing messages', () => {
    useChatStore.getState().setMessages('conv1', [mockMessage]);
    const newMessage = { ...mockMessage, id: 'msg2', content: 'World' };
    useChatStore.getState().addMessage('conv1', newMessage);
    
    const messages = useChatStore.getState().messages['conv1'];
    expect(messages).toHaveLength(2);
  });

  it('should mark message as read', () => {
    useChatStore.getState().setMessages('conv1', [mockMessage]);
    useChatStore.getState().markMessageRead('conv1', 'msg1');
    
    const messages = useChatStore.getState().messages['conv1'];
    expect(messages[0].read).toBe(true);
  });

  it('should set typing user', () => {
    useChatStore.getState().setTypingUser('conv1', 'user2');
    const typingUsers = useChatStore.getState().typingUsers['conv1'];
    expect(typingUsers).toContain('user2');
  });

  it('should remove typing user', () => {
    useChatStore.getState().setTypingUser('conv1', 'user2');
    useChatStore.getState().removeTypingUser('conv1', 'user2');
    const typingUsers = useChatStore.getState().typingUsers['conv1'];
    expect(typingUsers).not.toContain('user2');
  });

  it('should get other participant', () => {
    const otherUser: User = { ...mockUser, id: '2', email: 'other@example.com' };
    const conversation: Conversation = {
      ...mockConversation,
      participants: [
        { id: 'p1', conversationId: 'conv1', userId: '1', joinedAt: new Date().toISOString(), user: mockUser },
        { id: 'p2', conversationId: 'conv1', userId: '2', joinedAt: new Date().toISOString(), user: otherUser },
      ],
    };

    const other = useChatStore.getState().getOtherParticipant(conversation, '1');
    expect(other?.id).toBe('2');
  });
});
