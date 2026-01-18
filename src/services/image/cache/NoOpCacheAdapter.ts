/**
 * NoOp 缓存适配器
 * 用于禁用缓存场景或测试环境
 */

import type { CacheAdapter, CacheEntry, CacheStats, ColoringCardParams } from '../types';

export class NoOpCacheAdapter implements CacheAdapter {
  async findExactMatch(
    _params: ColoringCardParams,
    _provider: string
  ): Promise<CacheEntry | null> {
    // 永远不命中缓存
    return null;
  }

  async store(
    _params: ColoringCardParams,
    _promptText: string,
    _provider: string,
    _imageUrl: string,
    _storagePath?: string
  ): Promise<string> {
    // 返回一个伪 ID，但实际不存储
    return `noop-${Date.now()}`;
  }

  async findSimilar(
    _params: ColoringCardParams,
    _limit?: number
  ): Promise<CacheEntry[]> {
    return [];
  }

  async cleanup(
    _maxAgeDays?: number,
    _minAccessCount?: number
  ): Promise<number> {
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
