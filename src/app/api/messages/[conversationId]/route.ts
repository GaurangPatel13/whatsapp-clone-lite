import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getUserFromToken } from '@/server/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
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

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: params.conversationId,
        userId: currentUser.id,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: params.conversationId },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(
      messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        read: m.read,
        sender: m.sender,
      }))
    );
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
