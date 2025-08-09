import { Product, Category, Vendor } from '@prisma/client';

// XML Schema definitions for different document types
export interface XMLInventoryDocument {
  header: {
    documentType: 'INVENTORY_UPDATE' | 'STOCK_REPORT' | 'PURCHASE_ORDER' | 'INVOICE';
    version: string;
    timestamp: string;
    senderId: string;
    receiverId?: string;
    transactionId: string;
  };
  content: {
    products?: XMLProduct[];
    orders?: XMLPurchaseOrder[];
    movements?: XMLInventoryMovement[];
  };
}

export interface XMLProduct {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: {
    id: string;
    name: string;
  };
  vendor: {
    id: string;
    name: string;
    code?: string;
  };
  pricing: {
    unitPrice: number;
    currency: string;
    costPrice?: number;
  };
  inventory: {
    quantity: number;
    unitOfMeasure: string;
    location?: string;
    reorderThreshold?: number;
    leadTime?: number;
    minimumOrderQuantity?: number;
  };
  identifiers?: {
    barcode?: string;
    supplierProductCode?: string;
    upcCode?: string;
  };
  dates?: {
    createdAt: string;
    updatedAt: string;
    lastRestockDate?: string;
    expirationDate?: string;
  };
  status?: {
    active: boolean;
    discontinued: boolean;
  };
}

export interface XMLPurchaseOrder {
  id: string;
  orderNumber: string;
  status: string;
  vendor: {
    id: string;
    name: string;
    address?: string;
    contactInfo?: string;
  };
  orderDate: string;
  expectedDeliveryDate?: string;
  items: Array<{
    productId: string;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totals: {
    subtotal: number;
    tax?: number;
    shipping?: number;
    total: number;
    currency: string;
  };
}

export interface XMLInventoryMovement {
  id: string;
  productId: string;
  sku: string;
  type: string;
  quantity: number;
  reason?: string;
  reference?: string;
  timestamp: string;
  performedBy: string;
  cost?: number;
}

// Convert database models to XML format
export function productToXML(product: Product & { 
  category: Category | null; 
  vendor: Vendor | null; 
}): XMLProduct {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description || undefined,
    category: {
      id: product.category?.id || '',
      name: product.category?.name || 'Uncategorized'
    },
    vendor: {
      id: product.vendor?.id || '',
      name: product.vendor?.name || 'Unknown Vendor',
      code: product.supplierProductCode || undefined
    },
    pricing: {
      unitPrice: product.price,
      currency: 'USD', // You can make this configurable
      costPrice: undefined // Product model doesn't have cost field yet
    },
    inventory: {
      quantity: product.quantity,
      unitOfMeasure: product.unitOfMeasure || 'EACH',
      location: product.location || undefined,
      reorderThreshold: undefined, // Add reorderThreshold field to Product model if needed
      leadTime: product.leadTime || undefined,
      minimumOrderQuantity: product.minimumOrderQuantity || undefined
    },
    identifiers: {
      barcode: product.barcode || undefined,
      supplierProductCode: product.supplierProductCode || undefined
    },
    dates: {
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      lastRestockDate: product.lastRestockDate?.toISOString(),
      expirationDate: product.expirationDate?.toISOString()
    },
    status: {
      active: true, // You can add an active field to your schema if needed
      discontinued: product.discontinued || false
    }
  };
}

// Generate XML document from data
export function generateXMLDocument(
  documentType: XMLInventoryDocument['header']['documentType'],
  data: {
    products?: XMLProduct[];
    orders?: XMLPurchaseOrder[];
    movements?: XMLInventoryMovement[];
  },
  options: {
    senderId: string;
    receiverId?: string;
    transactionId?: string;
  }
): string {
  const doc: XMLInventoryDocument = {
    header: {
      documentType,
      version: '1.0',
      timestamp: new Date().toISOString(),
      senderId: options.senderId,
      receiverId: options.receiverId,
      transactionId: options.transactionId || generateTransactionId()
    },
    content: data
  };

  return objectToXML(doc, 'InventoryDocument');
}

