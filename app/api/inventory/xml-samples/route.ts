import { NextResponse } from 'next/server';
import { generateXMLDocument } from '@/lib/xml-utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'INVENTORY_UPDATE';

  try {
    let sampleXML = '';

    switch (type) {
      case 'INVENTORY_UPDATE':
        sampleXML = generateSampleInventoryUpdate();
        break;
      case 'STOCK_REPORT':
        sampleXML = generateSampleStockReport();
        break;
      case 'PURCHASE_ORDER':
        sampleXML = generateSamplePurchaseOrder();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid document type' },
          { status: 400 }
        );
    }

    return new NextResponse(sampleXML, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="sample_${type.toLowerCase()}.xml"`,
      },
    });

  } catch (error) {
    console.error('Error generating sample XML:', error);
    return NextResponse.json(
      { error: 'Failed to generate sample XML' },
      { status: 500 }
    );
  }
}

function generateSampleInventoryUpdate(): string {
  const sampleData = {
    products: [
      {
        id: 'SAMPLE_001',
        sku: 'LAPTOP-001',
        name: 'Business Laptop Pro',
        description: 'High-performance business laptop with 16GB RAM',
        category: {
          id: 'CAT_ELECTRONICS',
          name: 'Electronics'
        },
        vendor: {
          id: 'VENDOR_TECH',
          name: 'TechCorp Suppliers',
          code: 'TC001'
        },
        pricing: {
          unitPrice: 1299.99,
          currency: 'USD',
          costPrice: 899.99
        },
        inventory: {
          quantity: 25,
          unitOfMeasure: 'EACH',
          location: 'Warehouse-A-01',
          reorderThreshold: 5,
          leadTime: 7,
          minimumOrderQuantity: 1
        },
        identifiers: {
          barcode: '123456789012',
          supplierProductCode: 'TC-LAPTOP-001',
          upcCode: '012345678901'
        },
        dates: {
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-08-09T14:22:00Z',
          lastRestockDate: '2024-08-01T09:00:00Z'
        },
        status: {
          active: true,
          discontinued: false
        }
      },
      {
        id: 'SAMPLE_002',
        sku: 'MOUSE-WL-001',
        name: 'Wireless Optical Mouse',
        description: 'Ergonomic wireless mouse with USB receiver',
        category: {
          id: 'CAT_ACCESSORIES',
          name: 'Computer Accessories'
        },
        vendor: {
          id: 'VENDOR_PERIPH',
          name: 'Peripheral Plus',
          code: 'PP001'
        },
        pricing: {
          unitPrice: 24.99,
          currency: 'USD',
          costPrice: 12.50
        },
        inventory: {
          quantity: 150,
          unitOfMeasure: 'EACH',
          location: 'Warehouse-B-15',
          reorderThreshold: 20,
          leadTime: 3,
          minimumOrderQuantity: 10
        },
        identifiers: {
          barcode: '234567890123',
          supplierProductCode: 'PP-MOUSE-WL-001'
        },
        dates: {
          createdAt: '2024-02-10T08:15:00Z',
          updatedAt: '2024-08-09T14:22:00Z',
          lastRestockDate: '2024-07-25T11:30:00Z'
        },
        status: {
          active: true,
          discontinued: false
        }
      }
    ]
  };

  return generateXMLDocument('INVENTORY_UPDATE', sampleData, {
    senderId: 'SAMPLE_SYSTEM',
    receiverId: 'YOUR_INVENTORY_SYSTEM',
    transactionId: 'SAMPLE_TXN_001'
  });
}

function generateSampleStockReport(): string {
  const sampleData = {
    products: [
      {
        id: 'STOCK_001',
        sku: 'DESK-CHAIR-001',
        name: 'Ergonomic Office Chair',
        description: 'Adjustable height office chair with lumbar support',
        category: {
          id: 'CAT_FURNITURE',
          name: 'Office Furniture'
        },
        vendor: {
          id: 'VENDOR_OFFICE',
          name: 'Office Solutions Inc',
          code: 'OSI001'
        },
        pricing: {
          unitPrice: 299.99,
          currency: 'USD'
        },
        inventory: {
          quantity: 12,
          unitOfMeasure: 'EACH',
          location: 'Warehouse-C-08',
          reorderThreshold: 5,
          leadTime: 14,
          minimumOrderQuantity: 2
        },
        identifiers: {
          barcode: '345678901234',
          supplierProductCode: 'OSI-CHAIR-ERG-001'
        },
        dates: {
          createdAt: '2024-03-20T14:45:00Z',
          updatedAt: '2024-08-09T14:22:00Z'
        },
        status: {
          active: true,
          discontinued: false
        }
      }
    ]
  };

  return generateXMLDocument('STOCK_REPORT', sampleData, {
    senderId: 'WAREHOUSE_SYSTEM',
    receiverId: 'INVENTORY_MANAGEMENT',
    transactionId: 'STOCK_REPORT_' + Date.now()
  });
}

function generateSamplePurchaseOrder(): string {
  const sampleData = {
    orders: [
      {
        id: 'PO_SAMPLE_001',
        orderNumber: 'PO-2024-001',
        status: 'APPROVED',
        vendor: {
          id: 'VENDOR_SUPPLIES',
          name: 'Global Office Supplies',
          address: '123 Business Park, Suite 100, Corporate City, CC 12345',
          contactInfo: 'orders@globalsupplies.com'
        },
        orderDate: '2024-08-09T10:00:00Z',
        expectedDeliveryDate: '2024-08-16T10:00:00Z',
        items: [
          {
            productId: 'PROD_001',
            sku: 'PAPER-A4-001',
            name: 'A4 Copy Paper - 500 sheets',
            quantity: 20,
            unitPrice: 8.99,
            totalPrice: 179.80
          },
          {
            productId: 'PROD_002',
            sku: 'PEN-BLUE-001',
            name: 'Blue Ballpoint Pen',
            quantity: 100,
            unitPrice: 0.75,
            totalPrice: 75.00
          }
        ],
        totals: {
          subtotal: 254.80,
          tax: 25.48,
          shipping: 15.00,
          total: 295.28,
          currency: 'USD'
        }
      }
    ]
  };

  return generateXMLDocument('PURCHASE_ORDER', sampleData, {
    senderId: 'PURCHASE_SYSTEM',
    receiverId: 'VENDOR_PORTAL',
    transactionId: 'PO_EXPORT_' + Date.now()
  });
}
