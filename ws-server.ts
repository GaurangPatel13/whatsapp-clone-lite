import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { verifyToken } from './src/server/auth';
import { prisma } from './src/server/db';

const PORT = process.env.WS_PORT || 3002;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

const httpServer = createServer();
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || 
                socket.handshake.headers?.authorization?.split(' ')[1];

  if (!token) {
    return next(new Error('Authentication required'));
  }

  const payload = verifyToken(token);
  if (!payload) {
    return next(new Error('Invalid token'));
  }

  (socket as any).userId = payload.userId;
  next();
});

io.on('connection', async (socket) => {
  const userId = (socket as any).userId as string;
  console.log(`User ${userId} connected`);

  try {
    // Update presence to online
    await prisma.presence.upsert({
      where: { userId },
      update: { status: 'ONLINE', lastSeen: new Date() },
      create: { userId, status: 'ONLINE' },
    });

    // Notify others
    socket.broadcast.emit('presence_changed', {
      userId,
      status: 'ONLINE',
      lastSeen: new Date().toISOString(),
    });

    // Join user's conversation rooms
    const userConversations = await prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true },
    });

    userConversations.forEach((conv) => {
      socket.join(`conversation:${conv.conversationId}`);
    });

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Handle messages
    socket.on('send_message', async (data: { conversationId: string; content: string }) => {
      try {
        const { conversationId, content } = data;

        const participant = await prisma.conversationParticipant.findFirst({
          where: { conversationId, userId },
        });

        if (!participant) return;

        const message = await prisma.message.create({
          data: { conversationId, senderId: userId, content },
          include: {
            sender: { select: { id: true, displayName: true, avatarUrl: true } },
          },
        });

        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        io.to(`conversation:${conversationId}`).emit('new_message', {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
          read: message.read,
          sender: message.sender,
        });
      } catch (error) {
        console.error('Send message error:', error);
      }
    });

    // Typing indicators
    socket.on('typing_start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', { conversationId, userId });
    });

    socket.on('typing_stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user_stop_typing', { conversationId, userId });
    });

    // Presence
    socket.on('presence_update', async (status: string) => {
      await prisma.presence.update({
        where: { userId },
        data: { status, lastSeen: new Date() },
      });
      socket.broadcast.emit('presence_changed', { userId, status, lastSeen: new Date().toISOString() });
    });

    // Call signaling
    socket.on('call_offer', async (data: { calleeId: string; offer: RTCSessionDescriptionInit }) => {
      const { calleeId, offer } = data;
      const call = await prisma.call.create({
        data: { callerId: userId, calleeId, type: 'VIDEO', status: 'PENDING' },
      });

      io.to(`user:${calleeId}`).emit('call_offer_received', { callerId: userId, offer, callId: call.id });
      io.to(`user:${calleeId}`).emit('incoming_call', {
        id: call.id, callerId: userId, calleeId, type: 'VIDEO', status: 'PENDING',
      });
    });

    socket.on('call_answer', async (data: { callerId: string; answer: RTCSessionDescriptionInit }) => {
      io.to(`user:${data.callerId}`).emit('call_answer_received', { answer: data.answer });
    });

    socket.on('call_ice_candidate', (data: { peerId: string; candidate: RTCIceCandidateInit }) => {
      io.to(`user:${data.peerId}`).emit('call_ice_candidate_received', { candidate: data.candidate });
    });

    socket.on('call_end', async (callId: string) => {
      try {
        await prisma.call.update({
          where: { id: callId },
          data: { status: 'ENDED', endedAt: new Date() },
        });

        const call = await prisma.call.findUnique({ where: { id: callId } });
        if (call) {
          const otherUserId = call.callerId === userId ? call.calleeId : call.callerId;
          io.to(`user:${otherUserId}`).emit('call_ended', callId);
        }
      } catch (error) {
        console.error('Call end error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${userId} disconnected`);
      await prisma.presence.update({
        where: { userId },
        data: { status: 'OFFLINE', lastSeen: new Date() },
      });
      socket.broadcast.emit('presence_changed', {
        userId, status: 'OFFLINE', lastSeen: new Date().toISOString(),
      });
    });
  } catch (error) {
    console.error('Socket error:', error);
  }
});

httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
