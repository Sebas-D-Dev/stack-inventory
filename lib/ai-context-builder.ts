import prisma from '@/lib/prisma';
import { 
  getCachedInventoryContext, 
  setCachedInventoryContext,
  getCachedExternalContext,
  setCachedExternalContext 
} from './context-cache';

export interface ExternalContext {
  weather?: {
    condition: string;
    temp: number;
    season: string;
    impact: string; // How weather affects inventory
  };
  economic?: {
    usdRate: number;
    lastUpdated: string;
    marketTrend: string;
  };
  industry?: {
    retailSeason: string;
    demandForecast: string;
    marketTrends: string[];
    competitorPricing?: string;
  };
  systemHealth?: {
    dbPerformance: string;
    lastBackup: string;
    activeUsers: number;
  };
}

export interface InventoryContext {
  overview: {
    totalProducts: number;
    lowStockCount: number;
    criticalStockCount: number;
    totalCategories: number;
    totalVendors: number;
    estimatedTotalValue: number;
    monthlyUsageValue: number;
    lastUpdated: string;
    healthScore: number; // 0-100 system health
  };
  stockAlerts: {
    critical: Array<{
      name: string;
      quantity: number;
      daysRemaining: number;
      category?: string;
      vendor?: string;
      price: number;
      averageDailyUsage?: number;
    }>;
    lowStock: Array<{
      name: string;
      quantity: number;
      reorderThreshold: number;
      category?: string;
      vendor?: string;
      price: number;
    }>;
    expiringSoon: Array<{
      name: string;
      expirationDate: string;
      daysUntilExpiry: number;
      quantity: number;
    }>;
  };
  categoryPerformance: Array<{
    name: string;
    productCount: number;
    totalValue: number;
    averagePrice: number;
    recentActivity: number;
    monthlyGrowth: number;
    topProducts: string[];
    stockHealth: 'HEALTHY' | 'ATTENTION' | 'CRITICAL';
  }>;
  vendorPerformance: Array<{
    name: string;
    productCount: number;
    orderCount: number;
    averageProductValue: number;
    recentProducts: string[];
    reliability: number; // 0-100 score
    averageLeadTime: number;
    lastOrderDate?: string;
  }>;
  recentActivity: {
    movements: Array<{
      type: string;
      product: string;
      quantity: number;
      reason: string | null;
      date: string;
      user: string;
      impact: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
    orders: Array<{
      vendor: string;
      status: string;
      itemCount: number;
      totalValue: number;
      date: string;
      expectedDelivery?: string;
      urgency: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
    aiInsights: Array<{
      type: string;
      content: string;
      confidence: number;
      entityType: string;
      applied: boolean;
    }>;
  };
  userBehavior: {
    mostActiveUsers: Array<{
      name: string;
      role: string;
      recentActions: number;
      focus: string; // What they've been working on
    }>;
    systemUsage: {
      dailyActiveUsers: number;
      mostUsedFeatures: string[];
      peakUsageHours: string[];
    };
  };
  predictions: {
    stockouts: Array<{
      product: string;
      estimatedDate: string;
      confidence: number;
      recommendation: string;
    }>;
    demandSpikes: Array<{
      category: string;
      expectedDate: string;
      confidence: number;
      preparedActions: string[];
    }>;
    costOptimizations: Array<{
      area: string;
      potentialSavings: number;
      implementation: string;
    }>;
  };
}

export async function getEnhancedInventoryContext(): Promise<InventoryContext | null> {
  // Try to get from cache first
  const cached = getCachedInventoryContext();
  if (cached) {
    return cached;
  }

  try {
    // Get system settings for thresholds
    const systemSettings = await prisma.systemSetting.findMany({
      where: { category: 'inventory' }
    });
    
    const lowStockThreshold = parseInt(
      systemSettings.find(s => s.key === 'globalLowStockThreshold')?.value || '10'
    );
    const criticalThreshold = parseInt(
      systemSettings.find(s => s.key === 'criticalStockThreshold')?.value || '2'
    );

    const [
      totalProducts,
      lowStockProducts,
      criticalStockProducts,
      expiringSoonProducts,
      categories,
      vendors,
      recentMovements,
      recentOrders,
      aiInsights,
      userActivity,
      forecasts
    ] = await Promise.all([
      // Basic counts
      prisma.product.count(),
      
      // Low stock products with enhanced details
      prisma.product.findMany({
        where: {
          quantity: { lte: lowStockThreshold, gt: criticalThreshold }
        },
        include: { 
          category: true, 
          vendor: true,
          usageHistory: {
            take: 30,
            orderBy: { date: 'desc' }
          }
        },
        orderBy: { quantity: 'asc' },
        take: 15
      }),

      // Critical stock products
      prisma.product.findMany({
        where: {
          quantity: { lte: criticalThreshold }
        },
        include: { 
          category: true, 
          vendor: true,
          usageHistory: {
            take: 30,
            orderBy: { date: 'desc' }
          }
        },
        orderBy: { quantity: 'asc' },
        take: 10
      }),

      // Products expiring soon
      prisma.product.findMany({
        where: {
          expirationDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        },
        orderBy: { expirationDate: 'asc' },
        take: 10
      }),
      
      // Enhanced categories with performance metrics
      prisma.category.findMany({
        include: {
          _count: { select: { products: true } },
          products: {
            select: { 
              quantity: true, 
              price: true, 
              createdAt: true,
              updatedAt: true,
              name: true,
              inventoryMovements: {
                where: {
                  createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  }
                },
                select: { quantity: true, type: true }
              }
            }
          }
        }
      }),
      
      // Enhanced vendors with relationship metrics
      prisma.vendor.findMany({
        include: {
          _count: { select: { products: true, purchaseOrders: true } },
          products: {
            select: { 
              quantity: true, 
              price: true, 
              name: true, 
              leadTime: true,
              updatedAt: true
            },
            orderBy: { updatedAt: 'desc' },
            take: 5
          },
          purchaseOrders: {
            select: { 
              createdAt: true, 
              status: true, 
              totalAmount: true,
              expectedDate: true 
            },
            orderBy: { createdAt: 'desc' },
            take: 3
          }
        }
      }),
      
      // Enhanced recent inventory movements
      prisma.inventoryMovement.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { 
          product: { 
            select: { name: true, quantity: true, price: true } 
          },
          performedBy: {
            select: { name: true, role: true }
          }
        }
      }).catch(() => []),
      
      // Enhanced recent purchase orders
      prisma.purchaseOrder.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: { select: { name: true } },
          items: {
            include: {
              product: { select: { name: true } }
            }
          },
          requestedBy: { select: { name: true } }
        }
      }).catch(() => []),

      // Recent AI insights
      prisma.aIInsight.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      }).catch(() => []),

      // User activity analysis
      prisma.activityLog.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: {
          user: { select: { name: true, role: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }).catch(() => []),

      // Forecast data
      prisma.productForecast.findMany({
        where: {
          forecastDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
          }
        },
        include: {
          product: { select: { name: true, quantity: true } }
        },
        orderBy: { confidence: 'desc' },
        take: 15
      }).catch(() => [])
    ]);

    // Calculate system health metrics
    const totalValue = categories.reduce((sum, cat) => {
      return sum + cat.products.reduce((catSum, p) => catSum + (p.price * p.quantity), 0);
    }, 0);

    const monthlyUsageValue = recentMovements
      .filter(m => m.type === 'SALE' && m.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, m) => sum + (Math.abs(m.quantity) * (m.product.price || 0)), 0);

    // Calculate health score
    const healthFactors = {
      stockLevels: Math.max(0, 100 - (criticalStockProducts.length * 20)),
      categoryBalance: Math.min(100, categories.length * 10),
      vendorDiversity: Math.min(100, vendors.length * 5),
      recentActivity: Math.min(100, recentMovements.length * 2)
    };
    const healthScore = Math.round(
      (healthFactors.stockLevels + healthFactors.categoryBalance + 
       healthFactors.vendorDiversity + healthFactors.recentActivity) / 4
    );

    // Process category performance with enhanced metrics
    const categoryPerformance = categories.map(cat => {
      const totalCatValue = cat.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      const avgPrice = cat.products.length > 0 
        ? cat.products.reduce((sum, p) => sum + p.price, 0) / cat.products.length 
        : 0;
      
      const recentActivity = cat.products.filter(p => 
        new Date(p.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;

      const monthlyMovements = cat.products.reduce((sum, p) => 
        sum + p.inventoryMovements.length, 0
      );

      const lowStockCount = cat.products.filter(p => p.quantity <= lowStockThreshold).length;
      const stockHealth = lowStockCount === 0 ? 'HEALTHY' : 
        lowStockCount < cat.products.length * 0.3 ? 'ATTENTION' : 'CRITICAL';

      return {
        name: cat.name,
        productCount: cat._count.products,
        totalValue: totalCatValue,
        averagePrice: avgPrice,
        recentActivity,
        monthlyGrowth: monthlyMovements,
        topProducts: cat.products
          .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
          .slice(0, 3)
          .map(p => p.name),
        stockHealth: stockHealth as 'HEALTHY' | 'ATTENTION' | 'CRITICAL'
      };
    });

    // Enhanced vendor performance
    const vendorPerformance = vendors.map(vendor => {
      const avgLeadTime = vendor.products.length > 0
        ? vendor.products.reduce((sum, p) => sum + (p.leadTime || 0), 0) / vendor.products.length
        : 0;
      
      const onTimeDeliveries = vendor.purchaseOrders.filter(po => 
        po.status === 'RECEIVED' && po.expectedDate && new Date() <= po.expectedDate
      ).length;
      
      const reliability = vendor.purchaseOrders.length > 0 
        ? (onTimeDeliveries / vendor.purchaseOrders.length) * 100 
        : 100;

      return {
        name: vendor.name,
        productCount: vendor._count.products,
        orderCount: vendor._count.purchaseOrders,
        averageProductValue: vendor.products.length > 0 
          ? vendor.products.reduce((sum, p) => sum + p.price, 0) / vendor.products.length 
          : 0,
        recentProducts: vendor.products.map(p => p.name),
        reliability: Math.round(reliability),
        averageLeadTime: Math.round(avgLeadTime),
        lastOrderDate: vendor.purchaseOrders[0]?.createdAt.toISOString()
      };
    });

    // Analyze user behavior
    const userActivityMap = new Map();
    userActivity.forEach(activity => {
      const key = activity.user.name || 'Unknown';
      if (!userActivityMap.has(key)) {
        userActivityMap.set(key, {
          name: key,
          role: activity.user.role,
          actions: [],
          recentActions: 0
        });
      }
      const userData = userActivityMap.get(key);
      userData.actions.push(activity.action);
      userData.recentActions++;
    });

    const mostActiveUsers = Array.from(userActivityMap.values())
      .sort((a, b) => b.recentActions - a.recentActions)
      .slice(0, 5)
      .map(user => ({
        name: user.name,
        role: user.role,
        recentActions: user.recentActions,
        focus: getMostFrequent(user.actions) || 'Various tasks'
      }));

    // Calculate daily active users
    const uniqueUsers = new Set(userActivity.map(a => a.userId));
    const dailyActiveUsers = Math.round(uniqueUsers.size / 7);

    // Generate predictions based on forecast data and trends
    const stockoutPredictions = forecasts
      .filter(f => f.confidence > 0.7)
      .map(f => ({
        product: f.product.name,
        estimatedDate: f.forecastDate.toISOString().split('T')[0],
        confidence: Math.round(f.confidence * 100),
        recommendation: generateStockoutRecommendation(f)
      }))
      .slice(0, 5);

    const result: InventoryContext = {
      overview: {
        totalProducts,
        lowStockCount: lowStockProducts.length,
        criticalStockCount: criticalStockProducts.length,
        totalCategories: categories.length,
        totalVendors: vendors.length,
        estimatedTotalValue: totalValue,
        monthlyUsageValue,
        lastUpdated: new Date().toISOString(),
        healthScore
      },
      stockAlerts: {
        critical: criticalStockProducts.map(p => ({
          name: p.name,
          quantity: p.quantity,
          daysRemaining: calculateDaysRemaining(p),
          category: p.category?.name,
          vendor: p.vendor?.name,
          price: p.price,
          averageDailyUsage: calculateAverageDailyUsage(p.usageHistory)
        })),
        lowStock: lowStockProducts.map(p => ({
          name: p.name,
          quantity: p.quantity,
          reorderThreshold: p.minimumOrderQuantity,
          category: p.category?.name,
          vendor: p.vendor?.name,
          price: p.price
        })),
        expiringSoon: expiringSoonProducts.map(p => ({
          name: p.name,
          expirationDate: p.expirationDate?.toISOString().split('T')[0] || '',
          daysUntilExpiry: p.expirationDate 
            ? Math.ceil((p.expirationDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
            : 0,
          quantity: p.quantity
        }))
      },
      categoryPerformance,
      vendorPerformance,
      recentActivity: {
        movements: recentMovements.slice(0, 10).map(m => ({
          type: m.type,
          product: m.product.name,
          quantity: m.quantity,
          reason: m.reason,
          date: m.createdAt.toLocaleDateString(),
          user: m.performedBy.name || 'Unknown',
          impact: calculateMovementImpact(m)
        })),
        orders: recentOrders.map(o => ({
          vendor: o.vendor.name,
          status: o.status,
          itemCount: o.items.length,
          totalValue: o.totalAmount,
          date: o.createdAt.toLocaleDateString(),
          expectedDelivery: o.expectedDate?.toLocaleDateString(),
          urgency: calculateOrderUrgency(o)
        })),
        aiInsights: aiInsights.map(insight => ({
          type: insight.insightType,
          content: insight.content,
          confidence: Math.round(insight.confidence * 100),
          entityType: insight.entityType,
          applied: insight.applied
        }))
      },
      userBehavior: {
        mostActiveUsers,
        systemUsage: {
          dailyActiveUsers,
          mostUsedFeatures: calculateMostUsedFeatures(userActivity),
          peakUsageHours: calculatePeakUsageHours(userActivity)
        }
      },
      predictions: {
        stockouts: stockoutPredictions,
        demandSpikes: generateDemandSpikes(categoryPerformance),
        costOptimizations: generateCostOptimizations(vendorPerformance, categoryPerformance)
      }
    };

    // Cache the result
    setCachedInventoryContext(result);
    return result;
  } catch (error) {
    console.error('Error fetching enhanced inventory context:', error);
    return null;
  }
}

// Type definitions for helper functions
interface ProductWithUsage {
  quantity: number;
  usageHistory?: Array<{ quantity: number; date: Date }>;
}

interface MovementWithProduct {
  quantity: number;
  product: { price?: number; quantity?: number };
}

interface OrderWithDetails {
  createdAt: Date;
  status: string;
  expectedDate?: Date | null;
  totalAmount: number;
}

interface ActivityWithUser {
  action: string;
  createdAt: Date;
  userId: string;
}

interface ForecastWithDate {
  forecastDate: Date;
}

interface CategoryPerformance {
  name: string;
  monthlyGrowth: number;
  totalValue: number;
}

interface VendorPerformance {
  reliability: number;
}

// Helper functions for enhanced analysis
function calculateDaysRemaining(product: ProductWithUsage): number {
  if (!product.usageHistory || product.usageHistory.length === 0) return 30; // Default estimate
  
  const avgDailyUsage = calculateAverageDailyUsage(product.usageHistory);
  return avgDailyUsage > 0 ? Math.ceil(product.quantity / avgDailyUsage) : 30;
}

function calculateAverageDailyUsage(usageHistory: Array<{ quantity: number; date: Date }>): number {
  if (!usageHistory || usageHistory.length === 0) return 0;
  
  const totalUsage = usageHistory.reduce((sum, usage) => sum + usage.quantity, 0);
  const daysOfHistory = usageHistory.length;
  return totalUsage / daysOfHistory;
}

function calculateMovementImpact(movement: MovementWithProduct): 'LOW' | 'MEDIUM' | 'HIGH' {
  const valueImpact = Math.abs(movement.quantity) * (movement.product.price || 0);
  const percentageImpact = Math.abs(movement.quantity) / (movement.product.quantity || 1);
  
  if (valueImpact > 1000 || percentageImpact > 0.5) return 'HIGH';
  if (valueImpact > 100 || percentageImpact > 0.1) return 'MEDIUM';
  return 'LOW';
}

function calculateOrderUrgency(order: OrderWithDetails): 'LOW' | 'MEDIUM' | 'HIGH' {
  const daysSinceOrder = (Date.now() - order.createdAt.getTime()) / (24 * 60 * 60 * 1000);
  
  if (order.status === 'PENDING_APPROVAL' && daysSinceOrder > 3) return 'HIGH';
  if (order.status === 'ORDERED' && order.expectedDate && new Date() > order.expectedDate) return 'HIGH';
  if (order.totalAmount > 5000) return 'MEDIUM';
  return 'LOW';
}

function getMostFrequent(items: string[]): string | null {
  if (!items.length) return null;
  
  const frequency: { [key: string]: number } = {};
  items.forEach(item => frequency[item] = (frequency[item] || 0) + 1);
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)[0][0];
}

function calculateMostUsedFeatures(activities: ActivityWithUser[]): string[] {
  const featureMap: { [key: string]: number } = {};
  
  activities.forEach(activity => {
    const feature = mapActionToFeature(activity.action);
    featureMap[feature] = (featureMap[feature] || 0) + 1;
  });
  
  return Object.entries(featureMap)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([feature]) => feature);
}

