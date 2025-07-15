import { InventoryContext, ExternalContext } from './ai-context-builder';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ContextCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  
  // Cache TTL configurations
  private static readonly TTL_CONFIG = {
    inventory: 5 * 60 * 1000, // 5 minutes for inventory data
    external: 15 * 60 * 1000, // 15 minutes for external data
    user_specific: 2 * 60 * 1000, // 2 minutes for user-specific data
  };

  set<T>(key: string, data: T, type: keyof typeof ContextCache.TTL_CONFIG = 'inventory'): void {
    const ttl = ContextCache.TTL_CONFIG[type];
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics for monitoring
  getStats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      validEntries: entries.filter(([, entry]) => now - entry.timestamp <= entry.ttl).length,
      expiredEntries: entries.filter(([, entry]) => now - entry.timestamp > entry.ttl).length,
      cacheHitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private hitCount = 0;
  private missCount = 0;
  private estimateMemoryUsage(): number {
    // Rough estimation of cache memory usage
    return JSON.stringify(Object.fromEntries(this.cache)).length;
  }

  // Method to track cache hits/misses
  private recordHit(): void {
    this.hitCount++;
  }

  private recordMiss(): void {
    this.missCount++;
  }

  // Enhanced get method with hit/miss tracking
  getWithStats<T>(key: string): T | null {
    const result = this.get<T>(key);
    if (result !== null) {
      this.recordHit();
    } else {
      this.recordMiss();
    }
    return result;
  }
}

// Global cache instance
export const contextCache = new ContextCache();

// Helper functions for common cache operations
export function getCachedInventoryContext(): InventoryContext | null {
  return contextCache.getWithStats<InventoryContext>('inventory_context');
}

export function setCachedInventoryContext(data: InventoryContext): void {
  contextCache.set('inventory_context', data, 'inventory');
}

export function getCachedExternalContext(): ExternalContext | null {
  return contextCache.getWithStats<ExternalContext>('external_context');
}

export function setCachedExternalContext(data: ExternalContext): void {
  contextCache.set('external_context', data, 'external');
}

export function getCachedUserContext(userId: string): Record<string, unknown> | null {
  return contextCache.getWithStats<Record<string, unknown>>(`user_context_${userId}`);
}

export function setCachedUserContext(userId: string, data: Record<string, unknown>): void {
  contextCache.set(`user_context_${userId}`, data, 'user_specific');
}

// Cache invalidation helpers
export function invalidateInventoryCache(): void {
  contextCache.invalidatePattern('inventory_');
}

export function invalidateUserCache(userId: string): void {
  contextCache.invalidate(`user_context_${userId}`);
}

export function invalidateAllCache(): void {
  contextCache.clear();
}

// Scheduled cache cleanup (call this periodically)
export function cleanupExpiredCache(): void {
  const entries = Array.from(contextCache['cache'].entries());
  const now = Date.now();
  
  for (const [key, entry] of entries) {
    if (now - entry.timestamp > entry.ttl) {
      contextCache.invalidate(key);
    }
  }
}

export { ContextCache };
