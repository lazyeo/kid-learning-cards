import { type ImageGeneratorProvider, type ImageGenOptions } from '../types';

/**
 * Antigravity Provider 配置
 */
export interface AntigravityConfig {
  baseUrl: string;      // API 基础地址，如: https://your-server.com/v1
  apiKey: string;       // API 密钥
  model?: string;       // 模型名称，默认: dall-e-3
  timeout?: number;     // 请求超时时间(ms)，默认: 60000
}

/**
 * Antigravity-Manager Provider
 * 兼容 OpenAI API 格式的本地/云端 AI 代理
 *
 * @see https://github.com/lbjlaq/Antigravity-Manager
 */
export class AntigravityProvider implements ImageGeneratorProvider {
  private config: Required<AntigravityConfig>;

  constructor(config: AntigravityConfig) {
    // 标准化 baseUrl：移除末尾斜杠，确保包含 /v1
    let baseUrl = config.baseUrl.replace(/\/$/, '');
    if (!baseUrl.endsWith('/v1')) {
      baseUrl = `${baseUrl}/v1`;
    }

    this.config = {
      baseUrl,
      apiKey: config.apiKey,
      model: config.model || 'dall-e-3',
      timeout: config.timeout || 60000,
    };
  }

  getName(): string {
    return 'Antigravity Local AI';
  }

  getId(): string {
    return 'antigravity';
  }

  async generateImage(prompt: string, options: ImageGenOptions): Promise<string> {
    const endpoint = `${this.config.baseUrl}/images/generations`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: options.quality || 'standard',
          response_format: 'url'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Antigravity API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();

      // 处理 OpenAI 兼容的响应格式
      if (data.data && data.data[0]) {
        // URL 格式响应
        if (data.data[0].url) {
          return data.data[0].url;
        }
        // Base64 格式响应
        if (data.data[0].b64_json) {
          return `data:image/png;base64,${data.data[0].b64_json}`;
        }
      }

      throw new Error('No image data received from Antigravity');
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Antigravity request timeout after ${this.config.timeout}ms`);
      }
      console.error('Antigravity image generation failed:', error);
      throw error;
    }
  }

  supportsFeatures(): string[] {
    return ['local', 'openai_compatible', 'custom_models', 'custom_endpoint'];
  }
}
