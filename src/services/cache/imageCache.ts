import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { type ColoringCardParams } from '../ai/types';

/**
 * 缓存记录类型
 */
export interface CacheEntry {
  id: string;
  prompt_hash: string;
  prompt_text: string;
  theme: string;
  subject: string;
  difficulty: string;
  custom_prompt: string | null;
  provider: string;
  image_url: string;
  storage_path: string | null;
  created_at: string;
  last_accessed_at: string;
  access_count: number;
  metadata: Record<string, unknown>;
}

/**
 * 图片缓存服务
 * 使用 Supabase PostgreSQL 存储缓存索引
 */
export class ImageCacheService {
  private supabase: SupabaseClient;
  private tableName = 'image_cache';

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * 生成参数的 SHA-256 哈希
   * 用于精确匹配缓存
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
   * 标准化参数，确保相同输入产生相同哈希
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
   * @returns 缓存记录或 null
   */
  async findExactMatch(
    params: ColoringCardParams,
    provider: string
  ): Promise<CacheEntry | null> {
    try {
      const hash = await this.hashParams(params);

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('prompt_hash', hash)
        .eq('provider', provider)
        .maybeSingle();

      if (error) {
        console.error('Cache lookup error:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // 异步更新访问统计（不阻塞返回）
      this.updateAccessStats(data.id, data.access_count).catch(console.error);

      return data as CacheEntry;
    } catch (error) {
      console.error('Cache findExactMatch error:', error);
      return null;
    }
  }

  /**
   * 更新缓存访问统计
   */
  private async updateAccessStats(id: string, currentCount: number): Promise<void> {
    await this.supabase
      .from(this.tableName)
      .update({
        last_accessed_at: new Date().toISOString(),
        access_count: currentCount + 1
      })
      .eq('id', id);
  }

  /**
   * 存储新的缓存记录
   * @returns 新记录的 ID
   */
  async store(
    params: ColoringCardParams,
    promptText: string,
    provider: string,
    imageUrl: string,
    storagePath?: string
  ): Promise<string> {
    try {
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
    } catch (error) {
      console.error('Cache store error:', error);
      throw error;
    }
  }

  /**
   * 按主题和对象查找相似缓存（可选，用于推荐）
   */
  async findSimilar(
    params: ColoringCardParams,
    limit: number = 5
  ): Promise<CacheEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('theme', (params.theme || '').toLowerCase())
        .eq('difficulty', params.difficulty)
        .ilike('subject', `%${(params.subject || '').toLowerCase()}%`)
        .order('access_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Cache findSimilar error:', error);
        return [];
      }

      return (data || []) as CacheEntry[];
    } catch (error) {
      console.error('Cache findSimilar error:', error);
      return [];
    }
  }

  /**
   * 清理过期缓存
   * @param maxAgeDays 最大缓存天数
   * @param minAccessCount 最小访问次数（低于此值的过期缓存会被删除）
   */
  async cleanup(maxAgeDays: number = 30, minAccessCount: number = 1): Promise<number> {
    try {
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
    } catch (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<{
    totalEntries: number;
    totalHits: number;
    topThemes: Array<{ theme: string; count: number }>;
  }> {
    try {
      // 总条目数
      const { count: totalEntries } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      // 总命中次数
      const { data: hitsData } = await this.supabase
        .from(this.tableName)
        .select('access_count');

      const totalHits = (hitsData || []).reduce((sum, row) => sum + row.access_count, 0);

      // 热门主题（简化查询）
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
    } catch (error) {
      console.error('Cache getStats error:', error);
      return { totalEntries: 0, totalHits: 0, topThemes: [] };
    }
  }
}
