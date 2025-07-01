import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/auth';
import { getServerSession } from 'next-auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const categoryData = categories.map(category => ({
      name: category.name,
      productCount: category._count.products,
    }));

    return NextResponse.json(categoryData);
  } catch (error) {
    console.error('Error fetching category analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch category analytics' }, { status: 500 });
  }
}
