import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/auth';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId, quantity, type, reason } = await request.json();

    if (!productId || !quantity || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check for sufficient stock if quantity is negative
    if (quantity < 0 && product.quantity < Math.abs(quantity)) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    const [inventoryMovement] = await prisma.$transaction([
      prisma.inventoryMovement.create({
        data: {
          productId,
          quantity,
          type,
          reason,
          userId: session.user.id,
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      }),
    ]);

    return NextResponse.json(inventoryMovement, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory movement:', error);
    return NextResponse.json({ error: 'Failed to create inventory movement' }, { status: 500 });
  }
}