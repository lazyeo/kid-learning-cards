export interface ImageGenOptions {
  width?: number;
  height?: number;
  style?: 'line_art' | 'realistic' | 'cartoon' | 'sketch';
  quality?: 'standard' | 'hd';
}

export interface ColoringCardParams {
  theme: string;           // 主题（例如：动物、交通工具）
  subject: string;         // 具体对象（例如：猫、火车）
  difficulty: 'easy' | 'medium' | 'hard';
  customPrompt?: string;   // 用户自定义的额外描述
}

export interface ImageGeneratorProvider {
  /**
   * 获取提供商名称
   */
  getName(): string;

  /**
   * 获取提供商ID
   */
  getId(): string;

  /**
   * 生成图片
   * @param prompt 完整的提示词
   * @param options 生成选项
   * @returns 图片URL
   */
  generateImage(prompt: string, options: ImageGenOptions): Promise<string>;

  /**
   * 获取支持的功能特性列表
   */
  supportsFeatures(): string[];
}

export interface AIProviderConfig {
  id: string;
  name: string;
  isEnabled: boolean;
}

/**
 * 通用 Provider 配置
 */
export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  timeout?: number;
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  enabled: boolean;
  maxAgeDays?: number;  // 缓存有效期(天)
}

/**
 * 图片生成结果（包含缓存状态）
 */
export interface GenerationResult {
  imageUrl: string;
  cached: boolean;
  cacheId?: string;
  provider: string;
}
