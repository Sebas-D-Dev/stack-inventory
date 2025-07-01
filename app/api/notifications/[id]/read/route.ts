import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/auth';
import { getServerSession } from 'next-auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const notification = await prisma.notification.update({
      where: {
        id: id,
        userId: (session.user as { id: string }).id,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
  }
}