// Convert object to XML string
function objectToXML(obj: unknown, rootName: string): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<${rootName}>\n`;
  xml += objectToXMLRecursive(obj, 1);
  xml += `</${rootName}>`;
  return xml;
}

function objectToXMLRecursive(obj: unknown, depth: number): string {
  const indent = '  '.repeat(depth);
  let xml = '';

  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      if (Array.isArray(value)) {
        for (const item of value) {
          xml += `${indent}<${key}>\n`;
          if (typeof item === 'object') {
            xml += objectToXMLRecursive(item, depth + 1);
          } else {
            xml += `${indent}  ${escapeXML(String(item))}\n`;
          }
          xml += `${indent}</${key}>\n`;
        }
      } else if (typeof value === 'object') {
        xml += `${indent}<${key}>\n`;
        xml += objectToXMLRecursive(value, depth + 1);
        xml += `${indent}</${key}>\n`;
      } else {
        xml += `${indent}<${key}>${escapeXML(String(value))}</${key}>\n`;
      }
    }
  }

  return xml;
}

// Parse XML to object (basic implementation)
export function parseXMLDocument(xmlString: string): XMLInventoryDocument {
  // Note: In a production environment, you'd want to use a proper XML parser
  // like 'fast-xml-parser' or 'xml2js' for robust XML parsing
  // This is a simplified implementation for demonstration
  
  try {
    // Remove XML declaration and get root element content
    const cleanXML = xmlString.replace(/<\?xml[^>]*\?>/, '').trim();
    
    // This is a simplified parser - in production, use a proper XML library
    parseXMLToObject(cleanXML);
    
    // Return a basic structure for now
    return {
      header: {
        documentType: 'INVENTORY_UPDATE',
        version: '1.0',
        timestamp: new Date().toISOString(),
        senderId: 'parsed',
        transactionId: 'parsed'
      },
      content: {
        products: []
      }
    } as XMLInventoryDocument;
  } catch (error) {
    throw new Error(`Failed to parse XML: ${error}`);
  }
}

// Simplified XML to object parser (use proper library in production)
function parseXMLToObject(xml: string): Record<string, unknown> {
  // This is a very basic implementation
  // In production, use libraries like 'fast-xml-parser' or 'xml2js'
  const result: Record<string, unknown> = {};
  
  // Remove root element wrapper
  const match = xml.match(/<[^>]+>([\s\S]*)<\/[^>]+>$/);
  if (match) {
    // Parse content (simplified)
    // Implementation would go here for proper XML parsing
    result.parsed = true;
  }
  
  return result;
}

// Utility functions
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateTransactionId(): string {
  return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Validation functions
export function validateXMLDocument(doc: XMLInventoryDocument): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate header
  if (!doc.header) {
    errors.push('Missing document header');
  } else {
    if (!doc.header.documentType) errors.push('Missing document type');
    if (!doc.header.senderId) errors.push('Missing sender ID');
    if (!doc.header.transactionId) errors.push('Missing transaction ID');
  }

  // Validate content based on document type
  if (doc.header?.documentType === 'INVENTORY_UPDATE' || doc.header?.documentType === 'STOCK_REPORT') {
    if (!doc.content.products || doc.content.products.length === 0) {
      errors.push('Products array is required for this document type');
    }
  }

  // Validate products if present
  if (doc.content.products) {
    doc.content.products.forEach((product, index) => {
      if (!product.sku) errors.push(`Product ${index}: SKU is required`);
      if (!product.name) errors.push(`Product ${index}: Name is required`);
      if (product.pricing.unitPrice <= 0) errors.push(`Product ${index}: Unit price must be positive`);
      if (product.inventory.quantity < 0) errors.push(`Product ${index}: Quantity cannot be negative`);
    });
  }

  return { valid: errors.length === 0, errors };
}

// Common XML schemas for different document types
export const XML_SCHEMAS = {
  INVENTORY_UPDATE: 'InventoryUpdate_v1.0',
  STOCK_REPORT: 'StockReport_v1.0',
  PURCHASE_ORDER: 'PurchaseOrder_v1.0',
  INVOICE: 'Invoice_v1.0'
};
