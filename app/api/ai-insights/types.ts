export interface ProductData {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  leadTime?: number;
  minimumOrderQuantity?: number;
  category?: {
    id: string;
    name: string;
  };
  vendor?: {
    id: string;
    name: string;
  };
  inventoryMovements?: Array<{
    id: string;
    quantity: number;
    createdAt: Date;
    type: string;
  }>;
  usageHistory?: Array<{
    id: string;
    date: Date;
    quantity: number;
  }>;
}

export interface CategoryData {
  id: string;
  name: string;
  products?: ProductData[];
}

export interface InsightRequestParams {
  entityType: string;
  entityId: string;
  insightType: string;
}