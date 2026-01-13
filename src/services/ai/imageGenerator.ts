import { type ImageGeneratorProvider, type ColoringCardParams, type ImageGenOptions } from './types';
import { buildColoringPrompt } from './utils/promptBuilder';

export class ImageGenerator {
  private providers: Map<string, ImageGeneratorProvider>;
  private currentProviderId: string | null = null;

  constructor() {
    this.providers = new Map();
  }

  /**
   * 注册一个新的提供商
   */
  public registerProvider(provider: ImageGeneratorProvider): void {
    this.providers.set(provider.getId(), provider);

    // 如果是第一个注册的提供商，自动设为当前提供商
    if (this.currentProviderId === null) {
      this.currentProviderId = provider.getId();
    }
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
   */
  public async generate(params: ColoringCardParams): Promise<string> {
    if (!this.currentProviderId) {
      throw new Error('No AI provider selected.');
    }

    const provider = this.providers.get(this.currentProviderId);
    if (!provider) {
      throw new Error(`Current provider '${this.currentProviderId}' is invalid.`);
    }

    // 1. 构建 Prompt
    const prompt = buildColoringPrompt(params);

    // 2. 准备选项
    const options: ImageGenOptions = {
      width: 1024,
      height: 1024,
      style: 'line_art',
      quality: 'standard'
    };

    // 3. 调用提供商生成图片
    try {
      console.log(`Using provider: ${provider.getName()} to generate image...`);
      const imageUrl = await provider.generateImage(prompt, options);
      return imageUrl;
    } catch (error) {
      console.error('Image generation failed:', error);
      throw error;
    }
  }
}
