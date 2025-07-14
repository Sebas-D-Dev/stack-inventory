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

  const { days } = await request.json();

  try {
    // Get products that have external deals
    const products = await prisma.product.findMany({
      where: {
        externalDeals: {
          some: { inStock: true },
        },
      },
      include: {
        category: true,
        vendor: true,
        externalDeals: {
          where: { inStock: true },
          orderBy: { lastChecked: 'desc' },
        },
      },
      take: 20, // Limit for performance
    });

    const forecasts = [];

    for (const product of products) {
      try {
        // Get price history for this product
        const priceHistory = await prisma.inventoryMovement.findMany({
          where: { 
            productId: product.id,
            type: 'PURCHASE',
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });

        const forecast = await forecastPrice(product, priceHistory, days);
        forecasts.push(forecast);
      } catch (error) {
        console.error(`Error forecasting for product ${product.id}:`, error);
      }
    }

    return NextResponse.json({ forecasts });
  } catch (error) {
    console.error('Error generating bulk forecasts:', error);
    return NextResponse.json({ error: 'Failed to generate forecasts' }, { status: 500 });
  }
}