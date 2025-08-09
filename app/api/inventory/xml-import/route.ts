import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';
import { parseXMLDocument, validateXMLDocument, XMLInventoryDocument } from '@/lib/xml-utils';
import { PurchaseStatus } from '@prisma/client';

interface ProcessingResults {
  processed: number;
  created: number;
  updated: number;
  errors: string[];
  warnings: string[];
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized - Authentication required' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No XML file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.xml')) {
      return NextResponse.json(
        { error: 'Only XML files are supported' },
        { status: 400 }
      );
    }

    const xmlContent = await file.text();
    
    // Parse XML document
    let xmlDoc: XMLInventoryDocument;
    try {
      xmlDoc = parseXMLDocument(xmlContent);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid XML format', details: String(parseError) },
        { status: 400 }
      );
    }

    // Validate XML document structure
    const validation = validateXMLDocument(xmlDoc);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'XML validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const results = {
      processed: 0,
      created: 0,
      updated: 0,
      errors: [] as string[],
      warnings: [] as string[]
    };

    // Process based on document type
    switch (xmlDoc.header.documentType) {
      case 'INVENTORY_UPDATE':
      case 'STOCK_REPORT':
        if (xmlDoc.content.products) {
          await processProductUpdates(xmlDoc.content.products, results, session.user.id);
        }
        break;
      
      case 'PURCHASE_ORDER':
        if (xmlDoc.content.orders) {
          await processPurchaseOrders(xmlDoc.content.orders, results, session.user.id);
        }
        break;
      
      default:
        return NextResponse.json(
          { error: `Unsupported document type: ${xmlDoc.header.documentType}` },
          { status: 400 }
        );
    }

    // Log the import activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'XML_IMPORT',
        entityType: 'SYSTEM',
        entityId: xmlDoc.header.transactionId,
        details: JSON.stringify({
          documentType: xmlDoc.header.documentType,
          senderId: xmlDoc.header.senderId,
          results
        })
      }
    });

    return NextResponse.json({
      success: true,
      transactionId: xmlDoc.header.transactionId,
      documentType: xmlDoc.header.documentType,
      results
    });

  } catch (error) {
    console.error('XML import error:', error);
    return NextResponse.json(
      { error: 'Failed to process XML import', details: String(error) },
      { status: 500 }
    );
  }
}

// Helper function to process product updates from XML
async function processProductUpdates(
  xmlProducts: XMLInventoryDocument['content']['products'],
  results: ProcessingResults,
  userId: string
) {
  if (!xmlProducts) return;

  for (const xmlProduct of xmlProducts) {
    try {
      results.processed++;

      // Check if product exists by SKU
      const existingProduct = await prisma.product.findUnique({
        where: { sku: xmlProduct.sku }
      });

      // Verify category and vendor exist
      const category = await prisma.category.findFirst({
        where: { 
          OR: [
            { id: xmlProduct.category.id },
            { name: xmlProduct.category.name }
          ]
        }
      });

      const vendor = await prisma.vendor.findFirst({
        where: {
          OR: [
            { id: xmlProduct.vendor.id },
            { name: xmlProduct.vendor.name }
          ]
        }
      });

      if (!category) {
        results.errors.push(`Product ${xmlProduct.sku}: Category '${xmlProduct.category.name}' not found`);
        continue;
      }

      if (!vendor) {
        results.errors.push(`Product ${xmlProduct.sku}: Vendor '${xmlProduct.vendor.name}' not found`);
        continue;
      }

      const productData = {
        name: xmlProduct.name,
        description: xmlProduct.description || null,
        sku: xmlProduct.sku,
        price: xmlProduct.pricing.unitPrice,
        quantity: xmlProduct.inventory.quantity,
        categoryId: category.id,
        vendorId: vendor.id,
        userId: userId,
        unitOfMeasure: xmlProduct.inventory.unitOfMeasure || 'EACH',
        location: xmlProduct.inventory.location || null,
        barcode: xmlProduct.identifiers?.barcode || null,
        supplierProductCode: xmlProduct.identifiers?.supplierProductCode || null,
        leadTime: xmlProduct.inventory.leadTime || null,
        minimumOrderQuantity: xmlProduct.inventory.minimumOrderQuantity || 1,
        discontinued: xmlProduct.status?.discontinued || false,
        expirationDate: xmlProduct.dates?.expirationDate ? new Date(xmlProduct.dates.expirationDate) : null
      };

      if (existingProduct) {
        // Update existing product
        await prisma.product.update({
          where: { sku: xmlProduct.sku },
          data: productData
        });
        results.updated++;
        
        // Create inventory movement record for quantity changes
        if (existingProduct.quantity !== xmlProduct.inventory.quantity) {
          const quantityDiff = xmlProduct.inventory.quantity - existingProduct.quantity;
          await prisma.inventoryMovement.create({
            data: {
              productId: existingProduct.id,
              quantity: quantityDiff,
              type: 'ADJUSTMENT',
              reason: `XML Import - ${xmlProduct.sku}`,
              reference: `XML_IMPORT_${Date.now()}`,
              userId: userId
            }
          });
        }
      } else {
        // Create new product
        const newProduct = await prisma.product.create({
          data: productData
        });
        results.created++;

        // Create initial inventory movement
        if (xmlProduct.inventory.quantity > 0) {
          await prisma.inventoryMovement.create({
            data: {
              productId: newProduct.id,
              quantity: xmlProduct.inventory.quantity,
              type: 'ADJUSTMENT',
              reason: `Initial stock - XML Import`,
              reference: `XML_IMPORT_${Date.now()}`,
              userId: userId
            }
          });
        }
      }

    } catch (productError) {
      results.errors.push(`Product ${xmlProduct.sku}: ${String(productError)}`);
      console.error('Product processing error:', productError);
    }
  }
}

