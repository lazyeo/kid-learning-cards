/**
 * ImageService - 统一图片生成服务
 *
 * 职责：
 * 1. 统一入口：对外提供简洁的 generate(params, options) 接口
 * 2. 缓存管理：查询和存储缓存
 * 3. Provider 编排：优先级调度和自动降级
 * 4. 存储管理：图片持久化到 Storage
 */

import { CacheManager } from './cache/CacheManager';
import { StorageManager } from './storage/StorageManager';
import { ProviderOrchestrator } from './providers/ProviderOrchestrator';
import { buildColoringPrompt } from '../ai/utils/promptBuilder';
import type {
  IImageService,
  GenerateResult,
  GenerateOptions,
  CacheEntry,
  ColoringCardParams,
  ImageGenOptions
} from './types';

/**
 * ImageService 配置选项
 */
export interface ImageServiceOptions {
  cacheManager?: CacheManager;
  storageManager?: StorageManager;
  providerOrchestrator: ProviderOrchestrator;
  /** 默认 Provider（如果未指定） */
  defaultProvider?: string;
}

export class ImageService implements IImageService {
  private cacheManager: CacheManager;
  private storageManager: StorageManager;
  private orchestrator: ProviderOrchestrator;
  private defaultProvider: string;

  constructor(options: ImageServiceOptions) {
    this.cacheManager = options.cacheManager ?? new CacheManager();
    this.storageManager = options.storageManager ?? new StorageManager();
    this.orchestrator = options.providerOrchestrator;
    this.defaultProvider = options.defaultProvider ?? 'antigravity';
  }

  /**
   * 根据涂色卡片参数生成图片
   */
  async generate(
    params: ColoringCardParams,
    options?: GenerateOptions
  ): Promise<GenerateResult> {
    // 1. 缓存查询暂时禁用
    // TODO: 重新设计缓存机制，支持"刷新换一张"功能
    // const provider = options?.provider ?? this.defaultProvider;
    // const skipCache = options?.skipCache ?? false;
    // const forceRefresh = options?.forceRefresh ?? false;
    // if (!skipCache && !forceRefresh && this.cacheManager.isEnabled()) {
    //   const cached = await this.cacheManager.findExactMatch(params, provider);
    //   if (cached) {
    //     console.log(`[ImageService] Cache hit! ID: ${cached.id}`);
    //     return {
    //       imageUrl: cached.image_url,
    //       cached: true,
    //       cacheId: cached.id,
    //       provider: cached.provider,
    //       storagePath: cached.storage_path ?? undefined
    //     };
    //   }
    //   console.log('[ImageService] Cache miss');
    // }
    console.log('[ImageService] Cache lookup disabled (pending redesign)');

    // 2. 构建 Prompt
    const prompt = buildColoringPrompt(params);
    console.log('[ImageService] Generated prompt:', prompt.substring(0, 100) + '...');

    // 3. 生成图片
    const imageOptions: ImageGenOptions = options?.imageOptions ?? {
      width: 1024,
      height: 1024,
      style: 'line_art',
      quality: 'standard'
    };

    let result: GenerateResult;

    // 如果指定了 Provider，直接使用该 Provider
    if (options?.provider) {
      result = await this.orchestrator.generateWithProvider(
        options.provider,
        prompt,
        imageOptions,
        options.timeout
      );
    } else {
      // 否则使用优先级调度
      result = await this.orchestrator.generate(prompt, imageOptions);
    }

    console.log(`[ImageService] Image generated with provider: ${result.provider}`);

    // 4. 存储到 Storage（如果启用）
    let finalImageUrl = result.imageUrl;
    let storagePath: string | undefined;

    if (this.storageManager.isEnabled()) {
      try {
        const filename = `${params.theme}-${params.subject}`.replace(/\s+/g, '-');
        const storageResult = await this.storageManager.store(result.imageUrl, filename);
        finalImageUrl = storageResult.publicUrl;
        storagePath = storageResult.storagePath || undefined;
        console.log(`[ImageService] Image stored: ${storagePath}`);
      } catch (error) {
        console.warn('[ImageService] Storage failed, using original URL:', error);
      }
    }

    // 5. 存储到缓存（用于图库展示，但不影响每次生成新图）
    let cacheId: string | undefined;

    if (this.cacheManager.isEnabled()) {
      try {
        cacheId = await this.cacheManager.store(
          params,
          prompt,
          result.provider,
          finalImageUrl,
          storagePath
        ) ?? undefined;
        console.log(`[ImageService] Cache stored: ${cacheId}`);
      } catch (error) {
        console.warn('[ImageService] Cache store failed:', error);
      }
    }

    return {
      imageUrl: finalImageUrl,
      cached: false,
      cacheId,
      provider: result.provider,
      storagePath,
      failedProviders: result.failedProviders
    };
  }

  /**
   * 直接使用 prompt 生成图片（不走缓存）
   */
  async generateFromPrompt(
    prompt: string,
    options?: GenerateOptions
  ): Promise<GenerateResult> {
    const imageOptions: ImageGenOptions = options?.imageOptions ?? {
      width: 1024,
      height: 1024,
      style: 'line_art',
      quality: 'standard'
    };

    let result: GenerateResult;

    if (options?.provider) {
      result = await this.orchestrator.generateWithProvider(
        options.provider,
        prompt,
        imageOptions,
        options.timeout
      );
    } else {
      result = await this.orchestrator.generate(prompt, imageOptions);
    }

    // 如果启用存储，持久化图片
    if (this.storageManager.isEnabled()) {
      try {
        const filename = `custom-${Date.now()}`;
        const storageResult = await this.storageManager.store(result.imageUrl, filename);
        return {
          ...result,
          imageUrl: storageResult.publicUrl,
          storagePath: storageResult.storagePath || undefined
        };
      } catch (error) {
        console.warn('[ImageService] Storage failed:', error);
      }
    }

    return result;
  }

  /**
   * 检查缓存
   */
  async checkCache(
    params: ColoringCardParams,
    provider?: string
  ): Promise<CacheEntry | null> {
    if (!this.cacheManager.isEnabled()) {
      return null;
    }
    return this.cacheManager.findExactMatch(params, provider ?? this.defaultProvider);
  }

  /**
   * 获取缓存统计
   */
  async getCacheStats() {
    return this.cacheManager.getStats();
  }

  /**
   * 清理过期缓存
   */
  async cleanupCache(maxAgeDays?: number, minAccessCount?: number) {
    return this.cacheManager.cleanup(maxAgeDays, minAccessCount);
  }

  /**
   * 获取 Provider 编排器（用于高级配置）
   */
  getOrchestrator(): ProviderOrchestrator {
    return this.orchestrator;
  }

  /**
   * 获取缓存管理器（用于高级配置）
   */
  getCacheManager(): CacheManager {
    return this.cacheManager;
  }

  /**
   * 获取存储管理器（用于高级配置）
   */
  getStorageManager(): StorageManager {
    return this.storageManager;
  }
}
