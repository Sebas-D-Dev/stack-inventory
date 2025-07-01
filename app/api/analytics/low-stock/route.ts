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
    // Use raw query to compare quantity with reorderThreshold
    const lowStockProducts = await prisma.$queryRaw`
      SELECT p.*, c.name as categoryName, v.name as vendorName
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      LEFT JOIN "Vendor" v ON p."vendorId" = v.id
      WHERE p.quantity <= p."reorderThreshold"
      ORDER BY p.name ASC
    `;

    return NextResponse.json(lowStockProducts);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return NextResponse.json({ error: 'Failed to fetch low stock products' }, { status: 500 });
  }
}
