import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/auth';
import { getServerSession } from 'next-auth';
import { forecastSales } from '@/lib/stock-forecast';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, days } = await request.json();

  try {
    // Get product usage history
    const usageHistory = await prisma.productUsageHistory.findMany({
      where: { productId },
      orderBy: { date: 'desc' },
      take: 30, // Last 30 records
    });

    // Get inventory movements to calculate usage if we don't have enough usage history
    const movements = await prisma.inventoryMovement.findMany({
      where: { 
        productId,
        type: { in: ['SALE', 'ADJUSTMENT', 'LOSS'] },
        quantity: { lt: 0 } // Only negative quantities (usage)
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    // Convert inventory movements to usage records if needed
    const additionalData = [];
    if (usageHistory.length < 5 && movements.length > 0) {
      for (const movement of movements) {
        additionalData.push({
          quantity: Math.abs(movement.quantity),
          date: movement.createdAt,
        });
      }
    }

    // Convert to the format expected by the forecast function
    const forecastData = [
      ...usageHistory.map(record => ({
        quantity: record.quantity,
        date: record.date,
      })),
      ...additionalData
    ];

    const forecast = forecastSales(forecastData, days);

    return NextResponse.json(forecast);
  } catch (error) {
    console.error('Error generating sales forecast:', error);
    return NextResponse.json({ error: 'Failed to generate sales forecast' }, { status: 500 });
  }
}
