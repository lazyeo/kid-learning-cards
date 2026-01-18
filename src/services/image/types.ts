/**
 * ImageService 统一类型定义
 */

import type { ColoringCardParams, ImageGenOptions } from '../ai/types';

// ============================================================================
// Core Result Types
// ============================================================================

/**
 * 图片生成结果（统一返回类型）
 */
export interface GenerateResult {
  /** 图片 URL（存储 URL 或原始 URL） */
  imageUrl: string;
  /** 使用的 Provider ID */
  provider: string;
  /** 是否来自缓存 */
  cached: boolean;
  /** 缓存记录 ID（如果有） */
  cacheId?: string;
  /** 存储路径（如果已持久化） */
  storagePath?: string;
  /** 失败的 Provider 列表（如果有降级） */
  failedProviders?: ProviderError[];
}

/**
 * Provider 错误信息
 */
export interface ProviderError {
  providerId: string;
  providerName: string;
  error: string;
  timestamp: number;
}

// ============================================================================
// Generation Options
// ============================================================================

/**
 * 生成选项
 */
export interface GenerateOptions {
  /** 指定使用的 Provider ID */
  provider?: string;
  /** 跳过缓存查询 */
  skipCache?: boolean;
  /** 强制重新生成（忽略缓存） */
  forceRefresh?: boolean;
  /** 超时时间覆盖（毫秒） */
  timeout?: number;
  /** 图片生成选项 */
  imageOptions?: ImageGenOptions;
}

// ============================================================================
// Cache Types
// ============================================================================

/**
 * 缓存条目
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
 * 缓存适配器接口
 */
export interface CacheAdapter {
  /**
   * 查找精确匹配的缓存
   */
  findExactMatch(params: ColoringCardParams, provider: string): Promise<CacheEntry | null>;

  /**
   * 存储缓存记录
   * @returns 缓存记录 ID
   */
  store(
    params: ColoringCardParams,
    promptText: string,
    provider: string,
    imageUrl: string,
    storagePath?: string
  ): Promise<string>;

  /**
   * 查找相似缓存（可选）
   */
  findSimilar?(params: ColoringCardParams, limit?: number): Promise<CacheEntry[]>;

  /**
   * 清理过期缓存（可选）
   */
  cleanup?(maxAgeDays?: number, minAccessCount?: number): Promise<number>;

  /**
   * 获取缓存统计（可选）
   */
  getStats?(): Promise<CacheStats>;
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  totalEntries: number;
  totalHits: number;
  topThemes: Array<{ theme: string; count: number }>;
}

// ============================================================================
// Storage Types
// ============================================================================

/**
 * 存储结果
 */
export interface StorageResult {
  publicUrl: string;
  storagePath: string;
}

/**
 * 存储适配器接口
 */
export interface StorageAdapter {
  /**
   * 从 URL 下载并存储图片
   */
  storeFromUrl(imageUrl: string, filename: string): Promise<StorageResult>;

  /**
   * 存储 Base64 图片
   */
  storeFromBase64(base64Data: string, filename: string): Promise<StorageResult>;

  /**
   * 删除存储的图片
   */
  delete(path: string): Promise<void>;

  /**
   * 获取公开 URL
   */
  getPublicUrl(path: string): string;
}

// ============================================================================
// Provider Types
// ============================================================================

/**
 * Provider 优先级配置
 */
export interface ProviderPriorityConfig {
  /** Provider ID */
  id: string;
  /** 优先级（数字越小优先级越高，从 0 开始） */
  priority: number;
  /** 是否启用 */
  enabled: boolean;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 重试次数 */
  maxRetries?: number;
}

/**
 * 多 Provider 策略配置
 */
export interface MultiProviderStrategy {
  /** 优先级列表 */
  priorities: ProviderPriorityConfig[];
  /** 是否启用自动降级 */
  autoFallback: boolean;
  /** 全局超时时间（毫秒） */
  globalTimeout?: number;
}

// ============================================================================
// Service Configuration
// ============================================================================

/**
 * Supabase 配置
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Provider 凭证配置
 */
export interface ProviderCredentials {
  openai?: { apiKey: string };
  gemini?: { apiKey: string };
  antigravity?: { baseUrl: string; apiKey?: string };
  modelscope?: { apiKey: string; baseUrl?: string; model?: string };
}

/**
 * ImageService 配置
 */
export interface ImageServiceConfig {
  /** Supabase 配置（缓存和存储） */
  supabase?: SupabaseConfig;
  /** Provider 凭证 */
  providers: ProviderCredentials;
  /** 多 Provider 策略 */
  strategy?: MultiProviderStrategy;
  /** 是否启用缓存 */
  enableCache?: boolean;
  /** 是否启用存储 */
  enableStorage?: boolean;
}

// ============================================================================
// ImageService Interface
// ============================================================================

/**
 * ImageService 统一接口
 */
export interface IImageService {
  /**
   * 根据涂色卡片参数生成图片
   */
  generate(params: ColoringCardParams, options?: GenerateOptions): Promise<GenerateResult>;

  /**
   * 直接使用 prompt 生成图片
   */
  generateFromPrompt(prompt: string, options?: GenerateOptions): Promise<GenerateResult>;

  /**
   * 检查缓存
   */
  checkCache(params: ColoringCardParams, provider?: string): Promise<CacheEntry | null>;
}

// Re-export from ai/types for convenience
export type { ColoringCardParams, ImageGenOptions };
