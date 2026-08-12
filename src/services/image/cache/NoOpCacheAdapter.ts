/**
 * NoOp 缓存适配器
 * 用于禁用缓存场景或测试环境
 */

import type { CacheAdapter, CacheEntry, CacheStats } from '../types';

export class NoOpCacheAdapter implements CacheAdapter {
  async findExactMatch(): Promise<CacheEntry | null> {
    // 永远不命中缓存
    return null;
  }

  async store(): Promise<string> {
    // 返回一个伪 ID，但实际不存储
    return `noop-${Date.now()}`;
  }

  async findSimilar(): Promise<CacheEntry[]> {
    return [];
  }

  async cleanup(): Promise<number> {
    return 0;
  }

  async getStats(): Promise<CacheStats> {
    return {
      totalEntries: 0,
      totalHits: 0,
      topThemes: []
    };
  }
}
