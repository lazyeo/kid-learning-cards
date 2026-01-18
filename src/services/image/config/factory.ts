/**
 * ImageService 工厂函数 - 通用版本
 * 仅包含 createImageService，不依赖 process.env 或 import.meta.env
 */

import { ImageService } from '../ImageService';
import { CacheManager } from '../cache/CacheManager';
import { StorageManager } from '../storage/StorageManager';
import { SupabaseCacheAdapter } from '../cache/SupabaseCacheAdapter';
import { SupabaseStorageAdapter } from '../storage/SupabaseStorageAdapter';
import { ProviderOrchestrator, DEFAULT_STRATEGY } from '../providers/ProviderOrchestrator';
import { OpenAIProvider } from '../../ai/providers/openai';
import { GeminiProvider } from '../../ai/providers/gemini';
import { AntigravityProvider } from '../../ai/providers/antigravity';
import { ModelScopeProvider } from '../../ai/providers/modelscope';
import type { ImageServiceConfig } from '../types';

/**
 * 从配置创建 ImageService 实例
 */
export function createImageService(config: ImageServiceConfig): ImageService {
  // 1. 创建缓存管理器
  let cacheManager: CacheManager;
  if (config.enableCache !== false && config.supabase) {
    const cacheAdapter = new SupabaseCacheAdapter(
      config.supabase.url,
      config.supabase.anonKey
    );
    cacheManager = new CacheManager(cacheAdapter);
  } else {
    cacheManager = new CacheManager(); // NoOp
  }

  // 2. 创建存储管理器
  let storageManager: StorageManager;
  if (config.enableStorage !== false && config.supabase) {
    const storageAdapter = new SupabaseStorageAdapter(
      config.supabase.url,
      config.supabase.anonKey
    );
    storageManager = new StorageManager(storageAdapter);
  } else {
    storageManager = new StorageManager(); // NoOp
  }

  // 3. 创建 Provider 编排器
  const strategy = config.strategy ?? DEFAULT_STRATEGY;
  const orchestrator = new ProviderOrchestrator(strategy);

  // 4. 注册 Providers
  if (config.providers.antigravity?.baseUrl) {
    orchestrator.registerProvider(
      new AntigravityProvider({
        baseUrl: config.providers.antigravity.baseUrl,
        apiKey: config.providers.antigravity.apiKey ?? 'local'
      })
    );
  }

  if (config.providers.openai?.apiKey) {
    orchestrator.registerProvider(
      new OpenAIProvider(config.providers.openai.apiKey)
    );
  }

  if (config.providers.gemini?.apiKey) {
    orchestrator.registerProvider(
      new GeminiProvider(config.providers.gemini.apiKey)
    );
  }

  if (config.providers.modelscope?.apiKey) {
    orchestrator.registerProvider(
      new ModelScopeProvider({
        apiKey: config.providers.modelscope.apiKey,
        baseUrl: config.providers.modelscope.baseUrl,
        model: config.providers.modelscope.model
      })
    );
  }

  // 5. 确定默认 Provider
  const enabledProviders = orchestrator.getEnabledProviderIds();
  const defaultProvider = enabledProviders[0] ?? 'antigravity';

  return new ImageService({
    cacheManager,
    storageManager,
    providerOrchestrator: orchestrator,
    defaultProvider
  });
}

/**
 * 浏览器环境工厂函数
 * 使用 import.meta.env 读取配置
 */
export function createBrowserImageService(options?: {
  enableCache?: boolean;
  enableStorage?: boolean;
}): ImageService {
  // 使用动态访问避免编译错误
  const env = (import.meta as { env?: Record<string, string> }).env ?? {};

  const config: ImageServiceConfig = {
    supabase: env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY
      ? {
          url: env.VITE_SUPABASE_URL,
          anonKey: env.VITE_SUPABASE_ANON_KEY
        }
      : undefined,
    providers: {
      antigravity: env.VITE_ANTIGRAVITY_BASE_URL
        ? {
            baseUrl: env.VITE_ANTIGRAVITY_BASE_URL,
            apiKey: env.VITE_ANTIGRAVITY_API_KEY
          }
        : undefined,
      openai: env.VITE_OPENAI_API_KEY
        ? { apiKey: env.VITE_OPENAI_API_KEY }
        : undefined,
      gemini: env.VITE_GEMINI_API_KEY
        ? { apiKey: env.VITE_GEMINI_API_KEY }
        : undefined,
      modelscope: env.VITE_MODELSCOPE_API_KEY
        ? {
            apiKey: env.VITE_MODELSCOPE_API_KEY,
            baseUrl: env.VITE_MODELSCOPE_BASE_URL,
            model: env.VITE_MODELSCOPE_MODEL
          }
        : undefined
    },
    enableCache: options?.enableCache ?? true,
    enableStorage: options?.enableStorage ?? true
  };

  return createImageService(config);
}
