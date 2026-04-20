import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from './auth';
import { prisma } from './db';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const payload = verifyToken(token);
    if (!payload) {
      return next(new Error('Invalid token'));
    }

    socket.userId = payload.userId;
    next();
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`User ${userId} connected`);

    // Update presence to online
    await prisma.presence.upsert({
      where: { userId },
      update: { status: 'ONLINE', lastSeen: new Date() },
      create: { userId, status: 'ONLINE' },
    });

    // Notify others about online status
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

    // Handle sending messages
    socket.on('send_message', async (data: { conversationId: string; content: string }) => {
      try {
        const { conversationId, content } = data;

        // Verify user is participant
        const participant = await prisma.conversationParticipant.findFirst({
          where: { conversationId, userId },
        });

        if (!participant) return;

        // Create message
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            content,
          },
          include: {
            sender: {
              select: { id: true, displayName: true, avatarUrl: true },
            },
          },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        // Broadcast to all in conversation
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

    // Handle typing indicators
    socket.on('typing_start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
      });
    });

    socket.on('typing_stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
        conversationId,
        userId,
      });
    });

    // Handle presence updates
    socket.on('presence_update', async (status: 'ONLINE' | 'OFFLINE' | 'AWAY') => {
      await prisma.presence.update({
        where: { userId },
        data: { status, lastSeen: new Date() },
      });

      socket.broadcast.emit('presence_changed', {
        userId,
        status,
        lastSeen: new Date().toISOString(),
      });
    });

    // Handle call signaling - offer
    socket.on('call_offer', async (data: { calleeId: string; offer: RTCSessionDescriptionInit }) => {
      const { calleeId, offer } = data;

      // Create call record
      const call = await prisma.call.create({
        data: {
          callerId: userId,
          calleeId,
          type: 'VIDEO',
          status: 'PENDING',
        },
      });

      // Send offer to callee
      io.to(`user:${calleeId}`).emit('call_offer_received', {
        callerId: userId,
        offer,
        callId: call.id,
      });

      // Notify callee of incoming call
      io.to(`user:${calleeId}`).emit('incoming_call', {
        id: call.id,
        callerId: userId,
        calleeId,
        type: 'VIDEO',
        status: 'PENDING',
      });
    });

    // Handle call signaling - answer
    socket.on('call_answer', async (data: { callerId: string; answer: RTCSessionDescriptionInit }) => {
      const { callerId, answer } = data;

      io.to(`user:${callerId}`).emit('call_answer_received', { answer });
    });

    // Handle ICE candidates
    socket.on('call_ice_candidate', (data: { peerId: string; candidate: RTCIceCandidateInit }) => {
      const { peerId, candidate } = data;
      io.to(`user:${peerId}`).emit('call_ice_candidate_received', { candidate });
    });

    // Handle call end
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

    // Join user-specific room for calls
    socket.join(`user:${userId}`);

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${userId} disconnected`);

      await prisma.presence.update({
        where: { userId },
        data: { status: 'OFFLINE', lastSeen: new Date() },
      });

      socket.broadcast.emit('presence_changed', {
        userId,
        status: 'OFFLINE',
        lastSeen: new Date().toISOString(),
      });
    });
  });

  return io;
}
