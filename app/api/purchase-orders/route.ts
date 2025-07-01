import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/auth';
import { getServerSession } from 'next-auth';

// GET all purchase orders
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        vendor: true,
        items: {
          include: {
            product: true,
          },
        },
        requestedBy: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 });
  }
}

// POST a new purchase order
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { vendorId, items, status } = await request.json();

    if (!vendorId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Prepare items and calculate total amount
      const purchaseItemsData = [];
      let totalAmount = 0;
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`Product with id ${item.productId} not found`);
        }
        const itemTotalPrice = product.price * item.quantity;
        totalAmount += itemTotalPrice;
        purchaseItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: itemTotalPrice,
        });
      }

      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          vendorId,
          totalAmount,
          status: status || 'PENDING',
          requesterId: session.user.id,
          items: {
            create: purchaseItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // Log the activity
      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE_PURCHASE_ORDER',
          entityType: 'PURCHASE_ORDER',
          entityId: purchaseOrder.id,
          details: JSON.stringify(purchaseOrder),
        },
      });

      return purchaseOrder;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 });
  }
}
