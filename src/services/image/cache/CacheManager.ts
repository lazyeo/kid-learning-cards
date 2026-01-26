/**
 * 缓存管理器
 * 封装缓存适配器，提供 hash 生成和统一接口
 */

import type { CacheAdapter, CacheEntry, CacheStats, ColoringCardParams } from '../types';
import { NoOpCacheAdapter } from './NoOpCacheAdapter';

export class CacheManager {
  private adapter: CacheAdapter;

  constructor(adapter?: CacheAdapter) {
    this.adapter = adapter ?? new NoOpCacheAdapter();
  }

  /**
   * 生成参数的 SHA-256 哈希
   * 保持与现有 ImageCacheService 相同的算法以确保兼容性
   */
  async hashParams(params: ColoringCardParams): Promise<string> {
    const normalized = this.normalizeParams(params);
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);

    // 使用 Web Crypto API（浏览器和 Node.js 18+ 都支持）
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 标准化参数，确保相同输入产生相同哈希
   * 必须与现有 ImageCacheService.normalizeParams 保持一致
   */
  private normalizeParams(params: ColoringCardParams): string {
    return JSON.stringify({
      theme: (params.theme || '').toLowerCase().trim(),
      subject: (params.subject || '').toLowerCase().trim(),
      difficulty: params.difficulty,
      customPrompt: (params.customPrompt || '').toLowerCase().trim()
    });
  }

  /**
   * 查找精确匹配的缓存
   */
  async findExactMatch(
    params: ColoringCardParams,
    provider: string
  ): Promise<CacheEntry | null> {
    try {
      return await this.adapter.findExactMatch(params, provider);
    } catch (error) {
      console.error('[CacheManager] findExactMatch error:', error);
      return null;
    }
  }

  /**
   * 存储缓存记录
   */
  async store(
    params: ColoringCardParams,
    promptText: string,
    provider: string,
    imageUrl: string,
    storagePath?: string
  ): Promise<string | null> {
    try {
      return await this.adapter.store(params, promptText, provider, imageUrl, storagePath);
    } catch (error) {
      console.error('[CacheManager] store error:', error);
      return null;
    }
  }

  /**
   * 查找相似缓存
   */
  async findSimilar(
    params: ColoringCardParams,
    limit: number = 5
  ): Promise<CacheEntry[]> {
    if (!this.adapter.findSimilar) {
      return [];
    }
    try {
      return await this.adapter.findSimilar(params, limit);
    } catch (error) {
      console.error('[CacheManager] findSimilar error:', error);
      return [];
    }
  }

  /**
   * 清理过期缓存
   */
  async cleanup(maxAgeDays: number = 30, minAccessCount: number = 1): Promise<number> {
    if (!this.adapter.cleanup) {
      return 0;
    }
    try {
      return await this.adapter.cleanup(maxAgeDays, minAccessCount);
    } catch (error) {
      console.error('[CacheManager] cleanup error:', error);
      return 0;
    }
  }

  /**
   * 获取缓存统计
   */
  async getStats(): Promise<CacheStats> {
    if (!this.adapter.getStats) {
      return { totalEntries: 0, totalHits: 0, topThemes: [] };
    }
    try {
      return await this.adapter.getStats();
    } catch (error) {
      console.error('[CacheManager] getStats error:', error);
      return { totalEntries: 0, totalHits: 0, topThemes: [] };
    }
  }

  /**
   * 获取图库图片
   */
  async getGalleryImages(
    options: { theme?: string; limit?: number; orderBy?: 'popular' | 'recent' } = {}
  ): Promise<CacheEntry[]> {
    if (!this.adapter.getGalleryImages) {
      return [];
    }
    try {
      return await this.adapter.getGalleryImages(options);
    } catch (error) {
      console.error('[CacheManager] getGalleryImages error:', error);
      return [];
    }
  }

  /**
   * 增加图片访问计数
   */
  async incrementAccessCount(imageId: string): Promise<void> {
    if (!this.adapter.incrementAccessCount) {
      return;
    }
    try {
      await this.adapter.incrementAccessCount(imageId);
    } catch (error) {
      console.error('[CacheManager] incrementAccessCount error:', error);
    }
  }

  /**
   * 检查缓存是否启用（非 NoOp）
   */
  isEnabled(): boolean {
    return !(this.adapter instanceof NoOpCacheAdapter);
  }
}
