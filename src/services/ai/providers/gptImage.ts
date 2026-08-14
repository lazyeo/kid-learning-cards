import { type ImageGeneratorProvider, type ImageGenOptions } from '../types';

export interface GptImageConfig {
  baseUrl: string;
  apiKey: string;
  model?: string;
  timeout?: number;
}

interface GptImageResponse {
  data?: Array<{
    b64_json?: string;
    url?: string;
  }>;
  error?: {
    message?: string;
  };
  message?: string;
}

function buildGenerationsEndpoint(baseUrl: string): string {
  const normalized = baseUrl.replace(/\/+$/, '');

  if (normalized.endsWith('/images/generations')) {
    return normalized;
  }

  if (normalized.endsWith('/v1')) {
    return `${normalized}/images/generations`;
  }

  return `${normalized}/v1/images/generations`;
}

export class GptImageProvider implements ImageGeneratorProvider {
  private readonly config: Required<GptImageConfig>;
  private readonly endpoint: string;

  constructor(config: GptImageConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model || 'gpt-image-2',
      timeout: config.timeout || 120000,
    };
    this.endpoint = buildGenerationsEndpoint(config.baseUrl);
  }

  getName(): string {
    return 'GPT Image Compatible';
  }

  getId(): string {
    return 'gpt-image';
  }

  async generateImage(prompt: string, options: ImageGenOptions): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    const size = options.width && options.height
      ? `${options.width}x${options.height}`
      : '1024x1024';

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          n: 1,
          size,
          quality: options.quality === 'hd' ? 'high' : 'medium',
        }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({})) as GptImageResponse;

      if (!response.ok) {
        throw new Error(
          `GPT Image API Error: ${data.error?.message || data.message || response.statusText}`
        );
      }

      const image = data.data?.[0];
      if (image?.b64_json) {
        return `data:image/png;base64,${image.b64_json}`;
      }
      if (image?.url) {
        return image.url;
      }

      throw new Error('No image data received from GPT Image provider');
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`GPT Image request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  supportsFeatures(): string[] {
    return ['openai_compatible', 'gpt_image', 'base64_output', 'custom_endpoint'];
  }
}

