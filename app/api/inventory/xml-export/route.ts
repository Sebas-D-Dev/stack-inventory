import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';
import { generateXMLDocument, productToXML } from '@/lib/xml-utils';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized - Authentication required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get('type') || 'INVENTORY_UPDATE';
    const format = searchParams.get('format') || 'download'; // 'download' or 'inline'
    const categoryId = searchParams.get('categoryId');
    const vendorId = searchParams.get('vendorId');
    const productIds = searchParams.get('productIds')?.split(',');

    // Validate document type
    const validDocTypes = ['INVENTORY_UPDATE', 'STOCK_REPORT', 'PURCHASE_ORDER'];
    if (!validDocTypes.includes(documentType)) {
      return NextResponse.json(
        { error: `Invalid document type. Must be one of: ${validDocTypes.join(', ')}` },
        { status: 400 }
      );
    }

    let xmlContent = '';

    switch (documentType) {
      case 'INVENTORY_UPDATE':
      case 'STOCK_REPORT':
        xmlContent = await generateProductXML(documentType, {
          categoryId,
          vendorId,
          productIds,
          userId: session.user.id
        });
        break;
      
      case 'PURCHASE_ORDER':
        xmlContent = await generatePurchaseOrderXML(session.user.id);
        break;
      
      default:
        return NextResponse.json(
          { error: `Unsupported document type: ${documentType}` },
          { status: 400 }
        );
    }

    // Log the export activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'XML_EXPORT',
        entityType: 'SYSTEM',
        entityId: `EXPORT_${Date.now()}`,
        details: JSON.stringify({
          documentType,
          filters: { categoryId, vendorId, productIds }
        })
      }
    });

    const filename = `${documentType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.xml`;

    if (format === 'inline') {
      // Return XML content as JSON for API consumption
      return NextResponse.json({
        documentType,
        filename,
        content: xmlContent,
        generated: new Date().toISOString()
      });
    } else {
      // Return as downloadable file
      return new NextResponse(xmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache'
        }
      });
    }

  } catch (error) {
    console.error('XML export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate XML export', details: String(error) },
      { status: 500 }
    );
  }
}

// Generate XML for products (inventory updates or stock reports)
async function generateProductXML(
  documentType: 'INVENTORY_UPDATE' | 'STOCK_REPORT',
  filters: {
    categoryId?: string | null;
    vendorId?: string | null;
    productIds?: string[] | null;
    userId: string;
  }
): Promise<string> {
  
  // Build where clause based on filters
  const whereClause: Record<string, unknown> = {};
  
  if (filters.categoryId) {
    whereClause.categoryId = filters.categoryId;
  }
  
  if (filters.vendorId) {
    whereClause.vendorId = filters.vendorId;
  }
  
  if (filters.productIds && filters.productIds.length > 0) {
    whereClause.id = { in: filters.productIds };
  }

  // Fetch products with related data
  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      category: true,
      vendor: true
    },
    orderBy: { name: 'asc' }
  });

  // Convert to XML format
  const xmlProducts = products.map(product => productToXML(product));

  // Generate XML document
  return generateXMLDocument(documentType, {
    products: xmlProducts
  }, {
    senderId: `USER_${filters.userId}`,
    transactionId: `EXPORT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });
}

// Generate XML for purchase orders
async function generatePurchaseOrderXML(userId: string): Promise<string> {
  
  // Fetch recent purchase orders
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    include: {
      vendor: true,
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50 // Limit to recent orders
  });

  // Convert to XML format
  const xmlOrders = purchaseOrders.map(order => ({
    id: order.id,
    orderNumber: extractOrderNumber(order.notes) || order.id,
    status: order.status,
    vendor: {
      id: order.vendor.id,
      name: order.vendor.name,
      address: undefined, // Vendor model doesn't have address field
      contactInfo: order.vendor.website || undefined
    },
    orderDate: order.orderDate?.toISOString() || order.createdAt.toISOString(),
    expectedDeliveryDate: order.expectedDate?.toISOString(),
    items: order.items.map(item => ({
      productId: item.product.id,
      sku: item.product.sku,
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice
    })),
    totals: {
      subtotal: order.totalAmount * 0.9, // Assuming 10% tax for demo
      tax: order.totalAmount * 0.1,
      shipping: 0,
      total: order.totalAmount,
      currency: 'USD'
    }
  }));

  // Generate XML document
  return generateXMLDocument('PURCHASE_ORDER', {
    orders: xmlOrders
  }, {
    senderId: `USER_${userId}`,
    transactionId: `EXPORT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });
}

// Helper function to extract order number from notes
function extractOrderNumber(notes: string | null): string | null {
  if (!notes) return null;
  
  const match = notes.match(/XML Order: ([^\s-]+)/);
  return match ? match[1] : null;
}

// POST endpoint for bulk export with specific product selection
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized - Authentication required' }, { status: 401 });
  }

  try {
    const { productIds, documentType = 'INVENTORY_UPDATE', includeLowStock = false } = await request.json();

    const whereClause: Record<string, unknown> = {};
    
    if (productIds && productIds.length > 0) {
      whereClause.id = { in: productIds };
    }
    
    if (includeLowStock) {
      // Add condition for low stock items (assuming reorderThreshold field exists)
      whereClause.quantity = { lte: 10 }; // Basic low stock threshold
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        vendor: true
      },
      orderBy: { name: 'asc' }
    });

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No products found matching criteria' },
        { status: 404 }
      );
    }

    // Convert to XML format
    const xmlProducts = products.map(product => productToXML(product));

    // Generate XML document
    const xmlContent = generateXMLDocument(documentType, {
      products: xmlProducts
    }, {
      senderId: `USER_${session.user.id}`,
      transactionId: `BULK_EXPORT_${Date.now()}`
    });

    // Log the export activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'XML_BULK_EXPORT',
        entityType: 'SYSTEM',
        entityId: `BULK_EXPORT_${Date.now()}`,
        details: JSON.stringify({
          documentType,
          productCount: products.length,
          includeLowStock
        })
      }
    });

    const filename = `bulk_${documentType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.xml`;

    return new NextResponse(xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('XML bulk export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate bulk XML export', details: String(error) },
      { status: 500 }
    );
  }
}
