/**
 * Supabase 缓存适配器
 * 复用现有 ImageCacheService 的逻辑
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { CacheAdapter, CacheEntry, CacheStats, ColoringCardParams } from '../types';

export class SupabaseCacheAdapter implements CacheAdapter {
  private supabase: SupabaseClient;
  private tableName = 'image_cache';

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * 生成参数的 SHA-256 哈希
   */
  private async hashParams(params: ColoringCardParams): Promise<string> {
    const normalized = this.normalizeParams(params);
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 标准化参数
   */
  private normalizeParams(params: ColoringCardParams): string {
    return JSON.stringify({
      theme: (params.theme || '').toLowerCase().trim(),
      subject: (params.subject || '').toLowerCase().trim(),
      difficulty: params.difficulty,
      customPrompt: (params.customPrompt || '').toLowerCase().trim()
    });
  }

  async findExactMatch(
    params: ColoringCardParams,
    provider: string
  ): Promise<CacheEntry | null> {
    const hash = await this.hashParams(params);

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('prompt_hash', hash)
      .eq('provider', provider)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseCacheAdapter] Lookup error:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // 异步更新访问统计（不阻塞返回）
    this.updateAccessStats(data.id, data.access_count).catch(console.error);

    return data as CacheEntry;
  }

  private async updateAccessStats(id: string, currentCount: number): Promise<void> {
    await this.supabase
      .from(this.tableName)
      .update({
        last_accessed_at: new Date().toISOString(),
        access_count: currentCount + 1
      })
      .eq('id', id);
  }

  async store(
    params: ColoringCardParams,
    promptText: string,
    provider: string,
    imageUrl: string,
    storagePath?: string
  ): Promise<string> {
    const hash = await this.hashParams(params);

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        prompt_hash: hash,
        prompt_text: promptText,
        theme: (params.theme || '').toLowerCase(),
        subject: (params.subject || '').toLowerCase(),
        difficulty: params.difficulty,
        custom_prompt: params.customPrompt || null,
        provider: provider,
        image_url: imageUrl,
        storage_path: storagePath || null,
        metadata: {}
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  }

  async findSimilar(
    params: ColoringCardParams,
    limit: number = 5
  ): Promise<CacheEntry[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('theme', (params.theme || '').toLowerCase())
      .eq('difficulty', params.difficulty)
      .ilike('subject', `%${(params.subject || '').toLowerCase()}%`)
      .order('access_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[SupabaseCacheAdapter] findSimilar error:', error);
      return [];
    }

    return (data || []) as CacheEntry[];
  }

  /**
   * 获取热门/最新的图片用于图库展示
   */
  async getGalleryImages(
    options: { theme?: string; limit?: number; offset?: number; orderBy?: 'popular' | 'recent' } = {}
  ): Promise<CacheEntry[]> {
    const { theme, limit = 20, offset = 0, orderBy = 'popular' } = options;

    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .not('image_url', 'is', null);

    if (theme && theme !== 'all') {
      query = query.eq('theme', theme.toLowerCase());
    }

    if (orderBy === 'popular') {
      query = query.order('access_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('[SupabaseCacheAdapter] getGalleryImages error:', error);
      return [];
    }

    return (data || []) as CacheEntry[];
  }

  /**
   * 增加图片访问计数（下载/打印时调用）
   */
  async incrementAccessCount(imageId: string): Promise<void> {
    const { data, error: fetchError } = await this.supabase
      .from(this.tableName)
      .select('access_count')
      .eq('id', imageId)
      .single();

    if (fetchError || !data) {
      console.error('[SupabaseCacheAdapter] incrementAccessCount fetch error:', fetchError);
      return;
    }

    const { error: updateError } = await this.supabase
      .from(this.tableName)
      .update({
        access_count: data.access_count + 1,
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', imageId);

    if (updateError) {
      console.error('[SupabaseCacheAdapter] incrementAccessCount update error:', updateError);
    }
  }

  async cleanup(maxAgeDays: number = 30, minAccessCount: number = 1): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    const { count, error } = await this.supabase
      .from(this.tableName)
      .delete({ count: 'exact' })
      .lt('last_accessed_at', cutoffDate.toISOString())
      .lte('access_count', minAccessCount);

    if (error) {
      throw error;
    }

    return count || 0;
  }

  async getStats(): Promise<CacheStats> {
    // 总条目数
    const { count: totalEntries } = await this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    // 总命中次数
    const { data: hitsData } = await this.supabase
      .from(this.tableName)
      .select('access_count');

    const totalHits = (hitsData || []).reduce((sum, row) => sum + row.access_count, 0);

    // 热门主题
    const { data: themesData } = await this.supabase
      .from(this.tableName)
      .select('theme')
      .limit(100);

    const themeCounts = new Map<string, number>();
    (themesData || []).forEach(row => {
      const theme = row.theme || 'unknown';
      themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);
    });

    const topThemes = Array.from(themeCounts.entries())
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEntries: totalEntries || 0,
      totalHits,
      topThemes
    };
  }
}
