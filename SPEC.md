# WhatsApp Clone - Full Specification

## 1. Project Overview

**Project Name:** WhatsApp Clone
**Type:** Real-time messaging and video/voice calling application
**Core Functionality:** 1-to-1 chat with WebRTC-based voice/video calls
**Target Users:** Desktop web users requiring secure, minimal communication

## 2. Tech Stack

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- MUI (Material UI) for components
- Tailwind CSS for layout
- Zustand for state management (lightweight, minimal boilerplate)
- React Query for server state

### Backend
- Next.js API Routes (integrated, simpler deployment)
- Socket.IO for WebSocket (real-time messaging, presence, WebRTC signaling)
- WebRTC for voice/video calls
- Prisma ORM with PostgreSQL
- JWT for authentication

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌─────────────┐  │
│  │  Chat   │  │  Voice   │  │  Video  │  │  Presence    │  │
│  │  UI     │  │  Call    │  │  Call   │  │  Indicator  │  │
│  └────┬────┘  └────┬─────┘  └────┬────┘  └──────┬──────┘  │
│       │            │             │               │          │
│  ┌────┴────────────┴─────────────┴───────────────┴────┐   │
│  │              Zustand Store + React Query            │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌────────┐  ┌───────────┴───────────┐  ┌──────────────┐  │
│  │ Socket │  │      React Query      │  │  MediaStream │  │
│  │ Client │  │    (server state)     │  │  (WebRTC)    │  │
│  └────┬───┘  └────────────────────────┘  └──────────────┘  │
└───────┼────────────────────────────────────────────────────┘
        │ WebSocket / HTTP
┌───────┴────────────────────────────────────────────────────┐
│                        Backend                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Next.js API │  │  Socket.IO   │  │  WebRTC         │  │
│  │  Routes      │  │  Server      │  │  Signaling      │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│  ┌──────┴─────────────────┴────────────────────┴─────────┐  │
│  │                    Prisma ORM                          │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │                                │
│                    ┌────────┴────────┐                       │
│                    │   PostgreSQL    │                       │
│                    └─────────────────┘                       │
└──────────────────────────────────────────────────────────────┘
```

## 4. Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  displayName   String
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  conversations ConversationParticipant[]
  messages      Message[]
  presence      Presence?
  callsSent     Call[]    @relation("CallsSent")
  callsReceived Call[]    @relation("CallsReceived")
}

model Conversation {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  participants ConversationParticipant[]
  messages     Message[]
}

model ConversationParticipant {
  id             String       @id @default(cuid())
  conversationId String
  userId         String
  joinedAt       DateTime     @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id])
  user         User         @relation(fields: [userId], references: [id])

  @@unique([conversationId, userId])
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  senderId       String
  content        String
  createdAt      DateTime @default(now())
  read           Boolean  @default(false)

  conversation Conversation @relation(fields: [conversationId], references: [id])
  sender       User        @relation(fields: [senderId], references: [id])
}

model Presence {
  id        String   @id @default(cuid())
  userId    String   @unique
  status    PresenceStatus @default(OFFLINE)
  lastSeen  DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}

model Call {
  id          String     @id @default(cuid())
  callerId    String
  calleeId    String
  type        CallType
  status      CallStatus @default(PENDING)
  startedAt   DateTime?
  endedAt     DateTime?

  caller User @relation("CallsSent", fields: [callerId], references: [id])
  callee User @relation("CallsReceived", fields: [calleeId], references: [id])
}

enum PresenceStatus {
  ONLINE
  OFFLINE
  AWAY
}

enum CallType {
  VOICE
  VIDEO
}

enum CallStatus {
  PENDING
  ACCEPTED
  REJECTED
  ENDED
}
```

## 5. API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List all users (for starting conversations)
- `GET /api/users/:id` - Get user by ID

### Conversations
- `POST /api/conversations` - Create/get conversation with user
- `GET /api/conversations` - List user's conversations
- `GET /api/conversations/:id` - Get conversation with messages

### Messages
- `GET /api/messages/:conversationId` - Get messages for conversation
- `PUT /api/messages/:id/read` - Mark message as read

