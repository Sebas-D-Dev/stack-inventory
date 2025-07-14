interface PriceRecord {
  createdAt: Date;
  cost?: number | null;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  minimumOrderQuantity: number;
  externalDeals: Array<{
    id: string;
    source: string;
    price: number;
    shipping: number | null;
    inStock: boolean;
    externalUrl: string;
    lastChecked: Date;
  }>;
}

export async function forecastPrice(
  product: Product,
  priceHistory: PriceRecord[],
  daysToForecast: number
) {
  // Find the best current deal
  let bestDeal = null;
  if (product.externalDeals && product.externalDeals.length > 0) {
    bestDeal = product.externalDeals.reduce((best, deal) => {
      const totalPrice = deal.price + (deal.shipping || 0);
      const bestTotalPrice = best.price + (best.shipping || 0);
      return totalPrice < bestTotalPrice ? deal : best;
    }, product.externalDeals[0]);
  }

  // Calculate price trend
  const prices = priceHistory
    .filter(record => record.cost && record.cost > 0)
    .map(record => record.cost!)
    .slice(0, 30); // Last 30 purchases

  let predictedPrice = product.price;
  let confidence = 0.5;

  if (prices.length >= 3) {
    // Simple linear regression for price trend
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    // Calculate trend (simplified)
    const recentPrices = prices.slice(0, 10);
    const olderPrices = prices.slice(10, 20);
    
    if (recentPrices.length > 0 && olderPrices.length > 0) {
      const recentAvg = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
      const olderAvg = olderPrices.reduce((sum, p) => sum + p, 0) / olderPrices.length;
      
      const trend = (recentAvg - olderAvg) / olderAvg;
      predictedPrice = avgPrice * (1 + trend * (daysToForecast / 30));
      confidence = Math.min(0.9, prices.length / 30);
    }
  }

  // Calculate recommended quantity based on current stock and usage
  const baseQuantity = Math.max(product.minimumOrderQuantity, 1);
  const lowStockMultiplier = product.quantity <= 10 ? 2 : 1;
  const recommendedQuantity = baseQuantity * lowStockMultiplier;

  // Calculate potential savings
  const currentCost = product.price * recommendedQuantity;
  const dealCost = bestDeal ? (bestDeal.price + (bestDeal.shipping || 0)) * recommendedQuantity : currentCost;
  const savings = currentCost - dealCost;

  return {
    productId: product.id,
    predictedPrice,
    confidence,
    recommendedQuantity,
    bestDeal: bestDeal || {
      source: 'Current Vendor',
      price: product.price,
      shipping: 0,
      inStock: true,
      externalUrl: '#',
    },
    savings,
  };
}