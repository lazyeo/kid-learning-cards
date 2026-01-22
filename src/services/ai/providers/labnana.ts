import { type ImageGeneratorProvider, type ImageGenOptions } from '../types';

/**
 * LabNana Provider 配置
 */
export interface LabNanaConfig {
  apiKey: string;       // API 密钥，格式: lh_xxxxxxxxx
  timeout?: number;     // 请求超时时间(ms)，默认: 120000
}

/**
 * LabNana Provider
 * 支持 Google Gemini 图像生成的代理服务
 *
 * @see https://labnana.com/docs/openapi/guide
 */
export class LabNanaProvider implements ImageGeneratorProvider {
  private config: Required<LabNanaConfig>;
  private baseUrl = 'https://api.labnana.com';

  constructor(config: LabNanaConfig) {
    this.config = {
      apiKey: config.apiKey,
      timeout: config.timeout || 120000,
    };
  }

  getName(): string {
    return 'LabNana';
  }

  getId(): string {
    return 'labnana';
  }

  async generateImage(prompt: string, options: ImageGenOptions): Promise<string> {
    const endpoint = `${this.baseUrl}/openapi/v1/images/generation`;

    try {
      console.log('[LabNana] Generating image...');
      console.log(`[LabNana] Prompt: ${prompt.substring(0, 100)}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      // 确定分辨率
      let imageSize: '1K' | '2K' | '4K' = '1K';
      if (options.width && options.width >= 2048) {
        imageSize = '2K';
      }
      if (options.width && options.width >= 4096) {
        imageSize = '4K';
      }

      const requestBody = {
        provider: 'google',
        prompt: prompt,
        imageConfig: {
          imageSize: imageSize,
          aspectRatio: '1:1'  // 涂色卡片使用 1:1 比例
        }
      };

      console.log('[LabNana] Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`[LabNana] Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[LabNana] Error response:', errorData);
        throw new Error(
          `LabNana API Error: ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();
      console.log('[LabNana] Response received successfully');
      console.log('[LabNana] Response data:', JSON.stringify(data, null, 2));

      // 处理响应格式: { candidates: [{ content: { parts: [{ inlineData: { mimeType, data } }] } }] }
      const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (inlineData?.data) {
        const mimeType = inlineData.mimeType || 'image/png';
        console.log(`[LabNana] Image received: ${mimeType}, ${inlineData.data.length} chars`);
        return `data:${mimeType};base64,${inlineData.data}`;
      }

      // 如果有 URL 格式的响应
      if (data.url) {
        return data.url;
      }

      console.error('[LabNana] Unexpected response format:', Object.keys(data));
      throw new Error('No image data received from LabNana');
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`LabNana request timeout after ${this.config.timeout}ms`);
      }
      console.error('LabNana image generation failed:', error);
      throw error;
    }
  }

  supportsFeatures(): string[] {
    return [
      'google_gemini',
      'high_resolution',
      'reference_images',
      'line_art'
    ];
  }
}
