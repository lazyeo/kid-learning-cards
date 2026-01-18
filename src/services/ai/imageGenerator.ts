/**
 * @deprecated 请使用 src/services/image/ImageService 替代
 *
 * 此类已被 ImageService 模块取代，保留仅为向后兼容。
 * 新代码应使用：
 *
 * ```typescript
 * import { createImageService, createBrowserImageService } from '@/services/image';
 *
 * const imageService = createImageService(config);
 * const result = await imageService.generate(params);
 * ```
 *
 * @see src/services/image/ImageService.ts
 */
import {
  type ImageGeneratorProvider,
  type ColoringCardParams,
  type ImageGenOptions,
  type GenerationResult,
  type MultiProviderStrategy
} from './types';
import { buildColoringPrompt } from './utils/promptBuilder';
import { ProviderScheduler } from './providerScheduler';

/**
 * @deprecated 使用 ImageService 替代
 */
export class ImageGenerator {
  private providers: Map<string, ImageGeneratorProvider>;
  private currentProviderId: string | null = null;
  private scheduler: ProviderScheduler | null = null;

  constructor() {
    this.providers = new Map();
  }

  /**
   * 注册一个新的提供商
   */
  public registerProvider(provider: ImageGeneratorProvider): void {
    this.providers.set(provider.getId(), provider);

    // 如果启用了调度器，也注册到调度器
    if (this.scheduler) {
      this.scheduler.registerProvider(provider);
    }

    // 如果是第一个注册的提供商，自动设为当前提供商
    if (this.currentProviderId === null) {
      this.currentProviderId = provider.getId();
    }
  }

  /**
   * 批量注册 Providers
   */
  public registerProviders(providers: ImageGeneratorProvider[]): void {
    providers.forEach(provider => this.registerProvider(provider));
  }

  /**
   * 启用多 Provider 策略（优先级调度 + 自动降级）
   */
  public enableMultiProviderStrategy(strategy: MultiProviderStrategy): void {
    this.scheduler = new ProviderScheduler(strategy);
    // 将已注册的 providers 注册到调度器
    this.providers.forEach(provider => {
      this.scheduler!.registerProvider(provider);
    });
  }

  /**
   * 禁用多 Provider 策略
   */
  public disableMultiProviderStrategy(): void {
    this.scheduler = null;
  }

  /**
   * 获取调度器
   */
  public getScheduler(): ProviderScheduler | null {
    return this.scheduler;
  }

  /**
   * 切换当前使用的提供商
   */
  public switchProvider(providerId: string): void {
    if (!this.providers.has(providerId)) {
      throw new Error(`Provider '${providerId}' not registered.`);
    }
    this.currentProviderId = providerId;
  }

  /**
   * 获取当前提供商 ID
   */
  public getCurrentProviderId(): string | null {
    return this.currentProviderId;
  }

  /**
   * 获取所有已注册的提供商 ID
   */
  public getRegisteredProviderIds(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * 生成涂色卡片图片
   *
   * 如果启用了多 Provider 策略，使用调度器；
   * 否则使用当前选中的单个 Provider
   */
  public async generate(params: ColoringCardParams): Promise<GenerationResult> {
    // 1. 构建 Prompt
    const prompt = buildColoringPrompt(params);

    // 2. 准备选项
    const options: ImageGenOptions = {
      width: 1024,
      height: 1024,
      style: 'line_art',
      quality: 'standard'
    };

    // 3. 判断使用调度器还是单个 Provider
    if (this.scheduler) {
      // 使用多 Provider 策略（优先级 + 自动降级）
      return await this.scheduler.generateWithPriority(prompt, options);
    } else {
      // 使用单个 Provider
      return await this.generateWithSingleProvider(prompt, options);
    }
  }

  /**
   * 使用单个 Provider 生成图片
   */
  private async generateWithSingleProvider(
    prompt: string,
    options: ImageGenOptions
  ): Promise<GenerationResult> {
    if (!this.currentProviderId) {
      throw new Error('No AI provider selected.');
    }

    const provider = this.providers.get(this.currentProviderId);
    if (!provider) {
      throw new Error(`Current provider '${this.currentProviderId}' is invalid.`);
    }

    try {
      console.log(`Using provider: ${provider.getName()} to generate image...`);
      const imageUrl = await provider.generateImage(prompt, options);

      return {
        imageUrl,
        cached: false,
        provider: provider.getId()
      };
    } catch (error) {
      console.error('Image generation failed:', error);
      throw error;
    }
  }
}
