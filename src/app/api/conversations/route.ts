import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getUserFromToken } from '@/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const currentUser = await getUserFromToken(token);

    if (!currentUser) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: currentUser.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
                avatarUrl: true,
                presence: {
                  select: {
                    status: true,
                    lastSeen: true,
                  },
                },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      participants: conv.participants.map((p) => ({
        id: p.id,
        conversationId: p.conversationId,
        userId: p.userId,
        joinedAt: p.joinedAt.toISOString(),
        user: {
          id: p.user.id,
          email: p.user.email,
          displayName: p.user.displayName,
          avatarUrl: p.user.avatarUrl,
          presence: p.user.presence
            ? {
                status: p.user.presence.status,
                lastSeen: p.user.presence.lastSeen.toISOString(),
              }
            : null,
        },
      })),
      lastMessage: conv.messages[0]
        ? {
            id: conv.messages[0].id,
            conversationId: conv.messages[0].conversationId,
            senderId: conv.messages[0].senderId,
            content: conv.messages[0].content,
            createdAt: conv.messages[0].createdAt.toISOString(),
            read: conv.messages[0].read,
            sender: conv.messages[0].sender,
          }
        : null,
    }));

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const currentUser = await getUserFromToken(token);

    if (!currentUser) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { participantId } = await request.json();

    if (!participantId) {
      return NextResponse.json(
        { message: 'Participant ID is required' },
        { status: 400 }
      );
    }

    // Check if participant exists
    const participant = await prisma.user.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if conversation already exists between these users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { userId: currentUser.id },
            },
          },
          {
            participants: {
              some: { userId: participantId },
            },
          },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
                avatarUrl: true,
                presence: {
                  select: {
                    status: true,
                    lastSeen: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (existingConversation) {
      return NextResponse.json({
        id: existingConversation.id,
        createdAt: existingConversation.createdAt.toISOString(),
        updatedAt: existingConversation.updatedAt.toISOString(),
        participants: existingConversation.participants.map((p) => ({
          id: p.id,
          conversationId: p.conversationId,
          userId: p.userId,
          joinedAt: p.joinedAt.toISOString(),
          user: {
            id: p.user.id,
            email: p.user.email,
            displayName: p.user.displayName,
            avatarUrl: p.user.avatarUrl,
            presence: p.user.presence
              ? {
                  status: p.user.presence.status,
                  lastSeen: p.user.presence.lastSeen.toISOString(),
                }
              : null,
          },
        })),
      });
    }

    // Create new conversation with participants separately
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          createMany: {
            data: [
              { userId: currentUser.id },
              { userId: participantId },
            ],
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
                avatarUrl: true,
                presence: {
                  select: {
                    status: true,
                    lastSeen: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      id: conversation.id,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      participants: conversation.participants.map((p) => ({
        id: p.id,
        conversationId: p.conversationId,
        userId: p.userId,
        joinedAt: p.joinedAt.toISOString(),
        user: {
          id: p.user.id,
          email: p.user.email,
          displayName: p.user.displayName,
          avatarUrl: p.user.avatarUrl,
          presence: p.user.presence
            ? {
                status: p.user.presence.status,
                lastSeen: p.user.presence.lastSeen.toISOString(),
              }
            : null,
        },
      })),
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