### Presence
- `PUT /api/presence/status` - Update presence status

## 6. WebSocket Events

### Client → Server
- `join` - Join user's conversation rooms
- `send_message` - Send a message
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `call_offer` - WebRTC offer for call
- `call_answer` - WebRTC answer for call
- `call_ice_candidate` - ICE candidate for WebRTC
- `call_end` - End a call
- `presence_update` - Update online status

### Server → Client
- `new_message` - Receive new message
- `message_read` - Message was read
- `user_typing` - Someone is typing
- `user_stop_typing` - Someone stopped typing
- `presence_changed` - User presence changed
- `incoming_call` - Incoming call notification
- `call_offer` - Received WebRTC offer
- `call_answer` - Received WebRTC answer
- `call_ice_candidate` - Received ICE candidate
- `call_ended` - Call ended

## 7. UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                         Header Bar                               │
├────────────────┬────────────────────────────────────────────────┤
│                │  Conversation Header                            │
│                │  [Avatar] Name    [Voice] [Video] [Menu]       │
│  Chat List     ├────────────────────────────────────────────────┤
│                │                                                 │
│  ┌──────────┐  │                                                 │
│  │ Avatar   │  │              Message Area                      │
│  │ Name     │  │                                                 │
│  │ Preview  │  │                                                 │
│  │ Time     │  │                                                 │
│  └──────────┘  │                                                 │
│                │                                                 │
│  ┌──────────┐  ├────────────────────────────────────────────────┤
│  │ Avatar   │  │  Message Input                                 │
│  │ Name     │  │  [Type a message...              ] [Send]    │
│  │ Preview  │  │                                                 │
│  │ Time     │  └────────────────────────────────────────────────┘
│  └──────────┘  │
│                │
│  (scrollable)  │
└────────────────┴────────────────────────────────────────────────┘
```

## 8. Component Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (chat)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (chat list)
│   │   └── conversation/[id]/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/
│   │   ├── Avatar.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Typography.tsx
│   ├── chat/
│   │   ├── ChatList.tsx
│   │   ├── ChatListItem.tsx
│   │   ├── ConversationView.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── CallButton.tsx
│   ├── call/
│   │   ├── CallOverlay.tsx
│   │   ├── IncomingCallDialog.tsx
│   │   ├── ActiveCall.tsx
│   │   └── CallControls.tsx
│   └── providers/
│       ├── SocketProvider.tsx
│       ├── AuthProvider.tsx
│       └── QueryProvider.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useSocket.ts
│   ├── useChat.ts
│   ├── usePresence.ts
│   ├── useWebRTC.ts
│   └── useCall.ts
├── stores/
│   ├── authStore.ts
│   ├── chatStore.ts
│   ├── presenceStore.ts
│   └── callStore.ts
├── lib/
│   ├── api.ts
│   ├── socket.ts
│   ├── webrtc.ts
│   └── utils.ts
├── server/
│   ├── db.ts
│   ├── auth.ts
│   └── socket/
│       ├── index.ts
│       ├── messaging.ts
│       ├── presence.ts
│       └── signaling.ts
└── types/
    └── index.ts
```

## 9. State Management Strategy

Using **Zustand** for client state (simple, minimal boilerplate):
- `authStore` - Current user, JWT token, login/logout
- `chatStore` - Active conversation, messages cache, typing states
- `presenceStore` - Online users, last seen
- `callStore` - Call state, peer connection, local/remote streams

Using **React Query** for server state:
- User data fetching/caching
- Message fetching/caching
- Conversation list
- Mutations for sending messages, etc.

## 10. Setup Instructions

1. Clone and install dependencies
2. Set up PostgreSQL database
3. Configure environment variables
4. Run Prisma migrations
5. Start development server
6. Configure Socket.IO client

## 11. Deployment Considerations

- Vercel: Serverless functions for API, separate WebSocket server needed
- Alternative: Deploy to VPS with custom server
- WebSocket: Use Socket.IO with Redis adapter for scaling
