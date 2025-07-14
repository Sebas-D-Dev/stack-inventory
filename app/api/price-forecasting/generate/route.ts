import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';
import { forecastPrice } from '@/lib/price-forecast';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, days } = await request.json();

  try {
    // Get product with external deals
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        vendor: true,
        externalDeals: {
          where: { inStock: true },
          orderBy: { lastChecked: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get price history from inventory movements
    const priceHistory = await prisma.inventoryMovement.findMany({
      where: { 
        productId,
        type: 'PURCHASE',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Generate price forecast
    const forecast = await forecastPrice(product, priceHistory, days);

    return NextResponse.json({ forecast });
  } catch (error) {
    console.error('Error generating price forecast:', error);
    return NextResponse.json({ error: 'Failed to generate forecast' }, { status: 500 });
  }
}