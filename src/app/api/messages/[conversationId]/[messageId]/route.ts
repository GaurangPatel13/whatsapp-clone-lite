import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getUserFromToken } from '@/server/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
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

    const message = await prisma.message.findUnique({
      where: { id: params.messageId },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json(
        { message: 'Message not found' },
        { status: 404 }
      );
    }

    // Check if user is participant
    const isParticipant = message.conversation.participants.some(
      (p) => p.userId === currentUser.id
    );

    if (!isParticipant) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }

    const updatedMessage = await prisma.message.update({
      where: { id: params.messageId },
      data: { read: true },
    });

    return NextResponse.json({
      id: updatedMessage.id,
      conversationId: updatedMessage.conversationId,
      senderId: updatedMessage.senderId,
      content: updatedMessage.content,
      createdAt: updatedMessage.createdAt.toISOString(),
      read: updatedMessage.read,
    });
  } catch (error) {
    console.error('Mark message read error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
