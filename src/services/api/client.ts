import { type ColoringCardParams, type GenerationResult } from '../ai/types';

export interface GenerateImageResponse {
  imageUrl: string;
  cached?: boolean;
  cacheId?: string;
  provider?: string;
  error?: string;
}

export type ProviderName = 'openai' | 'gemini' | 'antigravity';

export interface GenerateImageOptions {
  provider?: ProviderName;
  useCache?: boolean;
  forceRefresh?: boolean;
}

/**
 * 调用后端 API 生成图片
 * @param params 生成参数
 * @param provider AI 提供商 (默认为 openai)
 * @returns 图片 URL
 */
export async function generateImage(
  params: ColoringCardParams,
  provider: ProviderName = 'openai'
): Promise<string> {
  const result = await generateImageWithDetails(params, { provider });
  return result.imageUrl;
}

/**
 * 调用后端 API 生成图片（返回完整结果，包含缓存状态）
 * @param params 生成参数
 * @param options 生成选项
 * @returns 完整的生成结果
 */
export async function generateImageWithDetails(
  params: ColoringCardParams,
  options: GenerateImageOptions = {}
): Promise<GenerationResult> {
  const {
    provider = 'openai',
    useCache = true,
    forceRefresh = false
  } = options;

  // 在本地开发环境，URL 指向本地的 Netlify Functions
  // 在生产环境，自动指向相对路径
  const apiUrl = '/.netlify/functions/generate-image';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        params,
        provider,
        useCache,
        forceRefresh
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const data: GenerateImageResponse = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.imageUrl) {
      throw new Error('No image URL received from server');
    }

    return {
      imageUrl: data.imageUrl,
      cached: data.cached || false,
      cacheId: data.cacheId,
      provider: data.provider || provider
    };
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
