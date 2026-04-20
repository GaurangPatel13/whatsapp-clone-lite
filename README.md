# WhatsApp Clone

A real-time messaging and video/voice calling application built with Next.js.

## Features

- Real-time 1-to-1 messaging
- Voice and video calls via WebRTC
- Online/offline presence indicators
- Typing indicators
- JWT-based authentication

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, MUI, Tailwind CSS
- **State Management**: Zustand + React Query
- **Backend**: Next.js API Routes
- **Real-time**: Socket.IO for messaging and WebRTC signaling
- **Calls**: WebRTC
- **Database**: MongoDB via Prisma ORM

## Project Structure

```
whatsapp-clone/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── (auth)/         # Auth pages (login, register)
│   │   ├── (chat)/          # Chat pages
│   │   └── api/            # API routes
│   ├── components/         # React components
│   │   ├── chat/           # Chat-related components
│   │   ├── call/           # Call-related components
│   │   ├── providers/       # Context providers
│   │   └── ui/             # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and helpers
│   ├── server/             # Server-side code
│   ├── stores/             # Zustand stores
│   └── types/              # TypeScript types
├── server.ts               # Custom server with Socket.IO (local dev)
├── ws-server.ts            # Separate WebSocket server (production)
├── vercel.json             # Vercel configuration
├── Dockerfile              # Docker deployment
└── package.json
```

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your MongoDB connection string
```

3. Generate Prisma client and push schema:

```bash
npm run db:generate
npm run db:push
```

4. Start the development server (runs both Next.js and WebSocket):

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev        # Next.js on port 3001
npm run dev:ws     # WebSocket on port 3002
```

5. Open http://localhost:3001 in your browser.

## Testing

```bash
npm test           # Run all tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run with coverage
```

## Deployment

### Vercel + Railway/Render (Recommended)

Since Vercel serverless functions don't support persistent WebSocket connections:

1. **Deploy Next.js frontend to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```
   Set `NEXT_PUBLIC_API_URL` to your WebSocket server URL.

2. **Deploy WebSocket server to Railway/Render:**
   - Create new Web Service
   - Set start command: `npm run start:ws`
   - Set environment variables from `.env`

### Docker (Self-hosted)

```bash
docker build -t whatsapp-clone .
docker run -p 3001:3001 -p 3002:3002 whatsapp-clone
```

### Local Production Build

```bash
npm run build          # Build Next.js
npm run start          # Start production server (includes Socket.IO)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Conversations
- `GET /api/conversations` - List user conversations
- `POST /api/conversations` - Create/get conversation
- `GET /api/conversations/:id` - Get conversation details

### Messages
- `GET /api/messages/:conversationId` - Get messages
- `PUT /api/messages/:id/read` - Mark message as read

### Users
- `GET /api/users` - List users

## WebSocket Events

### Client → Server
- `send_message` - Send a message
- `typing_start` / `typing_stop` - Typing indicators
- `presence_update` - Update presence status
- `call_offer` / `call_answer` / `call_ice_candidate` - WebRTC signaling
- `call_end` - End a call

### Server → Client
- `new_message` - Receive message
- `user_typing` / `user_stop_typing` - Typing indicators
- `presence_changed` - Presence updates
- `incoming_call` - Incoming call
- `call_offer_received` / `call_answer_received` / `call_ice_candidate_received` - WebRTC signaling
- `call_ended` - Call ended

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/whatsapp_clone` |
| `JWT_SECRET` | Secret for JWT signing | (required) |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `PORT` | Next.js server port | `3001` |
| `NEXT_PUBLIC_API_URL` | API URL for client | `http://localhost:3001` |
| `WS_PORT` | WebSocket server port | `3002` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |

## Scalability Considerations

1. **Horizontal Scaling**: Use Redis adapter for Socket.IO to scale WebSocket across multiple instances
2. **Database**: Use MongoDB Atlas with replica set for production
3. **STUN/TURN Servers**: For WebRTC in production, use commercial STUN/TURN servers (e.g., Twilio, Xirsys)
4. **Media Servers**: For many concurrent calls, consider mediasoup or Daily.co for SFU functionality

## License

MIT