// Helper function to process purchase orders from XML
async function processPurchaseOrders(
  xmlOrders: XMLInventoryDocument['content']['orders'],
  results: ProcessingResults,
  userId: string
) {
  if (!xmlOrders) return;

  for (const xmlOrder of xmlOrders) {
    try {
      results.processed++;

      // Check if order already exists by notes field (since no orderNumber field exists)
      const existingOrder = await prisma.purchaseOrder.findFirst({
        where: { 
          notes: {
            contains: `XML Order: ${xmlOrder.orderNumber}`
          }
        }
      });

      if (existingOrder) {
        results.warnings.push(`Purchase Order ${xmlOrder.orderNumber} already exists - skipping`);
        continue;
      }

      // Verify vendor exists
      const vendor = await prisma.vendor.findFirst({
        where: {
          OR: [
            { id: xmlOrder.vendor.id },
            { name: xmlOrder.vendor.name }
          ]
        }
      });

      if (!vendor) {
        results.errors.push(`Order ${xmlOrder.orderNumber}: Vendor '${xmlOrder.vendor.name}' not found`);
        continue;
      }

      // Map XML status to PurchaseStatus enum
      const statusMap: Record<string, PurchaseStatus> = {
        'DRAFT': PurchaseStatus.DRAFT,
        'PENDING': PurchaseStatus.PENDING_APPROVAL,
        'APPROVED': PurchaseStatus.APPROVED,
        'ORDERED': PurchaseStatus.ORDERED,
        'RECEIVED': PurchaseStatus.RECEIVED,
        'CANCELLED': PurchaseStatus.CANCELLED
      };

      const mappedStatus = statusMap[xmlOrder.status.toUpperCase()] || PurchaseStatus.DRAFT;

      // Create purchase order
      const newOrder = await prisma.purchaseOrder.create({
        data: {
          vendorId: vendor.id,
          status: mappedStatus,
          orderDate: new Date(xmlOrder.orderDate),
          expectedDate: xmlOrder.expectedDeliveryDate ? new Date(xmlOrder.expectedDeliveryDate) : null,
          totalAmount: xmlOrder.totals.total,
          requesterId: userId,
          notes: `XML Order: ${xmlOrder.orderNumber} - Imported from XML - Transaction ID: ${xmlOrder.id}`
        }
      });

      // Create purchase order items
      for (const xmlItem of xmlOrder.items) {
        const product = await prisma.product.findUnique({
          where: { sku: xmlItem.sku }
        });

        if (product) {
          await prisma.purchaseItem.create({
            data: {
              purchaseOrderId: newOrder.id,
              productId: product.id,
              quantity: xmlItem.quantity,
              unitPrice: xmlItem.unitPrice,
              totalPrice: xmlItem.totalPrice
            }
          });
        } else {
          results.warnings.push(`Order ${xmlOrder.orderNumber}: Product ${xmlItem.sku} not found - item skipped`);
        }
      }

      results.created++;

    } catch (orderError) {
      results.errors.push(`Order ${xmlOrder.orderNumber}: ${String(orderError)}`);
      console.error('Order processing error:', orderError);
    }
  }
}
