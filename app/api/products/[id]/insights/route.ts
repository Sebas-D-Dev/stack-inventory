import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  const productId = id;
  
  try {
    const insights = await prisma.aIInsight.findMany({
      where: {
        entityType: 'PRODUCT',
        entityId: productId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}