import { ImageGenerator } from './imageGenerator';
import { type ImageGeneratorProvider, type MultiProviderStrategy } from './types';
import { OpenAIProvider } from './providers/openai';
import { GeminiProvider } from './providers/gemini';
import { AntigravityProvider } from './providers/antigravity';
import { ModelScopeProvider } from './providers/modelscope';

/**
 * Provider 配置接口
 * 从环境变量读取配置
 */
export interface ProviderEnvConfig {
  // OpenAI
  openai?: {
    apiKey: string;
    baseUrl?: string;
    model?: string;
  };

  // Gemini
  gemini?: {
    apiKey: string;
    model?: string;
  };

  // Antigravity
  antigravity?: {
    apiKey: string;
    baseUrl: string;
    model?: string;
  };

  // ModelScope
  modelscope?: {
    apiKey: string;
    baseUrl?: string;
    model?: string;
  };
}

/**
 * 默认的 Provider 优先级策略
 *
 * 优先级说明：
 * 1. Antigravity (优先级 0) - 本地部署、快速、可控（临时优先）
 * 2. ModelScope (优先级 1) - 免费、中文友好（前端 CORS 限制，需后端代理）
 * 3. OpenAI (优先级 2) - 质量高、但价格贵
 * 4. Gemini (优先级 3) - 备用方案
 *
 * 注意：ModelScope 在前端会遇到 CORS 问题，建议通过后端代理使用
 */
export const DEFAULT_PROVIDER_STRATEGY: MultiProviderStrategy = {
  priorities: [
    { id: 'antigravity', priority: 0, enabled: true, timeout: 60000 },
    { id: 'modelscope', priority: 1, enabled: false, timeout: 120000 }, // 暂时禁用，避免 CORS
    { id: 'openai', priority: 2, enabled: true, timeout: 60000 },
    { id: 'gemini', priority: 3, enabled: true, timeout: 60000 },
  ],
  autoFallback: true,
  globalTimeout: 180000, // 3 分钟总超时
};

/**
 * 从环境变量读取 Provider 配置
 */
export function loadProviderConfigFromEnv(): ProviderEnvConfig {
  const config: ProviderEnvConfig = {};

  // OpenAI
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (openaiKey) {
    config.openai = {
      apiKey: openaiKey,
      baseUrl: import.meta.env.VITE_OPENAI_BASE_URL,
      model: import.meta.env.VITE_OPENAI_MODEL || 'dall-e-3',
    };
  }

  // Gemini
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (geminiKey) {
    config.gemini = {
      apiKey: geminiKey,
      model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash-exp',
    };
  }

  // Antigravity
  const antigravityKey = import.meta.env.VITE_ANTIGRAVITY_API_KEY;
  const antigravityUrl = import.meta.env.VITE_ANTIGRAVITY_BASE_URL;
  if (antigravityKey && antigravityUrl) {
    config.antigravity = {
      apiKey: antigravityKey,
      baseUrl: antigravityUrl,
      model: import.meta.env.VITE_ANTIGRAVITY_MODEL,
    };
  }

  // ModelScope
  const modelscopeKey = import.meta.env.VITE_MODELSCOPE_API_KEY;
  if (modelscopeKey) {
    config.modelscope = {
      apiKey: modelscopeKey,
      baseUrl: import.meta.env.VITE_MODELSCOPE_BASE_URL,
      model: import.meta.env.VITE_MODELSCOPE_MODEL,
    };
  }

  return config;
}

/**
 * 创建 Provider 实例
 */
export function createProvidersFromConfig(
  config: ProviderEnvConfig
): ImageGeneratorProvider[] {
  const providers: ImageGeneratorProvider[] = [];

  if (config.openai) {
    // OpenAI Provider 只需要 apiKey
    providers.push(
      new OpenAIProvider(config.openai.apiKey)
    );
  }

  if (config.gemini) {
    // Gemini Provider 只需要 apiKey
    providers.push(
      new GeminiProvider(config.gemini.apiKey)
    );
  }

  if (config.antigravity) {
    providers.push(
      new AntigravityProvider({
        apiKey: config.antigravity.apiKey,
        baseUrl: config.antigravity.baseUrl,
        model: config.antigravity.model,
      })
    );
  }

  if (config.modelscope) {
    providers.push(
      new ModelScopeProvider({
        apiKey: config.modelscope.apiKey,
        baseUrl: config.modelscope.baseUrl,
        model: config.modelscope.model,
      })
    );
  }

  return providers;
}

/**
 * 初始化 ImageGenerator 工厂函数
 *
 * 根据环境变量自动配置所有可用的 Providers，
 * 并启用多 Provider 优先级策略
 */
export function createImageGenerator(
  customStrategy?: Partial<MultiProviderStrategy>
): ImageGenerator {
  // 1. 从环境变量加载配置
  const envConfig = loadProviderConfigFromEnv();

  // 2. 创建 providers
  const providers = createProvidersFromConfig(envConfig);

  if (providers.length === 0) {
    throw new Error(
      'No AI providers configured. Please set at least one provider API key in environment variables.'
    );
  }

  // 3. 创建 ImageGenerator
  const generator = new ImageGenerator();
  generator.registerProviders(providers);

  // 4. 启用多 Provider 策略
  const strategy: MultiProviderStrategy = {
    ...DEFAULT_PROVIDER_STRATEGY,
    ...customStrategy,
    // 过滤掉没有配置的 providers
    priorities: (customStrategy?.priorities || DEFAULT_PROVIDER_STRATEGY.priorities).filter(
      (p) => providers.some((provider) => provider.getId() === p.id)
    ),
  };

  generator.enableMultiProviderStrategy(strategy);

  console.log(
    `[ImageGenerator] Initialized with ${providers.length} provider(s):`,
    providers.map((p) => p.getName()).join(', ')
  );

  console.log(
    `[ImageGenerator] Priority order:`,
    strategy.priorities.map((p) => `${p.id} (${p.enabled ? 'enabled' : 'disabled'})`).join(' > ')
  );

  return generator;
}
