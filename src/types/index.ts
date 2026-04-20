export type PresenceStatus = 'ONLINE' | 'OFFLINE' | 'AWAY';
export type CallType = 'VOICE' | 'VIDEO';
export type CallStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ENDED';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages: Message[];
  lastMessage?: Message;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: string;
  user: User;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
  sender?: User;
}

export interface Presence {
  id: string;
  userId: string;
  status: PresenceStatus;
  lastSeen: string;
}

export interface Call {
  id: string;
  callerId: string;
  calleeId: string;
  type: CallType;
  status: CallStatus;
  startedAt: string | null;
  endedAt: string | null;
  caller?: User;
  callee?: User;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SocketEvents {
  // Client -> Server
  join: (userId: string) => void;
  send_message: (data: { conversationId: string; content: string }) => void;
  typing_start: (conversationId: string) => void;
  typing_stop: (conversationId: string) => void;
  call_offer: (data: { calleeId: string; offer: RTCSessionDescriptionInit }) => void;
  call_answer: (data: { callerId: string; answer: RTCSessionDescriptionInit }) => void;
  call_ice_candidate: (data: { peerId: string; candidate: RTCIceCandidateInit }) => void;
  call_end: (callId: string) => void;
  presence_update: (status: PresenceStatus) => void;

  // Server -> Client
  new_message: (message: Message) => void;
  message_read: (data: { messageId: string; readAt: string }) => void;
  user_typing: (data: { conversationId: string; userId: string }) => void;
  user_stop_typing: (data: { conversationId: string; userId: string }) => void;
  presence_changed: (presence: Presence) => void;
  incoming_call: (call: Call) => void;
  call_offer_received: (data: { callerId: string; offer: RTCSessionDescriptionInit; callId: string }) => void;
  call_answer_received: (data: { answer: RTCSessionDescriptionInit }) => void;
  call_ice_candidate_received: (data: { candidate: RTCIceCandidateInit }) => void;
  call_ended: (callId: string) => void;
}
