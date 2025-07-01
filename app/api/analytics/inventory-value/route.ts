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
    const products = await prisma.product.findMany();
    const totalValue = products.reduce((acc, product) => acc + product.quantity * product.price, 0);

    return NextResponse.json({ totalValue });
  } catch (error) {
    console.error('Error fetching inventory value:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory value' }, { status: 500 });
  }
}