function mapActionToFeature(action: string): string {
  const featureMap: { [key: string]: string } = {
    'PRODUCT_CREATED': 'Product Management',
    'PRODUCT_UPDATED': 'Product Management',
    'INVENTORY_ADJUSTMENT': 'Inventory Tracking',
    'ORDER_CREATED': 'Purchase Orders',
    'ORDER_APPROVED': 'Purchase Orders',
    'USER_LOGIN': 'Authentication',
    'REPORT_GENERATED': 'Analytics'
  };
  
  return featureMap[action] || 'General Activity';
}

function calculatePeakUsageHours(activities: ActivityWithUser[]): string[] {
  const hourMap: { [key: number]: number } = {};
  
  activities.forEach(activity => {
    const hour = new Date(activity.createdAt).getHours();
    hourMap[hour] = (hourMap[hour] || 0) + 1;
  });
  
  return Object.entries(hourMap)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => `${hour}:00-${hour}:59`);
}

function generateStockoutRecommendation(forecast: ForecastWithDate): string {
  const daysUntilStockout = Math.ceil(
    (forecast.forecastDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
  );
  
  if (daysUntilStockout <= 7) {
    return 'URGENT: Place emergency order immediately';
  } else if (daysUntilStockout <= 14) {
    return 'HIGH PRIORITY: Initiate reorder process within 2-3 days';
  } else {
    return 'PLANNED: Schedule reorder for next week';
  }
}

function generateDemandSpikes(categories: CategoryPerformance[]): Array<{
  category: string;
  expectedDate: string;
  confidence: number;
  preparedActions: string[];
}> {
  return categories
    .filter(cat => cat.monthlyGrowth > 5)
    .slice(0, 3)
    .map(cat => ({
      category: cat.name,
      expectedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      confidence: Math.min(85, 60 + cat.monthlyGrowth * 2),
      preparedActions: [
        'Increase safety stock levels',
        'Contact vendors for bulk pricing',
        'Monitor competitor activity'
      ]
    }));
}

function generateCostOptimizations(vendors: VendorPerformance[], categories: CategoryPerformance[]): Array<{
  area: string;
  potentialSavings: number;
  implementation: string;
}> {
  const optimizations = [];
  
  // Vendor consolidation opportunities
  const lowReliabilityVendors = vendors.filter(v => v.reliability < 80);
  if (lowReliabilityVendors.length > 0) {
    optimizations.push({
      area: 'Vendor Optimization',
      potentialSavings: lowReliabilityVendors.length * 500,
      implementation: 'Consolidate with high-reliability vendors'
    });
  }
  
  // Category optimization
  const highValueCategories = categories.filter(c => c.totalValue > 10000);
  if (highValueCategories.length > 0) {
    optimizations.push({
      area: 'Bulk Purchase Discounts',
      potentialSavings: highValueCategories.reduce((sum, c) => sum + c.totalValue * 0.05, 0),
      implementation: 'Negotiate volume discounts for high-value categories'
    });
  }
  
  return optimizations.slice(0, 3);
}

export async function getExternalContext(): Promise<ExternalContext | null> {
  // Try to get from cache first
  const cached = getCachedExternalContext();
  if (cached) {
    return cached;
  }

  try {
    const results = await Promise.allSettled([
      // Weather API with inventory impact analysis
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=your-city&appid=${process.env.WEATHER_API_KEY}`)
        .then(res => res.ok ? res.json() : null)
        .catch(() => null),
      
      // Economic indicators with market analysis
      fetch('https://api.exchangerate-api.com/v4/latest/USD')
        .then(res => res.ok ? res.json() : null)
        .catch(() => null),

      // System health metrics
      getSystemHealthMetrics()
    ]);

    const [weatherResult, economicResult, systemHealthResult] = results;
    
    const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : null;
    const economic = economicResult.status === 'fulfilled' ? economicResult.value : null;
    const systemHealth = systemHealthResult.status === 'fulfilled' ? systemHealthResult.value : null;

    const result: ExternalContext = {
      weather: weather ? {
        condition: weather.weather?.[0]?.main || 'Unknown',
        temp: weather.main?.temp || 0,
        season: getSeasonFromDate(new Date()),
        impact: getWeatherInventoryImpact(weather.weather?.[0]?.main, getSeasonFromDate(new Date()))
      } : undefined,
      economic: economic ? {
        usdRate: economic.rates?.EUR || 1,
        lastUpdated: economic.date || new Date().toISOString(),
        marketTrend: analyzeMarketTrend(economic.rates?.EUR)
      } : undefined,
      industry: {
        retailSeason: getRetailSeason(),
        demandForecast: getDemandForecast(),
        marketTrends: getMarketTrends(),
        competitorPricing: 'Monitor competitor pricing through external APIs'
      },
      systemHealth: systemHealth || undefined
    };

    // Cache the result
    setCachedExternalContext(result);
    return result;
  } catch (_error) {
    console.error('Failed to fetch external context:', _error);
    return null;
  }
}

async function getSystemHealthMetrics() {
  try {
    const activeUsers = await prisma.user.count({
      where: {
        activityLogs: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        }
      }
    });

    const lastBackup = await prisma.systemSetting.findUnique({
      where: { key: 'lastBackupTime' }
    });

    return {
      dbPerformance: 'Optimal', // You could add actual performance metrics
      lastBackup: lastBackup?.value || 'Unknown',
      activeUsers
    };
  } catch (_error) {
    console.error('Error fetching system health metrics:', _error);
    return {
      dbPerformance: 'Unknown',
      lastBackup: 'Unknown',
      activeUsers: 0
    };
  }
}

function getWeatherInventoryImpact(condition: string, season: string): string {
  if (condition === 'Rain' || condition === 'Snow') {
    return 'Increased demand for indoor products, delivery delays possible';
  }
  if (condition === 'Clear' && season === 'Summer') {
    return 'High demand for cooling products, outdoor equipment';
  }
  if (season === 'Winter') {
    return 'Seasonal demand shifts, heating products in demand';
  }
  return 'Normal seasonal patterns expected';
}

function analyzeMarketTrend(currentRate: number): string {
  // This is a simplified analysis - in reality you'd compare with historical data
  if (currentRate > 0.9) return 'Strong USD - good for imports';
  if (currentRate < 0.8) return 'Weak USD - focus on domestic suppliers';
  return 'Stable currency - normal operations';
}

export async function buildComprehensiveAIContext(userRole: string, specificQuery?: string) {
  const [inventoryData, externalData] = await Promise.all([
    getEnhancedInventoryContext(),
    getExternalContext()
  ]);

  const currentDate = new Date();
  
  const baseContext = `
SYSTEM INFORMATION:
- Current Date: ${currentDate.toLocaleDateString()}
- Current Time: ${currentDate.toLocaleTimeString()}
- User Role: ${userRole}
- System: Stack Inventory Management (AI-Enhanced)
- System Health Score: ${inventoryData?.overview.healthScore || 'N/A'}/100

INVENTORY OVERVIEW:
${inventoryData ? `
- Total Products: ${inventoryData.overview.totalProducts}
- Critical Stock Items: ${inventoryData.overview.criticalStockCount} (URGENT ATTENTION NEEDED)
- Low Stock Items: ${inventoryData.overview.lowStockCount}
- Categories: ${inventoryData.overview.totalCategories}
- Vendors: ${inventoryData.overview.totalVendors}
- Total Inventory Value: $${inventoryData.overview.estimatedTotalValue.toFixed(2)}
- Monthly Usage Value: $${inventoryData.overview.monthlyUsageValue.toFixed(2)}

CRITICAL ALERTS (IMMEDIATE ACTION REQUIRED):
${inventoryData.stockAlerts.critical.length > 0 ? inventoryData.stockAlerts.critical.map(item => 
  `- 🚨 ${item.name}: Only ${item.quantity} units left (${item.daysRemaining} days remaining), Category: ${item.category}, Vendor: ${item.vendor}, Daily Usage: ${item.averageDailyUsage?.toFixed(2) || 'Unknown'}`
).join('\n') : 'No critical stock alerts'}

EXPIRING PRODUCTS (ATTENTION NEEDED):
${inventoryData.stockAlerts.expiringSoon.length > 0 ? inventoryData.stockAlerts.expiringSoon.map(item =>
  `- ⏰ ${item.name}: Expires in ${item.daysUntilExpiry} days (${item.expirationDate}), Quantity: ${item.quantity}`
).join('\n') : 'No products expiring soon'}

LOW STOCK ALERTS:
${inventoryData.stockAlerts.lowStock.slice(0, 8).map(item => 
  `- ⚠️ ${item.name}: ${item.quantity} units (reorder at ${item.reorderThreshold}), Category: ${item.category}, Vendor: ${item.vendor}, Price: $${item.price}`
).join('\n')}

CATEGORY PERFORMANCE ANALYSIS:
${inventoryData.categoryPerformance.map(cat => 
  `- ${cat.name}: ${cat.productCount} products, $${cat.totalValue.toFixed(2)} value, Stock Health: ${cat.stockHealth}, Growth: ${cat.monthlyGrowth} movements/month
    Top Products: ${cat.topProducts.join(', ')}`
).join('\n')}

VENDOR RELATIONSHIP STATUS:
${inventoryData.vendorPerformance.map(vendor => 
  `- ${vendor.name}: ${vendor.productCount} products, ${vendor.orderCount} orders, Reliability: ${vendor.reliability}%, Avg Lead Time: ${vendor.averageLeadTime} days
    Last Order: ${vendor.lastOrderDate ? new Date(vendor.lastOrderDate).toLocaleDateString() : 'Never'}`
).join('\n')}

RECENT ACTIVITY & INSIGHTS:
High Impact Movements:
${inventoryData.recentActivity.movements.filter(m => m.impact === 'HIGH').slice(0, 3).map(m => 
  `- ${m.type}: ${m.product} (${m.quantity > 0 ? '+' : ''}${m.quantity}) by ${m.user} - ${m.reason || 'No reason'} [${m.impact} IMPACT]`
).join('\n')}

Urgent Orders:
${inventoryData.recentActivity.orders.filter(o => o.urgency === 'HIGH').slice(0, 3).map(o => 
  `- ${o.vendor}: ${o.status} ($${o.totalValue}) - ${o.urgency} URGENCY`
).join('\n')}

AI-Generated Insights:
${inventoryData.recentActivity.aiInsights.slice(0, 3).map(insight => 
  `- ${insight.type}: ${insight.content} (${insight.confidence}% confidence) ${insight.applied ? '[APPLIED]' : '[PENDING]'}`
).join('\n')}

PREDICTIVE ANALYTICS:
Stockout Predictions:
${inventoryData.predictions.stockouts.map(pred => 
  `- ${pred.product}: Expected stockout ${pred.estimatedDate} (${pred.confidence}% confidence) - ${pred.recommendation}`
).join('\n')}

Demand Spike Forecasts:
${inventoryData.predictions.demandSpikes.map(spike => 
  `- ${spike.category}: Expected spike ${spike.expectedDate} (${spike.confidence}% confidence)`
).join('\n')}

Cost Optimization Opportunities:
${inventoryData.predictions.costOptimizations.map(opt => 
  `- ${opt.area}: Potential savings $${opt.potentialSavings.toFixed(2)} - ${opt.implementation}`
).join('\n')}

USER ACTIVITY INSIGHTS:
Most Active Users (Last 7 Days):
${inventoryData.userBehavior.mostActiveUsers.map(user => 
  `- ${user.name} (${user.role}): ${user.recentActions} actions, Focus: ${user.focus}`
).join('\n')}

System Usage:
- Daily Active Users: ${inventoryData.userBehavior.systemUsage.dailyActiveUsers}
- Peak Hours: ${inventoryData.userBehavior.systemUsage.peakUsageHours.join(', ')}
- Most Used Features: ${inventoryData.userBehavior.systemUsage.mostUsedFeatures.join(', ')}
` : 'Inventory data unavailable'}

EXTERNAL CONTEXT & MARKET CONDITIONS:
${externalData ? `
Weather & Seasonal Impact: ${externalData.weather?.condition || 'Unknown'} (${externalData.weather?.season})
- Inventory Impact: ${externalData.weather?.impact || 'Normal operations expected'}

Economic Environment:
- Market Trend: ${externalData.economic?.marketTrend || 'Stable'}
- USD/EUR Rate: ${externalData.economic?.usdRate || 'N/A'}

Industry Context:
- Retail Season: ${externalData.industry?.retailSeason}
- Demand Forecast: ${externalData.industry?.demandForecast}
- Market Trends: ${externalData.industry?.marketTrends.join(', ')}

System Health:
- Database Performance: ${externalData.systemHealth?.dbPerformance || 'Unknown'}
- Active Users (24h): ${externalData.systemHealth?.activeUsers || 0}
- Last Backup: ${externalData.systemHealth?.lastBackup || 'Unknown'}
` : 'External data unavailable'}

USER CAPABILITIES (${userRole}):
${getRoleCapabilities(userRole)}

AVAILABLE AI FEATURES:
- Real-time inventory tracking with predictive alerts
- Automated reorder point optimization
- AI-powered demand forecasting and trend analysis
- Smart vendor performance evaluation
- Cost optimization recommendations
- Seasonal demand pattern recognition
- Comprehensive reporting and analytics dashboard
- External market data integration
- User behavior analysis and system optimization
`;

  // Add query-specific context
  if (specificQuery) {
    const contextHints = getQueryContextHints(specificQuery, inventoryData);
    return baseContext + `\n\nQUERY-SPECIFIC CONTEXT:\n${contextHints}`;
  }

  return baseContext;
}

function getRoleCapabilities(role: string): string {
  const capabilities = {
    SUPER_ADMIN: 'Full system access, user management, system configuration, advanced analytics, all AI insights',
    ADMIN: 'Inventory management, reporting, vendor relations, bulk operations, AI recommendations, user oversight',
    MODERATOR: 'Content review, inventory operations, category management, basic AI insights, reporting',
    VENDOR: 'Own product management, sales analytics, restock notifications, order tracking, limited AI insights',
    USER: 'Basic inventory viewing, personal notifications, limited reporting, basic AI insights'
  };
  return capabilities[role as keyof typeof capabilities] || capabilities.USER;
}

function getQueryContextHints(query: string, inventoryData: InventoryContext | null): string {
  const queryLower = query.toLowerCase();
  const hints = [];

  if (queryLower.includes('critical') || queryLower.includes('urgent') || queryLower.includes('emergency')) {
    hints.push(`🚨 CRITICAL ITEMS REQUIRE IMMEDIATE ATTENTION: ${inventoryData?.stockAlerts.critical?.length || 0} products critically low`);
    inventoryData?.stockAlerts.critical.slice(0, 3).forEach(item => {
      hints.push(`   - ${item.name}: ${item.quantity} units, ${item.daysRemaining} days remaining`);
    });
  }

  if (queryLower.includes('reorder') || queryLower.includes('stock') || queryLower.includes('low')) {
    hints.push(`📦 REORDER STATUS: ${inventoryData?.stockAlerts.lowStock?.length || 0} products below reorder threshold`);
    if (inventoryData?.predictions.stockouts.length) {
      hints.push(`   Predicted stockouts: ${inventoryData.predictions.stockouts.slice(0, 2).map(s => s.product).join(', ')}`);
    }
  }
  
  if (queryLower.includes('category') || queryLower.includes('categories')) {
    const criticalCategories = inventoryData?.categoryPerformance?.filter(c => c.stockHealth === 'CRITICAL') || [];
    if (criticalCategories.length > 0) {
      hints.push(`⚠️ CATEGORIES NEEDING ATTENTION: ${criticalCategories.map(c => c.name).join(', ')}`);
    }
    const topCategory = inventoryData?.categoryPerformance?.[0];
    if (topCategory) {
      hints.push(`🏆 Top performing category: ${topCategory.name} ($${topCategory.totalValue.toFixed(2)} value, ${topCategory.stockHealth} health)`);
    }
  }
  
  if (queryLower.includes('vendor') || queryLower.includes('supplier')) {
    const unreliableVendors = inventoryData?.vendorPerformance?.filter(v => v.reliability < 80) || [];
    if (unreliableVendors.length > 0) {
      hints.push(`⚠️ VENDOR RELIABILITY ISSUES: ${unreliableVendors.map(v => `${v.name} (${v.reliability}%)`).join(', ')}`);
    }
    const topVendor = inventoryData?.vendorPerformance?.[0];
    if (topVendor) {
      hints.push(`🏆 Primary vendor: ${topVendor.name} - ${topVendor.productCount} products, ${topVendor.reliability}% reliability`);
    }
  }
  
  if (queryLower.includes('cost') || queryLower.includes('price') || queryLower.includes('budget') || queryLower.includes('savings')) {
    hints.push(`💰 FINANCIAL STATUS: Total inventory value $${inventoryData?.overview?.estimatedTotalValue?.toFixed(2) || 'N/A'}, Monthly usage $${inventoryData?.overview?.monthlyUsageValue?.toFixed(2) || 'N/A'}`);
    if (inventoryData?.predictions.costOptimizations.length) {
      const totalSavings = inventoryData.predictions.costOptimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0);
      hints.push(`   Potential savings identified: $${totalSavings.toFixed(2)}`);
    }
  }
  
  if (queryLower.includes('trend') || queryLower.includes('forecast') || queryLower.includes('predict') || queryLower.includes('future')) {
    hints.push(`📈 TREND ANALYSIS: System health score ${inventoryData?.overview?.healthScore || 'N/A'}/100`);
    if (inventoryData?.predictions.demandSpikes.length) {
      hints.push(`   Upcoming demand spikes: ${inventoryData.predictions.demandSpikes.map(s => s.category).join(', ')}`);
    }
  }

  if (queryLower.includes('expir') || queryLower.includes('shelf') || queryLower.includes('perishable')) {
    hints.push(`⏰ EXPIRATION ALERTS: ${inventoryData?.stockAlerts.expiringSoon?.length || 0} products expiring within 30 days`);
    inventoryData?.stockAlerts.expiringSoon.slice(0, 3).forEach(item => {
      hints.push(`   - ${item.name}: ${item.daysUntilExpiry} days until expiry`);
    });
  }

  if (queryLower.includes('user') || queryLower.includes('activity') || queryLower.includes('usage')) {
    hints.push(`👥 USER ACTIVITY: ${inventoryData?.userBehavior.systemUsage.dailyActiveUsers || 0} daily active users`);
    hints.push(`   Most active: ${inventoryData?.userBehavior.mostActiveUsers.slice(0, 2).map(u => u.name).join(', ')}`);
  }

  return hints.join('\n');
}

// Helper functions (keeping existing ones and adding new ones)
function getSeasonFromDate(date: Date): string {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
}

function getRetailSeason(): string {
  const month = new Date().getMonth();
  if (month >= 10 || month <= 1) return 'Holiday/Winter Shopping Season';
  if (month >= 2 && month <= 4) return 'Spring Refresh Period';
  if (month >= 5 && month <= 7) return 'Summer Season';
  return 'Back-to-School/Fall Preparation';
}

function getDemandForecast(): string {
  const month = new Date().getMonth();
  if (month >= 10 || month <= 1) return 'High demand for seasonal items, holiday surge expected';
  if (month >= 5 && month <= 7) return 'Summer product demand increasing, outdoor equipment trending';
  if (month >= 8 && month <= 9) return 'Back-to-school demand, office supplies surge';
  return 'Moderate demand with seasonal variations, spring cleaning trends';
}

function getMarketTrends(): string[] {
  return [
    'AI-driven inventory automation gaining adoption',
    'Supply chain resilience focus increasing',
    'Sustainable packaging demand rising',
    'Real-time inventory visibility becoming standard',
    'Predictive analytics reducing stockouts by 30%',
    'Multi-channel inventory management essential'
  ];
}
