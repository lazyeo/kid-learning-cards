/**
 * ImageService 模块公共导出
 *
 * 统一的图片生成服务模块，包含：
 * - ImageService: 主服务类
 * - CacheManager/StorageManager: 缓存和存储管理
 * - ProviderOrchestrator: Provider 编排
 * - 工厂函数: 环境特定的创建方法
 */

// ============================================================================
// Core Service
// ============================================================================

export { ImageService } from './ImageService';
export type { ImageServiceOptions } from './ImageService';

// ============================================================================
// Types
// ============================================================================

export type {
  // Result types
  GenerateResult,
  GenerateOptions,
  ProviderError,

  // Cache types
  CacheEntry,
  CacheAdapter,
  CacheStats,

  // Storage types
  StorageResult,
  StorageAdapter,

  // Provider types
  ProviderPriorityConfig,
  MultiProviderStrategy,

  // Config types
  SupabaseConfig,
  ProviderCredentials,
  ImageServiceConfig,

  // Interface
  IImageService,

  // Re-exports
  ColoringCardParams,
  ImageGenOptions
} from './types';

// ============================================================================
// Cache
// ============================================================================

export { CacheManager } from './cache';
export { NoOpCacheAdapter } from './cache';
export { SupabaseCacheAdapter } from './cache';

// ============================================================================
// Storage
// ============================================================================

export { StorageManager } from './storage';
export { NoOpStorageAdapter } from './storage';
export { SupabaseStorageAdapter } from './storage';

// ============================================================================
// Providers
// ============================================================================

export { ProviderOrchestrator, DEFAULT_STRATEGY } from './providers';
export {
  OpenAIProvider,
  GeminiProvider,
  AntigravityProvider,
  ModelScopeProvider
} from './providers';

// ============================================================================
// Factory Functions (Browser-safe)
// ============================================================================

export {
  createImageService,
  createBrowserImageService
} from './config';

// Note: For Node.js environments (Netlify Functions, dev-server),
// import createNodeImageService and validateNodeConfig from:
// './config/factory.node'
