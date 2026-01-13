import { type ImageGeneratorProvider, type ImageGenOptions } from '../types';

export class GeminiProvider implements ImageGeneratorProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getName(): string {
    return 'Google Gemini (Imagen 3)';
  }

  getId(): string {
    return 'gemini';
  }

  async generateImage(prompt: string, options: ImageGenOptions): Promise<string> {
    // Google Imagen 3 via Gemini API
    // 注意：目前 endpoint 可能随区域变化，这里使用标准 endpoint
    // 实际使用时需要确认 API 版本
    const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${this.apiKey}`;

    try {
      // 这里的 request body 结构基于 Imagen API 标准
      // 如果使用 Vertex AI，结构会略有不同
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instances: [
            { prompt: prompt }
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: options.width && options.height && options.width !== options.height ? "3:4" : "1:1", // 简化处理
            // 更多参数可在此添加
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API Error: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();

      // 解析响应，Imagen 通常返回 Base64 编码的图片
      if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
        return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
      }

      // 处理可能的 URL 返回格式
      if (data.predictions && data.predictions[0] && data.predictions[0].url) {
        return data.predictions[0].url;
      }

      throw new Error('No image data received from Gemini');
    } catch (error) {
      console.error('Gemini image generation failed:', error);
      throw error;
    }
  }

  supportsFeatures(): string[] {
    return ['high_quality', 'photorealistic', 'fast'];
  }
}
