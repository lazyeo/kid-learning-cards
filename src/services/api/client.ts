import { type ColoringCardParams } from '../ai/types';

export interface GenerateImageResponse {
  imageUrl: string;
  error?: string;
}

export type ProviderName = 'openai' | 'gemini';

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
  // 在本地开发环境，URL 指向本地的 Netlify Functions
  // 在生产环境，自动指向相对路径
  const apiUrl = '/.netlify/functions/generate-image';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ params, provider }),
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

    return data.imageUrl;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
