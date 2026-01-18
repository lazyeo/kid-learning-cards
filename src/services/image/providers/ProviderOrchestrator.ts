/**
 * Provider 编排器
 * 基于现有 ProviderScheduler，管理多个 AI Provider 的优先级调度和自动降级
 */

import type { ImageGeneratorProvider, ImageGenOptions } from '../../ai/types';
import type {
  GenerateResult,
  ProviderError,
  ProviderPriorityConfig,
  MultiProviderStrategy
} from '../types';

/**
 * 默认策略配置
 * 优先级：modelscope > gemini > antigravity > openai
 */
export const DEFAULT_STRATEGY: MultiProviderStrategy = {
  priorities: [
    { id: 'modelscope', priority: 0, enabled: true, timeout: 120000 },
    { id: 'gemini', priority: 1, enabled: true, timeout: 60000 },
    { id: 'antigravity', priority: 2, enabled: true, timeout: 60000 },
    { id: 'openai', priority: 3, enabled: true, timeout: 60000 },
  ],
  autoFallback: true,
  globalTimeout: 180000,
};

export class ProviderOrchestrator {
  private providers: Map<string, ImageGeneratorProvider>;
  private strategy: MultiProviderStrategy;

  constructor(strategy?: MultiProviderStrategy) {
    this.providers = new Map();
    this.strategy = strategy ?? DEFAULT_STRATEGY;
  }

  /**
   * 注册 Provider
   */
  registerProvider(provider: ImageGeneratorProvider): void {
    this.providers.set(provider.getId(), provider);
  }

  /**
   * 批量注册 Providers
   */
  registerProviders(providers: ImageGeneratorProvider[]): void {
    providers.forEach(provider => this.registerProvider(provider));
  }

  /**
   * 获取 Provider
   */
  getProvider(id: string): ImageGeneratorProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * 更新策略配置
   */
  updateStrategy(strategy: Partial<MultiProviderStrategy>): void {
    this.strategy = { ...this.strategy, ...strategy };
  }

  /**
   * 获取当前策略
   */
  getStrategy(): MultiProviderStrategy {
    return { ...this.strategy };
  }

  /**
   * 根据优先级生成图片（支持自动降级）
   */
  async generate(
    prompt: string,
    options: ImageGenOptions
  ): Promise<GenerateResult> {
    const failedProviders: ProviderError[] = [];
    const startTime = Date.now();

    // 按优先级排序并过滤已启用的 providers
    const sortedConfigs = this.getSortedEnabledProviders();

    if (sortedConfigs.length === 0) {
      throw new Error('No enabled providers available');
    }

    // 遍历所有 provider 直到成功或全部失败
    for (const config of sortedConfigs) {
      const provider = this.providers.get(config.id);

      if (!provider) {
        console.warn(`[ProviderOrchestrator] Provider '${config.id}' not registered, skipping`);
        continue;
      }

      // 检查全局超时
      if (this.strategy.globalTimeout) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= this.strategy.globalTimeout) {
          throw new Error(
            `Global timeout exceeded (${this.strategy.globalTimeout}ms). Failed providers: ${failedProviders.map(p => p.providerId).join(', ')}`
          );
        }
      }

      try {
        console.log(
          `[ProviderOrchestrator] Attempting provider: ${provider.getName()} (priority: ${config.priority})`
        );

        const imageUrl = await this.executeWithTimeout(
          provider,
          prompt,
          options,
          config.timeout
        );

        // 成功生成
        console.log(
          `[ProviderOrchestrator] Successfully generated image with provider: ${provider.getName()}`
        );

        return {
          imageUrl,
          cached: false,
          provider: provider.getId(),
          failedProviders: failedProviders.length > 0 ? failedProviders : undefined
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        console.warn(
          `[ProviderOrchestrator] Provider '${provider.getName()}' failed:`,
          errorMessage
        );

        // 记录失败信息
        failedProviders.push({
          providerId: provider.getId(),
          providerName: provider.getName(),
          error: errorMessage,
          timestamp: Date.now()
        });

        // 如果不启用自动降级，或这是最后一个 provider，抛出错误
        if (!this.strategy.autoFallback || config === sortedConfigs[sortedConfigs.length - 1]) {
          throw new Error(
            `All providers failed. Last error: ${errorMessage}. Failed providers: ${failedProviders.map(p => `${p.providerName} (${p.error})`).join('; ')}`
          );
        }

        // 继续尝试下一个 provider
        console.log('[ProviderOrchestrator] Falling back to next provider...');
      }
    }

    // 理论上不会到这里
    throw new Error('No providers available to try');
  }

  /**
   * 使用指定 Provider 生成图片
   */
  async generateWithProvider(
    providerId: string,
    prompt: string,
    options: ImageGenOptions,
    timeout?: number
  ): Promise<GenerateResult> {
    const provider = this.providers.get(providerId);

    if (!provider) {
      throw new Error(`Provider '${providerId}' not registered`);
    }

    const config = this.strategy.priorities.find(p => p.id === providerId);
    const effectiveTimeout = timeout ?? config?.timeout;

    console.log(`[ProviderOrchestrator] Using specific provider: ${provider.getName()}`);

    const imageUrl = await this.executeWithTimeout(
      provider,
      prompt,
      options,
      effectiveTimeout
    );

    return {
      imageUrl,
      cached: false,
      provider: provider.getId()
    };
  }

  /**
   * 带超时执行 Provider 的生成方法
   */
  private async executeWithTimeout(
    provider: ImageGeneratorProvider,
    prompt: string,
    options: ImageGenOptions,
    timeout?: number
  ): Promise<string> {
    // 如果没有指定超时，直接执行
    if (!timeout) {
      return await provider.generateImage(prompt, options);
    }

    // 创建超时 Promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Provider '${provider.getName()}' timeout after ${timeout}ms`));
      }, timeout);
    });

    // 竞速：生成 vs 超时
    return await Promise.race([
      provider.generateImage(prompt, options),
      timeoutPromise
    ]);
  }

  /**
   * 获取排序后的已启用 providers
   */
  private getSortedEnabledProviders(): ProviderPriorityConfig[] {
    return this.strategy.priorities
      .filter(config => config.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * 获取所有已注册的 provider IDs
   */
  getRegisteredProviderIds(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * 获取所有已启用的 provider IDs（按优先级排序）
   */
  getEnabledProviderIds(): string[] {
    return this.getSortedEnabledProviders().map(config => config.id);
  }

  /**
   * 检查指定 provider 是否可用
   */
  isProviderAvailable(providerId: string): boolean {
    return this.providers.has(providerId) &&
      this.strategy.priorities.some(
        config => config.id === providerId && config.enabled
      );
  }

  /**
   * 启用或禁用 Provider
   */
  setProviderEnabled(providerId: string, enabled: boolean): void {
    const config = this.strategy.priorities.find(p => p.id === providerId);
    if (config) {
      config.enabled = enabled;
    }
  }
}
